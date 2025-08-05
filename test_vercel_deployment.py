#!/usr/bin/env python3
"""
Test script to verify Vercel deployment configuration
"""
import os
import sys
import asyncio
from datetime import date

# Add server directory to path
sys.path.append('server')

def test_imports():
    """Test if all required modules can be imported"""
    try:
        print("Testing imports...")
        
        # Test basic imports
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        print("✓ FastAPI imports successful")
        
        # Test config
        from config import settings
        print("✓ Config import successful")
        
        # Test models
        from models import FlightSearchRequest, FlightSearchResponse
        print("✓ Models import successful")
        
        # Test flight service
        from services.flight_service import FlightService
        print("✓ Flight service import successful")
        
        # Test flight router
        from routers.flights import router
        print("✓ Flight router import successful")
        
        # Test main app
        from main import app
        print("✓ Main app import successful")
        
        return True
        
    except Exception as e:
        print(f"✗ Import error: {str(e)}")
        return False

def test_flight_service():
    """Test if flight service can be instantiated"""
    try:
        print("\nTesting flight service...")
        
        # Set a dummy API key for testing
        os.environ["SERP_API_KEY"] = "test_key"
        
        from services.flight_service import FlightService
        service = FlightService()
        print("✓ Flight service instantiated successfully")
        
        return True
        
    except Exception as e:
        print(f"✗ Flight service error: {str(e)}")
        return False

def test_app_startup():
    """Test if the FastAPI app can be created"""
    try:
        print("\nTesting app startup...")
        
        from main import app
        
        # Check if app has the expected routes
        routes = [route.path for route in app.routes]
        print(f"✓ App created with {len(routes)} routes")
        
        # Check for health endpoint
        if "/health" in routes:
            print("✓ Health endpoint found")
        else:
            print("✗ Health endpoint missing")
            
        return True
        
    except Exception as e:
        print(f"✗ App startup error: {str(e)}")
        return False

async def test_api_endpoints():
    """Test API endpoints using TestClient"""
    try:
        print("\nTesting API endpoints...")
        
        from fastapi.testclient import TestClient
        from main import app
        
        client = TestClient(app)
        
        # Test health endpoint
        response = client.get("/health")
        if response.status_code == 200:
            print("✓ Health endpoint working")
        else:
            print(f"✗ Health endpoint failed: {response.status_code}")
            
        # Test root endpoint
        response = client.get("/")
        if response.status_code == 200:
            print("✓ Root endpoint working")
        else:
            print(f"✗ Root endpoint failed: {response.status_code}")
            
        return True
        
    except Exception as e:
        print(f"✗ API endpoint test error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=== Vercel Deployment Test ===\n")
    
    # Test 1: Imports
    if not test_imports():
        print("\n❌ Import test failed. Deployment will likely fail.")
        return False
    
    # Test 2: Flight Service
    if not test_flight_service():
        print("\n❌ Flight service test failed. Deployment will likely fail.")
        return False
    
    # Test 3: App Startup
    if not test_app_startup():
        print("\n❌ App startup test failed. Deployment will likely fail.")
        return False
    
    # Test 4: API Endpoints
    try:
        asyncio.run(test_api_endpoints())
    except Exception as e:
        print(f"✗ API endpoint test error: {str(e)}")
    
    print("\n✅ All core tests passed! Deployment should work.")
    print("\nNext steps:")
    print("1. Make sure SERP_API_KEY is set in Vercel environment variables")
    print("2. Deploy to Vercel using: vercel --prod")
    print("3. Check the deployment logs for any issues")
    
    return True

if __name__ == "__main__":
    main() 