from typing import Dict, List, Optional


FAST_ITINERARY_PROMPT_TEMPLATE = """You are an elite travel planner tasked with crafting a bespoke, logistically sound itinerary for {destination}.
Follow EVERY rule:
1. Return STRICT JSON only (UTF-8, double quotes, no trailing commas, no markdown or commentary).
2. Create exactly {total_days} entries in daily_plans covering every day from {start_date} through {end_date}.
3. Day 1 MUST begin with a hotel check-in/arrival activity; the final day MUST acknowledge departure or hotel check-out.
4. Provide 2-4 curated activities per day (after Day 1 check-in) using 24-hour time, chronological order, realistic durations, and descriptions tailored to {destination} and {interests_description}.
5. Provide 3-4 meals per day spanning breakfast, lunch, dinner, and optional snack/tea. meal_type must be one of ["breakfast","brunch","lunch","snack","tea","dinner"].
6. Include a dinner entry on Day 1 and another on the final day.
7. Ensure at least one activity per day aligns with the stated interests (or culturally iconic experiences when interests are general).
8. Add transportation entries for every major transition (including airport transfers) with realistic method, duration, and cost details.
9. Keep monetary values consistent with the declared budget and local pricing norms; align totals with the overall budget narrative.
10. Do not repeat venues or neighborhoods unless logistically required; if reuse is necessary (e.g., returning to the hotel), explain the reason in the description.
11. Enrich activities and meals with actionable insights (reservation tips, etiquette, seasonal advice, best time to visit, etc.).
12. Include at least two distinct accommodation_suggestions representing varied styles or price points for the trip profile.
13. Populate daily_plans.theme with concise, evocative summaries of each day’s focus.
14. Provide EXACTLY 10-12 destination-aware travel_tips that are practical and non-redundant.
15. Use the {currency_symbol} symbol for every monetary amount; all values must be in {currency_code}.
16. Respect weather context: {weather_summary}.
17. Respect dietary considerations: {dietary_summary}.

RESPONSE FORMAT (strict JSON):
{{
  "destination": "{destination}",
  "total_days": {total_days},
  "budget_estimate": 0,
  "accommodation_suggestions": [
    {{
      "name": "Hotel Name",
      "type": "hotel",
      "location": "Historic Center District",
      "price_range": "{currency_symbol}100-150/night",
      "brief_description": "Modern comfort near major sights"
    }},
    {{
      "name": "Boutique Stay",
      "type": "boutique_hotel",
      "location": "Creative Arts District",
      "price_range": "{currency_symbol}160-210/night",
      "brief_description": "Design-led property with breakfast included"
    }}
  ],
  "daily_plans": [
    {{
      "day": 1,
      "date": "{start_date}",
      "theme": "Arrival & Hotel Check-in",
      "activities": [
        {{
          "time": "12:00",
          "title": "Hotel Check-in & Arrival",
          "description": "Check into hotel and settle in",
          "location": "Historic Center District",
          "duration": "1 hour",
          "estimated_cost": "{currency_symbol}0",
          "type": "accommodation"
        }}
      ],
      "meals": [
        {{
          "time": "09:00",
          "meal_type": "breakfast",
          "name": "Morning Bistro",
          "cuisine": "Continental",
          "location": "Hotel Lobby Cafe",
          "price_range": "{currency_symbol}1,200-1,500"
        }},
        {{
          "time": "13:00",
          "meal_type": "lunch",
          "name": "Market Hall Eatery",
          "cuisine": "Local",
          "location": "Old Town Market Hall",
          "price_range": "{currency_symbol}1,800-2,400"
        }},
        {{
          "time": "16:30",
          "meal_type": "snack",
          "name": "Artisan Gelateria",
          "cuisine": "Dessert",
          "location": "Cathedral Quarter",
          "price_range": "{currency_symbol}600-900"
        }},
        {{
          "time": "19:00",
          "meal_type": "dinner",
          "name": "Harborview Dining Room",
          "cuisine": "International",
          "location": "Harborfront Dining Pier",
          "price_range": "{currency_symbol}2,800-3,600"
        }}
      ],
      "transportation": [
        {{
          "from": "Airport",
          "to": "Hotel",
          "method": "taxi",
          "duration": "30 minutes",
          "cost": "{currency_symbol}1,800"
        }}
      ]
    }}
  ],
  "travel_tips": [
    "Book timed-entry tickets for headline attractions before departure",
    "Carry small-denomination cash for markets and street food",
    "Confirm dress codes for religious or heritage sites in advance",
    "Use the metro or tram during rush hour to avoid traffic jams",
    "Reserve dinner tables two days ahead for popular restaurants",
    "Keep a reusable water bottle; public refill stations are common",
    "Check weather alerts each morning for sudden climate shifts",
    "Download the official city transport app for live updates",
    "Plan indoor experiences during midday heat or heavy rain",
    "Keep digital and printed copies of essential travel documents",
    "Learn basic local phrases to enhance service interactions",
    "Tipping norms vary—round up 5-10% in restaurants unless included"
  ]
}}

Generate the itinerary now."""


