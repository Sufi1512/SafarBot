"""
Logging middleware for SafarBot API
Handles request/response logging and performance monitoring
"""

from fastapi import Request
import time
import logging
import json
from typing import Dict, Any

logger = logging.getLogger(__name__)

class LoggingMiddleware:
    """Middleware for comprehensive request/response logging"""
    
    @staticmethod
    async def log_requests(request: Request, call_next):
        """Log all incoming requests and outgoing responses"""
        start_time = time.time()
        
        # Extract request information
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        method = request.method
        url = str(request.url)
        path = request.url.path
        
        # Log request
        logger.info(
            f"📥 REQUEST: {method} {path} | "
            f"IP: {client_ip} | "
            f"UA: {user_agent[:50]}..."
        )
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log successful response
            logger.info(
                f"📤 RESPONSE: {method} {path} | "
                f"Status: {response.status_code} | "
                f"Time: {process_time:.3f}s | "
                f"IP: {client_ip}"
            )
            
            # Add performance header
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log error
            logger.error(
                f"❌ ERROR: {method} {path} | "
                f"Error: {str(e)} | "
                f"Time: {process_time:.3f}s | "
                f"IP: {client_ip}"
            )
            
            raise
    
    @staticmethod
    async def log_api_usage(request: Request, call_next):
        """Log API usage for analytics and monitoring"""
        path = request.url.path
        
        # Skip logging for health checks and static files
        if path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log API usage metrics
        usage_data = {
            "timestamp": time.time(),
            "method": request.method,
            "path": path,
            "status_code": response.status_code,
            "process_time": process_time,
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown")
        }
        
        # Log as structured data for easy parsing
        logger.info(f"API_USAGE: {json.dumps(usage_data)}")
        
        return response
