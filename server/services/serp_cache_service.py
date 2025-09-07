"""
SERP Cache Service - Avoid redundant API calls
Caches SERP API responses to prevent calling the same data multiple times
"""

import logging
import json
import hashlib
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

class SerpCacheService:
    """Centralized cache for SERP API responses"""
    
    def __init__(self, cache_duration_minutes: int = 60):
        """Initialize the cache service"""
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.cache_duration = timedelta(minutes=cache_duration_minutes)
        print(f"💾 SERP CACHE SERVICE - Initialized (cache for {cache_duration_minutes} minutes)")
    
    def _generate_cache_key(self, endpoint: str, params: Dict[str, Any]) -> str:
        """Generate a unique cache key for the request"""
        # Sort params for consistent keys
        sorted_params = json.dumps(params, sort_keys=True)
        # Create hash of endpoint + params
        cache_string = f"{endpoint}:{sorted_params}"
        return hashlib.md5(cache_string.encode()).hexdigest()
    
    def _is_cache_valid(self, cached_data: Dict[str, Any]) -> bool:
        """Check if cached data is still valid"""
        cached_time = datetime.fromisoformat(cached_data["timestamp"])
        return datetime.now() - cached_time < self.cache_duration
    
    def get_cached_response(self, endpoint: str, params: Dict[str, Any]) -> Optional[Any]:
        """Get cached response if available and valid"""
        cache_key = self._generate_cache_key(endpoint, params)
        
        if cache_key in self._cache:
            cached_data = self._cache[cache_key]
            if self._is_cache_valid(cached_data):
                print(f"💾 CACHE HIT: {endpoint} (saved SERP API call)")
                return cached_data["response"]
            else:
                # Remove expired cache
                del self._cache[cache_key]
                print(f"🗑️  CACHE EXPIRED: {endpoint}")
        
        print(f"💸 CACHE MISS: {endpoint} (will call SERP API)")
        return None
    
    def cache_response(self, endpoint: str, params: Dict[str, Any], response: Any) -> None:
        """Cache the SERP API response"""
        cache_key = self._generate_cache_key(endpoint, params)
        
        self._cache[cache_key] = {
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "endpoint": endpoint,
            "params": params
        }
        
        print(f"💾 CACHED: {endpoint} (future calls will be instant)")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_entries = len(self._cache)
        valid_entries = sum(1 for data in self._cache.values() if self._is_cache_valid(data))
        expired_entries = total_entries - valid_entries
        
        return {
            "total_entries": total_entries,
            "valid_entries": valid_entries,
            "expired_entries": expired_entries,
            "cache_hit_potential": f"{(valid_entries / max(total_entries, 1)) * 100:.1f}%"
        }
    
    def clear_expired_cache(self) -> int:
        """Clear expired cache entries and return count of cleared entries"""
        expired_keys = [
            key for key, data in self._cache.items() 
            if not self._is_cache_valid(data)
        ]
        
        for key in expired_keys:
            del self._cache[key]
        
        print(f"🗑️  CLEARED {len(expired_keys)} expired cache entries")
        return len(expired_keys)
    
    def clear_all_cache(self) -> None:
        """Clear all cache entries"""
        cleared_count = len(self._cache)
        self._cache.clear()
        print(f"🗑️  CLEARED ALL CACHE: {cleared_count} entries removed")

# Global cache instance
serp_cache = SerpCacheService()

class CachedPlacesSearchTool:
    """Places search tool with SERP caching to avoid redundant API calls"""
    
    def __init__(self):
        """Initialize the cached places search tool"""
        from tools.places_search_tool import PlacesSearchTool
        self.original_tool = PlacesSearchTool()
        self.cache = serp_cache
        print("🚀 CACHED PLACES SEARCH TOOL - Initialized with SERP caching")
    
    async def search_hotels_cached(self, location: str, check_in: str = None, check_out: str = None,
                                  rating_min: float = 3.5, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for hotels with caching"""
        
        # Create cache parameters
        cache_params = {
            "location": location,
            "check_in": check_in,
            "check_out": check_out,
            "rating_min": rating_min,
            "max_results": max_results
        }
        
        # Check cache first
        cached_result = self.cache.get_cached_response("search_hotels", cache_params)
        if cached_result is not None:
            return cached_result
        
        # Call original API
        print(f"🌐 SERP API CALL: hotels in {location}")
        result = await self.original_tool.search_hotels(location, check_in, check_out, rating_min, max_results)
        
        # Cache the result
        self.cache.cache_response("search_hotels", cache_params, result)
        
        return result
    
    async def search_restaurants_cached(self, location: str, cuisine_type: str = None,
                                       rating_min: float = 4.0, max_results: int = 8) -> List[Dict[str, Any]]:
        """Search for restaurants with caching"""
        
        cache_params = {
            "location": location,
            "cuisine_type": cuisine_type,
            "rating_min": rating_min,
            "max_results": max_results
        }
        
        cached_result = self.cache.get_cached_response("search_restaurants", cache_params)
        if cached_result is not None:
            return cached_result
        
        print(f"🌐 SERP API CALL: restaurants in {location}")
        result = await self.original_tool.search_restaurants(location, cuisine_type, rating_min, max_results)
        
        self.cache.cache_response("search_restaurants", cache_params, result)
        return result
    
    async def search_cafes_cached(self, location: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for cafes with caching"""
        
        cache_params = {
            "location": location,
            "max_results": max_results
        }
        
        cached_result = self.cache.get_cached_response("search_cafes", cache_params)
        if cached_result is not None:
            return cached_result
        
        print(f"🌐 SERP API CALL: cafes in {location}")
        result = await self.original_tool.search_cafes(location, max_results)
        
        self.cache.cache_response("search_cafes", cache_params, result)
        return result
    
    async def search_attractions_cached(self, location: str, interests: List[str] = None,
                                       max_results: int = 10) -> List[Dict[str, Any]]:
        """Search for attractions with caching"""
        
        cache_params = {
            "location": location,
            "interests": interests or [],
            "max_results": max_results
        }
        
        cached_result = self.cache.get_cached_response("search_attractions", cache_params)
        if cached_result is not None:
            return cached_result
        
        print(f"🌐 SERP API CALL: attractions in {location}")
        result = await self.original_tool.search_attractions(location, interests, max_results)
        
        self.cache.cache_response("search_attractions", cache_params, result)
        return result
    
    async def raw_serp_search_cached(self, query: str) -> List[Dict[str, Any]]:
        """Perform raw SERP search with caching"""
        
        cache_params = {"query": query}
        
        cached_result = self.cache.get_cached_response("raw_search", cache_params)
        if cached_result is not None:
            return cached_result
        
        print(f"🌐 SERP API CALL: raw search '{query}'")
        
        # Import here to avoid circular dependency
        import serpapi
        from config import settings
        
        if not getattr(settings, 'serp_api_key', None):
            return []
        
        try:
            search = serpapi.GoogleSearch({
                "q": query,
                "api_key": settings.serp_api_key,
                "engine": "google_maps",
                "type": "search",
                "num": 15
            })
            
            results = search.get_dict()
            local_results = results.get("local_results", [])
            
            # Cache the result
            self.cache.cache_response("raw_search", cache_params, local_results)
            
            return local_results
            
        except Exception as e:
            logger.error(f"Error in cached raw SERP search: {str(e)}")
            return []

# Global cached tool instance
cached_places_tool = CachedPlacesSearchTool()
