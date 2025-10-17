"""
Redis Service - Advanced caching and real-time features
Replaces in-memory caching with distributed Redis caching
"""

import redis
import json
import hashlib
import asyncio
from typing import Dict, Any, Optional, List, Union
from datetime import datetime, timedelta
import logging
from config import settings
import os

logger = logging.getLogger(__name__)

class RedisService:
    """
    Advanced Redis service for caching, real-time features, and session management
    """
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client: Optional[redis.Redis] = None
        self.default_ttl = 3600  # 1 hour default TTL
        
    async def connect(self):
        """Initialize Redis connection"""
        try:
            # Parse Redis URL for connection
            if self.redis_url.startswith("redis://") or self.redis_url.startswith("rediss://"):
                self.redis_client = redis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    health_check_interval=30
                )
            else:
                # Local Redis connection
                self.redis_client = redis.Redis(
                    host='localhost',
                    port=6379,
                    db=0,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
            
            # Test connection
            await asyncio.to_thread(self.redis_client.ping)
            logger.info("✅ Redis connection established successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {str(e)}")
            logger.warning("📍 Falling back to in-memory caching")
            self.redis_client = None
            return False
    
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
        if not self.redis_client:
            return None
            
        try:
            cache_key = self._generate_cache_key(namespace, key, params)
            data = await asyncio.to_thread(self.redis_client.get, cache_key)
            
            if data:
                logger.debug(f"💾 Cache HIT: {cache_key}")
                return json.loads(data)
            else:
                logger.debug(f"💸 Cache MISS: {cache_key}")
                return None
                
        except Exception as e:
            logger.error(f"Redis GET error: {str(e)}")
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
        if not self.redis_client:
            return False
            
        try:
            cache_key = self._generate_cache_key(namespace, key, params)
            serialized_value = json.dumps(value, default=str)
            ttl_seconds = ttl or self.default_ttl
            
            result = await asyncio.to_thread(
                self.redis_client.setex, 
                cache_key, 
                ttl_seconds, 
                serialized_value
            )
            
            logger.debug(f"💾 Cache SET: {cache_key} (TTL: {ttl_seconds}s)")
            return result
            
        except Exception as e:
            logger.error(f"Redis SET error: {str(e)}")
            return False
    
    async def delete(self, namespace: str, key: str, params: Optional[Dict[str, Any]] = None) -> bool:
        """Delete cached data"""
        if not self.redis_client:
            return False
            
        try:
            cache_key = self._generate_cache_key(namespace, key, params)
            result = await asyncio.to_thread(self.redis_client.delete, cache_key)
            logger.debug(f"🗑️ Cache DELETE: {cache_key}")
            return bool(result)
            
        except Exception as e:
            logger.error(f"Redis DELETE error: {str(e)}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern"""
        if not self.redis_client:
            return 0
            
        try:
            keys = await asyncio.to_thread(self.redis_client.keys, f"safarbot:{pattern}*")
            if keys:
                result = await asyncio.to_thread(self.redis_client.delete, *keys)
                logger.debug(f"🗑️ Cache PATTERN DELETE: {len(keys)} keys deleted")
                return result
            return 0
            
        except Exception as e:
            logger.error(f"Redis PATTERN DELETE error: {str(e)}")
            return 0
    
    async def cached_call(
        self, 
        namespace: str,
        key: str,
        api_call,
        ttl: Optional[int] = None,
        params: Optional[Dict[str, Any]] = None,
        force_refresh: bool = False
    ) -> Any:
        """Cached API call wrapper"""
        
        # Check cache first (unless force refresh)
        if not force_refresh:
            cached_data = await self.get(namespace, key, params)
            if cached_data is not None:
                return cached_data
        
        # Execute API call
        try:
            if asyncio.iscoroutinefunction(api_call):
                result = await api_call()
            else:
                result = await asyncio.to_thread(api_call)
            
            # Cache the result
            await self.set(namespace, key, result, ttl, params)
            return result
            
        except Exception as e:
            logger.error(f"Cached call error: {str(e)}")
            raise
    
    # Real-time features for collaboration
    async def publish_event(self, channel: str, event_data: Dict[str, Any]) -> bool:
        """Publish real-time event"""
        if not self.redis_client:
            return False
            
        try:
            message = json.dumps({
                'timestamp': datetime.utcnow().isoformat(),
                'data': event_data
            }, default=str)
            
            result = await asyncio.to_thread(
                self.redis_client.publish, 
                f"safarbot:{channel}", 
                message
            )
            logger.debug(f"📡 Event PUBLISHED: {channel}")
            return result > 0
            
        except Exception as e:
            logger.error(f"Redis PUBLISH error: {str(e)}")
            return False
    
    async def subscribe_to_events(self, channels: List[str], callback):
        """Subscribe to real-time events"""
        if not self.redis_client:
            return
            
        try:
            pubsub = self.redis_client.pubsub()
            prefixed_channels = [f"safarbot:{channel}" for channel in channels]
            await asyncio.to_thread(pubsub.subscribe, *prefixed_channels)
            
            logger.info(f"📡 Subscribed to channels: {channels}")
            
            # Listen for messages
            async def listen():
                while True:
                    try:
                        message = await asyncio.to_thread(pubsub.get_message, timeout=1.0)
                        if message and message['type'] == 'message':
                            channel = message['channel'].replace('safarbot:', '')
                            data = json.loads(message['data'])
                            await callback(channel, data)
                    except Exception as e:
                        logger.error(f"Redis SUBSCRIBE error: {str(e)}")
                        break
            
            return listen
            
        except Exception as e:
            logger.error(f"Redis SUBSCRIBE setup error: {str(e)}")
            return None
    
    # Session management
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
        if not self.redis_client:
            return {}
            
        try:
            pattern = f"safarbot:collaboration:collab:{itinerary_id}:user:*"
            keys = await asyncio.to_thread(self.redis_client.keys, pattern)
            
            states = {}
            for key in keys:
                user_id = key.split(':')[-1]
                data = await asyncio.to_thread(self.redis_client.get, key)
                if data:
                    states[user_id] = json.loads(data)
            
            return states
            
        except Exception as e:
            logger.error(f"Get collaboration state error: {str(e)}")
            return {}
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get Redis cache statistics"""
        if not self.redis_client:
            return {"status": "disconnected", "error": "Redis not available"}
            
        try:
            info = await asyncio.to_thread(self.redis_client.info)
            memory_info = await asyncio.to_thread(self.redis_client.info, 'memory')
            
            # Count SafarBot specific keys
            safarbot_keys = await asyncio.to_thread(self.redis_client.keys, "safarbot:*")
            
            return {
                "status": "connected",
                "total_keys": info.get('db0', {}).get('keys', 0),
                "safarbot_keys": len(safarbot_keys),
                "memory_used": memory_info.get('used_memory_human', '0B'),
                "memory_peak": memory_info.get('used_memory_peak_human', '0B'),
                "connected_clients": info.get('connected_clients', 0),
                "commands_processed": info.get('total_commands_processed', 0),
                "cache_hit_ratio": "Available in Redis stats",
                "uptime_seconds": info.get('uptime_in_seconds', 0)
            }
            
        except Exception as e:
            logger.error(f"Redis stats error: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def health_check(self) -> bool:
        """Check if Redis is healthy"""
        if not self.redis_client:
            return False
            
        try:
            await asyncio.to_thread(self.redis_client.ping)
            return True
        except Exception:
            return False
    
    async def disconnect(self):
        """Close Redis connection gracefully"""
        try:
            if self.redis_client:
                self.redis_client.close()
                self.redis_client = None
                self.is_connected = False
                logger.info("Redis disconnected successfully")
        except Exception as e:
            logger.warning(f"Redis disconnect warning: {e}")
    
    async def close(self):
        """Alias for disconnect"""
        await self.disconnect()

# Global Redis service instance
redis_service = RedisService()

# Helper functions for backward compatibility
async def get_cached_response(endpoint: str, params: Dict[str, Any]) -> Optional[Any]:
    """Backward compatible function for SERP cache"""
    return await redis_service.get("serp_cache", endpoint, params)

async def cache_response(endpoint: str, params: Dict[str, Any], response: Any, ttl: int = 3600) -> bool:
    """Backward compatible function for SERP cache"""
    return await redis_service.set("serp_cache", endpoint, response, ttl, params)
