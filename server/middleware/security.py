"""
Security middleware for SafarBot API
Handles security headers, rate limiting, and request validation
"""

from fastapi import Request, HTTPException
from fastapi.responses import Response, JSONResponse
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
        
        # Allow Swagger/OpenAPI docs to load properly - check all docs-related paths
        path = request.url.path
        is_docs_path = (
            path.startswith("/docs") or 
            path.startswith("/redoc") or 
            path.startswith("/openapi.json") or
            path.startswith("/static") or
            "/swagger" in path.lower() or
            path == "/favicon.ico"
        )
        
        # For Swagger docs, skip most security headers to allow it to work
        if is_docs_path:
            # Minimal headers for Swagger to work
            response.headers["X-Content-Type-Options"] = "nosniff"
            # Don't set restrictive headers that block Swagger UI
            return response
        
        # Security headers for all other endpoints
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        
        return response
    
    @staticmethod
    async def validate_request_size(request: Request, call_next):
        """Validate request size to prevent large payload attacks"""
        try:
            content_length = request.headers.get("content-length")
            
            if content_length:
                try:
                    size = int(content_length)
                    max_size = 10 * 1024 * 1024  # 10MB limit
                    
                    if size > max_size:
                        logger.warning(f"Request too large: {size} bytes from {request.client.host}")
                        return JSONResponse(
                            status_code=413,
                            content={
                                "error": True,
                                "message": "Request payload too large. Maximum size is 10MB.",
                                "status_code": 413,
                                "path": request.url.path
                            }
                        )
                except ValueError:
                    # Invalid content-length header
                    logger.warning(f"Invalid content-length header from {request.client.host}")
                    return JSONResponse(
                        status_code=400,
                        content={
                            "error": True,
                            "message": "Invalid content-length header",
                            "status_code": 400,
                            "path": request.url.path
                        }
                    )
            
            return await call_next(request)
        except Exception as e:
            logger.error(f"Error in request size validation: {str(e)}")
            return JSONResponse(
                status_code=400,
                content={
                    "error": True,
                    "message": "Request validation failed",
                    "status_code": 400,
                    "path": request.url.path
                }
            )
    
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


