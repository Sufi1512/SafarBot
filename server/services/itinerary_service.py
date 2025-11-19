import asyncio
from datetime import date, timedelta, datetime
from typing import List, Dict, Any, Optional
from uuid import uuid4
import logging
from fastapi import HTTPException
from starlette.requests import Request
from models import ItineraryResponse, DailyPlan
from workflows.optimized_prefetch_workflow import OptimizedPrefetchWorkflow
from services.cache_service import cache_service
from services.place_details_service import PlaceDetailsService
from utils.currency_utils import (
    convert_currency_payload,
    convert_currency_strings,
)
import json
from prompts.itinerary_prompts import format_accommodation_type

logger = logging.getLogger(__name__)

class ItineraryService:
    def __init__(self):
        # Initialize structured workflow
        try:
            self.workflow = OptimizedPrefetchWorkflow()
            logger.info("Structured itinerary workflow initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize itinerary workflow: {str(e)}")
            self.workflow = None
        self.place_details_service = PlaceDetailsService()
        self.details_cache_ttl = 1800  # 30 minutes

    async def _generate_complete_response(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        budget_range: Optional[str] = None,
        interests: List[str] = [],
        travelers: int = 1,
        travel_companion: Optional[str] = None,
        trip_pace: Optional[str] = None,
        departure_city: Optional[str] = None,
        flight_class_preference: Optional[str] = None,
        hotel_rating_preference: Optional[str] = None,
        accommodation_type: Optional[str] = None,
        email: Optional[str] = None,
        dietary_preferences: List[str] = [],
        halal_preferences: Optional[str] = None,
        vegetarian_preferences: Optional[str] = None,
        request: Optional[Request] = None
    ) -> Dict[str, Any]:
        """
        Internal helper that orchestrates the optimized itinerary workflow and returns
        the complete payload (itinerary + place details + additional places).
        """

        await self._ensure_client_connected(request)
        print("\n" + "=" * 80)
        print("🚀 ITINERARY SERVICE - STARTING GENERATION")
        print("=" * 80)
        print(f"📍 Destination: {destination}")
        print(f"📅 Dates: {start_date} to {end_date}")
        print(f"👥 Travelers: {travelers} ({travel_companion or 'General'})")
        print(f"💰 Budget: ${budget if budget else 'Flexible'} ({budget_range or 'Not specified'})")
        print(f"🎯 Interests: {', '.join(interests) if interests else 'General'}")
        print(f"🏨 Accommodation: {hotel_rating_preference or accommodation_type or 'Standard'}")
        print(f"🚶 Trip Pace: {trip_pace or 'Balanced'}")
        print(f"🍽️ Dietary: {', '.join(dietary_preferences) if dietary_preferences else 'No restrictions'}")
        print("-" * 80)

        try:
            if not self.workflow:
                print("⚠️  WORKFLOW NOT CONFIGURED - Using fallback")
                logger.warning("LangGraph workflow not configured, returning fallback itinerary")
                await self._ensure_client_connected(request)
                fallback = await self._generate_fallback_itinerary(
                    destination, start_date, end_date, budget, interests, travelers, accommodation_type
                )
                return {"itinerary": fallback.model_dump() if hasattr(fallback, "model_dump") else fallback}

            print("✅ OPTIMIZED WORKFLOW INITIALIZED - Starting complete generation")
            logger.info(f"Generating complete itinerary for {destination} using optimized workflow")

            await self._ensure_client_connected(request)
            response = await self.workflow.generate_complete_itinerary(
                destination=destination,
                start_date=start_date,
                end_date=end_date,
                budget=budget,
                budget_range=budget_range,
                interests=interests,
                travelers=travelers,
                travel_companion=travel_companion,
                trip_pace=trip_pace,
                departure_city=departure_city,
                flight_class_preference=flight_class_preference,
                hotel_rating_preference=hotel_rating_preference,
                accommodation_type=accommodation_type,
                email=email,
                dietary_preferences=dietary_preferences,
                halal_preferences=halal_preferences,
                vegetarian_preferences=vegetarian_preferences,
                request=request
            )

            await self._ensure_client_connected(request)
            print("✅ COMPLETE ITINERARY GENERATION COMPLETED SUCCESSFULLY")
            itinerary = response.get('itinerary', {})
            place_details = response.get('place_details', {})
            additional_places = response.get('additional_places', {})

            print(f"📊 Generated {len(itinerary.get('daily_plans', []))} days")
            print(f"💰 Budget: ${itinerary.get('budget_estimate', 0)}")
            print(f"📍 Place details: {len(place_details)} places")
            print(f"🎯 Additional places: {sum(len(places) for places in additional_places.values())}")
            print("=" * 80)

            return response

        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ ERROR IN ITINERARY GENERATION: {str(e)}")
            logger.error(f"Error generating itinerary: {str(e)}")

            # Check if it's a Google API error
            if "500 An internal error has occurred" in str(e):
                print("🔧 ERROR TYPE: Google API Internal Error")
                raise Exception("AI service is temporarily unavailable. Please try again in a few minutes.")
            elif "API key" in str(e).lower() or "authentication" in str(e).lower():
                print("🔑 ERROR TYPE: API Key/Authentication Error")
                raise Exception("AI service configuration error. Please contact support.")
            elif "quota" in str(e).lower() or "rate limit" in str(e).lower():
                print("⏱️  ERROR TYPE: Rate Limit/Quota Error")
                raise Exception("AI service is currently busy. Please try again later.")
            else:
                print(f"🚨 ERROR TYPE: General Error - {str(e)}")
                raise Exception(f"Failed to generate itinerary: {str(e)}")

    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        budget_range: Optional[str] = None,
        interests: List[str] = [],
        travelers: int = 1,
        travel_companion: Optional[str] = None,
        trip_pace: Optional[str] = None,
        departure_city: Optional[str] = None,
        flight_class_preference: Optional[str] = None,
        hotel_rating_preference: Optional[str] = None,
        accommodation_type: Optional[str] = None,
        email: Optional[str] = None,
        dietary_preferences: List[str] = [],
        halal_preferences: Optional[str] = None,
        vegetarian_preferences: Optional[str] = None,
        request: Optional[Request] = None
    ) -> Dict[str, Any]:
        """
        Public method that returns the full itinerary payload including
        place details and additional places.
        """

        response = await self._generate_complete_response(
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            budget_range=budget_range,
            interests=interests,
            travelers=travelers,
            travel_companion=travel_companion,
            trip_pace=trip_pace,
            departure_city=departure_city,
            flight_class_preference=flight_class_preference,
            hotel_rating_preference=hotel_rating_preference,
            accommodation_type=accommodation_type,
            email=email,
            dietary_preferences=dietary_preferences,
            halal_preferences=halal_preferences,
            vegetarian_preferences=vegetarian_preferences,
            request=request
        )

        return convert_currency_payload(response)

    async def generate_itinerary_structure(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        budget_range: Optional[str] = None,
        interests: List[str] = [],
        travelers: int = 1,
        travel_companion: Optional[str] = None,
        trip_pace: Optional[str] = None,
        departure_city: Optional[str] = None,
        flight_class_preference: Optional[str] = None,
        hotel_rating_preference: Optional[str] = None,
        accommodation_type: Optional[str] = None,
        email: Optional[str] = None,
        dietary_preferences: List[str] = [],
        halal_preferences: Optional[str] = None,
        vegetarian_preferences: Optional[str] = None,
        request: Optional[Request] = None
    ) -> Dict[str, Any]:
        """Generate itinerary structure only and cache detailed data for later retrieval."""

        response = await self._generate_complete_response(
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            budget_range=budget_range,
            interests=interests,
            travelers=travelers,
            travel_companion=travel_companion,
            trip_pace=trip_pace,
            departure_city=departure_city,
            flight_class_preference=flight_class_preference,
            hotel_rating_preference=hotel_rating_preference,
            accommodation_type=accommodation_type,
            email=email,
            dietary_preferences=dietary_preferences,
            halal_preferences=halal_preferences,
            vegetarian_preferences=vegetarian_preferences,
            request=request
        )

        convert_currency_payload(response)

        itinerary = response.get("itinerary", {}) if isinstance(response, dict) else response
        weather = response.get("weather") if isinstance(response, dict) else None

        # Cache heavy payload for follow-up API call
        details_token = str(uuid4())
        cache_payload = {
            "place_details": response.get("place_details", {}),
            "additional_places": response.get("additional_places", {}),
            "weather": response.get("weather"),
            "metadata": response.get("metadata", {}),
        }

        await self._ensure_client_connected(request)
        await cache_service.store_json(
            key=f"itinerary:details:{details_token}",
            data=cache_payload,
            ttl=self.details_cache_ttl,
        )

        if isinstance(itinerary, dict):
            metadata = itinerary.setdefault("metadata", {})
            metadata["details_token"] = details_token
            metadata["details_expires_in"] = self.details_cache_ttl
            metadata["currency"] = "INR"

        response_body: Dict[str, Any] = {"itinerary": itinerary}
        if weather is not None:
            response_body["weather"] = weather

        return response_body

    async def get_itinerary_details(
        self,
        token: Optional[str] = None,
        place_ids: Optional[List[str]] = None,
        include_additional: bool = True,
    ) -> Dict[str, Any]:
        """
        Retrieve cached place details for an itinerary or fetch them on demand using place IDs.
        """

        if token:
            cached = await cache_service.get_json(f"itinerary:details:{token}")
            if cached:
                convert_currency_strings(cached)
                response: Dict[str, Any] = {
                    "place_details": cached.get("place_details", {}),
                }
                if include_additional:
                    response["additional_places"] = cached.get("additional_places", {})
                if cached.get("weather") is not None:
                    response["weather"] = cached.get("weather")
                metadata_source = cached.get("metadata", {})
                metadata = metadata_source.copy() if isinstance(metadata_source, dict) else {}
                metadata["details_token"] = token
                metadata["details_expires_in"] = self.details_cache_ttl
                response["metadata"] = metadata
                return response

        if place_ids:
            details_list = await self.place_details_service.get_place_details(place_ids)
            details_dict: Dict[str, Any] = {}
            for detail in details_list:
                if hasattr(detail, "model_dump"):
                    details_dict[detail.place_id] = detail.model_dump()
                else:
                    details_dict[detail.place_id] = detail

            convert_currency_strings(details_dict)
            return {"place_details": details_dict}

        raise ValueError("No itinerary details token or place_ids provided")

    async def _ensure_client_connected(self, request: Optional[Request]) -> None:
        if request and await request.is_disconnected():
            logger.info("Client disconnected during itinerary generation")
            raise HTTPException(status_code=499, detail="Client disconnected")
    
    async def predict_prices(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Predict travel costs for the given destination and dates using LangGraph workflow
        """
        try:
            if not self.workflow:
                raise Exception("LangGraph workflow is not properly configured")
            
            # Use the workflow's LLM directly for price prediction
            # This could be enhanced to be part of the main workflow in the future
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            total_days = (end_date_obj - start_date_obj).days + 1
            
            if not self.workflow.llm:
                raise Exception("AI service not available in workflow")

            prompt_text = (
                "You are a travel cost estimation expert.\n"
                f"Destination: {destination}.\n"
                f"Dates: {start_date} to {end_date} ({total_days} days).\n"
                f"Travelers: {travelers}.\n"
                f"Preferred accommodation: {format_accommodation_type(accommodation_type)}.\n"
                "Provide a JSON object with estimated costs (flights, accommodation, daily spending, activities, contingency) in USD."
            )

            response = await self.workflow.llm.ainvoke(prompt_text)
            
            # Clean and parse the response
            cleaned_text = self.workflow._clean_json_response(response.content)
            
            try:
                price_prediction = json.loads(cleaned_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse price prediction JSON: {cleaned_text[:200]}...")
                raise Exception(f"Invalid JSON response from AI service: {str(e)}")
            
            return price_prediction
            
        except Exception as e:
            logger.error(f"Error predicting prices: {str(e)}")
            raise Exception(f"Failed to predict prices: {str(e)}")
    
    async def _generate_fallback_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        interests: List[str] = [],
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> ItineraryResponse:
        """
        Generate a basic fallback itinerary when LangGraph workflow is unavailable
        """
        # Use the workflow's fallback method if available, otherwise create a simple one
        if self.workflow:
            try:
                return await self.workflow._generate_fallback_itinerary(
                    destination, start_date, end_date, budget, interests, travelers, accommodation_type
                )
            except:
                pass  # Fall through to simple fallback
        
        # Simple fallback when everything else fails
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        total_days = (end_date_obj - start_date_obj).days + 1
        current_date = start_date_obj
        
        daily_plans = []
        for day_num in range(1, total_days + 1):
            daily_plan = DailyPlan(
                day=day_num,
                date=current_date.strftime("%Y-%m-%d"),
                activities=[
                    {
                        "time": "09:00",
                        "title": f"Explore {destination}",
                        "description": f"Discover the beautiful city of {destination}",
                        "location": destination,
                        "duration": "4 hours",
                        "cost": 20,
                        "type": "sightseeing"
                    },
                    {
                        "time": "14:00",
                        "title": "Local Cuisine Experience",
                        "description": f"Try authentic local food in {destination}",
                        "location": destination,
                        "duration": "2 hours",
                        "cost": 15,
                        "type": "food"
                    }
                ],
                meals=[
                    {
                        "name": f"Local Restaurant in {destination}",
                        "cuisine": "Local",
                        "rating": 4.0,
                        "price_range": "$$",
                        "description": f"Enjoy authentic local cuisine in {destination}"
                    }
                ],
                accommodation={
                    "name": f"Hotel in {destination}",
                    "rating": 3.5,
                    "price": 80,
                    "amenities": ["WiFi", "Air Conditioning"],
                    "location": destination
                },
                transport=[
                    {
                        "type": "walking",
                        "description": "Explore the city on foot",
                        "duration": "30 minutes"
                    }
                ]
            )
            daily_plans.append(daily_plan)
            current_date += timedelta(days=1)
        
        return ItineraryResponse(
            destination=destination,
            total_days=total_days,
            budget_estimate=budget or 1000.0,
            daily_plans=daily_plans,
            recommendations={
                "hotels": [f"Look for well-reviewed hotels in {destination}"],
                "restaurants": [f"Try local restaurants in {destination}"],
                "tips": [
                    "Service is temporarily unavailable. This is a basic itinerary.",
                    "Transportation: Use local public transport for cost-effective travel.",
                    "Safety: Always be aware of your surroundings and keep belongings secure.",
                    "Culture: Respect local customs and dress appropriately for religious sites.",
                    "Planning: Book popular attractions in advance to avoid disappointment."
                ]
            }
        ) 