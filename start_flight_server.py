#!/usr/bin/env python3
"""
Simple server startup script for flight service only
"""

import os
import sys
from pathlib import Path

# Add the server directory to the path
server_dir = Path(__file__).parent / "server"
sys.path.append(str(server_dir))

# Set environment variables
# Note: You must set SERP_API_KEY in your environment or .env file
# The server will fail to start if no valid API key is provided

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv(server_dir / '.env')
    
    # Import only the flights router
    from routers.flights import router as flights_router
    
    app = FastAPI(
        title="SafarBot Flight API",
        description="Flight booking API with SerpApi integration",
        version="1.0.0"
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include only flights router
    app.include_router(flights_router, prefix="/api/v1", tags=["flights"])
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "SafarBot Flight API"}
    
    @app.get("/")
    async def root():
        return {
            "message": "SafarBot Flight API",
            "docs": "/docs",
            "health": "/health"
        }
    
    if __name__ == "__main__":
        import uvicorn
        print("🚀 Starting SafarBot Flight Server...")
        print("   This server includes SerpApi integration for flight search and booking options")
        print("   Access at: http://localhost:8000")
        print("   API docs at: http://localhost:8000/docs")
        print("   Health check at: http://localhost:8000/health")
        print()
        print("📋 Available endpoints:")
        print("   POST /api/v1/flights/search - Search for flights")
        print("   GET  /api/v1/flights/booking-options/{token} - Get booking options")
        print("   GET  /api/v1/flights/popular - Get popular flights")
        print("   GET  /api/v1/flights/airports/suggestions - Get airport suggestions")
        print()
        uvicorn.run(app, host="0.0.0.0", port=8000)
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required dependencies:")
    print("pip install fastapi uvicorn python-dotenv serpapi")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1) 