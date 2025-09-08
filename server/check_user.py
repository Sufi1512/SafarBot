#!/usr/bin/env python3
"""
Check user details
"""

import asyncio
from database import Database

async def check_user():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("👤 Checking User Details")
        print("=" * 50)
        
        # Check user by email
        user = await db.users.find_one({
            'email': 'ksufiyan38@gmail.com'
        })
        
        if user:
            print(f"👤 User Found:")
            print(f"  ID: {user.get('_id')}")
            print(f"  Email: {user.get('email')}")
            print(f"  Name: {user.get('name')}")
        else:
            print("❌ User not found")
            
        # Check all users
        print("\n👥 All Users:")
        users = await db.users.find({}).to_list(length=10)
        for u in users:
            print(f"  {u.get('_id')} - {u.get('email')} - {u.get('name')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_user())
