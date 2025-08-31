from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

# Import routers
from routers import flights, chat, itinerary, auth
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
app.include_router(auth, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(flights, prefix="/api/v1", tags=["flights"])
app.include_router(chat, prefix="/api/v1", tags=["chat"])
app.include_router(itinerary, prefix="/api/v1", tags=["itinerary"])
# Removed alerts and affiliate routers per request

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
    return {
        "message": "Welcome to SafarBot API!",
        "version": "1.0.0",
        "database": "MongoDB",
        "features": [
            "AI-powered travel planning",
            "Flight & hotel booking",
            "Price alerts & predictions",
            "Affiliate integration",
            "User authentication"
        ],
        "endpoints": {
            "health": "/health",
            "authentication": "/api/v1/auth",
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 