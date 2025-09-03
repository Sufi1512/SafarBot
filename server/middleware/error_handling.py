"""
Error handling middleware for SafarBot API
Provides centralized error handling and standardized error responses
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
import traceback
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware:
    """Centralized error handling middleware"""
    
    @staticmethod
    async def handle_errors(request: Request, call_next):
        """Handle all errors and return standardized responses"""
        try:
            return await call_next(request)
        
        except HTTPException as e:
            # FastAPI HTTP exceptions
            logger.warning(f"HTTP Exception: {e.detail} for {request.url.path}")
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": True,
                    "message": e.detail,
                    "status_code": e.status_code,
                    "path": request.url.path
                }
            )
        
        except RequestValidationError as e:
            # Pydantic validation errors
            logger.warning(f"Validation Error: {str(e)} for {request.url.path}")
            return JSONResponse(
                status_code=422,
                content={
                    "error": True,
                    "message": "Validation error",
                    "details": e.errors(),
                    "status_code": 422,
                    "path": request.url.path
                }
            )
        
        except Exception as e:
            # Unexpected errors
            error_id = id(e)  # Simple error ID
            logger.error(
                f"Unexpected error {error_id}: {str(e)} for {request.url.path}\n"
                f"Traceback: {traceback.format_exc()}"
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": "Internal server error",
                    "error_id": error_id,
                    "status_code": 500,
                    "path": request.url.path
                }
            )
    
    @staticmethod
    def create_error_response(
        message: str,
        status_code: int = 500,
        details: Dict[str, Any] = None,
        error_id: str = None
    ) -> JSONResponse:
        """Create standardized error response"""
        content = {
            "error": True,
            "message": message,
            "status_code": status_code
        }
        
        if details:
            content["details"] = details
        
        if error_id:
            content["error_id"] = error_id
        
        return JSONResponse(status_code=status_code, content=content)
