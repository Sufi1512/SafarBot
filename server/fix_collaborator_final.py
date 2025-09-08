#!/usr/bin/env python3
"""
Fix collaborator to use correct user ID
"""

import asyncio
from database import Database

async def fix_collaborator_final():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔧 Final Fix for Collaborator")
        print("=" * 50)
        
        # The correct user ID from user_fields collection
        correct_user_id = "6894590d0368e75cd399fedb"
        print(f"✅ Correct User ID: {correct_user_id}")
        
        # Update the collaborator record
        result = await db.itinerary_collaborators.update_one(
            {'itinerary_id': '68bd802b337c027969eca5a0'},
            {'$set': {'user_id': correct_user_id}}
        )
        
        if result.modified_count > 0:
            print("✅ Collaborator user ID updated")
        else:
            print("❌ Failed to update collaborator user ID")
            
        # Update the collaborator's itinerary
        result2 = await db.saved_itineraries.update_one(
            {'_id': '68bdd89cb42ce03606c68566'},
            {'$set': {
                'user_id': correct_user_id,
                'collaborators': [correct_user_id]
            }}
        )
        
        if result2.modified_count > 0:
            print("✅ Collaborator's itinerary updated")
        else:
            print("❌ Failed to update collaborator's itinerary")
            
        # Update the invitation
        result3 = await db.itinerary_invitations.update_one(
            {'invitation_token': '1189a15f-5844-4993-a2e1-7a3e5f369e9c'},
            {'$set': {'invited_user_id': correct_user_id}}
        )
        
        if result3.modified_count > 0:
            print("✅ Invitation user ID updated")
        else:
            print("❌ Failed to update invitation user ID")
            
        # Verify the changes
        print(f"\n🔍 Verification:")
        
        # Check collaborator record
        collaborator = await db.itinerary_collaborators.find_one({
            'itinerary_id': '68bd802b337c027969eca5a0'
        })
        
        if collaborator:
            print(f"👥 Collaborator User ID: {collaborator.get('user_id')}")
            print(f"👥 Collaborator Itinerary ID: {collaborator.get('collaborator_itinerary_id')}")
        
        # Check collaborator's itinerary
        collaborator_itinerary = await db.saved_itineraries.find_one({
            '_id': '68bdd89cb42ce03606c68566'
        })
        
        if collaborator_itinerary:
            print(f"📋 Collaborator Itinerary User ID: {collaborator_itinerary.get('user_id')}")
            print(f"📋 Collaborator Itinerary Collaborators: {collaborator_itinerary.get('collaborators')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_collaborator_final())
