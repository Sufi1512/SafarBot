from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

from services.auth_service import AuthService
from database import get_collection, USERS_COLLECTION

router = APIRouter()
security = HTTPBearer()

# Pydantic models for request/response
class UserSignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    confirm_password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    is_email_verified: bool = False
    status: str = "pending"
    created_at: datetime
    updated_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
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
            detail="Invalid token payload",
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

@router.post("/signup", response_model=dict)
async def signup(user_data: UserSignupRequest):
    """Register a new user."""
    try:
        # Validate password confirmation
        if user_data.password != user_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        # Validate password strength
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Check if user already exists
        collection = get_collection(USERS_COLLECTION)
        existing_user = await collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user document
        user_dict = {
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "email": user_data.email,
            "phone": user_data.phone,
            "hashed_password": AuthService.get_password_hash(user_data.password),
            "is_email_verified": False,
            "status": "pending",
            "role": "user",
            "login_attempts": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert user
        result = await collection.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        return {
            "message": "User registered successfully. Please check your email for verification.",
            "user_id": str(result.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLoginRequest):
    """Authenticate user and return tokens."""
    try:
        # Find user by email
        collection = get_collection(USERS_COLLECTION)
        user_doc = await collection.find_one({"email": login_data.email})
        
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not AuthService.verify_password(login_data.password, user_doc["hashed_password"]):
            # Increment login attempts
            await collection.update_one(
                {"_id": user_doc["_id"]},
                {"$inc": {"login_attempts": 1}}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Reset login attempts on successful login
        await collection.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "login_attempts": 0,
                    "last_login": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Create tokens
        access_token = AuthService.create_access_token(
            data={"sub": str(user_doc["_id"]), "email": user_doc["email"]}
        )
        refresh_token = AuthService.create_refresh_token(
            data={"sub": str(user_doc["_id"])}
        )
        
        # Prepare user response
        user_response = UserResponse(
            id=str(user_doc["_id"]),
            first_name=user_doc["first_name"],
            last_name=user_doc["last_name"],
            email=user_doc["email"],
            phone=user_doc.get("phone"),
            is_email_verified=user_doc.get("is_email_verified", False),
            status=user_doc.get("status", "pending"),
            created_at=user_doc["created_at"],
            updated_at=user_doc["updated_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token."""
    try:
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
        
        # Create new tokens
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        new_refresh_token = AuthService.create_refresh_token(
            data={"sub": str(user.id)}
        )
        
        # Prepare user response
        user_response = UserResponse(
            id=str(user.id),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=user.phone,
            is_email_verified=user.is_email_verified,
            status=user.status,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(
        id=str(current_user["_id"]),
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        email=current_user["email"],
        phone=current_user.get("phone"),
        is_email_verified=current_user.get("is_email_verified", False),
        status=current_user.get("status", "pending"),
        created_at=current_user["created_at"],
        updated_at=current_user["updated_at"]
    )

@router.put("/me", response_model=UserResponse)
async def update_user_info(
    update_data: UserUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update current user information."""
    try:
        collection = get_collection(USERS_COLLECTION)
        
        # Prepare update data
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_dict}
        )
        
        if result.modified_count:
            # Get updated user
            updated_user = await collection.find_one({"_id": current_user["_id"]})
            return UserResponse(
                id=str(updated_user["_id"]),
                first_name=updated_user["first_name"],
                last_name=updated_user["last_name"],
                email=updated_user["email"],
                phone=updated_user.get("phone"),
                is_email_verified=updated_user.get("is_email_verified", False),
                status=updated_user.get("status", "pending"),
                created_at=updated_user["created_at"],
                updated_at=updated_user["updated_at"]
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes made"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Update failed: {str(e)}"
        )

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    """Change user password."""
    try:
        if password_data.new_password != password_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New passwords do not match"
            )
        
        if len(password_data.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        success = await AuthService.change_password(
            str(current_user["_id"]),
            password_data.current_password,
            password_data.new_password
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change failed: {str(e)}"
        )

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """Request password reset."""
    try:
        reset_token = await AuthService.create_password_reset_token(request.email)
        if not reset_token:
            # Don't reveal if email exists or not
            return {"message": "If the email exists, a password reset link has been sent"}
        
        # TODO: Send email with reset token
        # For now, just return success message
        return {"message": "If the email exists, a password reset link has been sent"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset request failed: {str(e)}"
        )

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirmRequest):
    """Reset password using token."""
    try:
        if request.new_password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        if len(request.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        success = await AuthService.reset_password(request.token, request.new_password)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user (client should discard tokens)."""
    # In a more advanced implementation, you might want to blacklist the token
    return {"message": "Logged out successfully"} 