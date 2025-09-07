#!/usr/bin/env python3
"""
Fix collaborator record
"""

import asyncio
from database import Database

async def fix_collaborator():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔧 Fixing Collaborator Record")
        print("=" * 50)
        
        # Get the correct user ID
        user = await db.users.find_one({
            'email': 'ksufiyan38@gmail.com'
        })
        
        correct_user_id = user['_id']
        print(f"✅ Correct User ID: {correct_user_id}")
        
        # Find the collaborator record
        collaborator = await db.itinerary_collaborators.find_one({})
        
        if collaborator:
            print(f"👥 Found Collaborator Record:")
            print(f"  ID: {collaborator.get('_id')}")
            print(f"  Current User ID: {collaborator.get('user_id')}")
            print(f"  Itinerary ID: {collaborator.get('itinerary_id')}")
            
            # Update the collaborator record
            result = await db.itinerary_collaborators.update_one(
                {'_id': collaborator['_id']},
                {'$set': {'user_id': correct_user_id}}
            )
            
            if result.modified_count > 0:
                print("✅ Collaborator user ID updated")
            else:
                print("❌ Failed to update collaborator user ID")
        else:
            print("❌ No collaborator record found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_collaborator())
