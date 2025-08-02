import json
import os
from typing import List, Dict, Any, Optional
import logging
from models import RestaurantInfo

logger = logging.getLogger(__name__)

class RestaurantService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
        
    async def get_recommendations(
        self,
        location: str,
        cuisine: Optional[str] = None,
        budget: Optional[str] = None,
        rating: Optional[float] = None
    ) -> List[RestaurantInfo]:
        """
        Get restaurant recommendations for a location
        """
        try:
            # Load mock restaurant data
            restaurants_data = await self._load_restaurant_data(location.lower())
            
            # Apply filters
            if cuisine:
                restaurants_data = self._filter_by_cuisine(restaurants_data, cuisine)
            
            if budget:
                restaurants_data = self._filter_by_budget(restaurants_data, budget)
            
            if rating:
                restaurants_data = self._filter_by_rating(restaurants_data, rating)
            
            # Convert to RestaurantInfo objects
            restaurants = []
            for restaurant_data in restaurants_data[:10]:  # Limit to 10 results
                restaurant = RestaurantInfo(
                    name=restaurant_data.get('name', ''),
                    cuisine=restaurant_data.get('cuisine', ''),
                    address=restaurant_data.get('address', ''),
                    price_range=restaurant_data.get('price_range', ''),
                    rating=restaurant_data.get('rating', 0.0),
                    specialties=restaurant_data.get('specialties', []),
                    description=restaurant_data.get('description', '')
                )
                restaurants.append(restaurant)
            
            return restaurants
            
        except Exception as e:
            logger.error(f"Error getting restaurant recommendations: {str(e)}")
            return []
    
    async def get_popular_restaurants(self, location: str) -> List[RestaurantInfo]:
        """
        Get popular restaurants for a location
        """
        try:
            restaurants_data = await self._load_restaurant_data(location.lower())
            
            # Sort by rating and get top 5
            popular_restaurants = sorted(restaurants_data, key=lambda x: x.get('rating', 0), reverse=True)[:5]
            
            restaurants = []
            for restaurant_data in popular_restaurants:
                restaurant = RestaurantInfo(
                    name=restaurant_data.get('name', ''),
                    cuisine=restaurant_data.get('cuisine', ''),
                    address=restaurant_data.get('address', ''),
                    price_range=restaurant_data.get('price_range', ''),
                    rating=restaurant_data.get('rating', 0.0),
                    specialties=restaurant_data.get('specialties', []),
                    description=restaurant_data.get('description', '')
                )
                restaurants.append(restaurant)
            
            return restaurants
            
        except Exception as e:
            logger.error(f"Error getting popular restaurants: {str(e)}")
            return []
    
    async def _load_restaurant_data(self, location: str) -> List[Dict[str, Any]]:
        """
        Load restaurant data from JSON file
        """
        try:
            file_path = os.path.join(self.data_dir, f'restaurants_{location}.json')
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                # Return default data if file doesn't exist
                return self._get_default_restaurants()
        except Exception as e:
            logger.error(f"Error loading restaurant data: {str(e)}")
            return self._get_default_restaurants()
    
    def _filter_by_cuisine(self, restaurants: List[Dict[str, Any]], cuisine: str) -> List[Dict[str, Any]]:
        """
        Filter restaurants by cuisine
        """
        return [restaurant for restaurant in restaurants 
                if cuisine.lower() in restaurant.get('cuisine', '').lower()]
    
    def _filter_by_budget(self, restaurants: List[Dict[str, Any]], budget: str) -> List[Dict[str, Any]]:
        """
        Filter restaurants by budget
        """
        budget_mapping = {
            'budget': ['$', '$$'],
            'mid-range': ['$$', '$$$'],
            'luxury': ['$$$', '$$$$']
        }
        
        if budget in budget_mapping:
            allowed_ranges = budget_mapping[budget]
            return [restaurant for restaurant in restaurants 
                    if restaurant.get('price_range') in allowed_ranges]
        
        return restaurants
    
    def _filter_by_rating(self, restaurants: List[Dict[str, Any]], min_rating: float) -> List[Dict[str, Any]]:
        """
        Filter restaurants by minimum rating
        """
        return [restaurant for restaurant in restaurants 
                if restaurant.get('rating', 0) >= min_rating]
    
    def _get_default_restaurants(self) -> List[Dict[str, Any]]:
        """
        Return default restaurant data
        """
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