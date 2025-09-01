from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from models import ItineraryRequest, ItineraryResponse, APIResponse, PlaceDetailsRequest, PlaceDetailsResponse, SerpPlaceRequest, SerpPlaceResponse, SerpSearchRequest, SerpSearchResponse, AdditionalPlacesRequest, AdditionalPlacesResponse, UnifiedItineraryRequest, UnifiedItineraryResponse
from services.itinerary_service import ItineraryService
from services.place_service import PlaceService
from services.place_details_service import PlaceDetailsService
from services.serp_places_service import SerpPlacesService
from services.additional_places_service import AdditionalPlacesService
from services.unified_itinerary_service import UnifiedItineraryService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

itinerary_service = ItineraryService()
place_service = PlaceService()
place_details_service = PlaceDetailsService()
serp_places_service = SerpPlacesService()
additional_places_service = AdditionalPlacesService()
unified_itinerary_service = UnifiedItineraryService()

@router.post("/generate-complete-itinerary")
async def generate_complete_itinerary(request: UnifiedItineraryRequest):
    """
    🚀 RECOMMENDED ENDPOINT - Generate COMPLETE itinerary + all additional places in ONE API call
    
    This endpoint returns EVERYTHING you need:
    ✅ Core itinerary structure (limited, curated places for actual travel plan)
    ✅ ALL additional places discovered (comprehensive exploration options)
    ✅ Complete place data with ratings, photos, reviews, coordinates
    ✅ Usage guide for frontend implementation
    
    Benefits:
    - Single API call instead of multiple endpoints
    - Parallel processing for maximum speed
    - Complete data in one response
    - Perfect for "itinerary + explore more" UI
    
    Response includes:
    - itinerary: Main travel plan with day-by-day activities
    - additional_places: ALL hotels, restaurants, attractions, nightlife, etc.
    - summary: Statistics and counts for UI badges/indicators
    - usage_guide: How to use each section in your frontend
    """
    print(f"\n🚀 UNIFIED ENDPOINT - Complete itinerary request for {request.destination}")
    
    try:
        complete_response = await unified_itinerary_service.generate_complete_itinerary(
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            budget=request.budget,
            interests=request.interests,
            travelers=request.travelers,
            accommodation_type=request.accommodation_type
        )
        
        # Convert to proper response model
        response = UnifiedItineraryResponse(**complete_response)
        
        total_places = complete_response.get("summary", {}).get("total_places_available", 0)
        print(f"✅ UNIFIED ENDPOINT - Returning complete package with {total_places} total places")
        
        return response
        
    except Exception as e:
        print(f"❌ UNIFIED ENDPOINT - Error: {str(e)}")
        logger.error(f"Error in unified itinerary generation: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate complete itinerary: {str(e)}"
        )

@router.options("/generate-complete-itinerary")
async def generate_complete_itinerary_options():
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

@router.options("/generate-itinerary")
async def generate_itinerary_options():
    """
    Handle OPTIONS requests for CORS preflight
    """
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )

@router.options("/predict-prices")
async def predict_prices_options():
    """
    Handle OPTIONS requests for CORS preflight
    """
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
async def generate_itinerary(request: ItineraryRequest):
    """
    🚀 ENHANCED ENDPOINT - Generate complete itinerary with full place metadata
    
    Returns:
    ✅ Complete itinerary structure with place IDs
    ✅ Full place details (images, reviews, ratings, addresses, coordinates)
    ✅ Additional places for exploration
    ✅ Complete metadata for all places
    
    This endpoint now returns everything in one call:
    - itinerary: Day-by-day travel plan
    - place_details: Complete metadata for places in itinerary
    - additional_places: Extra places for user exploration
    - metadata: Generation statistics and info
    """
    try:
        logger.info(f"Generating complete itinerary for {request.destination}")
        
        complete_response = await itinerary_service.generate_itinerary(
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            budget=request.budget,
            interests=request.interests,
            travelers=request.travelers,
            accommodation_type=request.accommodation_type
        )
        
        # Log the response structure for debugging
        itinerary = complete_response.get('itinerary', {})
        place_details = complete_response.get('place_details', {})
        additional_places = complete_response.get('additional_places', {})
        
        print(f"✅ ENHANCED ITINERARY ENDPOINT - Returning complete data:")
        print(f"   📋 Itinerary: {len(itinerary.get('daily_plans', []))} days")
        print(f"   🗺️  Place details: {len(place_details)} places with full metadata")
        print(f"   🎯 Additional places: {sum(len(places) for places in additional_places.values())}")
        
        return complete_response
        
    except Exception as e:
        logger.error(f"Error generating complete itinerary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate complete itinerary: {str(e)}")

@router.post("/predict-prices")
async def predict_prices(request: ItineraryRequest):
    """
    Predict travel costs for the given destination and dates
    """
    try:
        logger.info(f"Predicting prices for {request.destination}")
        
        price_prediction = await itinerary_service.predict_prices(
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            travelers=request.travelers,
            accommodation_type=request.accommodation_type
        )
        
        return APIResponse(
            success=True,
            message="Price prediction generated successfully",
            data=price_prediction
        )
        
    except Exception as e:
        logger.error(f"Error predicting prices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to predict prices: {str(e)}") 


