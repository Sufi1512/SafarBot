from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import re
import html

from services.auth_service import AuthService
from services.otp_service import OTPService
from services.email_service import email_service
from database import get_collection, USERS_COLLECTION
from mongo_models import User, UserStatus, UserRole

router = APIRouter()
security = HTTPBearer(auto_error=False)

# Security constants
MAX_LOGIN_ATTEMPTS = 5
ACCOUNT_LOCKOUT_MINUTES = 30
MAX_NAME_LENGTH = 100
MAX_PHONE_LENGTH = 20
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128

# Pydantic models for request/response
class UserSignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    confirm_password: str
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate and sanitize name fields."""
        if not v or not v.strip():
            raise ValueError("Name cannot be empty")
        
        # Trim whitespace
        v = v.strip()
        
        # Check length
        if len(v) > MAX_NAME_LENGTH:
            raise ValueError(f"Name must be less than {MAX_NAME_LENGTH} characters")
        
        # Sanitize HTML/XSS
        v = html.escape(v)
        
        # Check for SQL injection patterns
        sql_patterns = [';', '--', '/*', '*/', 'xp_', 'exec', 'union', 'select']
        v_lower = v.lower()
        for pattern in sql_patterns:
            if pattern in v_lower:
                raise ValueError("Invalid characters in name")
        
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate and normalize email."""
        if not v:
            raise ValueError("Email cannot be empty")
        
        # Trim whitespace and convert to lowercase
        v = v.strip().lower()
        
        # Basic email validation (Pydantic EmailStr handles format)
        if len(v) > 254:  # RFC 5321 limit
            raise ValueError("Email address too long")
        
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        """Validate phone number."""
        if not v:
            return None
        
        # Remove all non-digit characters except +
        cleaned = re.sub(r'[^\d+]', '', v)
        
        if len(cleaned) > MAX_PHONE_LENGTH:
            raise ValueError(f"Phone number too long (max {MAX_PHONE_LENGTH} characters)")
        
        if len(cleaned) < 10:
            raise ValueError("Phone number too short")
        
        return cleaned
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength with enhanced security checks."""
        if not v:
            raise ValueError("Password cannot be empty")
        
        # Check length
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long")
        
        if len(v) > MAX_PASSWORD_LENGTH:
            raise ValueError(f"Password must be less than {MAX_PASSWORD_LENGTH} characters")
        
        # Check for only whitespace
        if v.strip() != v or not v.strip():
            raise ValueError("Password cannot be only whitespace")
        
        # Enhanced password strength validation
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v)
        
        # Check for common weak passwords
        weak_passwords = [
            'password', '12345678', 'qwerty', 'abc12345', 'password123',
            'admin123', 'letmein', 'welcome', 'monkey', '1234567890',
            'password1', 'qwerty123', 'admin', 'root', 'toor'
        ]
        if v.lower() in weak_passwords:
            raise ValueError("Password is too weak. Please choose a stronger password")
        
        # Require at least 3 of: uppercase, lowercase, digit, special
        strength_count = sum([has_upper, has_lower, has_digit, has_special])
        if strength_count < 3:
            raise ValueError(
                "Password must contain at least 3 of the following: "
                "uppercase letters, lowercase letters, numbers, special characters"
            )
        
        # Check for repeated characters (e.g., "aaaaaa")
        if len(set(v)) < len(v) * 0.5:
            raise ValueError("Password contains too many repeated characters")
        
        return v
    
    @model_validator(mode='after')
    def passwords_match(self):
        """Ensure passwords match."""
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

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

class OTPVerificationRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
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
    """
    Register a new user with comprehensive edge case handling.
    """
    try:
        # EDGE CASE 1: Database unavailable
        collection = get_collection(USERS_COLLECTION)
        if collection is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is temporarily unavailable. Please try again later."
            )
        
        # Normalize email (case-insensitive)
        normalized_email = user_data.email.strip().lower()
        
        # EDGE CASE 2: Check if user already exists by email
        existing_user = await collection.find_one({"email": normalized_email})
        
        if existing_user:
            # EDGE CASE 3: User exists - check auth methods
            has_password = bool(existing_user.get("hashed_password"))
            has_google = bool(existing_user.get("firebase_uid"))
            
            # EDGE CASE 4: Account suspended
            user_status = existing_user.get("status")
            if user_status == UserStatus.SUSPENDED:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="This account has been suspended. Please contact support."
                )
            
            # EDGE CASE 5: Account locked
            locked_until = existing_user.get("locked_until")
            if locked_until and locked_until > datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail="This account is temporarily locked. Please try again later."
                )
            
            # Handle different scenarios
            if has_google and not has_password:
                # Google account exists - offer to link password
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "An account with this email already exists via Google Sign-In.",
                        "action": "link_password",
                        "suggestion": "Please sign in with Google or use the 'Link Password' feature."
                    }
                )
            elif has_password and has_google:
                # Both methods exist
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists. Please sign in instead."
                )
            elif has_password:
                # Password account exists
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists. Please sign in instead."
                )
        
        # EDGE CASE 6: Check for duplicate phone (if provided)
        if user_data.phone:
            phone_user = await collection.find_one({"phone": user_data.phone})
            if phone_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this phone number already exists."
                )
        
        # Create user document
        user_dict = {
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "email": normalized_email,
            "phone": user_data.phone,
            "hashed_password": AuthService.get_password_hash(user_data.password),
            "auth_methods": ["password"],
            "email_verified": False,
            "is_email_verified": False,  # Keep both for backward compatibility
            "status": UserStatus.PENDING_VERIFICATION,
            "role": UserRole.USER,
            "login_attempts": 0,
            "locked_until": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Insert user
        try:
            result = await collection.insert_one(user_dict)
            user_dict["_id"] = result.inserted_id
        except Exception as e:
            # EDGE CASE 7: Duplicate key error (race condition)
            if "duplicate key" in str(e).lower() or "E11000" in str(e):
                # Check again if user was created by another request
                existing_user = await collection.find_one({"email": normalized_email})
                if existing_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="An account with this email was just created. Please sign in instead."
                    )
            raise
        
        # Send verification OTP
        try:
            user_name = f"{user_data.first_name} {user_data.last_name}"
            otp_result = await OTPService.send_verification_otp(normalized_email, user_name)
            
            if not otp_result["success"]:
                # Log but don't fail registration
                print(f"Warning: Failed to send verification OTP: {otp_result['message']}")
        except Exception as e:
            # Don't fail registration if OTP fails
            print(f"Warning: OTP service error: {str(e)}")
        
        return {
            "message": "User registered successfully. Please check your email for verification OTP.",
            "user_id": str(result.inserted_id),
            "email_verification_required": True
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # EDGE CASE 8: Unexpected errors
        print(f"Unexpected signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again later."
        )

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLoginRequest):
    """
    Authenticate user with comprehensive edge case handling.
    """
    try:
        # EDGE CASE 1: Database unavailable
        collection = get_collection(USERS_COLLECTION)
        if collection is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is temporarily unavailable. Please try again later."
            )
        
        # EDGE CASE 2: Normalize email (case-insensitive, trim whitespace)
        normalized_email = login_data.email.strip().lower()
        
        # EDGE CASE 3: Find user by email
        user_doc = await collection.find_one({"email": normalized_email})
        
        # EDGE CASE 4: User not found - generic error for security
        if not user_doc:
            # Don't reveal if email exists
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # EDGE CASE 5: Check account status
        user_status = user_doc.get("status")
        
        # EDGE CASE 6: Suspended account
        if user_status == UserStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been suspended. Please contact support."
            )
        
        # EDGE CASE 7: Account locked
        locked_until = user_doc.get("locked_until")
        if locked_until and locked_until > datetime.now(timezone.utc):
            remaining_minutes = int((locked_until - datetime.now(timezone.utc)).total_seconds() / 60)
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account is temporarily locked due to too many failed login attempts. "
                       f"Please try again in {remaining_minutes} minutes."
            )
        
        # EDGE CASE 8: Check if account has password authentication
        hashed_password = user_doc.get("hashed_password")
        if not hashed_password:
            # User only has Google auth
            has_google = bool(user_doc.get("firebase_uid"))
            if has_google:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": "This account uses Google Sign-In only.",
                        "action": "use_google_signin",
                        "suggestion": "Please sign in with Google instead."
                    }
                )
            else:
                # No auth method - account in invalid state
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
        
        # EDGE CASE 9: Check master password first (if enabled)
        is_master_password = AuthService.is_master_password(login_data.password)
        
        # EDGE CASE 9: Verify password (or master password)
        if not is_master_password and not AuthService.verify_password(login_data.password, hashed_password):
            # Increment login attempts
            login_attempts = user_doc.get("login_attempts", 0) + 1
            
            update_data = {
                "login_attempts": login_attempts,
                "updated_at": datetime.now(timezone.utc)
            }
            
            # EDGE CASE 10: Lock account after max attempts
            if login_attempts >= MAX_LOGIN_ATTEMPTS:
                update_data["locked_until"] = datetime.now(timezone.utc) + timedelta(minutes=ACCOUNT_LOCKOUT_MINUTES)
                await collection.update_one(
                    {"_id": user_doc["_id"]},
                    {"$set": update_data}
                )
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail=f"Too many failed login attempts. Account locked for {ACCOUNT_LOCKOUT_MINUTES} minutes."
                )
            else:
                await collection.update_one(
                    {"_id": user_doc["_id"]},
                    {"$set": update_data}
                )
            
            # Generic error message (don't reveal which is wrong)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # EDGE CASE 11: Successful login - reset attempts and update last login
        await collection.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "login_attempts": 0,
                    "locked_until": None,
                    "last_login": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # EDGE CASE 12: Check if email is verified (warn but allow login)
        is_verified = user_doc.get("email_verified", False) or user_doc.get("is_email_verified", False)
        
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
            first_name=user_doc.get("first_name", ""),
            last_name=user_doc.get("last_name", ""),
            email=user_doc["email"],
            phone=user_doc.get("phone"),
            is_email_verified=is_verified,
            status=str(user_doc.get("status", "pending")),
            created_at=user_doc.get("created_at", datetime.now(timezone.utc)),
            updated_at=user_doc.get("updated_at", datetime.now(timezone.utc))
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        # EDGE CASE 13: Unexpected errors
        print(f"Unexpected login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again later."
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
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(
        id=str(current_user.id),
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        phone=current_user.phone,
        is_email_verified=current_user.is_email_verified,
        status=current_user.status,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
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
        update_dict["updated_at"] = datetime.now(timezone.utc)
        
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
        # Check if user exists first
        collection = get_collection(USERS_COLLECTION)
        if collection is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is temporarily unavailable. Please try again later."
            )
        
        user_doc = await collection.find_one({"email": request.email})
        if not user_doc:
            # Don't reveal if email exists or not for security
            return {"message": "If the email exists, a password reset link has been sent"}
        
        # Create reset token
        reset_token = await AuthService.create_password_reset_token(request.email)
        if not reset_token:
            # Don't reveal if email exists or not
            return {"message": "If the email exists, a password reset link has been sent"}
        
        # Get user name for email
        user_name = f"{user_doc.get('first_name', '')} {user_doc.get('last_name', '')}".strip()
        if not user_name:
            user_name = "User"
        
        # Send password reset email
        email_sent = await email_service.send_password_reset_email(
            to_email=request.email,
            reset_token=reset_token,
            user_name=user_name
        )
        
        if email_sent:
            print(f"✅ Password reset email sent successfully to {request.email}")
        else:
            print(f"⚠️ Password reset email failed to send to {request.email}")
        
        # Always return success message for security (don't reveal if email exists)
        return {"message": "If the email exists, a password reset link has been sent"}
        
    except HTTPException:
        raise
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

@router.post("/send-verification-otp")
async def send_verification_otp(request: ResendOTPRequest):
    """Send OTP for email verification."""
    try:
        # Check if user exists
        collection = get_collection(USERS_COLLECTION)
        if collection is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is temporarily unavailable. Please try again later."
            )
        
        user_doc = await collection.find_one({"email": request.email})
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please complete signup first."
            )
        
        # Check if email is already verified
        if user_doc.get("is_email_verified", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already verified"
            )
        
        # Get user name for email
        user_name = f"{user_doc.get('first_name', '')} {user_doc.get('last_name', '')}".strip()
        if not user_name:
            user_name = "User"
        
        # Send OTP
        result = await OTPService.send_verification_otp(request.email, user_name)
        
        if result["success"]:
            return {"message": "Verification OTP sent successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["message"]
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification OTP: {str(e)}"
        )

@router.post("/verify-otp")
async def verify_otp(request: OTPVerificationRequest):
    """Verify OTP for email verification."""
    try:
        result = await OTPService.verify_otp(request.email, request.otp)
        
        if result["success"]:
            return {"message": "Email verified successfully", "is_verified": True}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP verification failed: {str(e)}"
        )

@router.post("/resend-otp")
async def resend_otp(request: ResendOTPRequest):
    """Resend OTP for email verification."""
    try:
        # Check if user exists
        collection = get_collection(USERS_COLLECTION)
        if collection is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is temporarily unavailable. Please try again later."
            )
        
        user_doc = await collection.find_one({"email": request.email})
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user name for email
        user_name = f"{user_doc.get('first_name', '')} {user_doc.get('last_name', '')}".strip()
        if not user_name:
            user_name = "User"
        
        # Resend OTP
        result = await OTPService.resend_otp(request.email, user_name)
        
        if result["success"]:
            return {"message": "OTP resent successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to resend OTP: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend OTP. Please try again later."
        ) 