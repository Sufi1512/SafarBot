"""
Authentication middleware for SafarBot API
Handles JWT token validation and user authentication
"""

from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import logging

from services.auth_service import AuthService

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

class AuthMiddleware:
    """Authentication middleware for JWT token validation"""
    
    @staticmethod
    async def validate_token(request: Request, call_next):
        """Validate JWT tokens for protected endpoints"""
        path = request.url.path
        
        # Public endpoints that don't require authentication
        public_endpoints = [
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/auth/signup",
            "/auth/login",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/refresh",
            "/auth/send-verification-otp",
            "/auth/verify-otp",
            "/auth/resend-otp",
            "/google/auth",
            "/google/callback",
            "/google/google-signin",
            "/itinerary/generate-itinerary",  # Public for demo
            "/itinerary/generate-itinerary-ai",  # Public for demo
            "/itinerary/generate-itinerary-complete",  # Public for demo
            "/itinerary/generate-itinerary-structure",  # Public for demo
            "/itinerary/generate-itinerary-details",  # Public for demo
            "/itinerary/places/additional",  # Public for demo
            "/flights/search",  # Public for demo
            "/flights/popular",  # Public for demo
            "/flights/airports/suggestions",  # Public for demo
            "/hotels/search-hotels",  # Public for demo
            "/restaurants/recommend-restaurants",  # Public for demo
            "/weather/current",  # Public for demo
            "/weather/forecast",  # Public for demo
            "/images/",  # Image proxy - public
        ]
        
        # Check if endpoint requires authentication
        requires_auth = not any(path.startswith(endpoint) for endpoint in public_endpoints)
        
        if not requires_auth:
            return await call_next(request)
        
        # Extract token from Authorization header
        authorization: str = request.headers.get("Authorization")
        
        if not authorization:
            logger.warning(f"Missing authorization header for {path}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        try:
            # Extract token from "Bearer <token>" format
            parts = authorization.split()
            if len(parts) != 2:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authorization header format",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            scheme, token = parts
            if scheme.lower() != "bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Verify token
            payload = AuthService.verify_token(token)
            
            if not payload or payload.get("type") != "access":
                logger.warning(f"Invalid token for {path}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Get user ID from token
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Verify user exists
            user = await AuthService.get_user_by_id(user_id)
            if not user:
                logger.warning(f"User not found for token: {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Add user info to request state for use in route handlers
            request.state.user = user
            request.state.user_id = user_id
            
            logger.info(f"Authenticated user {user_id} for {path}")
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Authentication error for {path}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return await call_next(request)
    
    @staticmethod
    async def optional_auth(request: Request, call_next):
        """Optional authentication - doesn't fail if no token provided"""
        authorization: str = request.headers.get("Authorization")
        
        if authorization:
            try:
                parts = authorization.split()
                if len(parts) != 2:
                    return await call_next(request)
                scheme, token = parts
                if scheme.lower() == "bearer":
                    payload = AuthService.verify_token(token)
                    
                    if payload and payload.get("type") == "access":
                        user_id = payload.get("sub")
                        if user_id:
                            user = await AuthService.get_user_by_id(user_id)
                            if user:
                                request.state.user = user
                                request.state.user_id = user_id
                                logger.info(f"Optional auth: User {user_id} authenticated")
            except Exception as e:
                logger.debug(f"Optional auth failed: {str(e)}")
                # Don't raise exception for optional auth
        
        return await call_next(request)


