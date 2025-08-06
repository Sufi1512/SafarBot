from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

# Import routers
from routers import flights, chat, itinerary
from config import settings

app = FastAPI(
    title="SafarBot API",
    description="AI-powered travel planning API - Flight Booking Service",
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
        "https://safarbot-frontend.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(flights.router, prefix="/api/v1", tags=["flights"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(itinerary.router, prefix="/api/v1", tags=["itinerary"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SafarBot Flight API"}

@app.get("/")
async def root():
    return {
        "message": "SafarBot Flight API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
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