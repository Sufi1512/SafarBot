#!/usr/bin/env python3
"""
MCP Server for SafarBot Itinerary Generation
Provides itinerary generation capabilities through Model Context Protocol
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, date
import sys
import os

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mcp import Server, types
from mcp.server import NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.types as mcp_types

# Import your existing services
from services.itinerary_service import ItineraryService
from services.unified_itinerary_service import UnifiedItineraryService
from services.place_service import PlaceService
from services.weather_service import WeatherService
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SafarBotMCPServer:
    def __init__(self):
        self.server = Server("safarbot-itinerary")
        self.itinerary_service = ItineraryService()
        self.unified_service = UnifiedItineraryService()
        self.place_service = PlaceService()
        self.weather_service = WeatherService()
        
        # Register tools
        self._register_tools()
        
    def _register_tools(self):
        """Register all available tools with the MCP server"""
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[mcp_types.Tool]:
            """List all available tools"""
            return [
                mcp_types.Tool(
                    name="generate_itinerary",
                    description="Generate a complete travel itinerary with places, activities, and recommendations",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "destination": {
                                "type": "string",
                                "description": "Travel destination (city, country, or region)"
                            },
                            "start_date": {
                                "type": "string",
                                "description": "Start date in YYYY-MM-DD format"
                            },
                            "end_date": {
                                "type": "string", 
                                "description": "End date in YYYY-MM-DD format"
                            },
                            "travelers": {
                                "type": "integer",
                                "description": "Number of travelers",
                                "default": 1
                            },
                            "budget": {
                                "type": "number",
                                "description": "Budget in USD (optional)"
                            },
                            "interests": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of interests (e.g., ['culture', 'food', 'adventure'])"
                            },
                            "accommodation_type": {
                                "type": "string",
                                "description": "Type of accommodation (budget, mid-range, luxury)",
                                "default": "mid-range"
                            }
                        },
                        "required": ["destination", "start_date", "end_date"]
                    }
                ),
                mcp_types.Tool(
                    name="get_place_details",
                    "description": "Get detailed information about a specific place",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "place_name": {
                                "type": "string",
                                "description": "Name of the place to get details for"
                            },
                            "location": {
                                "type": "string",
                                "description": "Location context (city, country)"
                            }
                        },
                        "required": ["place_name"]
                    }
                ),
                mcp_types.Tool(
                    name="get_weather_forecast",
                    "description": "Get weather forecast for a destination",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "destination": {
                                "type": "string",
                                "description": "Destination to get weather for"
                            },
                            "start_date": {
                                "type": "string",
                                "description": "Start date in YYYY-MM-DD format"
                            },
                            "end_date": {
                                "type": "string",
                                "description": "End date in YYYY-MM-DD format"
                            }
                        },
                        "required": ["destination", "start_date", "end_date"]
                    }
                ),
                mcp_types.Tool(
                    name="search_places",
                    "description": "Search for places of interest in a destination",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query (e.g., 'restaurants', 'museums', 'beaches')"
                            },
                            "location": {
                                "type": "string",
                                "description": "Location to search in"
                            },
                            "place_type": {
                                "type": "string",
                                "description": "Type of place (restaurant, attraction, hotel, etc.)"
                            }
                        },
                        "required": ["query", "location"]
                    }
                ),
                mcp_types.Tool(
                    name="get_travel_recommendations",
                    "description": "Get personalized travel recommendations based on preferences",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "destination": {
                                "type": "string",
                                "description": "Travel destination"
                            },
                            "interests": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of interests"
                            },
                            "budget_range": {
                                "type": "string",
                                "description": "Budget range (budget, mid-range, luxury)"
                            },
                            "duration_days": {
                                "type": "integer",
                                "description": "Number of days for the trip"
                            }
                        },
                        "required": ["destination"]
                    }
                )
            ]
        
        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[mcp_types.TextContent]:
            """Handle tool calls"""
            try:
                if name == "generate_itinerary":
                    return await self._generate_itinerary(arguments)
                elif name == "get_place_details":
                    return await self._get_place_details(arguments)
                elif name == "get_weather_forecast":
                    return await self._get_weather_forecast(arguments)
                elif name == "search_places":
                    return await self._search_places(arguments)
                elif name == "get_travel_recommendations":
                    return await self._get_travel_recommendations(arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")
            except Exception as e:
                logger.error(f"Error in tool {name}: {str(e)}")
                return [mcp_types.TextContent(
                    type="text",
                    text=f"Error: {str(e)}"
                )]
    
    async def _generate_itinerary(self, args: Dict[str, Any]) -> List[mcp_types.TextContent]:
        """Generate a complete travel itinerary"""
        try:
            # Prepare the request
            request_data = {
                "destination": args["destination"],
                "start_date": args["start_date"],
                "end_date": args["end_date"],
                "travelers": args.get("travelers", 1),
                "budget": args.get("budget"),
                "interests": args.get("interests", []),
                "accommodation_type": args.get("accommodation_type", "mid-range")
            }
            
            # Generate itinerary using your existing service
            result = await self.unified_service.generate_complete_itinerary(request_data)
            
            # Format the response
            response = {
                "status": "success",
                "itinerary": result.get("itinerary", {}),
                "additional_places": result.get("additional_places", {}),
                "summary": result.get("summary", {}),
                "generated_at": datetime.now().isoformat()
            }
            
            return [mcp_types.TextContent(
                type="text",
                text=json.dumps(response, indent=2, ensure_ascii=False)
            )]
            
        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            return [mcp_types.TextContent(
                type="text",
                text=f"Error generating itinerary: {str(e)}"
            )]
    
    async def _get_place_details(self, args: Dict[str, Any]) -> List[mcp_types.TextContent]:
        """Get detailed information about a place"""
        try:
            place_name = args["place_name"]
            location = args.get("location", "")
            
            # Use your existing place service
            details = await self.place_service.get_place_details(place_name, location)
            
            return [mcp_types.TextContent(
                type="text",
                text=json.dumps(details, indent=2, ensure_ascii=False)
            )]
            
        except Exception as e:
            logger.error(f"Error getting place details: {str(e)}")
            return [mcp_types.TextContent(
                type="text",
                text=f"Error getting place details: {str(e)}"
            )]
    
    async def _get_weather_forecast(self, args: Dict[str, Any]) -> List[mcp_types.TextContent]:
        """Get weather forecast for a destination"""
        try:
            destination = args["destination"]
            start_date = args["start_date"]
            end_date = args["end_date"]
            
            # Use your existing weather service
            forecast = await self.weather_service.get_weather_forecast(
                destination, start_date, end_date
            )
            
            return [mcp_types.TextContent(
                type="text",
                text=json.dumps(forecast, indent=2, ensure_ascii=False)
            )]
            
        except Exception as e:
            logger.error(f"Error getting weather forecast: {str(e)}")
            return [mcp_types.TextContent(
                type="text",
                text=f"Error getting weather forecast: {str(e)}"
            )]
    
    async def _search_places(self, args: Dict[str, Any]) -> List[mcp_types.TextContent]:
        """Search for places of interest"""
        try:
            query = args["query"]
            location = args["location"]
            place_type = args.get("place_type", "")
            
            # Use your existing place service
            results = await self.place_service.search_places(query, location, place_type)
            
            return [mcp_types.TextContent(
                type="text",
                text=json.dumps(results, indent=2, ensure_ascii=False)
            )]
            
        except Exception as e:
            logger.error(f"Error searching places: {str(e)}")
            return [mcp_types.TextContent(
                type="text",
                text=f"Error searching places: {str(e)}"
            )]
    
    async def _get_travel_recommendations(self, args: Dict[str, Any]) -> List[mcp_types.TextContent]:
        """Get personalized travel recommendations"""
        try:
            destination = args["destination"]
            interests = args.get("interests", [])
            budget_range = args.get("budget_range", "mid-range")
            duration_days = args.get("duration_days", 7)
            
            # Generate recommendations using your existing service
            recommendations = await self.itinerary_service.get_recommendations(
                destination, interests, budget_range, duration_days
            )
            
            return [mcp_types.TextContent(
                type="text",
                text=json.dumps(recommendations, indent=2, ensure_ascii=False)
            )]
            
        except Exception as e:
            logger.error(f"Error getting travel recommendations: {str(e)}")
            return [mcp_types.TextContent(
                type="text",
                text=f"Error getting travel recommendations: {str(e)}"
            )]
    
    async def run(self):
        """Run the MCP server"""
        logger.info("Starting SafarBot MCP Server...")
        
        # Initialize the server
        async with self.server:
            await self.server.run()

async def main():
    """Main entry point"""
    server = SafarBotMCPServer()
    await server.run()

if __name__ == "__main__":
    asyncio.run(main())
