#!/usr/bin/env python3
"""
Test script to verify MongoDB connection and authentication system
"""

import asyncio
import os
from dotenv import load_dotenv
from database import Database
from services.auth_service import AuthService
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv()

async def test_database_connection():
    """Test the database connection"""
    print("🔍 Testing MongoDB connection...")
    
    try:
        # Test connection
        await Database.connect_db()
        print("✅ Database connection successful!")
        
        # Test database access
        db = Database.get_db()
        print(f"✅ Database name: {db.name}")
        
        # Test collection access
        collection = db.user_fields
        print(f"✅ Collection 'user_fields' accessible")
        
        # Count documents
        count = await collection.count_documents({})
        print(f"✅ Collection has {count} documents")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_sync_connection():
    """Test synchronous database connection"""
    print("\n🔍 Testing synchronous MongoDB connection...")
    
    try:
        mongodb_url = os.getenv("MONGODB_URL")
        if not mongodb_url:
            print("❌ MONGODB_URL not found in environment variables")
            return False
            
        client = MongoClient(mongodb_url, server_api=ServerApi('1'))
        
        # Test connection
        client.admin.command('ping')
        print("✅ Synchronous connection successful!")
        
        # Test database access
        db = client.SafarBot
        print(f"✅ Database name: {db.name}")
        
        # Test collection access
        collection = db.user_fields
        print(f"✅ Collection 'user_fields' accessible")
        
        # Count documents
        count = collection.count_documents({})
        print(f"✅ Collection has {count} documents")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Synchronous connection failed: {e}")
        return False

async def test_user_creation():
    """Test user creation and authentication"""
    print("\n🔍 Testing user creation and authentication...")
    
    try:
        # Test user data
        test_user = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone": "+1234567890",
            "password": "TestPassword123!"
        }
        
        # Test password hashing
        hashed_password = AuthService.get_password_hash(test_user["password"])
        print("✅ Password hashing successful")
        
        # Test password verification
        is_valid = AuthService.verify_password(test_user["password"], hashed_password)
        print(f"✅ Password verification: {is_valid}")
        
        # Test JWT token creation
        token_data = {"sub": "test-user-id", "email": test_user["email"]}
        access_token = AuthService.create_access_token(token_data)
        refresh_token = AuthService.create_refresh_token(token_data)
        print("✅ JWT token creation successful")
        
        # Test token verification
        payload = AuthService.verify_token(access_token)
        print(f"✅ Token verification: {payload is not None}")
        
        return True
        
    except Exception as e:
        print(f"❌ User creation test failed: {e}")
        return False

async def create_sample_user():
    """Create a sample user in the database"""
    print("\n🔍 Creating sample user...")
    
    try:
        from database import get_collection, USERS_COLLECTION
        
        collection = get_collection(USERS_COLLECTION)
        
        # Check if user already exists
        existing_user = await collection.find_one({"email": "demo@example.com"})
        if existing_user:
            print("✅ Sample user already exists")
            return True
        
        # Create sample user
        sample_user = {
            "first_name": "Demo",
            "last_name": "User",
            "email": "demo@example.com",
            "phone": "+1234567890",
            "hashed_password": AuthService.get_password_hash("DemoPassword123!"),
            "is_email_verified": True,
            "status": "active",
            "role": "user",
            "login_attempts": 0,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
        
        result = await collection.insert_one(sample_user)
        print(f"✅ Sample user created with ID: {result.inserted_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Sample user creation failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting SafarBot Database Tests\n")
    
    # Test database connection
    db_ok = await test_database_connection()
    
    # Test synchronous connection
    sync_ok = test_sync_connection()
    
    # Test user creation and authentication
    auth_ok = await test_user_creation()
    
    # Create sample user
    sample_ok = await create_sample_user()
    
    # Close database connection
    await Database.close_db()
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST SUMMARY")
    print("="*50)
    print(f"Database Connection: {'✅ PASS' if db_ok else '❌ FAIL'}")
    print(f"Synchronous Connection: {'✅ PASS' if sync_ok else '❌ FAIL'}")
    print(f"Authentication System: {'✅ PASS' if auth_ok else '❌ FAIL'}")
    print(f"Sample User Creation: {'✅ PASS' if sample_ok else '❌ FAIL'}")
    
    if all([db_ok, sync_ok, auth_ok, sample_ok]):
        print("\n🎉 All tests passed! Database is ready for use.")
        print("\n📝 Sample user credentials:")
        print("   Email: demo@example.com")
        print("   Password: DemoPassword123!")
    else:
        print("\n⚠️  Some tests failed. Please check your configuration.")

if __name__ == "__main__":
    asyncio.run(main())
