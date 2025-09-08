#!/usr/bin/env python3
"""
Debug login process
"""

import asyncio
from database import Database, get_collection, USERS_COLLECTION

async def debug_login():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔍 Debugging Login Process")
        print("=" * 50)
        
        # Check all users
        print("👥 All Users in Database:")
        users = await db.users.find({}).to_list(length=10)
        for i, user in enumerate(users):
            print(f"  {i+1}. ID: {user.get('_id')}")
            print(f"      Email: {user.get('email')}")
            print(f"      Name: {user.get('name')}")
            print(f"      Created: {user.get('created_at')}")
        
        # Check users collection directly
        print(f"\n🗄️ Users Collection (get_collection):")
        users_collection = get_collection(USERS_COLLECTION)
        if users_collection is not None:
            users_from_collection = await users_collection.find({}).to_list(length=10)
            print(f"Found {len(users_from_collection)} users in collection")
            for i, user in enumerate(users_from_collection):
                print(f"  {i+1}. ID: {user.get('_id')}")
                print(f"      Email: {user.get('email')}")
        else:
            print("❌ Users collection not found")
        
        # Check specific user by email
        print(f"\n🔍 Finding User by Email 'ksufiyan38@gmail.com':")
        user_by_email = await db.users.find_one({"email": "ksufiyan38@gmail.com"})
        if user_by_email:
            print(f"✅ Found user: {user_by_email.get('_id')}")
        else:
            print("❌ User not found")
            
        # Check users collection for the same email
        if users_collection is not None:
            user_by_email_collection = await users_collection.find_one({"email": "ksufiyan38@gmail.com"})
            if user_by_email_collection:
                print(f"✅ Found user in collection: {user_by_email_collection.get('_id')}")
            else:
                print("❌ User not found in collection")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_login())
