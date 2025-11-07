"""
Weather API endpoints for fetching weather data
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, Dict, Any
import logging
from services.weather_service import weather_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/current")
async def get_current_weather(
    city: str = Query(..., description="City name"),
    country_code: Optional[str] = Query(None, description="Country code (e.g., 'US', 'GB')")
) -> Dict[str, Any]:
    """
    Get current weather for a specific city
    
    Args:
        city: City name (required)
        country_code: Optional country code for more precise location
        
    Returns:
        Current weather data including temperature, conditions, and recommendations
    """
    try:
        weather_data = await weather_service.get_current_weather(city, country_code)
        
        if "error" in weather_data:
            raise HTTPException(status_code=400, detail=weather_data["error"])
            
        # Add recommendations to the response
        recommendations = weather_service.get_weather_recommendations(weather_data)
        weather_data["recommendations"] = recommendations
        
        return weather_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_weather endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/forecast")
async def get_weather_forecast(
    city: str = Query(..., description="City name"),
    country_code: Optional[str] = Query(None, description="Country code (e.g., 'US', 'GB')"),
    days: int = Query(5, ge=1, le=5, description="Number of days to forecast (1-5)")
) -> Dict[str, Any]:
    """
    Get weather forecast for a specific city
    
    Args:
        city: City name (required)
        country_code: Optional country code for more precise location
        days: Number of days to forecast (1-5)
        
    Returns:
        Weather forecast data for the specified number of days
    """
    try:
        forecast_data = await weather_service.get_weather_forecast(city, country_code, days)
        
        if "error" in forecast_data:
            raise HTTPException(status_code=400, detail=forecast_data["error"])
            
        return forecast_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_weather_forecast endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/coordinates")
async def get_weather_by_coordinates(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
) -> Dict[str, Any]:
    """
    Get current weather by coordinates
    
    Args:
        lat: Latitude (required)
        lon: Longitude (required)
        
    Returns:
        Current weather data for the specified coordinates
    """
    try:
        weather_data = await weather_service.get_weather_by_coordinates(lat, lon)
        
        if "error" in weather_data:
            raise HTTPException(status_code=400, detail=weather_data["error"])
            
        # Add recommendations to the response
        recommendations = weather_service.get_weather_recommendations(weather_data)
        weather_data["recommendations"] = recommendations
        
        return weather_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_weather_by_coordinates endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/itinerary-format")
async def get_weather_for_itinerary(
    city: str = Query(..., description="City name"),
    country_code: Optional[str] = Query(None, description="Country code (e.g., 'US', 'GB')")
) -> Dict[str, Any]:
    """
    Get weather data formatted for itinerary planning
    
    Args:
        city: City name (required)
        country_code: Optional country code for more precise location
        
    Returns:
        Weather data formatted for inclusion in itinerary prompts
    """
    try:
        weather_data = await weather_service.get_current_weather(city, country_code)
        
        if "error" in weather_data:
            return {
                "formatted_weather": f"Weather data unavailable: {weather_data['error']}",
                "recommendations": ["Weather data unavailable - plan for various conditions"]
            }
            
        formatted_weather = weather_service.format_weather_for_itinerary(weather_data)
        recommendations = weather_service.get_weather_recommendations(weather_data)
        
        return {
            "formatted_weather": formatted_weather,
            "recommendations": recommendations,
            "raw_data": weather_data
        }
        
    except Exception as e:
        logger.error(f"Error in get_weather_for_itinerary endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
