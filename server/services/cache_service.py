"""
In-Memory Cache Service - Local caching with TTL support
Replaces Redis with simple in-memory storage for caching
"""

import json
import hashlib
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import logging
import threading

logger = logging.getLogger(__name__)


class CacheEntry:
    """Represents a cache entry with expiration time"""
    def __init__(self, value: Any, ttl: int):
        self.value = value
        self.expires_at = datetime.now() + timedelta(seconds=ttl)
    
    def is_expired(self) -> bool:
        """Check if entry has expired"""
        return datetime.now() > self.expires_at
    
    def get_value(self) -> Optional[Any]:
        """Get value if not expired"""
        if self.is_expired():
            return None
        return self.value


class CacheService:
    """
    In-memory cache service for local caching with TTL support
    """
    
    def __init__(self):
        self._cache: Dict[str, CacheEntry] = {}
        self._lock = threading.RLock()  # Thread-safe lock
        self.default_ttl = 3600  # 1 hour default TTL
        self._cleanup_task = None
        logger.info("✅ In-memory cache service initialized")
    
    def _generate_cache_key(self, namespace: str, key: str, params: Optional[Dict[str, Any]] = None) -> str:
        """Generate a hierarchical cache key"""
        if params:
            # Sort params for consistent keys
            sorted_params = json.dumps(params, sort_keys=True, default=str)
            param_hash = hashlib.md5(sorted_params.encode()).hexdigest()[:8]
            return f"safarbot:{namespace}:{key}:{param_hash}"
        return f"safarbot:{namespace}:{key}"
    
    async def get(self, namespace: str, key: str, params: Optional[Dict[str, Any]] = None) -> Optional[Any]:
        """Get cached data"""
        cache_key = self._generate_cache_key(namespace, key, params)
        
        with self._lock:
            entry = self._cache.get(cache_key)
            if entry:
                value = entry.get_value()
                if value is not None:
                    logger.debug(f"💾 Cache HIT: {cache_key}")
                    return value
                else:
                    # Expired, remove it
                    del self._cache[cache_key]
            
            logger.debug(f"💸 Cache MISS: {cache_key}")
            return None
    
    async def set(
        self, 
        namespace: str, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Set cached data with TTL"""
        cache_key = self._generate_cache_key(namespace, key, params)
        ttl_seconds = ttl or self.default_ttl
        
        with self._lock:
            self._cache[cache_key] = CacheEntry(value, ttl_seconds)
            logger.debug(f"💾 Cache SET: {cache_key} (TTL: {ttl_seconds}s)")
        
        return True
    
    async def delete(self, namespace: str, key: str, params: Optional[Dict[str, Any]] = None) -> bool:
        """Delete cached data"""
        cache_key = self._generate_cache_key(namespace, key, params)
        
        with self._lock:
            if cache_key in self._cache:
                del self._cache[cache_key]
                logger.debug(f"🗑️ Cache DELETE: {cache_key}")
                return True
        
        return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern"""
        prefix = f"safarbot:{pattern}"
        deleted_count = 0
        
        with self._lock:
            keys_to_delete = [k for k in self._cache.keys() if k.startswith(prefix)]
            for key in keys_to_delete:
                del self._cache[key]
                deleted_count += 1
        
        if deleted_count > 0:
            logger.debug(f"🗑️ Cache PATTERN DELETE: {deleted_count} keys deleted")
        
        return deleted_count
    
    async def store_json(self, key: str, data: Any, ttl: Optional[int] = None) -> bool:
        """Store JSON data (convenience method)"""
        # Store directly without namespace/key structure
        ttl_seconds = ttl or self.default_ttl
        
        with self._lock:
            self._cache[key] = CacheEntry(data, ttl_seconds)
            logger.debug(f"💾 Cache STORE JSON: {key}")
        
        return True
    
    async def get_json(self, key: str) -> Optional[Any]:
        """Get JSON data (convenience method)"""
        with self._lock:
            entry = self._cache.get(key)
            if entry:
                value = entry.get_value()
                if value is not None:
                    return value
                else:
                    # Expired, remove it
                    del self._cache[key]
        
        return None
    
    # Session management methods
    async def set_user_session(self, user_id: str, session_data: Dict[str, Any], ttl: int = 86400) -> bool:
        """Set user session data (24 hours default)"""
        return await self.set("sessions", f"user:{user_id}", session_data, ttl)
    
    async def get_user_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user session data"""
        return await self.get("sessions", f"user:{user_id}")
    
    async def delete_user_session(self, user_id: str) -> bool:
        """Delete user session"""
        return await self.delete("sessions", f"user:{user_id}")
    
    # Collaboration-specific methods
    async def set_collaboration_state(
        self, 
        itinerary_id: str, 
        user_id: str, 
        state: Dict[str, Any]
    ) -> bool:
        """Set collaboration state for real-time editing"""
        key = f"collab:{itinerary_id}:user:{user_id}"
        return await self.set("collaboration", key, state, ttl=300)  # 5 minutes
    
    async def get_collaboration_state(self, itinerary_id: str) -> Dict[str, Any]:
        """Get all collaboration states for an itinerary"""
        prefix = f"safarbot:collaboration:collab:{itinerary_id}:user:"
        states = {}
        
        with self._lock:
            for key, entry in list(self._cache.items()):
                if key.startswith(prefix):
                    value = entry.get_value()
                    if value is not None:
                        # Extract user_id from key
                        user_id = key.split(':')[-1]
                        states[user_id] = value
                    else:
                        # Expired, remove it
                        del self._cache[key]
        
        return states
    
    # Event publishing (stub - no pub/sub in in-memory)
    async def publish_event(self, channel: str, event_data: Dict[str, Any]) -> bool:
        """Publish real-time event (no-op in in-memory cache)"""
        # In-memory cache doesn't support pub/sub
        # This is a stub for compatibility
        logger.debug(f"📡 Event PUBLISH (stub): {channel}")
        return True
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            # Clean expired entries first
            expired_keys = [k for k, v in self._cache.items() if v.is_expired()]
            for key in expired_keys:
                del self._cache[key]
            
            total_keys = len(self._cache)
            safarbot_keys = len([k for k in self._cache.keys() if k.startswith("safarbot:")])
            
            # Estimate memory usage (rough calculation)
            memory_estimate = sum(len(str(v.value).encode()) for v in self._cache.values())
            memory_str = self._format_bytes(memory_estimate)
        
        return {
            "status": "connected",
            "type": "in-memory",
            "total_keys": total_keys,
            "safarbot_keys": safarbot_keys,
            "memory_used": memory_str,
            "cache_hit_ratio": "N/A (in-memory cache)"
        }
    
    def _format_bytes(self, bytes_value: int) -> str:
        """Format bytes to human-readable string"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.2f}{unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.2f}TB"
    
    async def health_check(self) -> bool:
        """Check if cache is healthy"""
        return True
    
    async def clear_all(self) -> int:
        """Clear all cache entries"""
        with self._lock:
            count = len(self._cache)
            self._cache.clear()
            logger.info(f"🗑️ Cache CLEARED: {count} entries removed")
        return count
    
    async def cleanup_expired(self) -> int:
        """Remove expired entries"""
        with self._lock:
            expired_keys = [k for k, v in self._cache.items() if v.is_expired()]
            for key in expired_keys:
                del self._cache[key]
        
        if expired_keys:
            logger.debug(f"🧹 Cache CLEANUP: {len(expired_keys)} expired entries removed")
        
        return len(expired_keys)


# Global cache service instance
cache_service = CacheService()

# Alias for backward compatibility (same interface as redis_service)
redis_service = cache_service

# Helper functions for backward compatibility
async def get_cached_response(endpoint: str, params: Dict[str, Any]) -> Optional[Any]:
    """Backward compatible function for SERP cache"""
    return await cache_service.get("serp_cache", endpoint, params)

async def cache_response(endpoint: str, params: Dict[str, Any], response: Any, ttl: int = 3600) -> bool:
    """Backward compatible function for SERP cache"""
    return await cache_service.set("serp_cache", endpoint, response, ttl, params)

