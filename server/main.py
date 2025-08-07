from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables first
load_dotenv('.env')

# Import routers
from routers import flights, chat, itinerary, alerts, affiliate, auth
from config import settings
from database import Database

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

# Database events
@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB on startup."""
    try:
        await Database.connect_db()
        print("✅ Database connection established")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("⚠️  Application will start without database connection")
        # Don't raise the exception to allow the app to start
        # This is important for deployment when MongoDB might not be available

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    await Database.close_db()
    print("✅ Database connection closed")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(flights.router, prefix="/api/v1", tags=["flights"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(itinerary.router, prefix="/api/v1", tags=["itinerary"])
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])
app.include_router(affiliate.router, prefix="/api/v1", tags=["affiliate"])

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection if client exists
        if Database.client:
            await Database.client.admin.command('ping')
            db_status = "connected"
        else:
            db_status = "not_initialized"
    except Exception as e:
        db_status = f"disconnected: {str(e)[:100]}"
    
    return {
        "status": "healthy",
        "message": "SafarBot API is running",
        "database": db_status,
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    db_status = "connected" if Database.client else "disconnected"
    return {
        "message": "Welcome to SafarBot API!",
        "version": "1.0.0",
        "database": db_status,
        "status": "running",
        "features": [
            "AI-powered travel planning",
            "Flight & hotel booking",
            "Price alerts & predictions",
            "Affiliate integration",
            "User authentication" if db_status == "connected" else "Basic API (no auth)"
        ],
        "endpoints": {
            "health": "/health",
            "test": "/test",
            "authentication": "/api/v1/auth" if db_status == "connected" else "disabled",
            "search_flights": "/api/v1/flights/search",
            "booking_options": "/api/v1/flights/booking-options/{booking_token}",
            "popular_flights": "/api/v1/flights/popular",
            "airport_suggestions": "/api/v1/flights/airports",
            "chat": "/api/v1/chat",
            "chat_history": "/api/v1/chat/history",
            "generate_itinerary": "/api/v1/generate-itinerary",
            "predict_prices": "/api/v1/predict-prices"
        }
    }

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint that doesn't require database."""
    return {
        "message": "SafarBot API is working!",
        "timestamp": datetime.now().isoformat(),
        "database": "connected" if Database.client else "disconnected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 