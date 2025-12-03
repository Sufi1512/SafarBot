from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from models import (
    ItineraryRequest,
    ItineraryResponse,
    AdditionalPlacesRequest,
    AdditionalPlacesResponse,
    ItineraryDetailsRequest,
)
from services.itinerary_service import ItineraryService
from services.additional_places_service import AdditionalPlacesService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

itinerary_service = ItineraryService()
additional_places_service = AdditionalPlacesService()

# ============================================================================
# ITINERARY ENDPOINTS - Primary flows for itinerary generation
# ============================================================================

# 1. STRUCTURE-ONLY ITINERARY - Split response for faster payload delivery


@router.options("/generate-itinerary-structure")
async def generate_itinerary_structure_options():
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        },
    )


@router.post("/generate-itinerary-structure")
async def generate_itinerary_structure(request_body: ItineraryRequest, http_request: Request):
    """Generate itinerary structure only and cache heavy place details for secondary retrieval."""

    try:
        user_id = getattr(http_request.state, 'user_id', None)
        user_email = getattr(http_request.state, 'user_email', None)
        
        logger.info("="*80)
        logger.info("🚀 ITINERARY API - Structure Generation Request")
        logger.info(f"   📍 Endpoint: /itinerary/generate-itinerary-structure")
        logger.info(f"   🌍 Destination: {request_body.destination}")
        logger.info(f"   📅 Dates: {request_body.start_date} to {request_body.end_date}")
        logger.info(f"   👥 Travelers: {request_body.travelers}")
        logger.info(f"   💰 Budget: ${request_body.budget if request_body.budget else 'Flexible'}")
        logger.info(f"   🎯 Interests: {', '.join(request_body.interests) if request_body.interests else 'General'}")
        logger.info(f"   👤 User: {user_id or 'Anonymous'} ({user_email or 'No email'})")
        logger.info(f"   🌐 IP: {http_request.client.host if http_request.client else 'Unknown'}")
        logger.info("="*80)

        structure_response = await itinerary_service.generate_itinerary_structure(
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

        logger.info("✅ ITINERARY API - Structure generation completed successfully")
        
        return structure_response

    except Exception as e:
        logger.error(f"❌ ITINERARY API - Error generating structure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary structure: {str(e)}")


# 1b. Fetch cached place details for itinerary (second step in split flow)


@router.options("/generate-itinerary-details")
async def generate_itinerary_details_options():
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        },
    )


@router.post("/generate-itinerary-details")
async def generate_itinerary_details(request_body: ItineraryDetailsRequest):
    """Return cached place details (and optional additional places) for an itinerary."""

    try:
        details_response = await itinerary_service.get_itinerary_details(
            token=request_body.token,
            place_ids=request_body.place_ids,
            include_additional=request_body.include_additional,
        )
        return details_response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error retrieving itinerary details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch itinerary details: {str(e)}")


# 2. ADDITIONAL PLACES ONLY - Get all additional places for a destination
#    Returns comprehensive place suggestions beyond the itinerary

@router.options("/places/additional")
async def additional_places_options():
    """Handle OPTIONS requests for CORS preflight"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )

@router.post("/places/additional")
async def get_additional_places(request: AdditionalPlacesRequest):
    """
    🌟 ADDITIONAL PLACES ENDPOINT - Get all additional places for a destination
    
    Returns comprehensive place suggestions beyond the itinerary:
    - ALL hotels found during search
    - ALL restaurants and cafes discovered
    - ALL attractions and activities available
    - Interest-based suggestions (nightlife, shopping, etc.)
    - Complete Google Maps data for each place
    
    Perfect for "You might also like" or "Explore more" sections!
    """
    print(f"\n🌟 ADDITIONAL PLACES API - Request for {request.destination}")
    print(f"    Interests: {', '.join(request.interests) if request.interests else 'General'}")
    
    try:
        # Get comprehensive place suggestions
        all_suggestions = await additional_places_service.get_all_place_suggestions(
            request.destination, 
            request.interests
        )
        
        # Format for frontend
        formatted_response = additional_places_service.format_for_frontend(all_suggestions)
        
        response = AdditionalPlacesResponse(
            destination=formatted_response["destination"],
            summary=formatted_response["summary"],
            suggestions=formatted_response["suggestions"],
            message=formatted_response["message"]
        )
        
        total_places = formatted_response["summary"]["total_places"]
        print(f"✅ ADDITIONAL PLACES API - Returning {total_places} additional places")
        
        return response
        
    except Exception as e:
        print(f"❌ ADDITIONAL PLACES API - Error: {str(e)}")
        logger.error(f"Error getting additional places: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get additional places: {str(e)}"
        )


# 3. COMPLETE ITINERARY - AI + Additional Places + Place Details (2-3 minutes)
#    Returns everything: AI itinerary + place details + additional places

@router.options("/generate-itinerary-complete")
async def generate_itinerary_complete_options():
    """Handle OPTIONS requests for CORS preflight"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )

