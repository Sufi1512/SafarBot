"""
Firebase Authentication Service
Handles Google Sign-In with Firebase and MongoDB integration
"""

import firebase_admin
from firebase_admin import credentials, auth
from google.auth.exceptions import GoogleAuthError
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timezone
from bson import ObjectId

from database import get_collection, USERS_COLLECTION
from mongo_models import User, UserStatus, UserRole
from services.auth_service import AuthService

logger = logging.getLogger(__name__)

class FirebaseAuthService:
    def __init__(self):
        """Initialize Firebase Admin SDK"""
        self.auth_service = AuthService()
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Use environment variables for Firebase credentials
                import os
                from config import settings
                
                # Get Firebase credentials from environment variables
                firebase_project_id = os.getenv("FIREBASE_PROJECT_ID")
                firebase_private_key = os.getenv("FIREBASE_PRIVATE_KEY")
                firebase_client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
                firebase_client_id = os.getenv("FIREBASE_CLIENT_ID")
                
                if not all([firebase_project_id, firebase_private_key, firebase_client_email]):
                    raise ValueError("Missing required Firebase environment variables")
                
                # Create credentials from environment variables
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": firebase_project_id,
                    "private_key": firebase_private_key.replace('\\n', '\n'),
                    "client_email": firebase_client_email,
                    "client_id": firebase_client_id,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{firebase_client_email}"
                })
                
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully with environment variables")
            else:
                logger.info("Firebase Admin SDK already initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            raise
    
    async def verify_firebase_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Firebase ID token and return user info
        
        Args:
            id_token: Firebase ID token from client
            
        Returns:
            Dict containing user information or None if invalid
        """
        try:
            # Verify the ID token
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            
            # Get additional user info from Firebase
            user_record = auth.get_user(uid)
            
            return {
                'uid': uid,
                'email': user_record.email,
                'name': user_record.display_name,
                'photo_url': user_record.photo_url,
                'email_verified': user_record.email_verified,
                'phone_number': user_record.phone_number,
                'provider_data': [
                    {
                        'provider_id': provider.provider_id,
                        'uid': provider.uid,
                        'email': provider.email,
                        'display_name': provider.display_name,
                        'photo_url': provider.photo_url
                    }
                    for provider in user_record.provider_data
                ]
            }
            
        except auth.InvalidIdTokenError:
            logger.warning("Invalid Firebase ID token")
            return None
        except auth.UserNotFoundError:
            logger.warning("Firebase user not found")
            return None
        except Exception as e:
            logger.error(f"Error verifying Firebase token: {str(e)}")
            return None
    
    def _split_name(self, full_name: str) -> tuple[str, str]:
        """
        Split full name into first and last name
        
        Args:
            full_name: Full name string
            
        Returns:
            Tuple of (first_name, last_name)
        """
        if not full_name:
            return "", ""
        
        name_parts = full_name.strip().split()
        if len(name_parts) == 0:
            return "", ""
        elif len(name_parts) == 1:
            return name_parts[0], ""
        else:
            first_name = name_parts[0]
            last_name = " ".join(name_parts[1:])
            return first_name, last_name

    async def create_or_update_user_from_firebase(self, firebase_user: Dict[str, Any]) -> Optional[User]:
        """
        Create or update MongoDB user from Firebase user data
        Handles ALL edge cases for account linking and creation.
        
        Args:
            firebase_user: User data from Firebase
            
        Returns:
            User object or None if failed
        """
        try:
            users_collection = get_collection(USERS_COLLECTION)
            
            # EDGE CASE 1: Database unavailable
            if not users_collection:
                logger.error("Database unavailable during Firebase auth")
                return None
            
            firebase_uid = firebase_user.get('uid')
            email = firebase_user.get('email', '').strip().lower()
            
            # EDGE CASE 2: Missing required fields
            if not firebase_uid:
                logger.error("Firebase UID missing")
                return None
            
            if not email:
                logger.error("Email missing from Firebase user")
                return None
            
            # Split the name into first and last name
            full_name = firebase_user.get('name', '')
            first_name, last_name = self._split_name(full_name)
            
            # EDGE CASE 3: Check if user exists by firebase_uid
            existing_user_by_uid = await users_collection.find_one({"firebase_uid": firebase_uid})
            
            # EDGE CASE 4: Check if user exists by email
            existing_user_by_email = await users_collection.find_one({"email": email})
            
            # Handle different scenarios
            if existing_user_by_uid:
                # EDGE CASE 5: User exists with this Firebase UID - update info
                user_status = existing_user_by_uid.get("status")
                
                # Check if account is suspended
                if user_status == UserStatus.SUSPENDED:
                    logger.warning(f"Attempted login to suspended account: {email}")
                    return None
                
                # Update existing user
                update_data = {
                    "email": email,
                    "first_name": first_name or existing_user_by_uid.get("first_name"),
                    "last_name": last_name or existing_user_by_uid.get("last_name"),
                    "name": full_name or existing_user_by_uid.get("name"),
                    "photo_url": firebase_user.get('photo_url') or existing_user_by_uid.get("photo_url"),
                    "email_verified": True,  # Google emails are verified
                    "is_email_verified": True,
                    "phone_number": firebase_user.get('phone_number') or existing_user_by_uid.get("phone_number"),
                    "last_login": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
                
                # Ensure auth_methods includes google
                auth_methods = existing_user_by_uid.get("auth_methods", [])
                if "google" not in auth_methods:
                    auth_methods.append("google")
                update_data["auth_methods"] = auth_methods
                
                # Remove None values
                update_data = {k: v for k, v in update_data.items() if v is not None}
                
                await users_collection.update_one(
                    {"firebase_uid": firebase_uid},
                    {"$set": update_data}
                )
                
                updated_user = await users_collection.find_one({"firebase_uid": firebase_uid})
                return User(**updated_user)
            
            elif existing_user_by_email:
                # EDGE CASE 6: Email exists but not linked to Google - LINK ACCOUNTS
                logger.info(f"Linking Google account to existing email account: {email}")
                
                user_status = existing_user_by_email.get("status")
                
                # Check if account is suspended
                if user_status == UserStatus.SUSPENDED:
                    logger.warning(f"Attempted to link Google to suspended account: {email}")
                    return None
                
                # Check if account is locked
                locked_until = existing_user_by_email.get("locked_until")
                if locked_until and locked_until > datetime.now(timezone.utc):
                    logger.warning(f"Attempted to link Google to locked account: {email}")
                    return None
                
                # Check if email account has password
                has_password = bool(existing_user_by_email.get("hashed_password"))
                
                # Prepare update data
                update_data = {
                    "firebase_uid": firebase_uid,
                    "email_verified": True,
                    "is_email_verified": True,
                    "last_login": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                }
                
                # Update name if not set or if Google has better data
                if not existing_user_by_email.get("first_name") and first_name:
                    update_data["first_name"] = first_name
                if not existing_user_by_email.get("last_name") and last_name:
                    update_data["last_name"] = last_name
                if not existing_user_by_email.get("name") and full_name:
                    update_data["name"] = full_name
                
                # Update photo if not set
                if not existing_user_by_email.get("photo_url") and firebase_user.get('photo_url'):
                    update_data["photo_url"] = firebase_user.get('photo_url')
                
                # Track auth methods
                auth_methods = existing_user_by_email.get("auth_methods", [])
                if "google" not in auth_methods:
                    auth_methods.append("google")
                if has_password and "password" not in auth_methods:
                    auth_methods.append("password")
                update_data["auth_methods"] = auth_methods
                
                # Add linked account info
                linked_accounts = existing_user_by_email.get("linked_accounts", [])
                linked_accounts.append({
                    "provider": "google",
                    "uid": firebase_uid,
                    "linked_at": datetime.now(timezone.utc)
                })
                update_data["linked_accounts"] = linked_accounts
                
                # Update provider data
                provider_data = existing_user_by_email.get("provider_data", [])
                provider_data.extend(firebase_user.get('provider_data', []))
                update_data["provider_data"] = provider_data
                
                # Update status if pending
                if existing_user_by_email.get("status") in ["pending", UserStatus.PENDING_VERIFICATION]:
                    update_data["status"] = UserStatus.ACTIVE
                
                # Remove None values
                update_data = {k: v for k, v in update_data.items() if v is not None}
                
                await users_collection.update_one(
                    {"_id": existing_user_by_email["_id"]},
                    {"$set": update_data}
                )
                
                linked_user = await users_collection.find_one({"_id": existing_user_by_email["_id"]})
                logger.info(f"Successfully linked Google account to existing user: {email}")
                return User(**linked_user)
            
            else:
                # EDGE CASE 7: New user - create account
                user_data = {
                    "firebase_uid": firebase_uid,
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "name": full_name,
                    "photo_url": firebase_user.get('photo_url'),
                    "email_verified": firebase_user.get('email_verified', False),
                    "is_email_verified": firebase_user.get('email_verified', False),
                    "phone_number": firebase_user.get('phone_number'),
                    "auth_methods": ["google"],
                    "status": UserStatus.ACTIVE,
                    "role": UserRole.USER,
                    "created_at": datetime.now(timezone.utc),
                    "last_login": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                    "preferences": {},
                    "provider_data": firebase_user.get('provider_data', []),
                    "linked_accounts": [{
                        "provider": "google",
                        "uid": firebase_uid,
                        "linked_at": datetime.now(timezone.utc)
                    }]
                }
                
                user_data = {k: v for k, v in user_data.items() if v is not None}
                
                try:
                    result = await users_collection.insert_one(user_data)
                    user_data['_id'] = result.inserted_id
                    logger.info(f"Created new Google user: {email}")
                    return User(**user_data)
                except Exception as e:
                    # EDGE CASE 8: Race condition - user created between checks
                    if "duplicate key" in str(e).lower() or "E11000" in str(e):
                        # Try to find the user that was just created
                        existing = await users_collection.find_one({"email": email})
                        if existing:
                            return User(**existing)
                    logger.error(f"Error creating Google user: {str(e)}")
                    return None
                
        except Exception as e:
            logger.error(f"Error creating/updating user from Firebase: {str(e)}")
            return None
    
    async def authenticate_with_firebase(self, id_token: str) -> Optional[Dict[str, Any]]:
        """
        Complete Firebase authentication flow
        
        Args:
            id_token: Firebase ID token from client
            
        Returns:
            Dict with user data and JWT token or None if failed
        """
        try:
            # Verify Firebase token
            firebase_user = await self.verify_firebase_token(id_token)
            if not firebase_user:
                return None
            
            # Create or update user in MongoDB
            user = await self.create_or_update_user_from_firebase(firebase_user)
            if not user:
                return None
            
            # Generate JWT token for our API
            jwt_token = self.auth_service.create_access_token(
                data={"sub": str(user.id), "email": user.email}
            )
            
            return {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "name": user.name,  # Keep full name for backward compatibility
                    "photo_url": user.photo_url,
                    "email_verified": user.email_verified,
                    "role": user.role,
                    "status": user.status,
                    "created_at": user.created_at.isoformat(),
                    "last_login": user.last_login.isoformat() if user.last_login else None
                },
                "access_token": jwt_token,
                "token_type": "bearer"
            }
            
        except Exception as e:
            logger.error(f"Error in Firebase authentication: {str(e)}")
            return None
    
    async def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[User]:
        """
        Get user by Firebase UID
        
        Args:
            firebase_uid: Firebase user ID
            
        Returns:
            User object or None if not found
        """
        try:
            users_collection = get_collection(USERS_COLLECTION)
            user_data = await users_collection.find_one({"firebase_uid": firebase_uid})
            
            if user_data:
                return User(**user_data)
            return None
            
        except Exception as e:
            logger.error(f"Error getting user by Firebase UID: {str(e)}")
            return None

# Global instance
firebase_auth_service = FirebaseAuthService()
