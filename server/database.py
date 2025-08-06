from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: Optional[AsyncIOMotorClient] = None
    sync_client: Optional[MongoClient] = None

    @classmethod
    async def connect_db(cls):
        """Create database connection."""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        cls.client = AsyncIOMotorClient(mongodb_url)
        cls.sync_client = MongoClient(mongodb_url)
        
        # Test the connection
        try:
            await cls.client.admin.command('ping')
            print("✅ Successfully connected to MongoDB!")
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise e

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
            raise Exception("Database not connected. Call connect_db() first.")
        return cls.client.safarbot

    @classmethod
    def get_sync_db(cls):
        """Get synchronous database instance."""
        if not cls.sync_client:
            raise Exception("Database not connected. Call connect_db() first.")
        return cls.sync_client.safarbot

# Database collections
def get_collection(collection_name: str):
    """Get a specific collection from the database."""
    db = Database.get_db()
    return db[collection_name]

def get_sync_collection(collection_name: str):
    """Get a specific collection from the synchronous database."""
    db = Database.get_sync_db()
    return db[collection_name]

# Collection names
USERS_COLLECTION = "users"
FLIGHTS_COLLECTION = "flights"
HOTELS_COLLECTION = "hotels"
BOOKINGS_COLLECTION = "bookings"
ITINERARIES_COLLECTION = "itineraries"
PRICE_ALERTS_COLLECTION = "price_alerts"
AFFILIATE_CLICKS_COLLECTION = "affiliate_clicks"
AFFILIATE_BOOKINGS_COLLECTION = "affiliate_bookings"
CHAT_SESSIONS_COLLECTION = "chat_sessions"
RESTAURANTS_COLLECTION = "restaurants"
SAVED_TRIPS_COLLECTION = "saved_trips"
NOTIFICATIONS_COLLECTION = "notifications" 