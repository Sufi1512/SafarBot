"""
Optimized Pre-fetch Workflow
1. Pre-fetch SERP data (hotels, restaurants, cafes, attractions)
2. Generate itinerary via LLM with place IDs
3. Map place IDs to complete metadata
4. Return single complete JSON response
"""

import asyncio
import json
import logging
import os
import re
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Tuple

from fastapi import HTTPException
from google import genai
from starlette.requests import Request

from config import settings
from mongo_models import AIProvider, AITaskType
from services.ai_tracking_service import ai_tracking_service
from services.serp_cache_service import cached_places_tool

logger = logging.getLogger(__name__)

EMPTY_PLACES = {"hotels": [], "restaurants": [], "cafes": [], "attractions": [], "interest_based": []}
CATEGORIES = ("hotels", "restaurants", "cafes", "attractions", "interest_based")


def _clean_json(text: str) -> str:
    """Extract valid JSON from LLM response."""
    if not text:
        return "{}"
    text = text.strip()
    for prefix in ("```json", "```"):
        if text.startswith(prefix):
            text = text[len(prefix):]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end > start:
        text = text[start : end + 1]
    lines = [re.sub(r"//.*$", "", line) if "://" not in line else line for line in text.split("\n")]
    return re.sub(r"/\*.*?\*/", "", "\n".join(lines), flags=re.DOTALL).strip()


def _fix_json(text: str) -> str:
    """Fix common JSON errors (trailing commas, missing commas)."""
    if not text:
        return "{}"
    text = re.sub(r",\s*}", "}", text)
    text = re.sub(r",\s*]", "]", text)
    text = re.sub(r'("\s*:\s*[^,}\]]+)\s*"', r'\1, "', text)
    return re.sub(r",\s*,", ",", text).strip()


def _parse_price(value: Any) -> float:
    """Extract average numeric value from price strings like '$25-40'."""
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    if not isinstance(value, str):
        return 0.0
    amounts = re.findall(r"\$([0-9]+(?:\.[0-9]+)?)", value) or re.findall(r"₹([0-9]+(?:\.[0-9]+)?)", value)
    return sum(float(a) for a in amounts) / len(amounts) if amounts else 0.0


class OptimizedPrefetchWorkflow:
    """Pre-fetches SERP data, generates itinerary via LLM, maps place IDs to metadata."""

    PREFETCH_LIMITS = {
        "base": {"hotels": 12, "restaurants": 15, "cafes": 8, "attractions": 12, "interest_based": 10},
        "max": {"hotels": 25, "restaurants": 30, "cafes": 16, "attractions": 24, "interest_based": 20},
        "growth": {"hotels": 2, "restaurants": 3, "cafes": 1, "attractions": 2, "interest_based": 2},
    }
    MIN_RATINGS = {
        "hotels": 4.0, "hotel": 4.0, "restaurants": 4.2, "restaurant": 4.2,
        "cafes": 4.0, "cafe": 4.0, "attractions": 4.0, "attraction": 4.0,
    }

    def __init__(self):
        if not getattr(settings, "google_api_key", None):
            raise ValueError("Google API key is required")
        self.client = genai.Client(api_key=settings.google_api_key)
        self.places_tool = cached_places_tool
        self.base_summary_limit, self.max_summary_limit = 5, 10
        logger.info("Optimized prefetch workflow initialized")

    async def generate_complete_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        budget_range: Optional[str] = None,
        interests: Optional[List[str]] = None,
        travelers: int = 1,
        travel_companion: Optional[str] = None,
        trip_pace: Optional[str] = None,
        departure_city: Optional[str] = None,
        flight_class_preference: Optional[str] = None,
        hotel_rating_preference: Optional[str] = None,
        accommodation_type: Optional[str] = None,
        email: Optional[str] = None,
        dietary_preferences: Optional[List[str]] = None,
        halal_preferences: Optional[str] = None,
        vegetarian_preferences: Optional[str] = None,
        request: Optional[Request] = None,
    ) -> Dict[str, Any]:
        interests = interests or []
        dietary_preferences = dietary_preferences or []

        await self._check_request(request)
        logger.info("Starting itinerary generation for %s (%s to %s)", destination, start_date, end_date)

        try:
            weather_task = self._start_weather_task(destination)
            dynamic_limits, summary_limit = self._dynamic_limits(start_date, end_date)
            all_places = await self._prefetch_places(destination, interests, dynamic_limits, request)
            itinerary_data, weather_data = await self._generate_itinerary(
                destination, start_date, end_date, budget, budget_range, interests, travelers,
                travel_companion, trip_pace, departure_city, flight_class_preference,
                hotel_rating_preference, accommodation_type, email, dietary_preferences,
                halal_preferences, vegetarian_preferences, all_places, weather_task, summary_limit, request
            )
            return await self._build_response(itinerary_data, all_places, weather_data, request)
        except Exception as e:
            logger.error("Itinerary workflow error: %s", e)
            raise

    def _start_weather_task(self, destination: str) -> Optional[asyncio.Task]:
        try:
            from services.weather_service import weather_service
            return asyncio.create_task(weather_service.get_current_weather(destination))
        except Exception as e:
            logger.warning("Weather task not started: %s", e)
            return None

    async def _check_request(self, request: Optional[Request]) -> None:
        if request and await request.is_disconnected():
            raise HTTPException(status_code=499, detail="Client disconnected")

    def _dynamic_limits(self, start_date: str, end_date: str) -> Tuple[Dict[str, int], int]:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        days = max((end - start).days + 1, 1)
        mult = max((days - 4) // 2, 0)
        limits = {}
        for cat, base in self.PREFETCH_LIMITS["base"].items():
            growth = self.PREFETCH_LIMITS["growth"].get(cat, 0) * mult
            cap = self.PREFETCH_LIMITS["max"].get(cat, base)
            limits[cat] = min(base + growth, cap)
        summary = min(self.base_summary_limit + mult, self.max_summary_limit)
        return limits, summary

    async def _prefetch_places(
        self,
        destination: str,
        interests: List[str],
        limits: Dict[str, int],
        request: Optional[Request],
    ) -> Dict[str, List[Dict[str, Any]]]:
        await self._check_request(request)
        tasks = [
            self.places_tool.search_hotels_cached(destination, max_results=limits["hotels"]),
            self.places_tool.search_restaurants_cached(destination, max_results=limits["restaurants"]),
            self.places_tool.search_cafes_cached(destination, max_results=limits["cafes"]),
            self.places_tool.search_attractions_cached(destination, interests, max_results=limits["attractions"]),
        ]
        for interest in interests[:3]:
            if interest not in ("city", "sightseeing"):
                tasks.append(self.places_tool.raw_serp_search_cached(f"{interest} places in {destination}"))

        results = await asyncio.gather(*tasks, return_exceptions=True)
        data = dict(EMPTY_PLACES)
        data["hotels"] = self._safe_result(results[0])
        data["restaurants"] = self._safe_result(results[1])
        data["cafes"] = self._safe_result(results[2])
        data["attractions"] = self._safe_result(results[3])
        for r in results[4:]:
            if not isinstance(r, Exception) and r:
                data["interest_based"].extend(r)

        for cat in CATEGORIES:
            data[cat] = self._filter_places(data[cat], cat, limits.get(cat, 99))

        pid = 1
        for cat, places in data.items():
            for p in places:
                if not p.get("place_id"):
                    p["place_id"] = f"{cat}_{pid:03d}"
                    pid += 1
                p["category"], p["prefetched"] = cat, True
        return data

    @staticmethod
    def _safe_result(r: Any) -> List[Dict]:
        return r if not isinstance(r, Exception) and r else []

    def _filter_places(
        self, places: List[Dict], category: str, max_n: int
    ) -> List[Dict[str, Any]]:
        if not places:
            return []
        seen_ids, seen_titles = set(), set()
        min_r = self.MIN_RATINGS.get(category.rstrip("s"), self.MIN_RATINGS.get(category, 0))
        out = []
        for p in places:
            pid, title = p.get("place_id"), (p.get("title") or p.get("name") or "").strip().lower()
            if pid and pid in seen_ids or title and title in seen_titles:
                continue
            try:
                r = float(p["rating"]) if p.get("rating") is not None else None
            except (TypeError, ValueError):
                r = None
            if min_r and r is not None and r < min_r:
                continue
            if pid:
                seen_ids.add(pid)
            if title:
                seen_titles.add(title)
            out.append(p)
            if len(out) >= max_n:
                break
        return out if out else places[:max_n]

    def _places_summary(self, data: Dict[str, List], limit: Optional[int] = None) -> str:
        limit = limit or self.base_summary_limit
        lines = []
        for cat, places in data.items():
            if not places:
                continue
            lines.append(f"\n{cat.upper()}:")
            for p in places[:limit]:
                pid = p.get("place_id", "unknown")
                name = p.get("title") or p.get("name") or "Unknown"
                r = p.get("rating")
                lines.append(f"  - {pid}: {name}" + (f" (★{r})" if r else ""))
        return "\n".join(lines)

    def _format_weather(self, w: Optional[Dict], dest: str) -> str:
        if not w or "error" in w:
            return "Weather data unavailable - plan for various conditions"
        cur, loc = w.get("current", {}), w.get("location", {})
        s = f"Current in {loc.get('city', dest)}: {cur.get('temperature', 0)}°C, {cur.get('description', 'unknown')}"
        if cur.get("humidity"):
            s += f", humidity {cur['humidity']}%"
        if cur.get("wind_speed"):
            s += f", wind {cur['wind_speed']} m/s"
        recs = w.get("recommendations", [])[:3]
        if recs:
            s += f". Recommendations: {'; '.join(recs)}"
        return s

    async def _get_weather_info(
        self, task: Optional[asyncio.Task], destination: str, request: Optional[Request]
    ) -> Tuple[Optional[Dict], str]:
        await self._check_request(request)
        w = None
        if task:
            try:
                w = await task
            except Exception as e:
                logger.warning("Weather task failed: %s", e)
        if not w or "error" in w:
            try:
                from services.weather_service import weather_service
                w = await weather_service.get_current_weather(destination)
            except Exception as e:
                logger.warning("Weather fetch failed: %s", e)
        return w, self._format_weather(w, destination)

    def _itinerary_prompt(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        total_days: int,
        places_summary: str,
        weather_info: str,
        budget_str: str,
        **ctx,
    ) -> str:
        dietary = ", ".join(ctx.get("dietary_preferences") or []) or "No restrictions"
        return f"""You are an expert travel planner. Create a {total_days}-day itinerary for {destination}.

DESTINATION: {destination} | DATES: {start_date} to {end_date} | TRAVELERS: {ctx.get('travel_companion') or f"{ctx.get('travelers', 1)} people"}
BUDGET: {budget_str} | PACE: {ctx.get('trip_pace') or 'Balanced'} | INTERESTS: {', '.join(ctx.get('interests') or [])}
ACCOMMODATION: {ctx.get('hotel_rating_preference') or ctx.get('accommodation_type') or 'Standard'} | DIETARY: {dietary}
WEATHER: {weather_info}

AVAILABLE PLACES (use ONLY these place_ids):
{places_summary}

RULES: 1) NEVER reuse place_id except hotel for check-in/out. 2) Day 1: hotel check-in first, include dinner. 3) Last day: dinner before departure. 4) 2-4 accommodations, 2-4 activities/day, 3-4 meals/day, EXACTLY 10-12 travel tips. 5) Return ONLY valid JSON, no markdown.

JSON structure: {{"destination":"...","total_days":N,"budget_estimate":0,"accommodation_suggestions":[{{"place_id","name","type","location","price_range"}}],"daily_plans":[{{"day", "date", "theme", "activities":[{{"time","place_id","title","duration","estimated_cost","type"}}],"meals":[{{"time","meal_type","place_id","name","cuisine","price_range"}}],"transportation":[{{"from","to","method","duration","cost"}}]}}],"place_ids_used":[],"travel_tips":[]}}

Generate the itinerary now:"""

    async def _generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float],
        budget_range: Optional[str],
        interests: List[str],
        travelers: int,
        travel_companion: Optional[str],
        trip_pace: Optional[str],
        departure_city: Optional[str],
        flight_class_preference: Optional[str],
        hotel_rating_preference: Optional[str],
        accommodation_type: Optional[str],
        email: Optional[str],
        dietary_preferences: List[str],
        halal_preferences: Optional[str],
        vegetarian_preferences: Optional[str],
        all_places: Dict[str, List[Dict]],
        weather_task: Optional[asyncio.Task],
        summary_limit: Optional[int],
        request: Optional[Request],
    ) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
        await self._check_request(request)
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        total_days = (end - start).days + 1
        weather_data, weather_info = await self._get_weather_info(weather_task, destination, request)

        ctx = locals()
        budget_str = budget_range or (f"${budget} USD" if budget else "Flexible")
        prompt = self._itinerary_prompt(
            destination, start_date, end_date, total_days,
            self._places_summary(all_places, summary_limit), weather_info, budget_str, **ctx
        )

        start_time = time.time()
        try:
            await self._check_request(request)
            resp = self.client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
            text = (resp.text or "").strip()
            elapsed = (time.time() - start_time) * 1000

            usage = getattr(resp, "usage_metadata", None)
            prompt_tok = getattr(usage, "prompt_token_count", 0) if usage else len(prompt) // 4
            completion_tok = getattr(usage, "candidates_token_count", 0) if usage else len(text) // 4

            text = _clean_json(text)
            try:
                data = json.loads(text)
            except json.JSONDecodeError as e:
                fixed = _fix_json(text)
                try:
                    data = json.loads(fixed)
                except json.JSONDecodeError:
                    os.makedirs("debug_responses", exist_ok=True)
                    path = f"debug_responses/failed_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(f"{e}\n---\n{text}\n---\n{fixed}\n")
                    logger.error("JSON parse failed, saved to %s", path)
                    raise

            data = self._fix_duplicate_place_ids(data, all_places)
            await self._log_ai_usage(request, True, prompt_tok, completion_tok, prompt, text[:1000],
                destination, start_date, end_date, total_days, budget, interests, travelers, data, elapsed)
            return data, weather_data

        except Exception as e:
            elapsed = (time.time() - start_time) * 1000
            logger.error("LLM generation error: %s", e)
            await self._log_ai_usage(request, False, len(prompt) // 4, 0, prompt, "", destination,
                start_date, end_date, total_days, None, [], 0, None, elapsed, str(e))
            return {
                "destination": destination, "total_days": total_days, "budget_estimate": budget,
                "accommodation_suggestions": [], "daily_plans": [], "place_ids_used": [],
                "travel_tips": ["Explore the local culture", "Try local cuisine"],
            }, weather_data

    async def _log_ai_usage(
        self,
        request: Optional[Request],
        success: bool,
        prompt_tok: int,
        completion_tok: int,
        prompt_text: str,
        response_text: str,
        destination: str,
        start_date: str,
        end_date: str,
        total_days: int,
        budget: Optional[float],
        interests: List[str],
        travelers: int,
        itinerary_data: Optional[Dict],
        elapsed_ms: float,
        error_msg: Optional[str] = None,
    ) -> None:
        if not request:
            return
        user_id = getattr(request.state, "user_id", None)
        user_email = getattr(request.state, "user_email", None)
        meta = {"place_ids_used": 0, "daily_plans": 0, "accommodation_suggestions": 0}
        if itinerary_data:
            meta = {
                "place_ids_used": len(itinerary_data.get("place_ids_used", [])),
                "daily_plans": len(itinerary_data.get("daily_plans", [])),
                "accommodation_suggestions": len(itinerary_data.get("accommodation_suggestions", [])),
            }
        await ai_tracking_service.log_ai_usage(
            provider=AIProvider.GEMINI,
            model="gemini-2.5-flash",
            task_type=AITaskType.ITINERARY_GENERATION,
            prompt_tokens=prompt_tok,
            completion_tokens=completion_tok,
            prompt_text=prompt_text,
            response_text=response_text,
            api_endpoint=getattr(request.url, "path", "/itinerary/generate-itinerary-complete"),
            http_method="POST",
            request=request,
            user_id=user_id,
            user_email=user_email,
            request_params={
                "destination": destination, "start_date": start_date, "end_date": end_date,
                "total_days": total_days, "budget": budget, "interests": interests, "travelers": travelers,
            },
            response_metadata=meta,
            success=success,
            error_message=error_msg,
            response_time_ms=elapsed_ms,
        )

    def _fix_duplicate_place_ids(
        self, data: Dict[str, Any], all_places: Dict[str, List[Dict]]
    ) -> Dict[str, Any]:
        available = {cat: [p["place_id"] for p in plcs if p.get("place_id")] for cat, plcs in all_places.items()}

        def unused(cat: str, exclude: Set[str]) -> Optional[str]:
            for pid in available.get(cat, []):
                if pid not in exclude:
                    return pid
            return None

        def cat_from_id(pid: str) -> str:
            return pid.split("_")[0] if "_" in pid else "attractions"

        used: Set[str] = set()
        hotel_id = None

        for acc in data.get("accommodation_suggestions", []):
            pid = acc.get("place_id")
            if pid:
                if pid in used:
                    new_id = unused("hotels", used)
                    if new_id:
                        acc["place_id"] = new_id
                        used.add(new_id)
                else:
                    used.add(pid)
                    if not hotel_id:
                        hotel_id = pid

        for day in data.get("daily_plans", []):
            for act in day.get("activities", []):
                pid = act.get("place_id")
                if pid and not (pid == hotel_id and act.get("type") == "accommodation"):
                    if pid in used:
                        new_id = unused(cat_from_id(pid), used)
                        if new_id:
                            act["place_id"] = new_id
                            used.add(new_id)
                    else:
                        used.add(pid)
            for meal in day.get("meals", []):
                pid = meal.get("place_id")
                if pid:
                    meal_cat = cat_from_id(pid)
                    if meal_cat not in ("restaurants", "cafes"):
                        meal_cat = "restaurants"
                    if pid in used:
                        new_id = unused(meal_cat, used)
                        if new_id:
                            meal["place_id"] = new_id
                            used.add(new_id)
                    else:
                        used.add(pid)

        data["place_ids_used"] = list(used)
        return data

    @staticmethod
    def _extract_used_place_ids(itinerary: Dict) -> Set[str]:
        ids = set(itinerary.get("place_ids_used", []))
        for day in itinerary.get("daily_plans", []):
            for act in day.get("activities", []):
                if "place_id" in act:
                    ids.add(act["place_id"])
            for meal in day.get("meals", []):
                if "place_id" in meal:
                    ids.add(meal["place_id"])
        for acc in itinerary.get("accommodation_suggestions", []):
            if "place_id" in acc:
                ids.add(acc["place_id"])
        return ids

    def _apply_place_metadata(self, itinerary: Dict, place_map: Dict[str, Dict]) -> None:
        if not itinerary or not place_map:
            return
        for acc in itinerary.get("accommodation_suggestions", []):
            p = place_map.get(acc.get("place_id"))
            if p:
                if p.get("title"):
                    acc["name"] = p["title"]
                if p.get("address"):
                    acc["location"] = p["address"]
                if p.get("price_range"):
                    acc["price_range"] = p["price_range"]
        for day in itinerary.get("daily_plans", []):
            for act in day.get("activities", []):
                p = place_map.get(act.get("place_id"))
                if p:
                    if p.get("title"):
                        act["title"] = p["title"]
                    if p.get("estimated_cost") is not None:
                        act["estimated_cost"] = f"${p['estimated_cost']}"
                    elif p.get("price_range"):
                        act["estimated_cost"] = p["price_range"]
            for meal in day.get("meals", []):
                p = place_map.get(meal.get("place_id"))
                if p:
                    if p.get("title"):
                        meal["name"] = p["title"]
                    if p.get("price_range"):
                        meal["price_range"] = p["price_range"]
                    if p.get("cuisine"):
                        meal["cuisine"] = p["cuisine"]
            for t in day.get("transportation", []):
                c = t.get("cost")
                if isinstance(c, (int, float)):
                    t["cost"] = f"${c}"

    def _budget_breakdown(
        self, itinerary: Dict, place_map: Dict
    ) -> Tuple[float, List[Dict]]:
        if not itinerary:
            return 0.0, []
        plans = itinerary.get("daily_plans") or []
        if not plans:
            return 0.0, []
        acc_cost = 0.0
        if itinerary.get("accommodation_suggestions"):
            acc = itinerary["accommodation_suggestions"][0]
            p = place_map.get(acc.get("place_id"))
            src = (p or acc).get("price_range") or acc.get("price")
            if src:
                acc_cost = _parse_price(src)
        total, breakdowns = 0.0, []
        for day in plans:
            meals = sum(_parse_price(m.get("price_range")) for m in day.get("meals", []))
            acts = sum(_parse_price(a.get("estimated_cost")) for a in day.get("activities", []))
            trans = sum(_parse_price(t.get("cost")) for t in day.get("transportation", []))
            day_total = meals + acts + trans + acc_cost
            total += day_total
            breakdowns.append({
                "meals": f"${round(meals, 2)}" if meals else "$0",
                "activities": f"${round(acts, 2)}" if acts else "$0",
                "transport": f"${round(trans, 2)}" if trans else "$0",
                "accommodation": f"${round(acc_cost, 2)}" if acc_cost else "$0",
                "total": f"${round(day_total, 2)}",
            })
        if total:
            itinerary.setdefault("budget_breakdown", {})
            itinerary["budget_breakdown"]["total"] = f"${round(total, 2)}"
            itinerary["budget_breakdown"]["per_day_average"] = f"${round(total / len(plans), 2)}"
        return total, breakdowns

    async def _build_response(
        self,
        itinerary: Dict[str, Any],
        all_places: Dict[str, List[Dict]],
        weather_data: Optional[Dict],
        request: Optional[Request],
    ) -> Dict[str, Any]:
        await self._check_request(request)
        place_map = {}
        for places in all_places.values():
            for p in places:
                pid = p.get("place_id")
                if pid:
                    place_map[pid] = p

        used_ids = self._extract_used_place_ids(itinerary)
        self._apply_place_metadata(itinerary, place_map)
        place_details = {pid: place_map[pid] for pid in used_ids if pid in place_map}
        additional = {cat: [p for p in plcs if p.get("place_id") not in used_ids] for cat, plcs in all_places.items()}

        total, daily = self._budget_breakdown(itinerary, place_map)
        if total:
            itinerary["budget_estimate"] = round(total, 2)
        for d, c in zip(itinerary.get("daily_plans", []), daily):
            if c:
                d.setdefault("budget_breakdown", {}).update(c)

        response = {
            "itinerary": itinerary,
            "place_details": place_details,
            "additional_places": additional,
            "weather": weather_data if weather_data and "error" not in weather_data else None,
            "metadata": {
                "total_places_prefetched": sum(len(p) for p in all_places.values()),
                "places_used_in_itinerary": len(place_details),
                "additional_places_available": sum(len(p) for p in additional.values()),
                "generation_timestamp": datetime.now().isoformat(),
                "workflow_type": "optimized_prefetch",
                "weather_included": weather_data is not None and "error" not in weather_data,
            },
        }

        try:
            from utils.image_utils import proxy_all_images_in_response, get_backend_url_from_request
            backend_url = get_backend_url_from_request(request)
            response = proxy_all_images_in_response(response, backend_url)
        except Exception as e:
            logger.warning("Image proxy failed: %s", e)

        try:
            from services.photo_prefetch_service import photo_prefetch_service
            urls = photo_prefetch_service.extract_all_photo_urls(response)
            response["photo_prefetch"] = photo_prefetch_service.generate_prefetch_metadata(urls)
        except Exception as e:
            logger.warning("Photo prefetch failed: %s", e)
            response["photo_prefetch"] = {"photo_urls": [], "total_photos": 0}

        return response

    def _clean_json_response(self, text: str) -> str:
        """Public alias for itinerary_service compatibility."""
        return _clean_json(text)
