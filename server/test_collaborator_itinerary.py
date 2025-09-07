#!/usr/bin/env python3
"""
Test that collaborator can see their itinerary
"""

import asyncio
import requests
from database import Database

async def test_collaborator_itinerary():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🧪 Testing Collaborator's Itinerary Access")
        print("=" * 50)
        
        # Login to get token
        login_data = {
            "email": "ksufiyan38@gmail.com",
            "password": "Khan0000@"
        }
        
        login_response = requests.post("http://localhost:8000/api/v1/auth/login", json=login_data)
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            return
            
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print("✅ Login successful")
        
        # Get saved itineraries
        print("\n📋 Fetching saved itineraries...")
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
            
        # Check collaborator record
        collaborator = await db.itinerary_collaborators.find_one({
            'user_id': '68bdb36909c4b05f3a1ca052'
        })
        
        if collaborator:
            print(f"\n👥 Collaborator Record:")
            print(f"  Role: {collaborator.get('role')}")
            print(f"  Collaborator Itinerary ID: {collaborator.get('collaborator_itinerary_id')}")
            
            # Check if the collaborator's itinerary exists
            if collaborator.get('collaborator_itinerary_id'):
                collaborator_itinerary = await db.saved_itineraries.find_one({
                    '_id': collaborator.get('collaborator_itinerary_id')
                })
                
                if collaborator_itinerary:
                    print(f"✅ Collaborator's itinerary exists:")
                    print(f"  Title: {collaborator_itinerary.get('title')}")
                    print(f"  User ID: {collaborator_itinerary.get('user_id')}")
                else:
                    print("❌ Collaborator's itinerary not found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_collaborator_itinerary())
