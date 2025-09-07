#!/usr/bin/env python3
"""
Check for duplicate users
"""

import asyncio
from database import Database

async def check_duplicate_users():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("👥 Checking for Duplicate Users")
        print("=" * 50)
        
        # Check all users with the same email
        users = await db.users.find({'email': 'ksufiyan38@gmail.com'}).to_list(length=10)
        
        print(f"Found {len(users)} users with email 'ksufiyan38@gmail.com':")
        for i, user in enumerate(users):
            print(f"  {i+1}. ID: {user.get('_id')}")
            print(f"      Email: {user.get('email')}")
            print(f"      Name: {user.get('name')}")
            print(f"      Created: {user.get('created_at')}")
        
        # Check which user ID is in the JWT token
        jwt_user_id = "6894590d0368e75cd399fedb"
        print(f"\n🔑 JWT Token User ID: {jwt_user_id}")
        
        # Check if this user exists
        jwt_user = await db.users.find_one({'_id': jwt_user_id})
        if jwt_user:
            print(f"✅ JWT User exists: {jwt_user.get('email')}")
        else:
            print(f"❌ JWT User not found")
            
        # Check which user has itineraries
        print(f"\n📋 Checking Itineraries for Each User:")
        for user in users:
            user_id = str(user['_id'])
            itineraries = await db.saved_itineraries.find({'user_id': user_id}).to_list(length=5)
            print(f"  User {user_id}: {len(itineraries)} itineraries")
            
            # Also check as ObjectId
            itineraries_objid = await db.saved_itineraries.find({'user_id': user['_id']}).to_list(length=5)
            print(f"  User {user['_id']} (ObjectId): {len(itineraries_objid)} itineraries")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_duplicate_users())
