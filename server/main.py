from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

# Import routers
from routers import flights, chat, itinerary, auth, dashboard
from routers.bookings import router as bookings_router
from routers.hotels import router as hotels_router
from routers.restaurants import router as restaurants_router
from routers.saved_itinerary import router as saved_itinerary
from routers.weather import router as weather_router
from routers.ip_tracking import router as ip_tracking_router
from routers.collaboration import router as collaboration_router
from routers.notifications import router as notifications_router
from routers.google_auth import router as google_auth_router
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
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "null",  # Allow local file:// origins for testing
        "https://safarbot.vercel.app",
        "https://safarbot-git-main-sufi1512.vercel.app",
        "https://safarbot-sufi1512.vercel.app",
        "https://safarbot-frontend.vercel.app",
        "https://safarbot.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Database and Redis events
@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB and Redis on startup."""
    try:
        await Database.connect_db()
        print("✅ Database connection established")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("⚠️  Application will start without database connection")
        # Don't raise the exception to allow the app to start
        # This is important for deployment when MongoDB might not be available
    
    # Initialize Redis connection
    try:
        from services.redis_service import redis_service
        await redis_service.connect()
        print("✅ Redis connection established")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        print("⚠️  Application will continue with limited caching")
    
    # Initialize WebSocket service
    try:
        from services.websocket_service import websocket_service
        await websocket_service.initialize()
        print("✅ WebSocket service initialized")
    except Exception as e:
        print(f"❌ WebSocket initialization failed: {e}")
        print("⚠️  Real-time features will be limited")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    await Database.close_db()
    print("✅ Database connection closed")
    
    # Close Redis connection
    try:
        from services.redis_service import redis_service
        await redis_service.disconnect()
        print("✅ Redis connection closed")
    except Exception as e:
        print(f"⚠️  Redis disconnect warning: {e}")

# Include routers
app.include_router(auth, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(google_auth_router, prefix="/api/v1/google", tags=["google-auth"])
app.include_router(dashboard, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(saved_itinerary, prefix="/api/v1/saved-itinerary", tags=["saved-itineraries"])
app.include_router(flights, prefix="/api/v1", tags=["flights"])
app.include_router(chat, prefix="/api/v1", tags=["chat"])
app.include_router(itinerary, prefix="/api/v1", tags=["itinerary"])
app.include_router(bookings_router, prefix="/api/v1", tags=["bookings"])
app.include_router(hotels_router, prefix="/api/v1", tags=["hotels"])
app.include_router(restaurants_router, prefix="/api/v1", tags=["restaurants"])
app.include_router(weather_router, prefix="/api/v1", tags=["weather"])
app.include_router(ip_tracking_router, prefix="/api/v1", tags=["ip-tracking"])
app.include_router(collaboration_router, prefix="/api/v1", tags=["collaboration"])
app.include_router(notifications_router, prefix="/api/v1", tags=["notifications"])

# Mount WebSocket app (Socket.IO - temporarily disabled)
# from services.websocket_service import socketio_app
# app.mount("/socket.io", socketio_app)

# Chat Collaboration WebSocket endpoints
from fastapi import WebSocket
from services.chat_collaboration_service import chat_service

@app.websocket("/chat/{user_id}")
async def chat_websocket_endpoint(websocket: WebSocket, user_id: str, user_name: str = None):
    """Chat collaboration WebSocket endpoint for authenticated users"""
    await chat_service.handle_websocket(websocket, user_id, user_name)

@app.websocket("/chat/{user_id}/{user_name}")
async def chat_websocket_with_name(websocket: WebSocket, user_id: str, user_name: str):
    """Chat collaboration WebSocket endpoint with user name"""
    await chat_service.handle_websocket(websocket, user_id, user_name)

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

@app.get("/socket.io/")
async def socket_io_blocked():
    """Block Socket.IO requests completely"""
    from fastapi import Response
    # Return a response that makes Socket.IO clients stop retrying
    return Response(
        content="Socket.IO service discontinued. Use native WebSocket at ws://localhost:8000/ws/",
        status_code=410,  # 410 Gone - service permanently discontinued
        headers={
            "Connection": "close",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

@app.get("/redis-status")
async def redis_status():
    """Redis status and configuration endpoint."""
    try:
        from services.redis_service import redis_service
        
        # Test Redis connection
        is_healthy = await redis_service.health_check()
        cache_stats = await redis_service.get_cache_stats()
        
        return {
            "redis_configured": True,
            "redis_healthy": is_healthy,
            "redis_stats": cache_stats,
            "fallback_active": not is_healthy,
            "message": "Redis working" if is_healthy else "Using in-memory fallback"
        }
    except Exception as e:
        return {
            "redis_configured": False,
            "redis_healthy": False,
            "error": str(e),
            "fallback_active": True,
            "message": "Redis service not available, using fallback"
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
            "dashboard": "/api/v1/dashboard",
            "saved_itineraries": "/api/v1/saved-itinerary",
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
            "bookings": "/api/v1/bookings",
            "hotels": "/api/v1/hotels",
            "restaurants": "/api/v1/restaurants",
            "current_weather": "/api/v1/weather/current",
            "weather_forecast": "/api/v1/weather/forecast",
            "weather_by_coordinates": "/api/v1/weather/coordinates",
            "weather_for_itinerary": "/api/v1/weather/itinerary-format",
            "ip_tracking": "/api/v1/ip-tracking",
            "otp_verification": "/api/v1/auth/send-verification-otp"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 