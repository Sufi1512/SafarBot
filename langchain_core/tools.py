import asyncio
import json
import os
from typing import List, Dict, Any, Optional
import logging
import httpx

logger = logging.getLogger(__name__)

class TravelTools:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        
    async def search_hotels(self, destination: str) -> List[Dict[str, Any]]:
        """Search for hotels in a destination (mock implementation)"""
        try:
            # Load mock hotel data
            hotels_data = await self._load_hotel_data(destination.lower())
            return hotels_data[:5]  # Return top 5 hotels
        except Exception as e:
            logger.error(f"Error searching hotels: {str(e)}")
            return self._get_default_hotels()
    
    async def search_restaurants(self, destination: str) -> List[Dict[str, Any]]:
        """Search for restaurants in a destination (mock implementation)"""
        try:
            # Load mock restaurant data
            restaurants_data = await self._load_restaurant_data(destination.lower())
            return restaurants_data[:5]  # Return top 5 restaurants
        except Exception as e:
            logger.error(f"Error searching restaurants: {str(e)}")
            return self._get_default_restaurants()
    
    async def get_weather(self, destination: str) -> Dict[str, Any]:
        """Get weather information for a destination (mock implementation)"""
        try:
            # In a real implementation, this would call a weather API
            # For now, return mock data
            weather_data = {
                "destination": destination,
                "current": {
                    "temperature": 22,
                    "condition": "Sunny",
                    "humidity": 65,
                    "wind_speed": 10
                },
                "forecast": [
                    {"day": "Today", "high": 25, "low": 18, "condition": "Sunny"},
                    {"day": "Tomorrow", "high": 23, "low": 16, "condition": "Partly Cloudy"},
                    {"day": "Day 3", "high": 20, "low": 14, "condition": "Rainy"}
                ],
                "recommendations": [
                    "Pack light clothing",
                    "Bring sunscreen",
                    "Umbrella recommended for day 3"
                ]
            }
            
            return weather_data
            
        except Exception as e:
            logger.error(f"Error getting weather: {str(e)}")
            return {"error": "Weather information unavailable"}
    
    async def get_flight_info(self, origin: str, destination: str, date: str) -> List[Dict[str, Any]]:
        """Get flight information (mock implementation)"""
        try:
            # Mock flight data
            flights = [
                {
                    "airline": "Airline A",
                    "flight_number": "AA123",
                    "departure": "10:00",
                    "arrival": "12:30",
                    "duration": "2h 30m",
                    "price": 250,
                    "stops": 0
                },
                {
                    "airline": "Airline B",
                    "flight_number": "BB456",
                    "departure": "14:00",
                    "arrival": "16:45",
                    "duration": "2h 45m",
                    "price": 180,
                    "stops": 1
                }
            ]
            
            return flights
            
        except Exception as e:
            logger.error(f"Error getting flight info: {str(e)}")
            return []
    
    async def get_transport_info(self, destination: str) -> Dict[str, Any]:
        """Get transportation information for a destination"""
        try:
            transport_info = {
                "destination": destination,
                "public_transport": {
                    "metro": "Available with extensive network",
                    "bus": "Comprehensive bus system",
                    "train": "Connects to nearby cities",
                    "ticket_prices": "Single ride: $2-3, Day pass: $8-10"
                },
                "taxis": {
                    "availability": "Readily available",
                    "average_cost": "$15-25 for city center trips",
                    "tips": "Use official taxi stands or ride-sharing apps"
                },
                "car_rental": {
                    "available": True,
                    "average_cost": "$40-60 per day",
                    "requirements": "International driving permit recommended"
                },
                "walking": {
                    "recommended": "City center is very walkable",
                    "safety": "Safe during day, well-lit areas at night"
                }
            }
            
            return transport_info
            
        except Exception as e:
            logger.error(f"Error getting transport info: {str(e)}")
            return {"error": "Transport information unavailable"}
    
    async def get_cultural_info(self, destination: str) -> Dict[str, Any]:
        """Get cultural information for a destination"""
        try:
            cultural_info = {
                "destination": destination,
                "language": "Local language with English widely spoken",
                "currency": "Local currency (exchange rate varies)",
                "customs": [
                    "Greet with handshake or local custom",
                    "Dress modestly when visiting religious sites",
                    "Tipping is appreciated but not mandatory"
                ],
                "etiquette": [
                    "Learn basic phrases in local language",
                    "Respect local customs and traditions",
                    "Ask permission before taking photos of people"
                ],
                "festivals": [
                    "Check local calendar for festivals during your visit",
                    "Some festivals may affect business hours"
                ]
            }
            
            return cultural_info
            
        except Exception as e:
            logger.error(f"Error getting cultural info: {str(e)}")
            return {"error": "Cultural information unavailable"}
    
    async def _load_hotel_data(self, location: str) -> List[Dict[str, Any]]:
        """Load hotel data from JSON file"""
        try:
            file_path = os.path.join(self.data_dir, f'hotels_{location}.json')
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                return self._get_default_hotels()
        except Exception as e:
            logger.error(f"Error loading hotel data: {str(e)}")
            return self._get_default_hotels()
    
    async def _load_restaurant_data(self, location: str) -> List[Dict[str, Any]]:
        """Load restaurant data from JSON file"""
        try:
            file_path = os.path.join(self.data_dir, f'restaurants_{location}.json')
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                return self._get_default_restaurants()
        except Exception as e:
            logger.error(f"Error loading restaurant data: {str(e)}")
            return self._get_default_restaurants()
    
    def _get_default_hotels(self) -> List[Dict[str, Any]]:
        """Return default hotel data"""
        return [
            {
                "name": "Grand Hotel",
                "address": "123 Main Street",
                "price_range": "$$$",
                "rating": 4.5,
                "amenities": ["WiFi", "Pool", "Spa", "Restaurant"],
                "description": "Luxury hotel in the heart of the city",
                "booking_url": "https://example.com/book"
            },
            {
                "name": "Comfort Inn",
                "address": "456 Oak Avenue",
                "price_range": "$$",
                "rating": 3.8,
                "amenities": ["WiFi", "Breakfast", "Parking"],
                "description": "Comfortable mid-range accommodation",
                "booking_url": "https://example.com/book"
            }
        ]
    
    def _get_default_restaurants(self) -> List[Dict[str, Any]]:
        """Return default restaurant data"""
        return [
            {
                "name": "La Trattoria",
                "cuisine": "Italian",
                "address": "789 Pine Street",
                "price_range": "$$",
                "rating": 4.2,
                "specialties": ["Pasta", "Pizza", "Wine"],
                "description": "Authentic Italian cuisine in a cozy atmosphere"
            },
            {
                "name": "Sakura Sushi",
                "cuisine": "Japanese",
                "address": "321 Elm Street",
                "price_range": "$$$",
                "rating": 4.6,
                "specialties": ["Sushi", "Sashimi", "Tempura"],
                "description": "Premium Japanese dining experience"
            }
        ] 