"""
SERP Cache Service - In-memory caching
Caches SERP API responses using in-memory storage
"""

import logging
from typing import Dict, Any, Optional, List
from services.cache_service import cache_service

logger = logging.getLogger(__name__)

class SerpCacheService:
    """In-memory SERP cache service"""
    
    def __init__(self, cache_duration_minutes: int = 60):
        """Initialize the cache service"""
        self.cache_duration_seconds = cache_duration_minutes * 60
        print(f"💾 SERP CACHE SERVICE - Initialized with in-memory cache (cache for {cache_duration_minutes} minutes)")
    
    async def get_cached_response(self, endpoint: str, params: Dict[str, Any]) -> Optional[Any]:
        """Get cached response if available and valid"""
        try:
            cached_data = await cache_service.get("serp_cache", endpoint, params)
            if cached_data is not None:
                print(f"💾 CACHE HIT: {endpoint} (saved SERP API call)")
                return cached_data
            else:
                print(f"💸 CACHE MISS: {endpoint} (will call SERP API)")
                return None
        except Exception as e:
            logger.error(f"Error getting cached response: {str(e)}")
            return None
    
    async def cache_response(self, endpoint: str, params: Dict[str, Any], response: Any) -> None:
        """Cache the SERP API response"""
        try:
            success = await cache_service.set(
                "serp_cache", 
                endpoint, 
                response, 
                ttl=self.cache_duration_seconds, 
                params=params
            )
            if success:
                print(f"💾 CACHED: {endpoint} (future calls will be instant)")
            else:
                print(f"⚠️ CACHE FAILED: {endpoint}")
        except Exception as e:
            logger.error(f"Error caching response: {str(e)}")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            stats = await cache_service.get_cache_stats()
            return {
                "type": "In-Memory Cache",
                "status": stats.get("status", "active"),
                "total_safarbot_keys": stats.get("safarbot_keys", 0),
                "memory_used": stats.get("memory_used", "0B"),
                "cache_duration_minutes": self.cache_duration_seconds // 60
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return {"type": "Redis Cache", "status": "error", "error": str(e)}
    
    async def clear_expired_cache(self) -> int:
        """Clear expired cache entries"""
        return await cache_service.cleanup_expired()
    
    async def clear_all_cache(self) -> None:
        """Clear all SERP cache entries"""
        try:
            cleared_count = await cache_service.delete_pattern("serp_cache:*")
            print(f"🗑️  CLEARED ALL SERP CACHE: {cleared_count} entries removed")
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")

# Global cache instance
serp_cache = SerpCacheService()

class CachedPlacesSearchTool:
    """Places search tool with Redis caching to avoid redundant API calls"""
    
    def __init__(self):
        """Initialize the cached places search tool"""
        from tools.places_search_tool import PlacesSearchTool
        self.original_tool = PlacesSearchTool()
        self.cache = serp_cache
        print("🚀 CACHED PLACES SEARCH TOOL - Initialized with in-memory caching")
    
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
        cached_result = await self.cache.get_cached_response("search_hotels", cache_params)
        if cached_result is not None:
            return cached_result
        
        # Call original API
        print(f"🌐 SERP API CALL: hotels in {location}")
        result = await self.original_tool.search_hotels(location, check_in, check_out, rating_min, max_results)
        
        # Cache the result
        await self.cache.cache_response("search_hotels", cache_params, result)
        
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
        
        cached_result = await self.cache.get_cached_response("search_restaurants", cache_params)
        if cached_result is not None:
            return cached_result
        
        print(f"🌐 SERP API CALL: restaurants in {location}")
        result = await self.original_tool.search_restaurants(location, cuisine_type, rating_min, max_results)
        
        await self.cache.cache_response("search_restaurants", cache_params, result)
        return result
    
    async def search_cafes_cached(self, location: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search for cafes with caching"""
        
        cache_params = {
            "location": location,
            "max_results": max_results
        }
        
        cached_result = await self.cache.get_cached_response("search_cafes", cache_params)
        if cached_result is not None:
            return cached_result
        
        print(f"🌐 SERP API CALL: cafes in {location}")
        result = await self.original_tool.search_cafes(location, max_results)
        
        await self.cache.cache_response("search_cafes", cache_params, result)
        return result
    
    async def search_attractions_cached(self, location: str, interests: List[str] = None,
                                       max_results: int = 10) -> List[Dict[str, Any]]:
        """Search for attractions with caching"""
        
        cache_params = {
            "location": location,
            "interests": interests or [],
            "max_results": max_results
        }
        
        cached_result = await self.cache.get_cached_response("search_attractions", cache_params)
        if cached_result is not None:
            return cached_result
        
        print(f"🌐 SERP API CALL: attractions in {location}")
        result = await self.original_tool.search_attractions(location, interests, max_results)
        
        await self.cache.cache_response("search_attractions", cache_params, result)
        return result
    
    async def raw_serp_search_cached(self, query: str) -> List[Dict[str, Any]]:
        """Perform raw SERP search with caching"""
        
        cache_params = {"query": query}
        
        cached_result = await self.cache.get_cached_response("raw_search", cache_params)
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
            await self.cache.cache_response("raw_search", cache_params, local_results)
            
            return local_results
            
        except Exception as e:
            logger.error(f"Error in cached raw SERP search: {str(e)}")
            return []

# Global cached tool instance
cached_places_tool = CachedPlacesSearchTool()