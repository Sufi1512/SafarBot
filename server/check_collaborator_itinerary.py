#!/usr/bin/env python3
"""
Check collaborator's itinerary details
"""

import asyncio
from database import Database

async def check_collaborator_itinerary():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔍 Checking Collaborator's Itinerary")
        print("=" * 50)
        
        # Get the correct user ID
        user = await db.users.find_one({
            'email': 'ksufiyan38@gmail.com'
        })
        
        correct_user_id = user['_id']
        print(f"✅ User ID: {correct_user_id}")
        
        # Check the collaborator's itinerary
        collaborator_itinerary = await db.saved_itineraries.find_one({
            '_id': '68bdd89cb42ce03606c68566'
        })
        
        if collaborator_itinerary:
            print(f"📋 Collaborator's Itinerary:")
            print(f"  ID: {collaborator_itinerary.get('_id')}")
            print(f"  Title: {collaborator_itinerary.get('title')}")
            print(f"  User ID: {collaborator_itinerary.get('user_id')}")
            print(f"  Owner ID: {collaborator_itinerary.get('owner_id')}")
            print(f"  Is Collaborative: {collaborator_itinerary.get('is_collaborative')}")
            print(f"  Collaborators: {collaborator_itinerary.get('collaborators')}")
            print(f"  Collaborators Type: {type(collaborator_itinerary.get('collaborators'))}")
            
            # Check if user ID is in collaborators list
            collaborators = collaborator_itinerary.get('collaborators', [])
            if collaborators:
                print(f"  First Collaborator: {collaborators[0]}")
                print(f"  First Collaborator Type: {type(collaborators[0])}")
                print(f"  User ID in Collaborators: {correct_user_id in collaborators}")
                print(f"  String User ID in Collaborators: {str(correct_user_id) in [str(c) for c in collaborators]}")
        else:
            print("❌ Collaborator's itinerary not found")
            
        # Check all itineraries for this user
        print(f"\n📋 All Itineraries for User {correct_user_id}:")
        all_itineraries = await db.saved_itineraries.find({
            'user_id': correct_user_id
        }).to_list(length=10)
        
        for i, itinerary in enumerate(all_itineraries):
            print(f"  {i+1}. {itinerary.get('title')} - {itinerary.get('_id')}")
            
        # Check all itineraries where user is in collaborators
        print(f"\n👥 All Itineraries where User is Collaborator:")
        collaborator_itineraries = await db.saved_itineraries.find({
            'collaborators': correct_user_id
        }).to_list(length=10)
        
        for i, itinerary in enumerate(collaborator_itineraries):
            print(f"  {i+1}. {itinerary.get('title')} - {itinerary.get('_id')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_collaborator_itinerary())
