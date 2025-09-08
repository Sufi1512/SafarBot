#!/usr/bin/env python3
"""
Test script for collaboration invitation functionality
"""

import asyncio
import requests
import json
import os
from datetime import datetime

class CollaborationTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api/v1"
        self.token = None
        self.user_email = None
        self.itinerary_id = None
        
    def print_separator(self, title):
        print(f"\n{'='*60}")
        print(f"  {title}")
        print(f"{'='*60}")
    
    def print_response(self, response, title="Response"):
        print(f"\n{title}:")
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")
    
    def login(self, email, password):
        """Login and get JWT token"""
        self.print_separator("LOGIN")
        
        url = f"{self.api_url}/auth/login"
        data = {
            "email": email,
            "password": password
        }
        
        print(f"Logging in as: {email}")
        response = requests.post(url, json=data)
        self.print_response(response, "Login Response")
        
        if response.status_code == 200:
            result = response.json()
            self.token = result.get("access_token")
            self.user_email = email
            print(f"✅ Login successful! Token: {self.token[:20]}...")
            return True
        else:
            print("❌ Login failed!")
            return False
    
    def get_itineraries(self):
        """Get user's saved itineraries"""
        self.print_separator("GET ITINERARIES")
        
        if not self.token:
            print("❌ No token available. Please login first.")
            return False
        
        url = f"{self.api_url}/saved-itinerary/"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        print("Fetching user itineraries...")
        response = requests.get(url, headers=headers)
        self.print_response(response, "Itineraries Response")
        
        if response.status_code == 200:
            result = response.json()
            # Handle both list response and object with data property
            if isinstance(result, list):
                itineraries = result
            else:
                itineraries = result.get("data", [])
            
            if itineraries:
                self.itinerary_id = itineraries[0]["id"]
                print(f"✅ Found {len(itineraries)} itineraries. Using first one: {self.itinerary_id}")
                return True
            else:
                print("❌ No itineraries found. Please create an itinerary first.")
                return False
        else:
            print("❌ Failed to fetch itineraries!")
            return False
    
    def send_invitation(self, invite_email, role="editor", message=None):
        """Send collaboration invitation"""
        self.print_separator("SEND INVITATION")
        
        if not self.token:
            print("❌ No token available. Please login first.")
            return False
        
        if not self.itinerary_id:
            print("❌ No itinerary ID available. Please get itineraries first.")
            return False
        
        url = f"{self.api_url}/collaboration/invite"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "itinerary_id": self.itinerary_id,
            "email": invite_email,
            "role": role,
            "message": message
        }
        
        print(f"Sending invitation to: {invite_email}")
        print(f"Itinerary ID: {self.itinerary_id}")
        print(f"Role: {role}")
        if message:
            print(f"Message: {message}")
        
        response = requests.post(url, json=data, headers=headers)
        self.print_response(response, "Invitation Response")
        
        if response.status_code == 200:
            print("✅ Invitation sent successfully!")
            return True
        else:
            print("❌ Failed to send invitation!")
            return False
    
    def get_invitations(self):
        """Get user's pending invitations"""
        self.print_separator("GET INVITATIONS")
        
        if not self.token:
            print("❌ No token available. Please login first.")
            return False
        
        url = f"{self.api_url}/collaboration/invitations"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        print("Fetching pending invitations...")
        response = requests.get(url, headers=headers)
        self.print_response(response, "Invitations Response")
        
        if response.status_code == 200:
            print("✅ Invitations fetched successfully!")
            return True
        else:
            print("❌ Failed to fetch invitations!")
            return False
    
    def get_collaborators(self):
        """Get collaborators for an itinerary"""
        self.print_separator("GET COLLABORATORS")
        
        if not self.token:
            print("❌ No token available. Please login first.")
            return False
        
        if not self.itinerary_id:
            print("❌ No itinerary ID available. Please get itineraries first.")
            return False
        
        url = f"{self.api_url}/collaboration/collaborators/{self.itinerary_id}"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        print(f"Fetching collaborators for itinerary: {self.itinerary_id}")
        response = requests.get(url, headers=headers)
        self.print_response(response, "Collaborators Response")
        
        if response.status_code == 200:
            print("✅ Collaborators fetched successfully!")
            return True
        else:
            print("❌ Failed to fetch collaborators!")
            return False
    
    def run_full_test(self):
        """Run a complete test sequence"""
        self.print_separator("COLLABORATION API TEST SUITE")
        print(f"Testing against: {self.base_url}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test 1: Login
        email = input("\nEnter your email: ").strip()
        password = input("Enter your password: ").strip()
        
        if not self.login(email, password):
            return False
        
        # Test 2: Get itineraries
        if not self.get_itineraries():
            return False
        
        # Test 3: Send invitation
        invite_email = input("\nEnter email to invite: ").strip()
        if not invite_email:
            invite_email = "test@example.com"
        
        role = input("Enter role (viewer/editor/admin) [editor]: ").strip() or "editor"
        message = input("Enter invitation message (optional): ").strip() or None
        
        if not self.send_invitation(invite_email, role, message):
            return False
        
        # Test 4: Get invitations
        self.get_invitations()
        
        # Test 5: Get collaborators
        self.get_collaborators()
        
        self.print_separator("TEST COMPLETED")
        print("✅ All tests completed!")
        return True

def main():
    """Main function to run tests"""
    print("🚀 SafarBot Collaboration API Tester")
    print("This script will test the collaboration invitation functionality")
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code != 200:
            print("❌ Server is not responding properly")
            return
    except requests.exceptions.RequestException:
        print("❌ Server is not running. Please start the server first:")
        print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return
    
    print("✅ Server is running")
    
    # Create tester instance
    tester = CollaborationTester()
    
    # Run tests
    try:
        tester.run_full_test()
    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")

if __name__ == "__main__":
    main()