def build_fast_itinerary_prompt(
    destination: str,
    start_date: str,
    end_date: str,
    total_days: int,
    travelers: int,
    travel_companion: Optional[str] = None,
    budget: Optional[float] = None,
    budget_range: Optional[str] = None,
    trip_pace: Optional[str] = None,
    interests: Optional[List[str]] = None,
    accommodation_type: Optional[str] = None,
    hotel_rating_preference: Optional[str] = None,
    dietary_preferences: Optional[List[str]] = None,
    halal_preferences: Optional[str] = None,
    vegetarian_preferences: Optional[str] = None,
    weather_data: Optional[Dict] = None,
    currency_code: str = "INR",
) -> str:
    """Return the fast itinerary prompt text with variables injected."""

    variables = build_fast_itinerary_prompt_variables(
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        total_days=total_days,
        travelers=travelers,
        travel_companion=travel_companion,
        budget=budget,
        budget_range=budget_range,
        trip_pace=trip_pace,
        interests=interests or [],
        accommodation_type=accommodation_type,
        hotel_rating_preference=hotel_rating_preference,
        dietary_preferences=dietary_preferences or [],
        halal_preferences=halal_preferences,
        vegetarian_preferences=vegetarian_preferences,
        weather_summary=format_weather_info(weather_data, destination),
        currency_code=currency_code,
    )

    return FAST_ITINERARY_PROMPT_TEMPLATE.format(**variables)


def format_weather_info(weather_data: Optional[Dict] = None, destination: str = "destination") -> str:
    """Format weather information for inclusion in prompts."""
    if not weather_data or "error" in weather_data:
        return f"Weather data unavailable for {destination}; plan for a range of conditions."

    current = weather_data.get("current", {})
    location = weather_data.get("location", {})

    temp = current.get("temperature")
    description = current.get("description", "unknown conditions")
    humidity = current.get("humidity")
    wind_speed = current.get("wind_speed")

    city = location.get("city", destination)
    segments = [f"Current weather in {city}: {temp}°C" if temp is not None else f"Weather update for {city}"]
    if description:
        segments.append(description)
    if humidity is not None:
        segments.append(f"humidity {humidity}%")
    if wind_speed is not None:
        segments.append(f"wind {wind_speed} m/s")

    summary = ", ".join(segments)
    recommendations = weather_data.get("recommendations", [])
    if recommendations:
        summary += ". Recommendations: " + "; ".join(recommendations[:3])

    return summary


def format_budget_info(
    budget: Optional[float],
    budget_range: Optional[str] = None,
    travelers: int = 1,
    currency_symbol: str = "$",
) -> str:
    """Return a readable budget summary string."""

    if budget_range:
        return budget_range

    if budget is not None:
        per_person = budget / max(travelers, 1)
        return f"{currency_symbol}{budget:,.0f} total (~{currency_symbol}{per_person:,.0f} per traveler)"

    plural = "s" if travelers != 1 else ""
    return f"Flexible budget for {travelers} traveler{plural}"


def format_interests(interests: List[str]) -> str:
    if not interests:
        return "general sightseeing and local experiences"
    return ", ".join(interests)


def format_accommodation_type(accommodation_type: Optional[str], hotel_rating: Optional[str] = None) -> str:
    if accommodation_type:
        return accommodation_type
    if hotel_rating:
        return f"hotel ({hotel_rating})"
    return "hotel"


def format_travel_companion(travelers: int, companion_type: Optional[str] = None) -> str:
    if companion_type:
        return companion_type
    if travelers == 1:
        return "solo traveler"
    if travelers == 2:
        return "couple"
    return f"group of {travelers}"


def format_trip_pace(trip_pace: Optional[str]) -> str:
    return trip_pace or "balanced"


def format_dietary_preferences(
    dietary_preferences: List[str],
    halal_preferences: Optional[str] = None,
    vegetarian_preferences: Optional[str] = None,
) -> str:
    preferences: List[str] = []
    if halal_preferences:
        preferences.append(f"halal: {halal_preferences}")
    if vegetarian_preferences:
        preferences.append(f"vegetarian: {vegetarian_preferences}")
    preferences.extend(dietary_preferences)

    return ", ".join(preferences) if preferences else "no specific dietary restrictions"


def format_currency_symbol(currency: str) -> str:
    mapping = {
        "INR": "₹",
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "AUD": "A$",
        "CAD": "C$",
        "JPY": "¥",
    }
    return mapping.get(currency.upper(), currency.upper())


def build_fast_itinerary_prompt_variables(
    destination: str,
    start_date: str,
    end_date: str,
    total_days: int,
    travelers: int,
    travel_companion: Optional[str],
    budget: Optional[float],
    budget_range: Optional[str],
    trip_pace: Optional[str],
    interests: List[str],
    accommodation_type: Optional[str],
    hotel_rating_preference: Optional[str],
    dietary_preferences: List[str],
    halal_preferences: Optional[str],
    vegetarian_preferences: Optional[str],
    weather_summary: str,
    currency_code: str = "INR",
) -> Dict[str, str]:
    currency_symbol = format_currency_symbol(currency_code)
    budget_display = format_budget_info(budget, budget_range, travelers, currency_symbol)

    return {
        "destination": destination,
        "start_date": start_date,
        "end_date": end_date,
        "total_days": total_days,
        "companion_description": format_travel_companion(travelers, travel_companion),
        "budget_display": budget_display,
        "trip_pace_description": format_trip_pace(trip_pace),
        "interests_description": format_interests(interests),
        "accommodation_summary": format_accommodation_type(accommodation_type, hotel_rating_preference),
        "dietary_summary": format_dietary_preferences(dietary_preferences, halal_preferences, vegetarian_preferences),
        "weather_summary": weather_summary,
        "currency_code": currency_code.upper(),
        "currency_symbol": currency_symbol,
    }
