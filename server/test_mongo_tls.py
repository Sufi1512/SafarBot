#!/usr/bin/env python3
"""
MongoDB TLS Connection Test
This script tests MongoDB connection with proper TLS configuration.
"""

import os
import asyncio
import certifi
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv()

async def test_mongo_tls():
    """Test MongoDB connection with TLS configuration."""
    
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    print(f"🔍 Testing MongoDB connection with URL: {mongodb_url}")
    
    # Test 1: Basic connection with TLS and certifi
    print("\n📋 Test 1: Basic connection with TLS and certifi")
    try:
        client = AsyncIOMotorClient(mongodb_url, tls=True, tlsCAFile=certifi.where())
        await client.admin.command('ping')
        print("✅ Basic TLS + certifi connection successful!")
        client.close()
    except Exception as e:
        print(f"❌ Basic TLS + certifi connection failed: {e}")
    
    # Test 2: Connection with ServerApi and TLS + certifi
    print("\n📋 Test 2: Connection with ServerApi and TLS + certifi")
    try:
        client = AsyncIOMotorClient(mongodb_url, server_api=ServerApi('1'), tls=True, tlsCAFile=certifi.where())
        await client.admin.command('ping')
        print("✅ ServerApi + TLS + certifi connection successful!")
        client.close()
    except Exception as e:
        print(f"❌ ServerApi + TLS + certifi connection failed: {e}")
    
    # Test 3: Full connection options (matching database.py)
    print("\n📋 Test 3: Full connection options with certifi")
    try:
        connection_options = {
            "server_api": ServerApi('1'),
            "tls": True,  # Explicitly enable TLS
            "tlsCAFile": certifi.where(),  # Use certifi for CA root certificates
            "retryWrites": True,
            "w": "majority",
            "maxPoolSize": 10,
            "minPoolSize": 1,
            "maxIdleTimeMS": 30000,
            "connectTimeoutMS": 30000,
            "socketTimeoutMS": 30000,
            "serverSelectionTimeoutMS": 60000,
        }
        client = AsyncIOMotorClient(mongodb_url, **connection_options)
        await client.admin.command('ping')
        print("✅ Full connection options with certifi successful!")
        client.close()
    except Exception as e:
        print(f"❌ Full connection options with certifi failed: {e}")
    
    # Test 4: Database access with certifi
    print("\n📋 Test 4: Database access with certifi")
    try:
        client = AsyncIOMotorClient(mongodb_url, server_api=ServerApi('1'), tls=True, tlsCAFile=certifi.where())
        db = client.SafarBot
        collection = db.user_fields
        count = await collection.count_documents({})
        print(f"✅ Database access with certifi successful! Found {count} users in user_fields collection")
        client.close()
    except Exception as e:
        print(f"❌ Database access with certifi failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_mongo_tls())
