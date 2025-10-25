"""
Google Authentication Routes
Handles Google Sign-In with Firebase integration
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import logging

from services.firebase_auth_service import firebase_auth_service
from services.auth_service import AuthService
from models import APIResponse

router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer()

class GoogleSignInRequest(BaseModel):
    id_token: str

class GoogleSignInResponse(BaseModel):
    user: dict
    access_token: str
    token_type: str = "bearer"

@router.post("/google-signin", response_model=APIResponse)
async def google_signin(request: GoogleSignInRequest):
    """
    Authenticate user with Google Sign-In via Firebase
    
    Args:
        request: Contains Firebase ID token
        
    Returns:
        User data and JWT token
    """
    try:
        logger.info("Google sign-in attempt")
        
        # Authenticate with Firebase
        auth_result = await firebase_auth_service.authenticate_with_firebase(request.id_token)
        
        if not auth_result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google authentication token"
            )
        
        logger.info(f"Google sign-in successful for user: {auth_result['user']['email']}")
        
        return APIResponse(
            success=True,
            message="Google authentication successful",
            data=auth_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Google sign-in: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during Google authentication"
        )

@router.post("/google-link-account", response_model=APIResponse)
async def link_google_account(
    request: GoogleSignInRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Link Google account to existing user account
    
    Args:
        request: Contains Firebase ID token
        credentials: JWT token for existing user
        
    Returns:
        Updated user data
    """
    try:
        # Verify existing user token
        auth_service = AuthService()
        current_user = auth_service.verify_token(credentials.credentials)
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        # Verify Firebase token
        firebase_user = await firebase_auth_service.verify_firebase_token(request.id_token)
        
        if not firebase_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google authentication token"
            )
        
        # Check if Google account is already linked to another user
        existing_user = await firebase_auth_service.get_user_by_firebase_uid(firebase_user['uid'])
        if existing_user and str(existing_user.id) != str(current_user['user_id']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account is already linked to another user"
            )
        
        # Update current user with Firebase data
        from database import get_collection, USERS_COLLECTION
        users_collection = get_collection(USERS_COLLECTION)
        
        update_data = {
            "firebase_uid": firebase_user['uid'],
            "photo_url": firebase_user.get('photo_url'),
            "email_verified": firebase_user.get('email_verified', False),
            "phone_number": firebase_user.get('phone_number'),
            "provider_data": firebase_user.get('provider_data', [])
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        await users_collection.update_one(
            {"_id": current_user['user_id']},
            {"$set": update_data}
        )
        
        logger.info(f"Google account linked for user: {current_user['email']}")
        
        return APIResponse(
            success=True,
            message="Google account linked successfully",
            data={"linked": True}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking Google account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during account linking"
        )

@router.delete("/google-unlink", response_model=APIResponse)
async def unlink_google_account(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Unlink Google account from user account
    
    Args:
        credentials: JWT token for user
        
    Returns:
        Success confirmation
    """
    try:
        # Verify user token
        auth_service = AuthService()
        current_user = auth_service.verify_token(credentials.credentials)
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        # Remove Firebase data from user
        from database import get_collection, USERS_COLLECTION
        users_collection = get_collection(USERS_COLLECTION)
        
        await users_collection.update_one(
            {"_id": current_user['user_id']},
            {"$unset": {
                "firebase_uid": "",
                "photo_url": "",
                "phone_number": "",
                "provider_data": ""
            }}
        )
        
        logger.info(f"Google account unlinked for user: {current_user['email']}")
        
        return APIResponse(
            success=True,
            message="Google account unlinked successfully",
            data={"unlinked": True}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlinking Google account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during account unlinking"
        )

@router.get("/google-status", response_model=APIResponse)
async def google_account_status(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Check if user has Google account linked
    
    Args:
        credentials: JWT token for user
        
    Returns:
        Google account status
    """
    try:
        # Verify user token
        auth_service = AuthService()
        current_user = auth_service.verify_token(credentials.credentials)
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        # Get user data
        from database import get_collection, USERS_COLLECTION
        users_collection = get_collection(USERS_COLLECTION)
        user_data = await users_collection.find_one({"_id": current_user['user_id']})
        
        is_linked = bool(user_data.get('firebase_uid'))
        
        return APIResponse(
            success=True,
            message="Google account status retrieved",
            data={
                "is_google_linked": is_linked,
                "firebase_uid": user_data.get('firebase_uid'),
                "photo_url": user_data.get('photo_url')
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking Google account status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error checking Google account status"
        )