@router.get("/places/search")
async def places_search(q: str = Query(..., description="Free-text place query"), gl: str | None = Query(None), hl: str = Query("en")):
    """Proxy to SerpApi Google Maps search using the server-side SERP_API_KEY."""
    try:
        data = place_service.search_place(q, hl=hl, gl=gl)
        return APIResponse(success=True, message="Places fetched", data=data)
    except Exception as e:
        logger.error(f"SerpApi search error: {e}")
        raise HTTPException(status_code=500, detail=f"SerpApi search failed: {str(e)}")


@router.get("/places/by-id")
async def place_by_id(place_id: str = Query(...), gl: str | None = Query(None), hl: str = Query("en")):
    """Fetch a place by Google place_id using SerpApi."""
    try:
        data = place_service.place_by_id(place_id, hl=hl, gl=gl)
        return APIResponse(success=True, message="Place fetched", data=data)
    except Exception as e:
        logger.error(f"SerpApi place error: {e}")
        raise HTTPException(status_code=500, detail=f"SerpApi place fetch failed: {str(e)}")

@router.post("/places/details")
async def get_place_details(request: PlaceDetailsRequest):
    """
    Get detailed information for a list of place IDs
    
    Returns complete place information including:
    - High-resolution images
    - Customer reviews and ratings  
    - Exact coordinates and addresses
    - Contact information
    - Opening hours
    - Amenities and features
    """
    print(f"\n🔍 PLACE DETAILS API - Received request for {len(request.place_ids)} places")
    
    try:
        place_details = await place_details_service.get_place_details(request.place_ids)
        
        response = PlaceDetailsResponse(
            places=place_details,
            total_count=len(place_details),
            message=f"Successfully fetched details for {len(place_details)} places"
        )
        
        print(f"✅ PLACE DETAILS API - Returning {len(place_details)} place details")
        return response
        
    except Exception as e:
        print(f"❌ PLACE DETAILS API - Error: {str(e)}")
        logger.error(f"Error fetching place details: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch place details: {str(e)}"
        )

@router.options("/places/details")
async def place_details_options():
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

@router.post("/places/serp/details")
async def get_serp_place_details(request: SerpPlaceRequest):
    """
    Get RAW Google Maps/SERP API data for a place ID
    
    Returns the complete, unmodified JSON response from Google Maps API including:
    - Complete place information
    - All available photos with high-resolution URLs
    - Full reviews with user profiles
    - Exact coordinates and addresses
    - All contact information and business hours
    - Service options and amenities
    - Popular times and visit duration
    - Price level and accepted payment methods
    """
    print(f"\n🌐 SERP RAW DATA API - Received request for place_id: {request.place_id}")
    
    try:
        place_data = await serp_places_service.get_place_by_id(request.place_id)
        
        if place_data:
            response = SerpPlaceResponse(
                place_data=place_data,
                message=f"Raw Google Maps data retrieved for {request.place_id}"
            )
            print(f"✅ SERP RAW DATA API - Returning complete Google JSON")
            return response
        else:
            response = SerpPlaceResponse(
                place_data=None,
                message=f"No data found for place_id: {request.place_id}"
            )
            print(f"⚠️  SERP RAW DATA API - No data found")
            return response
            
    except Exception as e:
        print(f"❌ SERP RAW DATA API - Error: {str(e)}")
        logger.error(f"Error fetching SERP place details: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch place details: {str(e)}"
        )

@router.post("/places/serp/search")
async def search_serp_places(request: SerpSearchRequest):
    """
    Search places using RAW Google Maps/SERP API
    
    Returns complete, unmodified search results from Google Maps including:
    - All matching places with full details
    - Business information and ratings
    - Photos and reviews preview
    - Geographic coordinates
    - Operating hours and contact info
    """
    print(f"\n🔍 SERP SEARCH API - Searching for: {request.query}")
    
    try:
        places = await serp_places_service.search_places(
            request.query, 
            request.location or "", 
            request.place_type or ""
        )
        
        response = SerpSearchResponse(
            places=places,
            total_count=len(places),
            message=f"Found {len(places)} places for query: {request.query}"
        )
        
        print(f"✅ SERP SEARCH API - Returning {len(places)} raw Google results")
        return response
        
    except Exception as e:
        print(f"❌ SERP SEARCH API - Error: {str(e)}")
        logger.error(f"Error searching SERP places: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to search places: {str(e)}"
        )

@router.options("/places/serp/details")
async def serp_place_details_options():
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

@router.options("/places/serp/search")
async def serp_place_search_options():
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
    Get ALL additional places for a destination beyond the itinerary
    
    This endpoint provides comprehensive place suggestions that users can explore:
    - ALL hotels found during search (not just the few in itinerary)
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