@router.post("/generate-itinerary-complete")
async def generate_itinerary_complete(request_body: ItineraryRequest, http_request: Request):
    """
    🚀 COMPLETE ENDPOINT - Generate AI itinerary + place details + additional places (2-3 minutes)
    
    This endpoint returns EVERYTHING in one response:
    ✅ AI-generated itinerary structure
    ✅ Complete place details (images, reviews, ratings, addresses, coordinates)
    ✅ All additional places for exploration
    ✅ Complete metadata for all places
    
    Use this when you need complete data in one API call.
    For faster response, use /generate-itinerary-ai + /places/additional separately.
    """
    try:
        user_id = getattr(http_request.state, 'user_id', None)
        user_email = getattr(http_request.state, 'user_email', None)
        
        logger.info("="*80)
        logger.info("🚀 ITINERARY API - Complete Generation Request")
        logger.info(f"   📍 Endpoint: /itinerary/generate-itinerary-complete")
        logger.info(f"   🌍 Destination: {request_body.destination}")
        logger.info(f"   📅 Dates: {request_body.start_date} to {request_body.end_date}")
        logger.info(f"   👥 Travelers: {request_body.travelers} ({request_body.travel_companion or 'General'})")
        logger.info(f"   💰 Budget: ${request_body.budget if request_body.budget else 'Flexible'} ({request_body.budget_range or 'Not specified'})")
        logger.info(f"   🎯 Interests: {', '.join(request_body.interests) if request_body.interests else 'General'}")
        logger.info(f"   🏨 Accommodation: {request_body.hotel_rating_preference or request_body.accommodation_type or 'Standard'}")
        logger.info(f"   🚶 Trip Pace: {request_body.trip_pace or 'Balanced'}")
        logger.info(f"   🍽️ Dietary: {', '.join(request_body.dietary_preferences) if request_body.dietary_preferences else 'No restrictions'}")
        logger.info(f"   👤 User: {user_id or 'Anonymous'} ({user_email or 'No email'})")
        logger.info(f"   🌐 IP: {http_request.client.host if http_request.client else 'Unknown'}")
        logger.info(f"   📧 Email: {request_body.email or 'Not provided'}")
        logger.info("="*80)
        
        complete_response = await itinerary_service.generate_itinerary(
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
        
        # Log the response structure for debugging
        itinerary = complete_response.get('itinerary', {})
        place_details = complete_response.get('place_details', {})
        additional_places = complete_response.get('additional_places', {})
        metadata = complete_response.get('metadata', {})
        
        logger.info("="*80)
        logger.info("✅ ITINERARY API - Complete generation finished")
        logger.info(f"   📋 Itinerary: {len(itinerary.get('daily_plans', []))} days")
        logger.info(f"   🗺️  Place details: {len(place_details)} places with full metadata")
        logger.info(f"   🎯 Additional places: {sum(len(places) for places in additional_places.values())} places")
        logger.info(f"   📊 Total places prefetched: {metadata.get('total_places_prefetched', 0)}")
        logger.info(f"   📊 Places used in itinerary: {metadata.get('places_used_in_itinerary', 0)}")
        logger.info(f"   🌤️  Weather included: {metadata.get('weather_included', False)}")
        logger.info("="*80)
        
        return complete_response
        
    except Exception as e:
        logger.error(f"❌ ITINERARY API - Error generating complete itinerary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate complete itinerary: {str(e)}")


# BACKWARD COMPATIBILITY - Keep /generate-itinerary for existing frontend code
# This redirects to /generate-itinerary-complete

@router.options("/generate-itinerary")
async def generate_itinerary_options():
    """Handle OPTIONS requests for CORS preflight"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )

@router.post("/generate-itinerary")
async def generate_itinerary(request_body: ItineraryRequest, http_request: Request):
    """
    Generate complete itinerary (backward compatibility)
    
    This endpoint redirects to /generate-itinerary-complete for backward compatibility.
    Consider using /generate-itinerary-complete for clarity.
    """
    # Redirect to complete endpoint
    return await generate_itinerary_complete(request_body, http_request)
