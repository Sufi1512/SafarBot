"""
Photo Prefetch Service - Automatically prefetch and cache photos for places
This service extracts all photo URLs from place data and triggers browser prefetching
"""

import logging
from typing import Dict, List, Any, Set
import asyncio

logger = logging.getLogger(__name__)

class PhotoPrefetchService:
    """Service to extract and prepare photo URLs for automatic prefetching"""
    
    def __init__(self):
        """Initialize the photo prefetch service"""
        self.prefetched_urls: Set[str] = set()
        logger.info("Photo Prefetch Service initialized")
    
    def extract_all_photo_urls(self, data: Dict[str, Any]) -> List[str]:
        """
        Extract ALL photo URLs from the complete itinerary response
        Returns a list of unique photo URLs ready for prefetching
        """
        photo_urls = []
        
        try:
            # Extract from place_details
            place_details = data.get('place_details', {})
            for place_id, place in place_details.items():
                urls = self._extract_photos_from_place(place)
                photo_urls.extend(urls)
            
            # Extract from additional_places
            additional_places = data.get('additional_places', {})
            for category, places in additional_places.items():
                for place in places:
                    urls = self._extract_photos_from_place(place)
                    photo_urls.extend(urls)
            
            # Deduplicate
            unique_urls = list(set(photo_urls))
            
            logger.info(f"📸 Extracted {len(unique_urls)} unique photo URLs for prefetching")
            
            return unique_urls
            
        except Exception as e:
            logger.error(f"Error extracting photo URLs: {str(e)}")
            return []
    
    def _extract_photos_from_place(self, place: Dict[str, Any]) -> List[str]:
        """Extract all photo URLs from a single place object"""
        urls = []
        
        # Primary thumbnail
        if place.get('thumbnail'):
            urls.append(place['thumbnail'])
        
        if place.get('serpapi_thumbnail'):
            urls.append(place['serpapi_thumbnail'])
        
        # High-res image
        if place.get('high_res_image'):
            urls.append(place['high_res_image'])
        
        # Photos array
        photos = place.get('photos', [])
        if isinstance(photos, list):
            for photo in photos:
                if isinstance(photo, dict):
                    if photo.get('thumbnail'):
                        urls.append(photo['thumbnail'])
                    if photo.get('image'):
                        urls.append(photo['image'])
                elif isinstance(photo, str):
                    urls.append(photo)
        
        return urls
    
    def generate_prefetch_metadata(self, photo_urls: List[str]) -> Dict[str, Any]:
        """
        Generate metadata for frontend to automatically prefetch photos
        Returns a structure that the frontend can use to trigger prefetching
        """
        return {
            "photo_urls": photo_urls,
            "total_photos": len(photo_urls),
            "prefetch_strategy": "eager",  # Load all photos immediately
            "cache_policy": "force-cache",  # Use browser cache aggressively
            "priority": "high",  # High priority for image loading
            "instructions": "Frontend should prefetch all URLs using <link rel='prefetch'> or fetch API"
        }
    
    async def prefetch_photos_server_side(self, photo_urls: List[str]) -> Dict[str, Any]:
        """
        Optional: Trigger server-side prefetching (validates URLs are accessible)
        This can help identify broken image URLs before sending to frontend
        """
        try:
            import aiohttp
        except ImportError:
            logger.warning("aiohttp not installed, skipping server-side photo validation")
            return {
                "valid_urls": photo_urls,
                "invalid_urls": [],
                "validation_complete": False
            }
        
        valid_urls = []
        invalid_urls = []
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for url in photo_urls[:50]:  # Limit to first 50 for performance
                tasks.append(self._validate_url(session, url))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for url, is_valid in zip(photo_urls[:50], results):
                if is_valid and not isinstance(is_valid, Exception):
                    valid_urls.append(url)
                else:
                    invalid_urls.append(url)
        
        logger.info(f"✅ Validated {len(valid_urls)} valid photo URLs")
        if invalid_urls:
            logger.warning(f"⚠️  Found {len(invalid_urls)} invalid photo URLs")
        
        return {
            "valid_urls": valid_urls,
            "invalid_urls": invalid_urls,
            "validation_complete": True
        }
    
    async def _validate_url(self, session: aiohttp.ClientSession, url: str) -> bool:
        """Validate that a photo URL is accessible"""
        try:
            async with session.head(url, timeout=aiohttp.ClientTimeout(total=2)) as response:
                return response.status == 200
        except:
            return False

# Global service instance
photo_prefetch_service = PhotoPrefetchService()

