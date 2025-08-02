from fastapi import APIRouter, HTTPException
from models import HotelSearchRequest, HotelInfo, APIResponse
from services.hotel_service import HotelService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

hotel_service = HotelService()

@router.post("/search-hotels")
async def search_hotels(request: HotelSearchRequest):
    """
    Search for hotels in the specified location
    """
    try:
        logger.info(f"Searching hotels in {request.location}")
        
        hotels = await hotel_service.search_hotels(
            location=request.location,
            check_in=request.check_in,
            check_out=request.check_out,
            guests=request.guests,
            budget_range=request.budget_range
        )
        
        return APIResponse(
            success=True,
            message=f"Found {len(hotels)} hotels in {request.location}",
            data=hotels
        )
        
    except Exception as e:
        logger.error(f"Error searching hotels: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search hotels: {str(e)}")

@router.get("/hotels/{location}/popular")
async def get_popular_hotels(location: str):
    """
    Get popular hotels for a location
    """
    try:
        logger.info(f"Getting popular hotels for {location}")
        
        popular_hotels = await hotel_service.get_popular_hotels(location)
        
        return APIResponse(
            success=True,
            message=f"Retrieved popular hotels for {location}",
            data=popular_hotels
        )
        
    except Exception as e:
        logger.error(f"Error getting popular hotels: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get popular hotels: {str(e)}") 