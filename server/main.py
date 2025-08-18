from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

# Import routers - simplified for deployment
from routers import flights
from config import settings

app = FastAPI(
    title="SafarBot API",
    description="AI-powered travel planning and booking platform with MongoDB",
    version="1.0.0"
)

# CORS middleware - updated for Render backend + Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://*.vercel.com",
        "https://safarbot.vercel.app",
        "https://safarbot-git-main-sufi1512.vercel.app",
        "https://safarbot-sufi1512.vercel.app",
        "https://safarbot-frontend.vercel.app",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Database events - simplified for deployment
@app.on_event("startup")
async def startup_db_client():
    """Startup event."""
    print("✅ SafarBot API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Shutdown event."""
    print("✅ SafarBot API stopped")

# Include routers - simplified for deployment
app.include_router(flights.router, prefix="/api/v1", tags=["flights"])

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "SafarBot Flight API is running",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to SafarBot Flight API!",
        "version": "1.0.0",
        "features": [
            "Flight search and booking",
            "Real-time flight data via SerpApi",
            "Booking options and pricing"
        ],
        "endpoints": {
            "health": "/health",
            "search_flights": "/api/v1/flights/search",
            "booking_options": "/api/v1/flights/booking-options/{booking_token}",
            "popular_flights": "/api/v1/flights/popular",
            "airport_suggestions": "/api/v1/flights/airports/suggestions"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 