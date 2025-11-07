"""
Places search tool using Google Maps/SERP API for finding hotels, restaurants, and cafes
"""

import logging
from typing import Dict, List, Optional, Any
from serpapi import GoogleSearch
from config import settings

logger = logging.getLogger(__name__)

class PlacesSearchTool:
    """Tool for searching real places using Google Maps/SERP API"""
    
    def __init__(self):
        """Initialize the places search tool"""
        self.api_key = getattr(settings, 'serp_api_key', None)
        if not self.api_key:
            print("      ⚠️  SERP API key not configured - Using fallback data")
            logger.warning("SERP API key not configured. Places search will be disabled.")
        else:
            print("      ✅ SERP API key configured - Will use real Google Maps data")
    
    async def search_hotels(self, location: str, check_in: str = None, check_out: str = None, 
                           rating_min: float = 3.5, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search for hotels in a specific location
        
        Args:
            location: Location to search for hotels
            check_in: Check-in date (YYYY-MM-DD format)
            check_out: Check-out date (YYYY-MM-DD format)
            rating_min: Minimum rating filter
            max_results: Maximum number of results to return
            
        Returns:
            List of ALL raw SERP API data for hotels (unfiltered, unprocessed)
        """
        if not self.api_key:
            print(f"         🔄 Using fallback hotel data for {location}")
            return self._get_fallback_hotels(location, max_results)
        
        try:
            print(f"         🌐 Searching real hotels via SERP API")
            query = f"hotels in {location}"
            if check_in and check_out:
                query += f" {check_in} to {check_out}"
            
            search = GoogleSearch({
                "q": query,
                "api_key": self.api_key,
                "engine": "google_maps",
                "type": "search",
                "ll": "@40.7589,-73.9851,15.1z",  # Default to NYC, will be updated by location
                "num": max_results,
                "hl": "en"  # Language parameter
            })
            
            results = search.get_dict()
            
            # Debug: Check what SERP API returned
            print(f"         🔍 SERP API response keys: {list(results.keys())}")
            local_results = results.get("local_results", [])
            print(f"         📊 Found {len(local_results)} local results")
            
            # Debug: Check first result structure
            if local_results and len(local_results) > 0:
                first_place = local_results[0]
                print(f"         🔍 First place keys: {list(first_place.keys())}")
                if 'thumbnail' in first_place or 'serpapi_thumbnail' in first_place:
                    print(f"         🖼️  First place has thumbnail: {first_place.get('thumbnail', 'N/A')}")
                else:
                    print(f"         📷 First place has NO thumbnail field")
            
            # Return ALL raw SERP data without filtering
            print(f"         📤 Returning ALL {len(local_results)} raw SERP results for hotels")
            return local_results
            
        except Exception as e:
            logger.error(f"Error searching hotels: {str(e)}")
            return self._get_fallback_hotels(location, max_results)
    
    async def search_restaurants(self, location: str, cuisine_type: str = None, 
                               rating_min: float = 4.0, max_results: int = 8) -> List[Dict[str, Any]]:
        """
        Search for restaurants and cafes in a specific location
        
        Args:
            location: Location to search for restaurants
            cuisine_type: Type of cuisine (optional)
            rating_min: Minimum rating filter
            max_results: Maximum number of results to return
            
        Returns:
            List of ALL raw SERP API data for restaurants (unfiltered, unprocessed)
        """
        if not self.api_key:
            return self._get_fallback_restaurants(location, cuisine_type, max_results)
        
        try:
            query = f"restaurants in {location}"
            if cuisine_type:
                query += f" {cuisine_type} cuisine"
            
            search = GoogleSearch({
                "q": query,
                "api_key": self.api_key,
                "engine": "google_maps",
                "type": "search",
                "num": max_results * 2,  # Get more to filter
                "hl": "en"  # Language parameter
            })
            
            results = search.get_dict()
            
            # Debug: Check what SERP API returned
            print(f"         🔍 SERP API response keys: {list(results.keys())}")
            local_results = results.get("local_results", [])
            print(f"         📊 Found {len(local_results)} local results")
            
            # Debug: Check first result structure
            if local_results and len(local_results) > 0:
                first_place = local_results[0]
                print(f"         🔍 First place keys: {list(first_place.keys())}")
                if 'thumbnail' in first_place or 'serpapi_thumbnail' in first_place:
                    print(f"         🖼️  First place has thumbnail: {first_place.get('thumbnail', 'N/A')}")
                else:
                    print(f"         📷 First place has NO thumbnail field")
            
            # Return ALL raw SERP data without filtering
            print(f"         📤 Returning ALL {len(local_results)} raw SERP results for restaurants")
            return local_results
            
            return local_results
            
        except Exception as e:
            logger.error(f"Error searching restaurants: {str(e)}")
            return self._get_fallback_restaurants(location, cuisine_type, max_results)
    
    async def search_cafes(self, location: str, rating_min: float = 4.0, 
                          max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search for cafes in a specific location
        
        Args:
            location: Location to search for cafes
            rating_min: Minimum rating filter
            max_results: Maximum number of results to return
            
        Returns:
            List of ALL raw SERP API data for cafes (unfiltered, unprocessed)
        """
        if not self.api_key:
            return self._get_fallback_cafes(location, max_results)
        
        try:
            search = GoogleSearch({
                "q": f"cafes coffee shops in {location}",
                "api_key": self.api_key,
                "engine": "google_maps",
                "type": "search",
                "num": max_results * 2,
                "hl": "en"  # Language parameter
            })
            
            results = search.get_dict()
            
            # Debug: Check what SERP API returned
            print(f"         🔍 SERP API response keys: {list(results.keys())}")
            local_results = results.get("local_results", [])
            print(f"         📊 Found {len(local_results)} local results")
            
            # Debug: Check first result structure
            if local_results and len(local_results) > 0:
                first_place = local_results[0]
                print(f"         🔍 First place keys: {list(first_place.keys())}")
                if 'thumbnail' in first_place or 'serpapi_thumbnail' in first_place:
                    print(f"         🖼️  First place has thumbnail: {first_place.get('thumbnail', 'N/A')}")
                else:
                    print(f"         📷 First place has NO thumbnail field")
            
            # Return ALL raw SERP data without filtering
            print(f"         📤 Returning ALL {len(local_results)} raw SERP results for cafes")
            return local_results
            
            return local_results
            
        except Exception as e:
            logger.error(f"Error searching cafes: {str(e)}")
            return self._get_fallback_cafes(location, max_results)
    
    async def search_attractions(self, location: str, interests: List[str] = None, 
                               max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Search for tourist attractions and activities
        
        Args:
            location: Location to search for attractions
            interests: List of interest categories
            max_results: Maximum number of results to return
            
        Returns:
            List of ALL raw SERP API data for attractions (unfiltered, unprocessed)
        """
        if not self.api_key:
            return self._get_fallback_attractions(location, interests, max_results)
        
        try:
            # Build query based on interests
            if interests:
                interest_query = " ".join(interests)
                query = f"{interest_query} attractions things to do in {location}"
            else:
                query = f"tourist attractions things to do in {location}"
            
            search = GoogleSearch({
                "q": query,
                "api_key": self.api_key,
                "engine": "google_maps",
                "type": "search",
                "num": max_results * 2,
                "hl": "en"  # Language parameter
            })
            
            results = search.get_dict()
            
            # Debug: Check what SERP API returned
            print(f"         🔍 SERP API response keys: {list(results.keys())}")
            local_results = results.get("local_results", [])
            print(f"         📊 Found {len(local_results)} local results")
            
            # Debug: Check first result structure
            if local_results and len(local_results) > 0:
                first_place = local_results[0]
                print(f"         🔍 First place keys: {list(first_place.keys())}")
                if 'thumbnail' in first_place or 'serpapi_thumbnail' in first_place:
                    print(f"         🖼️  First place has thumbnail: {first_place.get('thumbnail', 'N/A')}")
                else:
                    print(f"         📷 First place has NO thumbnail field")
            
            # Return ALL raw SERP data without filtering
            print(f"         📤 Returning ALL {len(local_results)} raw SERP results for attractions")
            return local_results
            
            return local_results
            
        except Exception as e:
            logger.error(f"Error searching attractions: {str(e)}")
            return self._get_fallback_attractions(location, interests, max_results)
    
    def _is_hotel(self, place: Dict[str, Any]) -> bool:
        """Check if a place is a hotel"""
        title = place.get("title", "").lower()
        types = place.get("type", [])
        
        hotel_keywords = ["hotel", "inn", "resort", "lodge", "motel", "hostel", "guesthouse"]
        hotel_types = ["lodging", "hotel"]
        
        return (any(keyword in title for keyword in hotel_keywords) or 
                any(hotel_type in types for hotel_type in hotel_types))
    
    def _is_restaurant(self, place: Dict[str, Any]) -> bool:
        """Check if a place is a restaurant"""
        title = place.get("title", "").lower()
        types = place.get("type", [])
        
        restaurant_types = ["restaurant", "food", "meal_delivery", "meal_takeaway"]
        
        return (any(rest_type in types for rest_type in restaurant_types) and
                "hotel" not in title and "lodging" not in types)
    
    def _is_cafe(self, place: Dict[str, Any]) -> bool:
        """Check if a place is a cafe"""
        title = place.get("title", "").lower()
        types = place.get("type", [])
        
        cafe_keywords = ["cafe", "coffee", "espresso", "starbucks", "coffee shop"]
        cafe_types = ["cafe", "restaurant"]
        
        return (any(keyword in title for keyword in cafe_keywords) or
                (any(cafe_type in types for cafe_type in cafe_types) and 
                 any(keyword in title for keyword in ["coffee", "cafe"])))
    
    def _is_attraction(self, place: Dict[str, Any]) -> bool:
        """Check if a place is a tourist attraction"""
        types = place.get("type", [])
        
        attraction_types = [
            "tourist_attraction", "museum", "park", "zoo", "aquarium", 
            "amusement_park", "art_gallery", "church", "temple", "synagogue",
            "mosque", "historical_landmark", "natural_feature"
        ]
        
        return any(attr_type in types for attr_type in attraction_types)
    
    def _extract_hotel_info(self, place: Dict[str, Any], location: str) -> Dict[str, Any]:
        """Extract hotel information from SERP API response"""
        # Extract photos if available
        photos = place.get("photos", [])
        thumbnail = ""
        serpapi_thumbnail = ""
        if photos and len(photos) > 0:
            first_photo = photos[0]
            thumbnail = first_photo.get("serpapi_thumbnail") or first_photo.get("image") or first_photo.get("thumbnail", "")
            serpapi_thumbnail = first_photo.get("serpapi_thumbnail") or first_photo.get("image", "")
            print(f"            ✅ Extracted hotel photo: {thumbnail}")
        else:
            print(f"            ❌ No photos found for hotel {place.get('title', 'Unknown')}")
        
        return {
            "name": place.get("title", "Unknown Hotel"),
            "rating": place.get("rating", 3.5),
            "price_range": self._estimate_price_range(place, "hotel"),
            "amenities": self._extract_amenities(place),
            "location": place.get("address", location),
            "description": f"Well-rated hotel in {location}",
            "phone": place.get("phone"),
            "website": place.get("website"),
            "thumbnail": place.get("serpapi_thumbnail") or place.get("thumbnail") or thumbnail,
            "serpapi_thumbnail": serpapi_thumbnail or place.get("serpapi_thumbnail") or place.get("thumbnail", ""),
            "place_id": place.get("place_id", ""),
            "category": "hotel",
            "coordinates": {
                "lat": place.get("gps_coordinates", {}).get("latitude"),
                "lng": place.get("gps_coordinates", {}).get("longitude")
            }
        }
    
    def _extract_restaurant_info(self, place: Dict[str, Any], location: str) -> Dict[str, Any]:
        """Extract restaurant information from SERP API response"""
        # Extract photos if available
        photos = place.get("photos", [])
        thumbnail = ""
        serpapi_thumbnail = ""
        if photos and len(photos) > 0:
            first_photo = photos[0]
            thumbnail = first_photo.get("serpapi_thumbnail") or first_photo.get("image") or first_photo.get("thumbnail", "")
            serpapi_thumbnail = first_photo.get("serpapi_thumbnail") or first_photo.get("image", "")
        
        return {
            "name": place.get("title", "Local Restaurant"),
            "cuisine": self._determine_cuisine(place),
            "rating": place.get("rating", 4.0),
            "price_range": self._estimate_price_range(place, "restaurant"),
            "description": f"Popular restaurant in {location}",
            "place_id": place.get("place_id", ""),
            "category": "restaurant",
            "thumbnail": place.get("serpapi_thumbnail") or place.get("thumbnail") or thumbnail,
            "serpapi_thumbnail": serpapi_thumbnail or place.get("serpapi_thumbnail") or place.get("thumbnail", ""),
            "location": place.get("address", location),
            "phone": place.get("phone"),
            "hours": place.get("hours"),
            "coordinates": {
                "lat": place.get("gps_coordinates", {}).get("latitude"),
                "lng": place.get("gps_coordinates", {}).get("longitude")
            }
        }
    
    def _extract_cafe_info(self, place: Dict[str, Any], location: str) -> Dict[str, Any]:
        """Extract cafe information from SERP API response"""
        # Extract photos if available
        photos = place.get("photos", [])
        thumbnail = ""
        serpapi_thumbnail = ""
        if photos and len(photos) > 0:
            first_photo = photos[0]
            thumbnail = first_photo.get("serpapi_thumbnail") or first_photo.get("image") or first_photo.get("thumbnail", "")
            serpapi_thumbnail = first_photo.get("serpapi_thumbnail") or first_photo.get("image", "")
        
        return {
            "name": place.get("title", "Local Cafe"),
            "type": "cafe",
            "rating": place.get("rating", 4.0),
            "price_range": "$",
            "description": f"Cozy cafe in {location}",
            "place_id": place.get("place_id", ""),
            "category": "cafe",
            "thumbnail": place.get("serpapi_thumbnail") or place.get("thumbnail") or thumbnail,
            "serpapi_thumbnail": serpapi_thumbnail or place.get("serpapi_thumbnail") or place.get("thumbnail", ""),
            "location": place.get("address", location),
            "speciality": "Coffee and light meals",
            "coordinates": {
                "lat": place.get("gps_coordinates", {}).get("latitude"),
                "lng": place.get("gps_coordinates", {}).get("longitude")
            }
        }
    
    def _extract_attraction_info(self, place: Dict[str, Any], location: str) -> Dict[str, Any]:
        """Extract attraction information from SERP API response"""
        # Extract photos if available
        photos = place.get("photos", [])
        thumbnail = ""
        serpapi_thumbnail = ""
        if photos and len(photos) > 0:
            first_photo = photos[0]
            thumbnail = first_photo.get("serpapi_thumbnail") or first_photo.get("image") or first_photo.get("thumbnail", "")
            serpapi_thumbnail = first_photo.get("serpapi_thumbnail") or first_photo.get("image", "")
        
        return {
            "name": place.get("title", "Local Attraction"),
            "type": self._determine_attraction_type(place),
            "rating": place.get("rating", 4.0),
            "description": f"Popular attraction in {location}",
            "place_id": place.get("place_id", ""),
            "category": "attraction",
            "thumbnail": place.get("serpapi_thumbnail") or place.get("thumbnail") or thumbnail,
            "serpapi_thumbnail": serpapi_thumbnail or place.get("serpapi_thumbnail") or place.get("thumbnail", ""),
            "location": place.get("address", location),
            "hours": place.get("hours"),
            "estimated_cost": self._estimate_attraction_cost(place),
            "estimated_duration": "2-3 hours",
            "coordinates": {
                "lat": place.get("gps_coordinates", {}).get("latitude"),
                "lng": place.get("gps_coordinates", {}).get("longitude")
            }
        }
    
    def _extract_amenities(self, place: Dict[str, Any]) -> List[str]:
        """Extract hotel amenities from place data"""
        default_amenities = ["WiFi", "Air Conditioning"]
        rating = place.get("rating", 3.5)
        
        if rating >= 4.5:
            return ["WiFi", "Pool", "Gym", "Restaurant", "Room Service", "Concierge"]
        elif rating >= 4.0:
            return ["WiFi", "Restaurant", "Room Service", "Air Conditioning"]
        else:
            return default_amenities
    
    def _estimate_price_range(self, place: Dict[str, Any], place_type: str) -> str:
        """Estimate price range based on rating and location"""
        rating = place.get("rating", 3.5)
        
        if place_type == "hotel":
            if rating >= 4.5:
                return "$$$"
            elif rating >= 4.0:
                return "$$"
            else:
                return "$"
        else:  # restaurant
            if rating >= 4.5:
                return "$$-$$$"
            elif rating >= 4.0:
                return "$$"
            else:
                return "$"
    
    def _determine_cuisine(self, place: Dict[str, Any]) -> str:
        """Determine cuisine type from place information"""
        title = place.get("title", "").lower()
        
        cuisine_keywords = {
            "italian": ["italian", "pizza", "pasta"],
            "chinese": ["chinese", "asian"],
            "japanese": ["japanese", "sushi", "ramen"],
            "french": ["french", "bistro"],
            "mexican": ["mexican", "taco"],
            "indian": ["indian", "curry"],
            "thai": ["thai"],
            "american": ["american", "burger", "grill"]
        }
        
        for cuisine, keywords in cuisine_keywords.items():
            if any(keyword in title for keyword in keywords):
                return cuisine.title()
        
        return "International"
    
    def _determine_attraction_type(self, place: Dict[str, Any]) -> str:
        """Determine the type of attraction"""
        types = place.get("type", [])
        title = place.get("title", "").lower()
        
        if "museum" in types or "museum" in title:
            return "museum"
        elif "park" in types or "park" in title:
            return "park"
        elif any(t in types for t in ["church", "temple", "synagogue", "mosque"]):
            return "religious_site"
        elif "historical" in types or "landmark" in types:
            return "historical_site"
        else:
            return "attraction"
    
    def _estimate_attraction_cost(self, place: Dict[str, Any]) -> int:
        """Estimate the cost of visiting an attraction"""
        types = place.get("type", [])
        
        if "museum" in types:
            return 15
        elif "park" in types:
            return 0
        elif any(t in types for t in ["zoo", "aquarium", "amusement_park"]):
            return 25
        else:
            return 10
    
    # Fallback methods when SERP API is not available
    def _get_fallback_hotels(self, location: str, max_results: int) -> List[Dict[str, Any]]:
        """Generate fallback hotel data"""
        hotels = []
        for i in range(min(max_results, 3)):
            hotels.append({
                "name": f"Hotel {location} {i+1}",
                "rating": 4.0 + (i * 0.2),
                "price_range": "$$",
                "amenities": ["WiFi", "Air Conditioning", "Restaurant"],
                "location": location,
                "description": f"Comfortable hotel in {location}"
            })
        return hotels
    
    def _get_fallback_restaurants(self, location: str, cuisine_type: str, max_results: int) -> List[Dict[str, Any]]:
        """Generate fallback restaurant data"""
        restaurants = []
        cuisines = [cuisine_type] if cuisine_type else ["Local", "International", "Traditional"]
        
        for i in range(min(max_results, len(cuisines) * 2)):
            cuisine = cuisines[i % len(cuisines)]
            restaurants.append({
                "name": f"{cuisine} Restaurant {location}",
                "cuisine": cuisine,
                "rating": 4.0 + (i * 0.1),
                "price_range": "$$",
                "description": f"Popular {cuisine.lower()} restaurant in {location}",
                "location": location
            })
        return restaurants
    
    def _get_fallback_cafes(self, location: str, max_results: int) -> List[Dict[str, Any]]:
        """Generate fallback cafe data"""
        cafes = []
        for i in range(min(max_results, 3)):
            cafes.append({
                "name": f"Cafe {location} {i+1}",
                "type": "cafe",
                "rating": 4.2,
                "price_range": "$",
                "description": f"Cozy cafe in {location}",
                "location": location,
                "speciality": "Coffee and pastries"
            })
        return cafes
    
    def _get_fallback_attractions(self, location: str, interests: List[str], max_results: int) -> List[Dict[str, Any]]:
        """Generate fallback attraction data"""
        attractions = []
        base_attractions = [
            {"name": f"{location} Museum", "type": "museum", "cost": 15},
            {"name": f"{location} Park", "type": "park", "cost": 0},
            {"name": f"Historic {location}", "type": "historical_site", "cost": 10}
        ]
        
        for i, attraction in enumerate(base_attractions[:max_results]):
            attractions.append({
                "name": attraction["name"],
                "type": attraction["type"],
                "rating": 4.0,
                "description": f"Popular {attraction['type']} in {location}",
                "location": location,
                "estimated_cost": attraction["cost"],
                "estimated_duration": "2-3 hours"
            })
        
        return attractions
