"""
Optimized Itinerary Service - Streamlined interface to the LangGraph workflow.

This service:
- Provides a clean API for itinerary generation
- Handles caching for split-request flows
- Manages currency conversion
- Provides fallback handling
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from uuid import uuid4

from fastapi import HTTPException
from starlette.requests import Request

from workflows.langgraph_itinerary_workflow import AgenticItineraryWorkflow
from services.cache_service import cache_service
from utils.currency_utils import convert_currency_payload, convert_currency_strings

logger = logging.getLogger(__name__)


class ItineraryService:
    """
    Service layer for itinerary generation.
    Wraps the LangGraph workflow with caching and error handling.
    """
    
    DETAILS_CACHE_TTL = 1800  # 30 minutes

    def __init__(self):
        try:
            self.workflow = AgenticItineraryWorkflow()
            logger.info("Itinerary service initialized with LangGraph workflow")
        except Exception as e:
            logger.error("Failed to initialize workflow: %s", str(e))
            raise

    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        budget_range: Optional[str] = None,
        interests: List[str] = None,
        travelers: int = 1,
        travel_companion: Optional[str] = None,
        trip_pace: Optional[str] = None,
        departure_city: Optional[str] = None,
        flight_class_preference: Optional[str] = None,
        hotel_rating_preference: Optional[str] = None,
        accommodation_type: Optional[str] = None,
        email: Optional[str] = None,
        dietary_preferences: List[str] = None,
        halal_preferences: Optional[str] = None,
        vegetarian_preferences: Optional[str] = None,
        request: Optional[Request] = None
    ) -> Dict[str, Any]:
        """
        Generate a complete itinerary with all place details and additional places.
        Returns the full payload in a single response.
        """
        interests = interests or []
        dietary_preferences = dietary_preferences or []
        
        # Check if client is still connected
        await self._check_client_connection(request)
        
        logger.info(
            "Generating itinerary: destination=%s, dates=%s to %s, travelers=%d",
            destination, start_date, end_date, travelers
        )

        try:
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
            )
            
            # Convert currency to INR
            return convert_currency_payload(response)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Itinerary generation failed: %s", str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate itinerary: {str(e)}"
            )

    async def generate_itinerary_structure(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        budget_range: Optional[str] = None,
        interests: List[str] = None,
        travelers: int = 1,
        travel_companion: Optional[str] = None,
        trip_pace: Optional[str] = None,
        departure_city: Optional[str] = None,
        flight_class_preference: Optional[str] = None,
        hotel_rating_preference: Optional[str] = None,
        accommodation_type: Optional[str] = None,
        email: Optional[str] = None,
        dietary_preferences: List[str] = None,
        halal_preferences: Optional[str] = None,
        vegetarian_preferences: Optional[str] = None,
        request: Optional[Request] = None
    ) -> Dict[str, Any]:
        """
        Generate itinerary structure and cache detailed data for secondary retrieval.
        
        This is the first step in a split-request flow:
        1. This endpoint returns the itinerary structure quickly
        2. A details_token is provided for fetching cached place details
        """
        interests = interests or []
        dietary_preferences = dietary_preferences or []
        
        await self._check_client_connection(request)

        # Generate full response
        full_response = await self.generate_itinerary(
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

        # Extract structure vs details
        itinerary = full_response.get("itinerary", {})
        weather = full_response.get("weather")

        # Cache heavy payload for follow-up request
        details_token = str(uuid4())
        cache_payload = {
            "place_details": full_response.get("place_details", {}),
            "additional_places": full_response.get("additional_places", {}),
            "weather": weather,
            "metadata": full_response.get("metadata", {}),
        }

        await cache_service.store_json(
            key=f"itinerary:details:{details_token}",
            data=cache_payload,
            ttl=self.DETAILS_CACHE_TTL,
        )

        # Add token to itinerary metadata
        if isinstance(itinerary, dict):
            metadata = itinerary.setdefault("metadata", {})
            metadata["details_token"] = details_token
            metadata["details_expires_in"] = self.DETAILS_CACHE_TTL
            metadata["currency"] = "INR"

        # Return structure with weather
        response = {"itinerary": itinerary}
        if weather:
            response["weather"] = weather
            
        return response

    async def get_itinerary_details(
        self,
        token: Optional[str] = None,
        place_ids: Optional[List[str]] = None,
        include_additional: bool = True,
    ) -> Dict[str, Any]:
        """
        Retrieve cached place details for an itinerary.
        
        This is the second step in a split-request flow:
        1. Use the details_token from generate_itinerary_structure
        2. Or provide specific place_ids to fetch
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
                    
                if cached.get("weather"):
                    response["weather"] = cached["weather"]
                    
                response["metadata"] = {
                    **cached.get("metadata", {}),
                    "details_token": token,
                    "details_expires_in": self.DETAILS_CACHE_TTL,
                }
                
                return response

        if place_ids:
            # Fallback: fetch specific places on-demand
            from services.place_details_service import PlaceDetailsService
            place_service = PlaceDetailsService()
            
            details_list = await place_service.get_place_details(place_ids)
            details_dict: Dict[str, Any] = {}
            
            for detail in details_list:
                if hasattr(detail, "model_dump"):
                    details_dict[detail.place_id] = detail.model_dump()
                elif hasattr(detail, "place_id"):
                    details_dict[detail.place_id] = detail
                    
            convert_currency_strings(details_dict)
            return {"place_details": details_dict}

        raise ValueError("Provide either token or place_ids")

    async def _check_client_connection(self, request: Optional[Request]) -> None:
        """Check if the client is still connected."""
        if request and await request.is_disconnected():
            logger.info("Client disconnected during itinerary generation")
            raise HTTPException(status_code=499, detail="Client disconnected")
