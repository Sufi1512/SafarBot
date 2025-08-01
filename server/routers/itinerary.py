from fastapi import APIRouter, HTTPException
from ..models import ItineraryRequest, ItineraryResponse, APIResponse
from ..services.itinerary_service import ItineraryService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

itinerary_service = ItineraryService()

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