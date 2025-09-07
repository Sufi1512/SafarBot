#!/usr/bin/env python3
"""
Test invitation acceptance and verify itinerary is saved for collaborator
"""

import asyncio
import requests
from database import Database

async def test_accept_invitation():
    try:
        await Database.connect_db()
        db = Database.client.SafarBot
        
        print("🧪 Testing Invitation Acceptance")
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
        
        # Check invitation status before acceptance
        invitation = await db.itinerary_invitations.find_one({
            'invitation_token': '1189a15f-5844-4993-a2e1-7a3e5f369e9c'
        })
        
        if invitation:
            print(f"📧 Invitation Status: {invitation.get('status')}")
            print(f"📧 Invited Email: {invitation.get('invited_email')}")
        else:
            print("❌ Invitation not found")
            return
        
        # Accept invitation
        print("\n🔄 Accepting invitation...")
        accept_response = requests.post(
            f"http://localhost:8000/api/v1/collaboration/invitation/1189a15f-5844-4993-a2e1-7a3e5f369e9c/accept",
            headers=headers
        )
        
        print(f"Accept Response Status: {accept_response.status_code}")
        print(f"Accept Response: {accept_response.text}")
        
        if accept_response.status_code == 200:
            print("✅ Invitation accepted successfully!")
            
            # Check if collaborator record was created
            collaborator = await db.itinerary_collaborators.find_one({
                'user_id': invitation.get('invited_user_id'),
                'itinerary_id': invitation.get('itinerary_id')
            })
            
            if collaborator:
                print(f"✅ Collaborator record created: {collaborator.get('_id')}")
                print(f"   Role: {collaborator.get('role')}")
                print(f"   Collaborator Itinerary ID: {collaborator.get('collaborator_itinerary_id')}")
                
                # Check if collaborator's itinerary was created
                if collaborator.get('collaborator_itinerary_id'):
                    collaborator_itinerary = await db.saved_itineraries.find_one({
                        '_id': collaborator.get('collaborator_itinerary_id')
                    })
                    
                    if collaborator_itinerary:
                        print("✅ Collaborator's itinerary copy created!")
                        print(f"   Title: {collaborator_itinerary.get('title')}")
                        print(f"   User ID: {collaborator_itinerary.get('user_id')}")
                        print(f"   Owner ID: {collaborator_itinerary.get('owner_id')}")
                        print(f"   Is Collaborative: {collaborator_itinerary.get('is_collaborative')}")
                    else:
                        print("❌ Collaborator's itinerary copy not found")
                else:
                    print("❌ No collaborator itinerary ID found")
            else:
                print("❌ Collaborator record not found")
                
            # Check invitation status after acceptance
            updated_invitation = await db.itinerary_invitations.find_one({
                'invitation_token': '1189a15f-5844-4993-a2e1-7a3e5f369e9c'
            })
            
            if updated_invitation:
                print(f"📧 Updated Invitation Status: {updated_invitation.get('status')}")
        else:
            print(f"❌ Failed to accept invitation: {accept_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_accept_invitation())
