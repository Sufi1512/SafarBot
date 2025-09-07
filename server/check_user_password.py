#!/usr/bin/env python3
"""
Check user password hash
"""

import asyncio
from database import Database

async def check_user_password():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔍 Checking User Password Hash")
        print("=" * 50)
        
        # Check user in users collection
        user = await db.users.find_one({"email": "ksufiyan38@gmail.com"})
        
        if user:
            print(f"👤 User in 'users' collection:")
            print(f"  ID: {user.get('_id')}")
            print(f"  Email: {user.get('email')}")
            print(f"  Has Password: {'hashed_password' in user}")
            if 'hashed_password' in user:
                print(f"  Password Hash: {user.get('hashed_password')[:50]}...")
            else:
                print(f"  Available Fields: {list(user.keys())}")
        else:
            print("❌ User not found in 'users' collection")
            
        # Check user in user_fields collection
        user_fields = await db.user_fields.find_one({"email": "ksufiyan38@gmail.com"})
        
        if user_fields:
            print(f"\n👤 User in 'user_fields' collection:")
            print(f"  ID: {user_fields.get('_id')}")
            print(f"  Email: {user_fields.get('email')}")
            print(f"  Has Password: {'hashed_password' in user_fields}")
            if 'hashed_password' in user_fields:
                print(f"  Password Hash: {user_fields.get('hashed_password')[:50]}...")
            else:
                print(f"  Available Fields: {list(user_fields.keys())}")
        else:
            print("❌ User not found in 'user_fields' collection")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_user_password())
