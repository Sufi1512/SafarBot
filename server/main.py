from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

# Import routers
from routers import flights, chat, itinerary, auth
from routers.weather import router as weather_router
from routers.ip_tracking import router as ip_tracking_router
from middleware.ip_examples import router as ip_examples_router
from config import settings
from database import Database

# Import middleware
from middleware.security import SecurityMiddleware
from middleware.logging import LoggingMiddleware
from middleware.rate_limiting import RateLimitingMiddleware
from middleware.auth import AuthMiddleware
from middleware.error_handling import ErrorHandlingMiddleware
from middleware.ip_tracking import IPTrackingMiddleware

app = FastAPI(
    title="SafarBot API",
    description="AI-powered travel planning and booking platform with MongoDB",
    version="1.0.0"
)

# =============================================================================
# MIDDLEWARE SETUP (Order matters - they execute in reverse order)
# =============================================================================

# 1. Error Handling (should be first to catch all errors)
@app.middleware("http")
async def error_handling_middleware(request, call_next):
    return await ErrorHandlingMiddleware.handle_errors(request, call_next)

# 2. Security Headers (add security headers to all responses)
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    return await SecurityMiddleware.add_security_headers(request, call_next)

# 3. Request Size Validation (prevent large payload attacks)
@app.middleware("http")
async def request_size_middleware(request, call_next):
    return await SecurityMiddleware.validate_request_size(request, call_next)

# 4. Block Suspicious Requests (block known attack tools)
@app.middleware("http")
async def block_suspicious_middleware(request, call_next):
    return await SecurityMiddleware.block_suspicious_requests(request, call_next)

# 5. Rate Limiting (prevent API abuse)
@app.middleware("http")
async def rate_limiting_middleware(request, call_next):
    return await RateLimitingMiddleware.apply_rate_limiting(request, call_next)

# 6. Request Logging (log all requests and responses)
@app.middleware("http")
async def logging_middleware(request, call_next):
    return await LoggingMiddleware.log_requests(request, call_next)

# 7. API Usage Logging (log API usage for analytics)
@app.middleware("http")
async def api_usage_middleware(request, call_next):
    return await LoggingMiddleware.log_api_usage(request, call_next)

# 8. IP Tracking (track and analyze IP activity)
@app.middleware("http")
async def ip_tracking_middleware(request, call_next):
    return await IPTrackingMiddleware.track_ip_activity(request, call_next)

# 9. Authentication (validate JWT tokens for protected endpoints)
@app.middleware("http")
async def auth_middleware(request, call_next):
    return await AuthMiddleware.validate_token(request, call_next)

# 10. CORS middleware - updated for Render backend + Vercel frontend
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
app.include_router(weather_router, prefix="/api/v1", tags=["weather"])
app.include_router(ip_tracking_router, prefix="/api/v1", tags=["ip-tracking"])
app.include_router(ip_examples_router, prefix="/api/v1", tags=["ip-examples"])
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
            "Weather integration",
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
            "generate_complete_itinerary": "/api/v1/generate-complete-itinerary",
            "generate_itinerary": "/api/v1/generate-itinerary",
            "predict_prices": "/api/v1/predict-prices",
            "place_details": "/api/v1/places/details",
            "serp_place_details": "/api/v1/places/serp/details",
            "serp_place_search": "/api/v1/places/serp/search",
            "additional_places": "/api/v1/places/additional",
            "current_weather": "/api/v1/weather/current",
            "weather_forecast": "/api/v1/weather/forecast",
            "weather_by_coordinates": "/api/v1/weather/coordinates",
            "weather_for_itinerary": "/api/v1/weather/itinerary-format"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 