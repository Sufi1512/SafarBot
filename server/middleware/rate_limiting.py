"""
Rate limiting middleware for SafarBot API
Prevents abuse of expensive AI and external API calls
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import time
from typing import Dict, Optional
import logging
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        # Store request timestamps for each IP
        self.requests: Dict[str, deque] = defaultdict(deque)
        # Rate limits (requests per time window)
        self.limits = {
            "default": {"requests": 100, "window": 3600},  # 100 requests per hour
            "auth": {"requests": 10, "window": 300},       # 10 auth attempts per 5 minutes
            "chat": {"requests": 20, "window": 3600},      # 20 chat requests per hour
            "search": {"requests": 50, "window": 3600},    # 50 searches per hour
        }
    
    def is_allowed(self, client_ip: str, endpoint_type: str = "default") -> bool:
        """Check if request is allowed based on rate limits"""
        now = time.time()
        limit_config = self.limits.get(endpoint_type, self.limits["default"])
        max_requests = limit_config["requests"]
        window = limit_config["window"]
        
        # Get request history for this IP
        request_times = self.requests[client_ip]
        
        # Remove old requests outside the window
        while request_times and request_times[0] <= now - window:
            request_times.popleft()
        
        # Check if under limit
        if len(request_times) >= max_requests:
            return False
        
        # Add current request
        request_times.append(now)
        return True
    
    def get_remaining_requests(self, client_ip: str, endpoint_type: str = "default") -> int:
        """Get remaining requests for an IP"""
        now = time.time()
        limit_config = self.limits.get(endpoint_type, self.limits["default"])
        max_requests = limit_config["requests"]
        window = limit_config["window"]
        
        request_times = self.requests[client_ip]
        
        # Remove old requests
        while request_times and request_times[0] <= now - window:
            request_times.popleft()
        
        return max(0, max_requests - len(request_times))

# Global rate limiter instance
rate_limiter = RateLimiter()

class RateLimitingMiddleware:
    """Rate limiting middleware"""
    
    @staticmethod
    def get_endpoint_type(path: str) -> str:
        """Determine endpoint type for rate limiting"""
        if "/auth/" in path:
            return "auth"
        elif "/chat" in path:
            return "chat"
        elif "/search" in path or "/flights" in path or "/hotels" in path:
            return "search"
        else:
            return "default"
    
    @staticmethod
    async def apply_rate_limiting(request: Request, call_next):
        """Apply rate limiting to requests"""
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        endpoint_type = RateLimitingMiddleware.get_endpoint_type(path)
        
        # Skip rate limiting for health checks
        if path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Check rate limit
        if not rate_limiter.is_allowed(client_ip, endpoint_type):
            remaining = rate_limiter.get_remaining_requests(client_ip, endpoint_type)
            
            logger.warning(
                f"Rate limit exceeded for {client_ip} on {path} "
                f"(endpoint_type: {endpoint_type})"
            )
            
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Try again later.",
                    "endpoint_type": endpoint_type,
                    "remaining_requests": remaining
                },
                headers={
                    "Retry-After": "3600",  # Retry after 1 hour
                    "X-RateLimit-Limit": str(rate_limiter.limits[endpoint_type]["requests"]),
                    "X-RateLimit-Remaining": str(remaining),
                    "X-RateLimit-Reset": str(int(time.time() + rate_limiter.limits[endpoint_type]["window"]))
                }
            )
        
        # Add rate limit headers to response
        response = await call_next(request)
        remaining = rate_limiter.get_remaining_requests(client_ip, endpoint_type)
        
        response.headers["X-RateLimit-Limit"] = str(rate_limiter.limits[endpoint_type]["requests"])
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time() + rate_limiter.limits[endpoint_type]["window"]))
        
        return response
