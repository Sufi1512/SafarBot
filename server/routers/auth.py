from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta
from typing import Optional

from mongo_models import UserCreate, UserLogin, UserUpdate, User
from services.auth_service import AuthService
from models import APIResponse

router = APIRouter()
security = HTTPBearer()

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await AuthService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.post("/register", response_model=APIResponse)
async def register(user_data: UserCreate):
    """Register a new user."""
    try:
        user = await AuthService.create_user(user_data)
        
        # Create access token
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        refresh_token = AuthService.create_refresh_token(
            data={"sub": str(user.id)}
        )
        
        return APIResponse(
            success=True,
            message="User registered successfully. Please check your email for verification.",
            data={
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_email_verified": user.is_email_verified,
                    "status": user.status
                },
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=APIResponse)
async def login(login_data: UserLogin):
    """Login user."""
    user = await AuthService.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active. Please verify your email."
        )
    
    # Create tokens
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    refresh_token = AuthService.create_refresh_token(
        data={"sub": str(user.id)}
    )
    
    return APIResponse(
        success=True,
        message="Login successful",
        data={
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_email_verified": user.is_email_verified,
                "status": user.status
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    )

@router.post("/refresh", response_model=APIResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token."""
    payload = AuthService.verify_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = await AuthService.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new access token
    new_access_token = AuthService.create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return APIResponse(
        success=True,
        message="Token refreshed successfully",
        data={
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    )

@router.get("/me", response_model=APIResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return APIResponse(
        success=True,
        message="User information retrieved successfully",
        data={
            "user": {
                "id": str(current_user.id),
                "email": current_user.email,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "phone": current_user.phone,
                "is_email_verified": current_user.is_email_verified,
                "is_phone_verified": current_user.is_phone_verified,
                "status": current_user.status,
                "profile_picture": current_user.profile_picture,
                "date_of_birth": current_user.date_of_birth,
                "preferences": current_user.preferences,
                "last_login": current_user.last_login
            }
        }
    )

@router.put("/me", response_model=APIResponse)
async def update_user_info(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user information."""
    updated_user = await AuthService.update_user(str(current_user.id), update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user information"
        )
    
    return APIResponse(
        success=True,
        message="User information updated successfully",
        data={
            "user": {
                "id": str(updated_user.id),
                "email": updated_user.email,
                "first_name": updated_user.first_name,
                "last_name": updated_user.last_name,
                "phone": updated_user.phone,
                "profile_picture": updated_user.profile_picture,
                "date_of_birth": updated_user.date_of_birth,
                "preferences": updated_user.preferences
            }
        }
    )

@router.post("/change-password", response_model=APIResponse)
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user)
):
    """Change user password."""
    success = await AuthService.change_password(
        str(current_user.id), current_password, new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )
    
    return APIResponse(
        success=True,
        message="Password changed successfully"
    )

@router.post("/forgot-password", response_model=APIResponse)
async def forgot_password(email: str):
    """Send password reset email."""
    reset_token = await AuthService.create_password_reset_token(email)
    
    if not reset_token:
        # Don't reveal if email exists or not
        return APIResponse(
            success=True,
            message="If the email exists, a password reset link has been sent."
        )
    
    # In production, send email with reset link
    # For now, just return success
    return APIResponse(
        success=True,
        message="Password reset link sent to your email"
    )

@router.post("/reset-password", response_model=APIResponse)
async def reset_password(token: str, new_password: str):
    """Reset password using token."""
    success = await AuthService.reset_password(token, new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return APIResponse(
        success=True,
        message="Password reset successfully"
    )

@router.post("/verify-email", response_model=APIResponse)
async def verify_email(token: str):
    """Verify user email."""
    success = await AuthService.verify_email(token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    return APIResponse(
        success=True,
        message="Email verified successfully"
    )

@router.post("/resend-verification", response_model=APIResponse)
async def resend_verification_email(email: str):
    """Resend email verification."""
    success = await AuthService.resend_verification_email(email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found or email already verified"
        )
    
    return APIResponse(
        success=True,
        message="Verification email sent successfully"
    )

@router.post("/logout", response_model=APIResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client should discard tokens)."""
    # In a more sophisticated implementation, you might want to blacklist tokens
    return APIResponse(
        success=True,
        message="Logged out successfully"
    ) 