from fastapi import APIRouter, HTTPException
from models import RestaurantRequest, RestaurantInfo, APIResponse
from services.restaurant_service import RestaurantService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

restaurant_service = RestaurantService()

@router.post("/recommend-restaurants")
async def recommend_restaurants(request: RestaurantRequest):
    """
    Get restaurant recommendations for a location
    """
    try:
        logger.info(f"Getting restaurant recommendations for {request.location}")
        
        restaurants = await restaurant_service.get_recommendations(
            location=request.location,
            cuisine=request.cuisine,
            budget=request.budget,
            rating=request.rating
        )
        
        return APIResponse(
            success=True,
            message=f"Found {len(restaurants)} restaurants in {request.location}",
            data=restaurants
        )
        
    except Exception as e:
        logger.error(f"Error getting restaurant recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get restaurant recommendations: {str(e)}")

@router.get("/{location}/popular")
async def get_popular_restaurants(location: str):
    """
    Get popular restaurants for a location
    """
    try:
        logger.info(f"Getting popular restaurants for {location}")
        
        popular_restaurants = await restaurant_service.get_popular_restaurants(location)
        
        return APIResponse(
            success=True,
            message=f"Retrieved popular restaurants for {location}",
            data=popular_restaurants
        )
        
    except Exception as e:
        logger.error(f"Error getting popular restaurants: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get popular restaurants: {str(e)}") 