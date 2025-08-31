from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from models import ItineraryRequest, ItineraryResponse, APIResponse
from services.itinerary_service import ItineraryService
from services.place_service import PlaceService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

itinerary_service = ItineraryService()
place_service = PlaceService()

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

@router.post("/generate-itinerary", response_model=ItineraryResponse)
async def generate_itinerary(request: ItineraryRequest):
    """
    Generate a personalized travel itinerary based on user preferences
    """
    try:
        logger.info(f"Generating itinerary for {request.destination}")
        
        itinerary = await itinerary_service.generate_itinerary(
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            budget=request.budget,
            interests=request.interests,
            travelers=request.travelers,
            accommodation_type=request.accommodation_type
        )
        
        return itinerary
        
    except Exception as e:
        logger.error(f"Error generating itinerary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")

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