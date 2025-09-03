"""
Security middleware for SafarBot API
Handles security headers, rate limiting, and request validation
"""

from fastapi import Request, HTTPException
from fastapi.responses import Response
import time
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    """Security middleware for adding security headers and basic protection"""
    
    @staticmethod
    async def add_security_headers(request: Request, call_next):
        """Add security headers to all responses"""
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response
    
    @staticmethod
    async def validate_request_size(request: Request, call_next):
        """Validate request size to prevent large payload attacks"""
        content_length = request.headers.get("content-length")
        
        if content_length:
            size = int(content_length)
            max_size = 10 * 1024 * 1024  # 10MB limit
            
            if size > max_size:
                logger.warning(f"Request too large: {size} bytes from {request.client.host}")
                raise HTTPException(
                    status_code=413,
                    detail="Request payload too large. Maximum size is 10MB."
                )
        
        return await call_next(request)
    
    @staticmethod
    async def block_suspicious_requests(request: Request, call_next):
        """Block suspicious requests based on patterns"""
        user_agent = request.headers.get("user-agent", "").lower()
        suspicious_patterns = [
            "sqlmap", "nikto", "nmap", "masscan", "zap", "burp"
        ]
        
        if any(pattern in user_agent for pattern in suspicious_patterns):
            logger.warning(f"Suspicious user agent blocked: {user_agent} from {request.client.host}")
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        return await call_next(request)
