#!/usr/bin/env python3
"""
Test fresh login to get correct JWT token
"""

import asyncio
import requests
from database import Database

async def test_fresh_login():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔑 Testing Fresh Login")
        print("=" * 50)
        
        # Login to get fresh token
        login_data = {
            "email": "ksufiyan38@gmail.com",
            "password": "Khan0000@"
        }
        
        login_response = requests.post("http://localhost:8000/api/v1/auth/login", json=login_data)
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return
            
        token_data = login_response.json()
        token = token_data["access_token"]
        user_id = token_data["user"]["id"]
        
        print(f"✅ Login successful")
        print(f"🔑 New Token: {token[:50]}...")
        print(f"👤 User ID: {user_id}")
        
        # Verify user exists in database
        user = await db.users.find_one({'_id': user_id})
        if user:
            print(f"✅ User exists in database: {user.get('email')}")
        else:
            print(f"❌ User not found in database")
            
        # Test saved itineraries with new token
        headers = {"Authorization": f"Bearer {token}"}
        
        print(f"\n📋 Testing Saved Itineraries with New Token...")
        itineraries_response = requests.get(
            "http://localhost:8000/api/v1/saved-itinerary/",
            headers=headers
        )
        
        print(f"Status Code: {itineraries_response.status_code}")
        
        if itineraries_response.status_code == 200:
            itineraries = itineraries_response.json()
            print(f"✅ Found {len(itineraries)} itineraries")
            
            for i, itinerary in enumerate(itineraries):
                print(f"\n📋 Itinerary {i+1}:")
                print(f"  ID: {itinerary.get('id')}")
                print(f"  Title: {itinerary.get('title')}")
                print(f"  User ID: {itinerary.get('user_id')}")
                print(f"  Is Collaborative: {itinerary.get('is_collaborative')}")
                print(f"  Owner ID: {itinerary.get('owner_id')}")
                print(f"  Collaborators: {itinerary.get('collaborators')}")
        else:
            print(f"❌ Failed to fetch itineraries: {itineraries_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_fresh_login())
