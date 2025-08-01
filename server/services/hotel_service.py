import json
import os
from typing import List, Dict, Any, Optional
from datetime import date
import logging
from ..models import HotelInfo

logger = logging.getLogger(__name__)

class HotelService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
        
    async def search_hotels(
        self,
        location: str,
        check_in: date,
        check_out: date,
        guests: int = 1,
        budget_range: Optional[str] = None
    ) -> List[HotelInfo]:
        """
        Search for hotels in the specified location
        """
        try:
            # Load mock hotel data
            hotels_data = await self._load_hotel_data(location.lower())
            
            # Filter by budget range if specified
            if budget_range:
                hotels_data = self._filter_by_budget(hotels_data, budget_range)
            
            # Convert to HotelInfo objects
            hotels = []
            for hotel_data in hotels_data[:10]:  # Limit to 10 results
                hotel = HotelInfo(
                    name=hotel_data.get('name', ''),
                    address=hotel_data.get('address', ''),
                    price_range=hotel_data.get('price_range', ''),
                    rating=hotel_data.get('rating', 0.0),
                    amenities=hotel_data.get('amenities', []),
                    description=hotel_data.get('description', ''),
                    booking_url=hotel_data.get('booking_url')
                )
                hotels.append(hotel)
            
            return hotels
            
        except Exception as e:
            logger.error(f"Error searching hotels: {str(e)}")
            return []
    
    async def get_popular_hotels(self, location: str) -> List[HotelInfo]:
        """
        Get popular hotels for a location
        """
        try:
            hotels_data = await self._load_hotel_data(location.lower())
            
            # Sort by rating and get top 5
            popular_hotels = sorted(hotels_data, key=lambda x: x.get('rating', 0), reverse=True)[:5]
            
            hotels = []
            for hotel_data in popular_hotels:
                hotel = HotelInfo(
                    name=hotel_data.get('name', ''),
                    address=hotel_data.get('address', ''),
                    price_range=hotel_data.get('price_range', ''),
                    rating=hotel_data.get('rating', 0.0),
                    amenities=hotel_data.get('amenities', []),
                    description=hotel_data.get('description', ''),
                    booking_url=hotel_data.get('booking_url')
                )
                hotels.append(hotel)
            
            return hotels
            
        except Exception as e:
            logger.error(f"Error getting popular hotels: {str(e)}")
            return []
    
    async def _load_hotel_data(self, location: str) -> List[Dict[str, Any]]:
        """
        Load hotel data from JSON file
        """
        try:
            file_path = os.path.join(self.data_dir, f'hotels_{location}.json')
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                # Return default data if file doesn't exist
                return self._get_default_hotels()
        except Exception as e:
            logger.error(f"Error loading hotel data: {str(e)}")
            return self._get_default_hotels()
    
    def _filter_by_budget(self, hotels: List[Dict[str, Any]], budget_range: str) -> List[Dict[str, Any]]:
        """
        Filter hotels by budget range
        """
        budget_mapping = {
            'budget': ['$', '$$'],
            'mid-range': ['$$', '$$$'],
            'luxury': ['$$$', '$$$$']
        }
        
        if budget_range in budget_mapping:
            allowed_ranges = budget_mapping[budget_range]
            return [hotel for hotel in hotels if hotel.get('price_range') in allowed_ranges]
        
        return hotels
    
    def _get_default_hotels(self) -> List[Dict[str, Any]]:
        """
        Return default hotel data
        """
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