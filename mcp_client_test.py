#!/usr/bin/env python3
"""
Test client for SafarBot MCP Server
Demonstrates how to use the MCP server for itinerary generation
"""

import asyncio
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def test_mcp_server():
    """Test the MCP server functionality"""
    
    # Server parameters
    server_params = StdioServerParameters(
        command="python",
        args=["mcp_server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the session
            await session.initialize()
            
            print("🔗 Connected to SafarBot MCP Server")
            
            # Test 1: List available tools
            print("\n📋 Available Tools:")
            tools = await session.list_tools()
            for tool in tools.tools:
                print(f"  - {tool.name}: {tool.description}")
            
            # Test 2: Generate an itinerary
            print("\n✈️  Generating Itinerary...")
            itinerary_result = await session.call_tool(
                "generate_itinerary",
                {
                    "destination": "Paris, France",
                    "start_date": "2024-06-01",
                    "end_date": "2024-06-05",
                    "travelers": 2,
                    "interests": ["culture", "food", "art"],
                    "budget": 2000,
                    "accommodation_type": "mid-range"
                }
            )
            
            print("Itinerary Result:")
            for content in itinerary_result.content:
                if hasattr(content, 'text'):
                    print(json.dumps(json.loads(content.text), indent=2))
            
            # Test 3: Get place details
            print("\n🏛️  Getting Place Details...")
            place_result = await session.call_tool(
                "get_place_details",
                {
                    "place_name": "Eiffel Tower",
                    "location": "Paris, France"
                }
            )
            
            print("Place Details:")
            for content in place_result.content:
                if hasattr(content, 'text'):
                    print(json.dumps(json.loads(content.text), indent=2))
            
            # Test 4: Get weather forecast
            print("\n🌤️  Getting Weather Forecast...")
            weather_result = await session.call_tool(
                "get_weather_forecast",
                {
                    "destination": "Paris, France",
                    "start_date": "2024-06-01",
                    "end_date": "2024-06-05"
                }
            )
            
            print("Weather Forecast:")
            for content in weather_result.content:
                if hasattr(content, 'text'):
                    print(json.dumps(json.loads(content.text), indent=2))
            
            # Test 5: Search for places
            print("\n🔍 Searching for Places...")
            search_result = await session.call_tool(
                "search_places",
                {
                    "query": "restaurants",
                    "location": "Paris, France",
                    "place_type": "restaurant"
                }
            )
            
            print("Search Results:")
            for content in search_result.content:
                if hasattr(content, 'text'):
                    print(json.dumps(json.loads(content.text), indent=2))
            
            print("\n✅ MCP Server tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_mcp_server())
