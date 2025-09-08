#!/usr/bin/env python3
"""
Debug the API query to see what's being returned
"""

import asyncio
from database import Database

async def debug_api_query():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔍 Debugging API Query")
        print("=" * 50)
        
        # Get the correct user ID
        user = await db.users.find_one({
            'email': 'ksufiyan38@gmail.com'
        })
        
        user_id = str(user['_id'])
        print(f"✅ User ID: {user_id}")
        
        # Simulate the API query
        print(f"\n📋 Owned Itineraries Query:")
        owned_query = {"user_id": user_id}
        print(f"Query: {owned_query}")
        
        owned_cursor = db.saved_itineraries.find(owned_query).sort("updated_at", -1)
        owned_itineraries = await owned_cursor.to_list(length=None)
        
        print(f"Found {len(owned_itineraries)} owned itineraries:")
        for i, itinerary in enumerate(owned_itineraries):
            print(f"  {i+1}. {itinerary.get('title')} - {itinerary.get('_id')} - {itinerary.get('user_id')}")
        
        print(f"\n👥 Collaborative Itineraries Query:")
        collaborative_query = {
            "collaborators": user_id,
            "user_id": {"$ne": user_id}
        }
        print(f"Query: {collaborative_query}")
        
        collaborative_cursor = db.saved_itineraries.find(collaborative_query).sort("updated_at", -1)
        collaborative_itineraries = await collaborative_cursor.to_list(length=None)
        
        print(f"Found {len(collaborative_itineraries)} collaborative itineraries:")
        for i, itinerary in enumerate(collaborative_itineraries):
            print(f"  {i+1}. {itinerary.get('title')} - {itinerary.get('_id')} - {itinerary.get('user_id')}")
            print(f"      Collaborators: {itinerary.get('collaborators')}")
        
        # Check all itineraries in database
        print(f"\n🗄️ All Itineraries in Database:")
        all_itineraries = await db.saved_itineraries.find({}).to_list(length=10)
        for i, itinerary in enumerate(all_itineraries):
            print(f"  {i+1}. {itinerary.get('title')} - {itinerary.get('_id')}")
            print(f"      User ID: {itinerary.get('user_id')}")
            print(f"      Collaborators: {itinerary.get('collaborators')}")
            print(f"      Is Collaborative: {itinerary.get('is_collaborative')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_api_query())
