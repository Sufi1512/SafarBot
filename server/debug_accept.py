#!/usr/bin/env python3
"""
Debug invitation acceptance process
"""

import asyncio
from database import Database

async def debug_accept():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🔍 Debugging Invitation Acceptance")
        print("=" * 50)
        
        # Check invitation
        invitation = await db.itinerary_invitations.find_one({
            'invitation_token': '1189a15f-5844-4993-a2e1-7a3e5f369e9c'
        })
        
        if invitation:
            print("📧 Invitation Details:")
            print(f"  ID: {invitation.get('_id')}")
            print(f"  Token: {invitation.get('invitation_token')}")
            print(f"  Invited Email: {invitation.get('invited_email')}")
            print(f"  Invited User ID: {invitation.get('invited_user_id')}")
            print(f"  Itinerary ID: {invitation.get('itinerary_id')}")
            print(f"  Owner ID: {invitation.get('owner_id')}")
            print(f"  Status: {invitation.get('status')}")
            
            # Check if original itinerary exists
            original_itinerary = await db.saved_itineraries.find_one({
                "_id": invitation["itinerary_id"]
            })
            
            if original_itinerary:
                print("\n📋 Original Itinerary Found:")
                print(f"  Title: {original_itinerary.get('title')}")
                print(f"  User ID: {original_itinerary.get('user_id')}")
                print(f"  Owner ID: {original_itinerary.get('owner_id')}")
            else:
                print("\n❌ Original itinerary not found")
                
            # Check collaborator record
            collaborator = await db.itinerary_collaborators.find_one({
                'itinerary_id': invitation.get('itinerary_id')
            })
            
            if collaborator:
                print("\n👥 Collaborator Record:")
                print(f"  User ID: {collaborator.get('user_id')}")
                print(f"  Role: {collaborator.get('role')}")
                print(f"  Collaborator Itinerary ID: {collaborator.get('collaborator_itinerary_id')}")
            else:
                print("\n❌ No collaborator record found")
                
        else:
            print("❌ Invitation not found")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_accept())
