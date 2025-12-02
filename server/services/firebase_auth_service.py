"""
Firebase Authentication Service
Handles Google Sign-In with Firebase and MongoDB integration
"""

import firebase_admin
from firebase_admin import credentials, auth
from google.auth.exceptions import GoogleAuthError
from typing import Optional, Dict, Any
import logging
from datetime import datetime
from bson import ObjectId

from database import get_collection, USERS_COLLECTION
from mongo_models import User, UserStatus, UserRole
from services.auth_service import AuthService

logger = logging.getLogger(__name__)

class FirebaseAuthService:
    def __init__(self):
        """Initialize Firebase Admin SDK"""
        self.auth_service = AuthService()
        self.firebase_initialized = False
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
                    logger.warning("Firebase credentials not configured. Google Sign-In will be disabled.")
                    return
                
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
            logger.warning(f"Failed to initialize Firebase: {str(e)}")
            logger.warning("Google Sign-In will be disabled. Server will continue without Firebase.")
            self.firebase_initialized = False
    
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
        
        Args:
            firebase_user: User data from Firebase
            
        Returns:
            User object or None if failed
        """
        try:
            users_collection = get_collection(USERS_COLLECTION)
            firebase_uid = firebase_user['uid']
            
            # Split the name into first and last name
            full_name = firebase_user.get('name', '')
            first_name, last_name = self._split_name(full_name)
            
            # Check if user already exists
            existing_user = await users_collection.find_one({"firebase_uid": firebase_uid})
            
            if existing_user:
                # Update existing user
                update_data = {
                    "email": firebase_user['email'],
                    "first_name": first_name,
                    "last_name": last_name,
                    "name": full_name,  # Keep full name as well for backward compatibility
                    "photo_url": firebase_user.get('photo_url'),
                    "email_verified": firebase_user.get('email_verified', False),
                    "phone_number": firebase_user.get('phone_number'),
                    "last_login": datetime.now(),
                    "updated_at": datetime.now()
                }
                
                # Remove None values
                update_data = {k: v for k, v in update_data.items() if v is not None}
                
                await users_collection.update_one(
                    {"firebase_uid": firebase_uid},
                    {"$set": update_data}
                )
                
                # Return updated user
                updated_user = await users_collection.find_one({"firebase_uid": firebase_uid})
                return User(**updated_user)
            
            else:
                # Create new user
                user_data = {
                    "firebase_uid": firebase_uid,
                    "email": firebase_user['email'],
                    "first_name": first_name,
                    "last_name": last_name,
                    "name": full_name,  # Keep full name as well for backward compatibility
                    "photo_url": firebase_user.get('photo_url'),
                    "email_verified": firebase_user.get('email_verified', False),
                    "phone_number": firebase_user.get('phone_number'),
                    "status": UserStatus.ACTIVE,
                    "role": UserRole.USER,
                    "created_at": datetime.now(),
                    "last_login": datetime.now(),
                    "updated_at": datetime.now(),
                    "preferences": {},
                    "provider_data": firebase_user.get('provider_data', [])
                }
                
                # Remove None values
                user_data = {k: v for k, v in user_data.items() if v is not None}
                
                result = await users_collection.insert_one(user_data)
                user_data['_id'] = result.inserted_id
                
                return User(**user_data)
                
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
