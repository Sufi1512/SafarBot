#!/usr/bin/env python3
"""
Simple test script for weather service without full server dependencies
"""

import os
import sys
import asyncio
import requests
from typing import Dict, Any

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Mock settings for testing
class MockSettings:
    def __init__(self):
        self.open_weather_api_key = os.getenv("OPEN_WEATHER_API_KEY")

# Mock the settings
import config
config.settings = MockSettings()

# Import weather service
from services.weather_service import WeatherService

async def test_weather_service():
    """Test the weather service functionality"""
    print("🌤️  Testing Weather Service Integration")
    print("=" * 50)
    
    weather_service = WeatherService()
    
    # Test 1: Check API key configuration
    print("\n1. Testing API Key Configuration:")
    if weather_service.api_key:
        print(f"   ✅ API Key configured: {weather_service.api_key[:8]}...")
    else:
        print("   ⚠️  No API key found. Set OPEN_WEATHER_API_KEY environment variable")
        print("   📝 You can still test the service structure")
    
    # Test 2: Test weather service methods (without API calls if no key)
    print("\n2. Testing Service Methods:")
    
    if weather_service.api_key:
        print("   🔍 Testing current weather for London...")
        try:
            result = await weather_service.get_current_weather("London", "GB")
            if "error" in result:
                print(f"   ❌ Error: {result['error']}")
            else:
                print(f"   ✅ Success! Temperature: {result['current']['temperature']}°C")
                print(f"   📍 Location: {result['location']['city']}, {result['location']['country']}")
                print(f"   🌡️  Conditions: {result['current']['description']}")
        except Exception as e:
            print(f"   ❌ Exception: {e}")
    else:
        print("   ⏭️  Skipping API tests (no API key)")
    
    # Test 3: Test weather formatting
    print("\n3. Testing Weather Formatting:")
    mock_weather_data = {
        "location": {"city": "London", "country": "GB"},
        "current": {
            "temperature": 15,
            "description": "partly cloudy",
            "humidity": 65,
            "wind_speed": 3.2
        }
    }
    
    formatted = weather_service.format_weather_for_itinerary(mock_weather_data)
    print(f"   📝 Formatted weather: {formatted}")
    
    # Test 4: Test recommendations
    print("\n4. Testing Weather Recommendations:")
    recommendations = weather_service.get_weather_recommendations(mock_weather_data)
    for i, rec in enumerate(recommendations, 1):
        print(f"   💡 {i}. {rec}")
    
    print("\n" + "=" * 50)
    print("🎉 Weather service test completed!")

def test_api_endpoints():
    """Test API endpoints if server is running"""
    print("\n🌐 Testing API Endpoints:")
    print("   📡 Make sure your server is running on http://localhost:8000")
    
    base_url = "http://localhost:8000/api/v1/weather"
    
    endpoints = [
        f"{base_url}/current?city=London&country_code=GB",
        f"{base_url}/forecast?city=Paris&days=3",
        f"{base_url}/coordinates?lat=40.7128&lon=-74.0060",
        f"{base_url}/itinerary-format?city=Tokyo"
    ]
    
    for endpoint in endpoints:
        print(f"   🔗 {endpoint}")
    
    print("\n   💡 Use curl or Postman to test these endpoints:")
    print("   curl 'http://localhost:8000/api/v1/weather/current?city=London'")

if __name__ == "__main__":
    print("🚀 SafarBot Weather Integration Test")
    print("=" * 50)
    
    # Run async test
    asyncio.run(test_weather_service())
    
    # Show API endpoint info
    test_api_endpoints()
    
    print("\n📋 Next Steps:")
    print("   1. Set OPEN_WEATHER_API_KEY in your .env file")
    print("   2. Start the server: python main.py")
    print("   3. Test endpoints with curl or Postman")
    print("   4. Check the FastAPI docs at http://localhost:8000/docs")
