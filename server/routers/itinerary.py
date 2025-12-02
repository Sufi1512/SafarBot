"""
Itinerary Router - Streamlined API endpoints for itinerary generation.

Endpoints:
- POST /generate-itinerary: Complete itinerary with all details (primary)
- POST /generate-itinerary-structure: Structure only, details cached (split flow step 1)
- POST /generate-itinerary-details: Fetch cached details (split flow step 2)
- POST /places/additional: Get additional place suggestions
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
import logging

from models import (
    ItineraryRequest,
    AdditionalPlacesRequest,
    AdditionalPlacesResponse,
    ItineraryDetailsRequest,
)
from services.itinerary_service import ItineraryService
from services.additional_places_service import AdditionalPlacesService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
itinerary_service = ItineraryService()
additional_places_service = AdditionalPlacesService()


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
# SPLIT FLOW - For faster initial response
# =============================================================================

@router.post("/generate-itinerary-structure")
async def generate_itinerary_structure(request_body: ItineraryRequest, http_request: Request):
    """
    Generate itinerary structure with cached details.
    
    Use this for faster initial response:
    1. Call this endpoint - returns itinerary structure + details_token
    2. Display itinerary to user immediately
    3. Call /generate-itinerary-details with token to fetch place details
    
    Returns:
    - Itinerary structure
    - details_token for fetching cached place data
    - Weather summary
    """
    try:
        logger.info("Structure request: %s", request_body.destination)
        
        response = await itinerary_service.generate_itinerary_structure(
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
        logger.error("Structure generation error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-itinerary-details")
async def generate_itinerary_details(request_body: ItineraryDetailsRequest):
    """
    Fetch cached place details for an itinerary.
    
    Use after /generate-itinerary-structure to get:
    - Full place details (images, reviews, contact info)
    - Additional place suggestions
    - Weather data
    
    Request:
    - token: The details_token from structure response
    - place_ids: Alternative - list of specific place IDs to fetch
    - include_additional: Whether to include additional suggestions (default true)
    """
    try:
        response = await itinerary_service.get_itinerary_details(
            token=request_body.token,
            place_ids=request_body.place_ids,
            include_additional=request_body.include_additional,
        )
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Details fetch error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# ADDITIONAL PLACES - Supplementary suggestions
# =============================================================================

@router.post("/places/additional")
async def get_additional_places(request: AdditionalPlacesRequest):
    """
    Get additional place suggestions for a destination.
    
    Returns comprehensive suggestions beyond the itinerary:
    - Hotels
    - Restaurants and cafes
    - Attractions
    - Interest-based suggestions
    
    Perfect for "Explore More" sections in the UI.
    """
    try:
        logger.info("Additional places: %s", request.destination)
        
        suggestions = await additional_places_service.get_all_place_suggestions(
            request.destination,
            request.interests
        )
        
        formatted = additional_places_service.format_for_frontend(suggestions)
        
        return AdditionalPlacesResponse(
            destination=formatted["destination"],
            summary=formatted["summary"],
            suggestions=formatted["suggestions"],
            message=formatted["message"]
        )
        
    except Exception as e:
        logger.error("Additional places error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# CORS OPTIONS HANDLERS
# =============================================================================

@router.options("/generate-itinerary")
@router.options("/generate-itinerary-structure")
@router.options("/generate-itinerary-details")
@router.options("/places/additional")
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
