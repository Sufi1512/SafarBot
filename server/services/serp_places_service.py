"""
SERP Places Service - Enhanced with Direct Photo Access

This service now efficiently extracts photos directly from Google Maps search results
instead of making separate API calls to google_maps_photos.

NEW APPROACH:
- Photos are included directly in local_results and place_results
- Each place object contains a 'photos' array with thumbnail and high-res images
- No need for separate photo API calls - much more efficient!

PHOTO STRUCTURE:
{
  "photos": [
    {
      "thumbnail": "https://...",     # Small preview (203x160, etc.)
      "image": "https://...",         # High-res (2720x2144, etc.)
      "video": "https://...",         # Video content (when available)
      "photo_meta_serpapi_link": "..." # Metadata link
    }
  ]
}
"""



import asyncio
import logging
from typing import List, Dict, Any, Optional
import serpapi
from datetime import datetime
from config import settings

logger = logging.getLogger(__name__)

class SerpPlacesService:
    """Service to provide raw Google SERP API place data"""
    
    def __init__(self):
        """Initialize the SERP places service"""
        self.api_key = getattr(settings, 'serp_api_key', None)
        if not self.api_key:
            print("      ⚠️  SERP API key not configured - Service will return empty responses")
            logger.warning("SERP API key not configured. SERP places service will be disabled.")
        else:
            print("      ✅ SERP API key configured - Will return raw Google Maps data")
    
    async def get_place_by_id(self, place_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a place by Google place_id using SerpApi.
        Returns enhanced place data with photos included.
        """
        print(f"\n📍 SERP PLACES SERVICE - Fetching place by ID: {place_id}")
        
        if not self.api_key:
            print("      ❌ No SERP API key available")
            return None
        
        try:
            print(f"      🌐 Calling Google Maps API via SERP")
            
            search = serpapi.GoogleSearch({
                "engine": "google_maps",
                "place_id": place_id,
                "api_key": self.api_key
            })
            
            results = search.get_dict()
            place_data = results.get('place_results', {})
            
            if place_data:
                print(f"      ✅ Raw Google data retrieved ({len(str(place_data))} characters)")
                print(f"      📍 Place: {place_data.get('title', 'Unknown')}")
                print(f"      ⭐ Rating: {place_data.get('rating', 'N/A')}")
                
                # Extract photos if available
                photos = place_data.get('photos', [])
                if photos:
                    print(f"      🖼️  Photos: {len(photos)} photos found")
                    
                    # Add the first photo as thumbnail for easy access
                    if photos and len(photos) > 0:
                        first_photo = photos[0]
                        place_data['thumbnail'] = first_photo.get('thumbnail')
                        place_data['serpapi_thumbnail'] = first_photo.get('thumbnail')  # For compatibility
                        place_data['high_res_image'] = first_photo.get('image')
                        place_data['photo_count'] = len(photos)
                else:
                    print(f"      🖼️  Photos: No photos found")
                
                # Extract reviews if available
                reviews = place_data.get('reviews', [])
                if reviews:
                    print(f"      📝 Reviews: {len(reviews)} reviews found")
                    place_data['review_count'] = len(reviews)
                else:
                    print(f"      📝 Reviews: No reviews found")
                
                return place_data
            else:
                print(f"      ⚠️  No place data found for {place_id}")
                return None
                
        except Exception as e:
            print(f"      ❌ SERP API error: {str(e)}")
            logger.error(f"Error fetching place by ID {place_id}: {str(e)}")
            return None
    
    async def search_places(self, query: str, location: str = "", place_type: str = "") -> List[Dict[str, Any]]:
        """
        Search for places using Google Maps search
        Returns enhanced Google Maps search results with photos included
        """
        print(f"\n🔍 SERP PLACES SERVICE - Searching for: {query}")
        
        if not self.api_key:
            print("      ❌ No SERP API key available")
            return []
        
        try:
            print(f"      🌐 Searching Google Maps via SERP")
            
            search_params = {
                "engine": "google_maps",
                "q": query,
                "api_key": self.api_key
            }
            
            if location:
                search_params["ll"] = location
            
            if place_type:
                search_params["type"] = place_type
            
            search = serpapi.GoogleSearch(search_params)
            results = search.get_dict()
            
            local_results = results.get('local_results', [])
            
            if local_results:
                print(f"      ✅ Found {len(local_results)} places")
                
                # Process each place to include photos and enhance data
                enhanced_results = []
                for i, place in enumerate(local_results):
                    # Extract photos if available
                    photos = place.get('photos', [])
                    if photos:
                        print(f"         {i+1}. {place.get('title', 'Unknown')} - {place.get('rating', 'N/A')}⭐ - 📸 {len(photos)} photos")
                        
                        # Add the first photo as thumbnail for easy access
                        if photos and len(photos) > 0:
                            first_photo = photos[0]
                            place['thumbnail'] = first_photo.get('thumbnail')
                            place['serpapi_thumbnail'] = first_photo.get('thumbnail')  # For compatibility
                            place['high_res_image'] = first_photo.get('image')
                    else:
                        print(f"         {i+1}. {place.get('title', 'Unknown')} - {place.get('rating', 'N/A')}⭐ - No photos")
                    
                    enhanced_results.append(place)
                
                return enhanced_results
            else:
                print(f"      ⚠️  No places found for query: {query}")
                return []
                
        except Exception as e:
            print(f"      ❌ SERP API search error: {str(e)}")
            logger.error(f"Error searching places for query {query}: {str(e)}")
            return []
    
    async def get_place_photos(self, place_id: str) -> List[Dict[str, Any]]:
        """
        Get high-resolution photos for a place
        Returns raw Google Photos API response
        """
        print(f"\n📸 SERP PLACES SERVICE - Fetching photos for: {place_id}")
        
        if not self.api_key:
            print("      ❌ No SERP API key available")
            return []
        
        try:
            search = serpapi.GoogleSearch({
                "engine": "google_maps_photos",
                "place_id": place_id,
                "api_key": self.api_key
            })
            
            results = search.get_dict()
            photos = results.get('photos', [])
            
            if photos:
                print(f"      ✅ Found {len(photos)} photos")
                return photos
            else:
                print(f"      ⚠️  No photos found")
                return []
                
        except Exception as e:
            print(f"      ❌ SERP API photos error: {str(e)}")
            logger.error(f"Error fetching photos for {place_id}: {str(e)}")
            return []
    
    async def get_place_reviews(self, place_id: str) -> List[Dict[str, Any]]:
        """
        Get detailed reviews for a place
        Returns raw Google Reviews API response
        """
        print(f"\n📝 SERP PLACES SERVICE - Fetching reviews for: {place_id}")
        
        if not self.api_key:
            print("      ❌ No SERP API key available")
            return []
        
        try:
            search = serpapi.GoogleSearch({
                "engine": "google_maps_reviews",
                "place_id": place_id,
                "api_key": self.api_key
            })
            
            results = search.get_dict()
            reviews = results.get('reviews', [])
            
            if reviews:
                print(f"      ✅ Found {len(reviews)} reviews")
                return reviews
            else:
                print(f"      ⚠️  No reviews found")
                return []
                
        except Exception as e:
            print(f"      ❌ SERP API reviews error: {str(e)}")
            logger.error(f"Error fetching reviews for {place_id}: {str(e)}")
            return []
