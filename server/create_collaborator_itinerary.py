#!/usr/bin/env python3
"""
Create collaborator's itinerary copy
"""

import asyncio
from datetime import datetime
from database import Database
from bson import ObjectId

async def create_collaborator_itinerary():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("📋 Creating Collaborator's Itinerary Copy")
        print("=" * 50)
        
        # Get the correct user ID
        user = await db.users.find_one({
            'email': 'ksufiyan38@gmail.com'
        })
        
        correct_user_id = user['_id']
        print(f"✅ User ID: {correct_user_id}")
        
        # Get the original itinerary
        original_itinerary = await db.saved_itineraries.find_one({
            "_id": ObjectId("68bd802b337c027969eca5a0")
        })
        
        if not original_itinerary:
            print("❌ Original itinerary not found")
            return
            
        print(f"📋 Original Itinerary: {original_itinerary.get('title')}")
        
        # Create a copy for the collaborator
        collaborator_itinerary = original_itinerary.copy()
        del collaborator_itinerary["_id"]  # Remove original ID
        del collaborator_itinerary["created_at"]  # Will be set to current time
        del collaborator_itinerary["updated_at"]  # Will be set to current time
        
        # Set new fields for collaborator's copy
        collaborator_itinerary.update({
            "user_id": correct_user_id,
            "is_collaborative": True,
            "collaborators": [correct_user_id],
            "owner_id": original_itinerary.get("user_id"),  # Keep reference to original owner
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        # Insert the collaborator's copy
        result = await db.saved_itineraries.insert_one(collaborator_itinerary)
        
        if result.inserted_id:
            print(f"✅ Collaborator's itinerary created: {result.inserted_id}")
            
            # Update the collaborator record with the new itinerary ID
            update_result = await db.itinerary_collaborators.update_one(
                {
                    "itinerary_id": ObjectId("68bd802b337c027969eca5a0"),
                    "user_id": correct_user_id
                },
                {"$set": {"collaborator_itinerary_id": result.inserted_id}}
            )
            
            if update_result.modified_count > 0:
                print("✅ Collaborator record updated with itinerary ID")
            else:
                print("❌ Failed to update collaborator record")
        else:
            print("❌ Failed to create collaborator's itinerary")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_collaborator_itinerary())
