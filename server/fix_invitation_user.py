#!/usr/bin/env python3
"""
Fix invitation user ID to match the actual user
"""

import asyncio
from database import Database

async def fix_invitation_user():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔧 Fixing Invitation User ID")
        print("=" * 50)
        
        # Get the correct user ID
        user = await db.users.find_one({
            'email': 'ksufiyan38@gmail.com'
        })
        
        if not user:
            print("❌ User not found")
            return
            
        correct_user_id = user['_id']
        print(f"✅ Correct User ID: {correct_user_id}")
        
        # Update the invitation
        result = await db.itinerary_invitations.update_one(
            {'invitation_token': '1189a15f-5844-4993-a2e1-7a3e5f369e9c'},
            {'$set': {'invited_user_id': correct_user_id}}
        )
        
        if result.modified_count > 0:
            print("✅ Invitation user ID updated")
        else:
            print("❌ Failed to update invitation user ID")
            
        # Update the collaborator record
        result2 = await db.itinerary_collaborators.update_one(
            {'itinerary_id': '68bd802b337c027969eca5a0'},
            {'$set': {'user_id': correct_user_id}}
        )
        
        if result2.modified_count > 0:
            print("✅ Collaborator user ID updated")
        else:
            print("❌ Failed to update collaborator user ID")
            
        # Verify the changes
        invitation = await db.itinerary_invitations.find_one({
            'invitation_token': '1189a15f-5844-4993-a2e1-7a3e5f369e9c'
        })
        
        if invitation:
            print(f"📧 Updated Invitation User ID: {invitation.get('invited_user_id')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_invitation_user())
