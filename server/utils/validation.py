"""
Validation utilities for security and data integrity
"""

from bson import ObjectId
from fastapi import HTTPException, status
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def validate_object_id(id_str: str, field_name: str = "ID") -> ObjectId:
    """
    Validate and convert string to ObjectId.
    Prevents NoSQL injection by ensuring proper format.
    
    Args:
        id_str: String to validate and convert
        field_name: Name of the field for error messages
        
    Returns:
        ObjectId instance
        
    Raises:
        HTTPException: If ID is invalid
    """
    if not id_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} is required"
        )
    
    if not isinstance(id_str, str):
        id_str = str(id_str)
    
    # Validate ObjectId format
    if not ObjectId.is_valid(id_str):
        logger.warning(f"Invalid {field_name} format attempted: {id_str[:50]}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} format"
        )
    
    try:
        return ObjectId(id_str)
    except Exception as e:
        logger.error(f"Error converting {field_name} to ObjectId: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} format"
        )

def validate_email(email: str) -> str:
    """
    Validate and normalize email address.
    
    Args:
        email: Email string to validate
        
    Returns:
        Normalized email (lowercase, trimmed)
        
    Raises:
        HTTPException: If email is invalid
    """
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    email = email.strip().lower()
    
    # Basic email validation
    if len(email) > 254:  # RFC 5321 limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address too long"
        )
    
    if "@" not in email or "." not in email.split("@")[1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    return email

def sanitize_string(text: str, max_length: int = 1000, allow_html: bool = False) -> str:
    """
    Sanitize string input to prevent XSS and injection attacks.
    
    Args:
        text: String to sanitize
        max_length: Maximum allowed length
        allow_html: Whether to allow HTML (not recommended)
        
    Returns:
        Sanitized string
    """
    if not text:
        return ""
    
    # Trim whitespace
    text = text.strip()
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
        logger.warning(f"String truncated to {max_length} characters")
    
    # Escape HTML if not allowed
    if not allow_html:
        import html
        text = html.escape(text)
    
    return text

