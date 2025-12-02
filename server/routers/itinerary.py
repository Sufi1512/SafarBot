"""
Itinerary Router - Streamlined API endpoints for itinerary generation.

Endpoints:
- POST /generate-itinerary: Complete itinerary with all details (primary)

Legacy split-flow and additional endpoints have been removed to simplify the API:
- /generate-itinerary-structure
- /generate-itinerary-details
- /places/additional
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
import logging

from models import ItineraryRequest
from services.itinerary_service import ItineraryService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
itinerary_service = ItineraryService()


# =============================================================================
# PRIMARY ENDPOINT - Complete itinerary generation
# =============================================================================

@router.post("/generate-itinerary")
async def generate_itinerary(request_body: ItineraryRequest, http_request: Request):
    """
    Generate a complete AI-powered travel itinerary.
    
    Returns:
    - Full itinerary with daily plans
    - Place details with ratings, images, coordinates
    - Additional place suggestions
    - Weather information
    
    Processing time: 30-90 seconds depending on trip length
    """
    try:
        logger.info("Itinerary request: %s", request_body.destination)
        
        response = await itinerary_service.generate_itinerary(
            destination=request_body.destination,
            start_date=request_body.start_date,
            end_date=request_body.end_date,
            budget=request_body.budget,
            budget_range=request_body.budget_range,
            interests=request_body.interests,
            travelers=request_body.travelers,
            travel_companion=request_body.travel_companion,
            trip_pace=request_body.trip_pace,
            departure_city=request_body.departure_city,
            flight_class_preference=request_body.flight_class_preference,
            hotel_rating_preference=request_body.hotel_rating_preference,
            accommodation_type=request_body.accommodation_type,
            email=request_body.email,
            dietary_preferences=request_body.dietary_preferences,
            halal_preferences=request_body.halal_preferences,
            vegetarian_preferences=request_body.vegetarian_preferences,
            request=http_request
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Itinerary generation error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# CORS OPTIONS HANDLERS
# =============================================================================

@router.options("/generate-itinerary")
async def handle_options():
    """Handle CORS preflight requests."""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )
