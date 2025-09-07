"""
Session Management Service
Handles user sessions, device tracking, and security monitoring
"""

import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from bson import ObjectId
import logging

from database import get_collection, USERS_COLLECTION
from mongo_models import (
    UserSessionDocument, SessionStatus, DeviceType,
    UserPreferencesDocument, NotificationPreferences, TravelPreferences
)
from services.auth_service import AuthService

logger = logging.getLogger(__name__)

class SessionService:
    SESSIONS_COLLECTION = "user_sessions"
    PREFERENCES_COLLECTION = "user_preferences"
    ANALYTICS_COLLECTION = "user_analytics"
    
    @staticmethod
    async def create_session(
        user_id: str,
        device_type: DeviceType,
        device_name: str,
        ip_address: str,
        user_agent: str,
        location: Optional[Dict[str, Any]] = None,
        is_remember_me: bool = False,
        expires_in_hours: int = 24
    ) -> UserSessionDocument:
        """Create a new user session."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            
            # Generate refresh token
            refresh_token = AuthService.create_refresh_token(
                data={"sub": user_id, "session_id": str(uuid.uuid4())}
            )
            
            # Calculate expiration time
            expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
            
            session_data = {
                "user_id": ObjectId(user_id),
                "device_type": device_type,
                "device_name": device_name,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "location": location,
                "status": SessionStatus.ACTIVE,
                "last_activity": datetime.utcnow(),
                "expires_at": expires_at,
                "is_remember_me": is_remember_me,
                "refresh_token": refresh_token,
                "created_at": datetime.utcnow()
            }
            
            result = await collection.insert_one(session_data)
            session_data["_id"] = result.inserted_id
            
            # Update user's last session
            await SessionService._update_user_last_session(user_id, str(session_data["_id"]))
            
            logger.info(f"Created session {session_data['_id']} for user {user_id}")
            return UserSessionDocument(**session_data)
            
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            raise Exception(f"Failed to create session: {str(e)}")
    
    @staticmethod
    async def get_active_sessions(user_id: str) -> List[UserSessionDocument]:
        """Get all active sessions for a user."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            
            query = {
                "user_id": ObjectId(user_id),
                "status": SessionStatus.ACTIVE,
                "expires_at": {"$gt": datetime.utcnow()}
            }
            
            cursor = collection.find(query).sort("last_activity", -1)
            sessions = await cursor.to_list(length=None)
            
            return [UserSessionDocument(**session) for session in sessions]
            
        except Exception as e:
            logger.error(f"Error getting active sessions: {str(e)}")
            return []
    
    @staticmethod
    async def update_session_activity(session_id: str) -> bool:
        """Update last activity timestamp for a session."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            
            result = await collection.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {"last_activity": datetime.utcnow()}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating session activity: {str(e)}")
            return False
    
    @staticmethod
    async def revoke_session(session_id: str, user_id: str) -> bool:
        """Revoke a specific session."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            
            result = await collection.update_one(
                {
                    "_id": ObjectId(session_id),
                    "user_id": ObjectId(user_id)
                },
                {
                    "$set": {
                        "status": SessionStatus.REVOKED,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error revoking session: {str(e)}")
            return False
    
    @staticmethod
    async def revoke_all_sessions(user_id: str, exclude_session_id: Optional[str] = None) -> int:
        """Revoke all sessions for a user except the current one."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            
            query = {
                "user_id": ObjectId(user_id),
                "status": SessionStatus.ACTIVE
            }
            
            if exclude_session_id:
                query["_id"] = {"$ne": ObjectId(exclude_session_id)}
            
            result = await collection.update_many(
                query,
                {
                    "$set": {
                        "status": SessionStatus.REVOKED,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count
            
        except Exception as e:
            logger.error(f"Error revoking all sessions: {str(e)}")
            return 0
    
    @staticmethod
    async def cleanup_expired_sessions() -> int:
        """Clean up expired sessions."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            
            result = await collection.update_many(
                {
                    "expires_at": {"$lt": datetime.utcnow()},
                    "status": SessionStatus.ACTIVE
                },
                {
                    "$set": {
                        "status": SessionStatus.EXPIRED,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count
            
        except Exception as e:
            logger.error(f"Error cleaning up expired sessions: {str(e)}")
            return 0
    
    @staticmethod
    async def get_session_by_id(session_id: str) -> Optional[UserSessionDocument]:
        """Get session by ID."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            session_doc = await collection.find_one({"_id": ObjectId(session_id)})
            return UserSessionDocument(**session_doc) if session_doc else None
            
        except Exception as e:
            logger.error(f"Error getting session by ID: {str(e)}")
            return None
    
    @staticmethod
    async def validate_session(session_id: str) -> bool:
        """Validate if a session is active and not expired."""
        try:
            session = await SessionService.get_session_by_id(session_id)
            if not session:
                return False
            
            return (
                session.status == SessionStatus.ACTIVE and
                session.expires_at > datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Error validating session: {str(e)}")
            return False
    
    @staticmethod
    async def _update_user_last_session(user_id: str, session_id: str) -> bool:
        """Update user's last session ID."""
        try:
            collection = get_collection(USERS_COLLECTION)
            
            result = await collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_session_id": session_id}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating user last session: {str(e)}")
            return False
    
    @staticmethod
    async def get_session_analytics(user_id: str) -> Dict[str, Any]:
        """Get session analytics for a user."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            
            # Get session statistics
            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {
                    "$group": {
                        "_id": None,
                        "total_sessions": {"$sum": 1},
                        "active_sessions": {
                            "$sum": {
                                "$cond": [
                                    {"$and": [
                                        {"$eq": ["$status", SessionStatus.ACTIVE]},
                                        {"$gt": ["$expires_at", datetime.utcnow()]}
                                    ]},
                                    1,
                                    0
                                ]
                            }
                        },
                        "device_types": {"$addToSet": "$device_type"},
                        "last_activity": {"$max": "$last_activity"}
                    }
                }
            ]
            
            result = await collection.aggregate(pipeline).to_list(length=1)
            
            if result:
                analytics = result[0]
                analytics.pop("_id", None)
                return analytics
            
            return {
                "total_sessions": 0,
                "active_sessions": 0,
                "device_types": [],
                "last_activity": None
            }
            
        except Exception as e:
            logger.error(f"Error getting session analytics: {str(e)}")
            return {}
    
    @staticmethod
    async def detect_suspicious_activity(
        user_id: str,
        ip_address: str,
        user_agent: str
    ) -> Dict[str, Any]:
        """Detect suspicious login activity."""
        try:
            collection = get_collection(SessionService.SESSIONS_COLLECTION)
            
            # Check for recent sessions from different IPs
            recent_sessions = await collection.find({
                "user_id": ObjectId(user_id),
                "created_at": {"$gte": datetime.utcnow() - timedelta(hours=24)},
                "ip_address": {"$ne": ip_address}
            }).to_list(length=10)
            
            # Check for unusual user agents
            unusual_agents = await collection.find({
                "user_id": ObjectId(user_id),
                "user_agent": {"$ne": user_agent},
                "created_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
            }).to_list(length=5)
            
            suspicious_indicators = []
            
            if len(recent_sessions) > 3:
                suspicious_indicators.append("Multiple IP addresses in 24h")
            
            if len(unusual_agents) > 2:
                suspicious_indicators.append("Unusual device patterns")
            
            return {
                "is_suspicious": len(suspicious_indicators) > 0,
                "indicators": suspicious_indicators,
                "recent_ip_count": len(recent_sessions),
                "unusual_agent_count": len(unusual_agents)
            }
            
        except Exception as e:
            logger.error(f"Error detecting suspicious activity: {str(e)}")
            return {"is_suspicious": False, "indicators": []}
