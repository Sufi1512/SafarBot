"""
Example usage of middleware in SafarBot API
Shows how to use middleware features in route handlers
"""

from fastapi import APIRouter, Request, Depends, HTTPException
from typing import Optional

router = APIRouter()

# Example 1: Using authenticated user from middleware
@router.get("/protected-endpoint")
async def protected_endpoint(request: Request):
    """
    This endpoint is automatically protected by AuthMiddleware
    The user information is available in request.state.user
    """
    # Get user from middleware (set by AuthMiddleware)
    user = getattr(request.state, 'user', None)
    user_id = getattr(request.state, 'user_id', None)
    
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    return {
        "message": "This is a protected endpoint",
        "user_id": user_id,
        "user_email": user.email,
        "user_name": f"{user.first_name} {user.last_name}"
    }

# Example 2: Optional authentication endpoint
@router.get("/optional-auth-endpoint")
async def optional_auth_endpoint(request: Request):
    """
    This endpoint works with or without authentication
    """
    user = getattr(request.state, 'user', None)
    
    if user:
        return {
            "message": f"Hello {user.first_name}! You are authenticated.",
            "authenticated": True,
            "user_id": str(user.id)
        }
    else:
        return {
            "message": "Hello anonymous user! You are not authenticated.",
            "authenticated": False
        }

# Example 3: Rate-limited endpoint
@router.get("/expensive-operation")
async def expensive_operation(request: Request):
    """
    This endpoint is automatically rate-limited by RateLimitingMiddleware
    The rate limit headers are automatically added to the response
    """
    # Simulate expensive operation (AI call, external API, etc.)
    import time
    time.sleep(1)  # Simulate processing time
    
    return {
        "message": "Expensive operation completed",
        "processing_time": "1 second",
        "note": "This endpoint is rate-limited to prevent abuse"
    }

# Example 4: Using request information from logging middleware
@router.get("/request-info")
async def request_info(request: Request):
    """
    This endpoint shows information about the current request
    """
    return {
        "method": request.method,
        "url": str(request.url),
        "path": request.url.path,
        "client_ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown"),
        "headers": dict(request.headers),
        "note": "All requests are automatically logged by LoggingMiddleware"
    }

# Example 5: Error handling demonstration
@router.get("/error-demo")
async def error_demo(request: Request, error_type: str = "validation"):
    """
    Demonstrates how ErrorHandlingMiddleware handles different types of errors
    """
    if error_type == "validation":
        # This will be caught by ErrorHandlingMiddleware
        raise HTTPException(status_code=400, detail="This is a validation error")
    
    elif error_type == "not_found":
        raise HTTPException(status_code=404, detail="Resource not found")
    
    elif error_type == "server_error":
        # This will be caught by ErrorHandlingMiddleware
        raise Exception("This is an unexpected server error")
    
    else:
        return {
            "message": "No error occurred",
            "error_type": error_type,
            "note": "Try ?error_type=validation, ?error_type=not_found, or ?error_type=server_error"
        }
