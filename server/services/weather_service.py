"""
Weather service for fetching weather data from OpenWeatherMap API
"""

import requests
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from config import settings

logger = logging.getLogger(__name__)

class WeatherService:
    """Service for fetching weather data from OpenWeatherMap API"""
    
    def __init__(self):
        self.api_key = settings.open_weather_api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"
        
    async def get_current_weather(self, city: str, country_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Get current weather for a city
        
        Args:
            city: City name
            country_code: Optional country code (e.g., 'US', 'GB')
            
        Returns:
            Dict containing current weather data
        """
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not configured")
            return {"error": "OpenWeatherMap API key not configured"}
            
        try:
            location = f"{city},{country_code}" if country_code else city
            url = f"{self.base_url}/weather"
            params = {
                "q": location,
                "appid": self.api_key,
                "units": "metric"  # Use metric units (Celsius)
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "location": {
                    "city": data["name"],
                    "country": data["sys"]["country"],
                    "coordinates": {
                        "lat": data["coord"]["lat"],
                        "lon": data["coord"]["lon"]
                    }
                },
                "current": {
                    "temperature": data["main"]["temp"],
                    "feels_like": data["main"]["feels_like"],
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "description": data["weather"][0]["description"],
                    "icon": data["weather"][0]["icon"],
                    "wind_speed": data["wind"]["speed"],
                    "wind_direction": data["wind"].get("deg", 0),
                    "visibility": data.get("visibility", 0) / 1000,  # Convert to km
                    "uv_index": data.get("uvi", 0)
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching current weather: {e}")
            return {"error": f"Failed to fetch weather data: {str(e)}"}
        except KeyError as e:
            logger.error(f"Unexpected API response format: {e}")
            return {"error": "Unexpected weather data format"}
        except Exception as e:
            logger.error(f"Unexpected error in weather service: {e}")
            return {"error": "Internal weather service error"}
    
    async def get_weather_forecast(self, city: str, country_code: Optional[str] = None, days: int = 5) -> Dict[str, Any]:
        """
        Get weather forecast for a city
        
        Args:
            city: City name
            country_code: Optional country code
            days: Number of days to forecast (1-5)
            
        Returns:
            Dict containing forecast data
        """
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not configured")
            return {"error": "OpenWeatherMap API key not configured"}
            
        try:
            location = f"{city},{country_code}" if country_code else city
            url = f"{self.base_url}/forecast"
            params = {
                "q": location,
                "appid": self.api_key,
                "units": "metric",
                "cnt": days * 8  # 8 forecasts per day (every 3 hours)
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Process forecast data
            forecasts = []
            for item in data["list"]:
                forecast = {
                    "datetime": datetime.fromtimestamp(item["dt"]).isoformat(),
                    "temperature": {
                        "min": item["main"]["temp_min"],
                        "max": item["main"]["temp_max"],
                        "current": item["main"]["temp"]
                    },
                    "humidity": item["main"]["humidity"],
                    "description": item["weather"][0]["description"],
                    "icon": item["weather"][0]["icon"],
                    "wind_speed": item["wind"]["speed"],
                    "precipitation": item.get("rain", {}).get("3h", 0) + item.get("snow", {}).get("3h", 0)
                }
                forecasts.append(forecast)
            
            return {
                "location": {
                    "city": data["city"]["name"],
                    "country": data["city"]["country"],
                    "coordinates": {
                        "lat": data["city"]["coord"]["lat"],
                        "lon": data["city"]["coord"]["lon"]
                    }
                },
                "forecasts": forecasts,
                "timestamp": datetime.now().isoformat()
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching weather forecast: {e}")
            return {"error": f"Failed to fetch forecast data: {str(e)}"}
        except KeyError as e:
            logger.error(f"Unexpected API response format: {e}")
            return {"error": "Unexpected forecast data format"}
        except Exception as e:
            logger.error(f"Unexpected error in weather service: {e}")
            return {"error": "Internal weather service error"}
    
    async def get_weather_by_coordinates(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get current weather by coordinates
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Dict containing current weather data
        """
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not configured")
            return {"error": "OpenWeatherMap API key not configured"}
            
        try:
            url = f"{self.base_url}/weather"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "location": {
                    "city": data["name"],
                    "country": data["sys"]["country"],
                    "coordinates": {
                        "lat": data["coord"]["lat"],
                        "lon": data["coord"]["lon"]
                    }
                },
                "current": {
                    "temperature": data["main"]["temp"],
                    "feels_like": data["main"]["feels_like"],
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "description": data["weather"][0]["description"],
                    "icon": data["weather"][0]["icon"],
                    "wind_speed": data["wind"]["speed"],
                    "wind_direction": data["wind"].get("deg", 0),
                    "visibility": data.get("visibility", 0) / 1000,
                    "uv_index": data.get("uvi", 0)
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching weather by coordinates: {e}")
            return {"error": f"Failed to fetch weather data: {str(e)}"}
        except KeyError as e:
            logger.error(f"Unexpected API response format: {e}")
            return {"error": "Unexpected weather data format"}
        except Exception as e:
            logger.error(f"Unexpected error in weather service: {e}")
            return {"error": "Internal weather service error"}
    
    def format_weather_for_itinerary(self, weather_data: Dict[str, Any]) -> str:
        """
        Format weather data for inclusion in itinerary prompts
        
        Args:
            weather_data: Weather data from API
            
        Returns:
            Formatted weather string for prompts
        """
        if "error" in weather_data:
            return f"Weather data unavailable: {weather_data['error']}"
            
        current = weather_data.get("current", {})
        location = weather_data.get("location", {})
        
        temp = current.get("temperature", 0)
        description = current.get("description", "unknown conditions")
        humidity = current.get("humidity", 0)
        wind_speed = current.get("wind_speed", 0)
        
        return f"Current weather in {location.get('city', 'location')}: {temp}°C, {description}, humidity {humidity}%, wind {wind_speed} m/s"
    
    def get_weather_recommendations(self, weather_data: Dict[str, Any]) -> List[str]:
        """
        Get weather-based recommendations for travel planning
        
        Args:
            weather_data: Weather data from API
            
        Returns:
            List of weather-based recommendations
        """
        if "error" in weather_data:
            return ["Weather data unavailable - plan for various conditions"]
            
        current = weather_data.get("current", {})
        recommendations = []
        
        temp = current.get("temperature", 20)
        description = current.get("description", "").lower()
        humidity = current.get("humidity", 50)
        wind_speed = current.get("wind_speed", 0)
        precipitation = current.get("precipitation", 0)
        
        # Temperature recommendations
        if temp < 10:
            recommendations.append("Pack warm clothing - temperatures are cold")
        elif temp > 30:
            recommendations.append("Pack light, breathable clothing - temperatures are hot")
        elif temp > 25:
            recommendations.append("Pack summer clothing and sun protection")
        
        # Weather condition recommendations
        if "rain" in description or precipitation > 0:
            recommendations.append("Bring rain gear and waterproof clothing")
        if "snow" in description:
            recommendations.append("Pack winter gear and warm, waterproof clothing")
        if "clear" in description or "sunny" in description:
            recommendations.append("Perfect weather for outdoor activities - bring sun protection")
        if "cloud" in description:
            recommendations.append("Overcast conditions - good for sightseeing without harsh sun")
        
        # Wind recommendations
        if wind_speed > 10:
            recommendations.append("Strong winds expected - secure loose items and consider indoor activities")
        
        # Humidity recommendations
        if humidity > 80:
            recommendations.append("High humidity - stay hydrated and seek air-conditioned spaces")
        elif humidity < 30:
            recommendations.append("Low humidity - use moisturizer and stay hydrated")
        
        return recommendations if recommendations else ["Weather conditions are moderate - plan for typical seasonal activities"]

# Create a singleton instance
weather_service = WeatherService()
