#!/usr/bin/env python3
"""
Create a proper user with correct password hash
"""

import asyncio
from database import Database
from services.auth_service import AuthService
from datetime import datetime

async def create_proper_user():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("👤 Creating Proper User")
        print("=" * 50)
        
        # Hash the password properly
        password = "Khan0000@"
        hashed_password = AuthService.hash_password(password)
        
        print(f"✅ Password hashed: {hashed_password[:50]}...")
        
        # Create user document
        user_doc = {
            "email": "ksufiyan38@gmail.com",
            "hashed_password": hashed_password,
            "first_name": "Sufiyan",
            "last_name": "Khan",
            "is_email_verified": True,
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "login_attempts": 0
        }
        
        # Insert or update user
        result = await db.user_fields.update_one(
            {"email": "ksufiyan38@gmail.com"},
            {"$set": user_doc},
            upsert=True
        )
        
        if result.upserted_id or result.modified_count > 0:
            print("✅ User created/updated successfully")
            
            # Verify the user
            user = await db.user_fields.find_one({"email": "ksufiyan38@gmail.com"})
            if user:
                print(f"👤 User ID: {user.get('_id')}")
                print(f"👤 Email: {user.get('email')}")
                print(f"👤 Has Password: {'hashed_password' in user}")
                
                # Test password verification
                if AuthService.verify_password(password, user.get('hashed_password')):
                    print("✅ Password verification successful")
                else:
                    print("❌ Password verification failed")
        else:
            print("❌ Failed to create/update user")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_proper_user())
