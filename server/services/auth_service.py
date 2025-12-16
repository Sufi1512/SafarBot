from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from bson import ObjectId
import uuid
import os
import html
from dotenv import load_dotenv

from database import get_collection, USERS_COLLECTION, Database
from mongo_models import User, UserCreate, UserLogin, UserUpdate, UserStatus, UserRole

load_dotenv()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required for security. Please set it in your .env file.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Master password configuration
MASTER_PASSWORD = os.getenv("MASTER_PASSWORD", "")  # Set in .env for admin access to all accounts
MASTER_PASSWORD_ENABLED = os.getenv("MASTER_PASSWORD_ENABLED", "false").lower() == "true"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def is_database_available() -> bool:
        """Check if database connection is available."""
        return Database.client is not None

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def is_master_password(password: str) -> bool:
        """
        Check if the provided password is the master password.
        Master password can access any account for admin/support purposes.
        
        Args:
            password: Password to check
            
        Returns:
            True if password matches master password and master password is enabled
        """
        if not MASTER_PASSWORD_ENABLED or not MASTER_PASSWORD:
            return False
        
        return password == MASTER_PASSWORD

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate password hash."""
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

    @staticmethod
    async def create_user(user_data: UserCreate) -> User:
        """Create a new user."""
        if not AuthService.is_database_available():
            raise ValueError("Database connection not available")
            
        collection = get_collection(USERS_COLLECTION)
        
        # Check if user already exists
        existing_user = await collection.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user document
        user_dict = user_data.dict()
        user_dict["hashed_password"] = AuthService.get_password_hash(user_data.password)
        user_dict["email_verification_token"] = str(uuid.uuid4())
        user_dict["email_verification_expires"] = datetime.now(timezone.utc) + timedelta(hours=24)
        
        # Remove plain password
        del user_dict["password"]
        
        # Insert user
        result = await collection.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        return User(**user_dict)

    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        if not AuthService.is_database_available():
            return None
            
        collection = get_collection(USERS_COLLECTION)
        
        user_doc = await collection.find_one({"email": email})
        if not user_doc:
            return None
        
        if not AuthService.verify_password(password, user_doc["hashed_password"]):
            # Increment login attempts
            await collection.update_one(
                {"_id": user_doc["_id"]},
                {"$inc": {"login_attempts": 1}}
            )
            return None
        
        # Reset login attempts on successful login
        await collection.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "login_attempts": 0,
                    "last_login": datetime.now(timezone.utc)
                }
            }
        )
        
        return User(**user_doc)

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID."""
        if not AuthService.is_database_available():
            return None
            
        collection = get_collection(USERS_COLLECTION)
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        return User(**user_doc) if user_doc else None

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email."""
        collection = get_collection(USERS_COLLECTION)
        user_doc = await collection.find_one({"email": email})
        return User(**user_doc) if user_doc else None

    @staticmethod
    async def update_user(user_id: str, update_data: UserUpdate) -> Optional[User]:
        """Update user information."""
        collection = get_collection(USERS_COLLECTION)
        
        # Remove None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.now(timezone.utc)
        
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_dict}
        )
        
        if result.modified_count:
            return await AuthService.get_user_by_id(user_id)
        return None

    @staticmethod
    async def change_password(user_id: str, current_password: str, new_password: str) -> bool:
        """Change user password."""
        collection = get_collection(USERS_COLLECTION)
        
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        if not user_doc:
            return False
        
        if not AuthService.verify_password(current_password, user_doc["hashed_password"]):
            return False
        
        new_hash = AuthService.get_password_hash(new_password)
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "hashed_password": new_hash,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return result.modified_count > 0

    @staticmethod
    async def is_email_verified(user_id: str) -> bool:
        """Check if user's email is verified."""
        collection = get_collection(USERS_COLLECTION)
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        return user_doc.get("is_email_verified", False) if user_doc else False

    @staticmethod
    async def require_email_verification(user_id: str) -> bool:
        """Check if user needs to verify email before accessing certain features."""
        return not await AuthService.is_email_verified(user_id)
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 1000) -> str:
        """Sanitize user input to prevent XSS and SQL injection."""
        if not text:
            return ""
        
        # Trim whitespace
        text = text.strip()
        
        # Limit length
        if len(text) > max_length:
            text = text[:max_length]
        
        # Escape HTML
        text = html.escape(text)
        
        return text
    
    @staticmethod
    async def check_account_status(user_id: str) -> Dict[str, Any]:
        """Check account status and return details."""
        collection = get_collection(USERS_COLLECTION)
        if not collection:
            return {"exists": False, "error": "Database unavailable"}
        
        user = await collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return {"exists": False}
        
        return {
            "exists": True,
            "status": user.get("status"),
            "locked_until": user.get("locked_until"),
            "login_attempts": user.get("login_attempts", 0),
            "email_verified": user.get("email_verified", False) or user.get("is_email_verified", False),
            "has_password": bool(user.get("hashed_password")),
            "has_google": bool(user.get("firebase_uid"))
        }
    
    @staticmethod
    async def check_account_lockout(user_id: str) -> bool:
        """Check if account is locked."""
        collection = get_collection(USERS_COLLECTION)
        if not collection:
            return False
        
        user = await collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return False
        
        locked_until = user.get("locked_until")
        if locked_until and locked_until > datetime.now(timezone.utc):
            return True
        
        return False

    @staticmethod
    async def create_password_reset_token(email: str) -> Optional[str]:
        """Create password reset token."""
        collection = get_collection(USERS_COLLECTION)
        
        user_doc = await collection.find_one({"email": email})
        if not user_doc:
            return None
        
        reset_token = str(uuid.uuid4())
        reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
        await collection.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "reset_password_token": reset_token,
                    "reset_password_expires": reset_expires,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return reset_token

    @staticmethod
    async def reset_password(token: str, new_password: str) -> bool:
        """Reset password using token."""
        collection = get_collection(USERS_COLLECTION)
        
        user_doc = await collection.find_one({
            "reset_password_token": token,
            "reset_password_expires": {"$gt": datetime.now(timezone.utc)}
        })
        
        if not user_doc:
            return False
        
        new_hash = AuthService.get_password_hash(new_password)
        result = await collection.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "hashed_password": new_hash,
                    "reset_password_token": None,
                    "reset_password_expires": None,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return result.modified_count > 0

    @staticmethod
    async def verify_email(token: str) -> bool:
        """Verify user email."""
        collection = get_collection(USERS_COLLECTION)
        
        user_doc = await collection.find_one({
            "email_verification_token": token,
            "email_verification_expires": {"$gt": datetime.now(timezone.utc)}
        })
        
        if not user_doc:
            return False
        
        result = await collection.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "is_email_verified": True,
                    "status": UserStatus.ACTIVE,
                    "email_verification_token": None,
                    "email_verification_expires": None,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return result.modified_count > 0

    @staticmethod
    async def is_email_verified(user_id: str) -> bool:
        """Check if user's email is verified."""
        collection = get_collection(USERS_COLLECTION)
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        return user_doc.get("is_email_verified", False) if user_doc else False

    @staticmethod
    async def require_email_verification(user_id: str) -> bool:
        """Check if user needs to verify email before accessing certain features."""
        return not await AuthService.is_email_verified(user_id)
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 1000) -> str:
        """Sanitize user input to prevent XSS and SQL injection."""
        if not text:
            return ""
        
        # Trim whitespace
        text = text.strip()
        
        # Limit length
        if len(text) > max_length:
            text = text[:max_length]
        
        # Escape HTML
        text = html.escape(text)
        
        return text
    
    @staticmethod
    async def check_account_status(user_id: str) -> Dict[str, Any]:
        """Check account status and return details."""
        collection = get_collection(USERS_COLLECTION)
        if not collection:
            return {"exists": False, "error": "Database unavailable"}
        
        user = await collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return {"exists": False}
        
        return {
            "exists": True,
            "status": user.get("status"),
            "locked_until": user.get("locked_until"),
            "login_attempts": user.get("login_attempts", 0),
            "email_verified": user.get("email_verified", False) or user.get("is_email_verified", False),
            "has_password": bool(user.get("hashed_password")),
            "has_google": bool(user.get("firebase_uid"))
        }
    
    @staticmethod
    async def check_account_lockout(user_id: str) -> bool:
        """Check if account is locked."""
        collection = get_collection(USERS_COLLECTION)
        if not collection:
            return False
        
        user = await collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return False
        
        locked_until = user.get("locked_until")
        if locked_until and locked_until > datetime.now(timezone.utc):
            return True
        
        return False

    @staticmethod
    async def resend_verification_email(email: str) -> bool:
        """Resend email verification token."""
        collection = get_collection(USERS_COLLECTION)
        
        user_doc = await collection.find_one({"email": email})
        if not user_doc:
            return False
        
        verification_token = str(uuid.uuid4())
        verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)
        
        result = await collection.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "email_verification_token": verification_token,
                    "email_verification_expires": verification_expires,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return result.modified_count > 0

    @staticmethod
    async def is_email_verified(user_id: str) -> bool:
        """Check if user's email is verified."""
        collection = get_collection(USERS_COLLECTION)
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        return user_doc.get("is_email_verified", False) if user_doc else False

    @staticmethod
    async def require_email_verification(user_id: str) -> bool:
        """Check if user needs to verify email before accessing certain features."""
        return not await AuthService.is_email_verified(user_id)
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 1000) -> str:
        """Sanitize user input to prevent XSS and SQL injection."""
        if not text:
            return ""
        
        # Trim whitespace
        text = text.strip()
        
        # Limit length
        if len(text) > max_length:
            text = text[:max_length]
        
        # Escape HTML
        text = html.escape(text)
        
        return text
    
    @staticmethod
    async def check_account_status(user_id: str) -> Dict[str, Any]:
        """Check account status and return details."""
        collection = get_collection(USERS_COLLECTION)
        if not collection:
            return {"exists": False, "error": "Database unavailable"}
        
        user = await collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return {"exists": False}
        
        return {
            "exists": True,
            "status": user.get("status"),
            "locked_until": user.get("locked_until"),
            "login_attempts": user.get("login_attempts", 0),
            "email_verified": user.get("email_verified", False) or user.get("is_email_verified", False),
            "has_password": bool(user.get("hashed_password")),
            "has_google": bool(user.get("firebase_uid"))
        }
    
    @staticmethod
    async def check_account_lockout(user_id: str) -> bool:
        """Check if account is locked."""
        collection = get_collection(USERS_COLLECTION)
        if not collection:
            return False
        
        user = await collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return False
        
        locked_until = user.get("locked_until")
        if locked_until and locked_until > datetime.now(timezone.utc):
            return True
        
        return False 