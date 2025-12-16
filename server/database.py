"""
Database Connection Management
Handles MongoDB connections with proper error handling and connection pooling
"""

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import ConnectionFailure, NetworkTimeout, ServerSelectionTimeoutError
from typing import Optional
import os
import certifi
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging - suppress MongoDB background task errors
pymongo_logger = logging.getLogger("pymongo")
pymongo_logger.setLevel(logging.WARNING)

background_logger = logging.getLogger("pymongo.synchronous.mongo_client")
background_logger.setLevel(logging.ERROR)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    sync_client: Optional[MongoClient] = None

    @classmethod
    async def connect_db(cls):
        """Create database connection with improved error handling."""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        
        # Check if it's a local MongoDB connection
        is_local = "localhost" in mongodb_url or "127.0.0.1" in mongodb_url
        
        if is_local:
            # Local MongoDB connection options (no TLS)
            connection_options = {
                "maxPoolSize": 10,
                "minPoolSize": 1,
                "maxIdleTimeMS": 30000,
                "connectTimeoutMS": 5000,
                "socketTimeoutMS": 5000,
                "serverSelectionTimeoutMS": 5000,
                "retryReads": True,
                "retryWrites": True,
            }
        else:
            # MongoDB Atlas connection options with TLS
            connection_options = {
                "server_api": ServerApi('1'),
                "tls": True,
                "tlsCAFile": certifi.where(),
                "retryWrites": True,
                "retryReads": True,
                "w": "majority",
                "maxPoolSize": 10,
                "minPoolSize": 1,
                "maxIdleTimeMS": 45000,  # Close idle connections faster
                "connectTimeoutMS": 20000,  # Reduced from 30s
                "socketTimeoutMS": 20000,  # Reduced from 30s
                "serverSelectionTimeoutMS": 30000,  # Reduced from 60s
                "heartbeatFrequencyMS": 10000,  # Check connection health every 10s
            }
        
        try:
            # Create async client with connection options
            cls.client = AsyncIOMotorClient(mongodb_url, **connection_options)
            
            # Create sync client with connection options
            cls.sync_client = MongoClient(mongodb_url, **connection_options)
            
            # Add event listeners to handle connection errors gracefully
            cls._setup_event_listeners()
            
            # Test the connection with timeout
            await cls.client.admin.command('ping')
            logging.info("Successfully connected to MongoDB")
            
        except (ConnectionFailure, NetworkTimeout, ServerSelectionTimeoutError) as e:
            logging.warning(f"MongoDB connection issue: {str(e)[:100]}")
            logging.warning("Continuing without database connection - some features may be limited")
            cls.client = None
            cls.sync_client = None
        except Exception as e:
            logging.error(f"Failed to connect to MongoDB: {e}")
            logging.warning("Continuing without database connection - authentication features disabled")
            cls.client = None
            cls.sync_client = None
    
    @classmethod
    def _setup_event_listeners(cls):
        """Setup event listeners to handle MongoDB connection events gracefully."""
        pass
    
    @classmethod
    async def check_connection(cls) -> bool:
        """Check if database connection is healthy."""
        if not cls.client:
            return False
        try:
            await cls.client.admin.command('ping')
            return True
        except Exception:
            return False
    
    @classmethod
    def is_connected(cls) -> bool:
        """Check if database is connected (synchronous check)."""
        return cls.client is not None and cls.sync_client is not None

    @classmethod
    async def close_db(cls):
        """Close database connection."""
        if cls.client:
            cls.client.close()
        if cls.sync_client:
            cls.sync_client.close()

    @classmethod
    def get_db(cls):
        """Get database instance."""
        if not cls.client:
            print("⚠️  Database not connected. Returning None.")
            return None
        return cls.client.SafarBot

    @classmethod
    def get_sync_db(cls):
        """Get synchronous database instance."""
        if not cls.sync_client:
            print("⚠️  Database not connected. Returning None.")
            return None
        return cls.sync_client.SafarBot

# Database collections
def get_collection(collection_name: str):
    """Get a specific collection from the database."""
    db = Database.get_db()
    if db is None:
        logging.warning(f"Cannot get collection '{collection_name}': Database not connected")
        return None
    return db[collection_name]

def get_sync_collection(collection_name: str):
    """Get a specific collection from the synchronous database."""
    db = Database.get_sync_db()
    if db is None:
        logging.warning(f"Cannot get collection '{collection_name}': Database not connected")
        return None
    return db[collection_name]

# FastAPI dependency for getting database
async def get_database():
    """FastAPI dependency to get database instance."""
    return Database.get_db()

# Collection names - Updated to match user's existing collection
USERS_COLLECTION = "user_fields"
FLIGHTS_COLLECTION = "flights"
HOTELS_COLLECTION = "hotels"
BOOKINGS_COLLECTION = "bookings"
ITINERARIES_COLLECTION = "itineraries"
PRICE_ALERTS_COLLECTION = "price_alerts"
AFFILIATE_CLICKS_COLLECTION = "affiliate_clicks"
AFFILIATE_BOOKINGS_COLLECTION = "affiliate_bookings"
CHAT_SESSIONS_COLLECTION = "chat_sessions"
RESTAURANTS_COLLECTION = "restaurants"
SAVED_TRIPS_COLLECTION = "saved_itineraries"
NOTIFICATIONS_COLLECTION = "notifications"

# Collaboration collections
SAVED_ITINERARIES_COLLECTION = "saved_itineraries"
ITINERARY_INVITATIONS_COLLECTION = "itinerary_invitations"
ITINERARY_COLLABORATORS_COLLECTION = "itinerary_collaborators"

# AI Tracking collection
AI_USAGE_COLLECTION = "ai_usage"   