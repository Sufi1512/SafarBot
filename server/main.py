"""
SafarBot API - AI-powered Travel Planning Platform

Optimized FastAPI application with:
- LangGraph-based itinerary generation
- Real-time collaboration via WebSocket
- Comprehensive travel services
- LangSmith tracing for AI debugging
"""

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

# Initialize LangSmith tracing before importing AI services
try:
    from langsmith_config.langsmith_setup import setup_langsmith
    langsmith_enabled = setup_langsmith()
    if not langsmith_enabled:
        # Suppress LangSmith errors if tracing is disabled
        import logging
        langsmith_logger = logging.getLogger("langsmith")
        langsmith_logger.setLevel(logging.ERROR)  # Only show errors, suppress warnings
except Exception as e:
    print(f"⚠️  LangSmith setup skipped: {e}")
    # Suppress LangSmith errors if setup failed
    import logging
    langsmith_logger = logging.getLogger("langsmith")
    langsmith_logger.setLevel(logging.CRITICAL)  # Suppress all LangSmith logs

# Import routers
from routers import flights, chat, itinerary, auth, dashboard
from routers.bookings import router as bookings_router
from routers.hotels import router as hotels_router
from routers.restaurants import router as restaurants_router
from routers.saved_itinerary import router as saved_itinerary
from routers.weather import router as weather_router
from routers.collaboration import router as collaboration_router
from routers.notifications import router as notifications_router
from routers.google_auth import router as google_auth_router
from routers.image_proxy import router as image_proxy_router

from config import settings
from database import Database

# Import middleware
from middleware.security import SecurityMiddleware
from middleware.logging import LoggingMiddleware
from middleware.rate_limiting import RateLimitingMiddleware
from middleware.auth import AuthMiddleware
from middleware.error_handling import ErrorHandlingMiddleware

# Create FastAPI app
app = FastAPI(
    title="SafarBot API",
    description="AI-powered travel planning with LangGraph and LangSmith",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# =============================================================================
# MIDDLEWARE SETUP (Order matters - they execute in reverse order)
# =============================================================================

@app.middleware("http")
async def error_handling_middleware(request, call_next):
    return await ErrorHandlingMiddleware.handle_errors(request, call_next)

@app.middleware("http")
async def security_headers_middleware(request, call_next):
    return await SecurityMiddleware.add_security_headers(request, call_next)

@app.middleware("http")
async def request_size_middleware(request, call_next):
    return await SecurityMiddleware.validate_request_size(request, call_next)

@app.middleware("http")
async def rate_limiting_middleware(request, call_next):
    return await RateLimitingMiddleware.apply_rate_limiting(request, call_next)

@app.middleware("http")
async def logging_middleware(request, call_next):
    return await LoggingMiddleware.log_requests(request, call_next)

@app.middleware("http")
async def auth_middleware(request, call_next):
    return await AuthMiddleware.validate_token(request, call_next)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
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

# =============================================================================
# DATABASE LIFECYCLE
# =============================================================================

@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB on startup."""
    try:
        await Database.connect_db()
        print("✅ Database connected")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("   Application will start without database")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    await Database.close_db()
    print("✅ Database disconnected")

# =============================================================================
# ROUTER CONFIGURATION
# =============================================================================

# Authentication
app.include_router(auth, prefix="/auth", tags=["Authentication"])
app.include_router(google_auth_router, prefix="/google", tags=["Google Auth"])

# User Data
app.include_router(dashboard, prefix="/dashboard", tags=["Dashboard"])
app.include_router(saved_itinerary, prefix="/itineraries", tags=["Saved Itineraries"])

# Travel Services
app.include_router(flights, prefix="/flights", tags=["Flights"])
app.include_router(hotels_router, prefix="/hotels", tags=["Hotels"])
app.include_router(restaurants_router, prefix="/restaurants", tags=["Restaurants"])
app.include_router(weather_router, prefix="/weather", tags=["Weather"])

# AI Itinerary Generation
app.include_router(itinerary, prefix="/itinerary", tags=["Itinerary"])
app.include_router(chat, prefix="/chat", tags=["Chat"])

# Bookings
app.include_router(bookings_router, prefix="/bookings", tags=["Bookings"])

# Collaboration
app.include_router(collaboration_router, prefix="/collaboration", tags=["Collaboration"])
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])

# Utilities
app.include_router(image_proxy_router, prefix="/images", tags=["Images"])

# =============================================================================
# WEBSOCKET ENDPOINTS
# =============================================================================

from services.chat_collaboration_service import chat_service

@app.websocket("/chat/{user_id}")
async def chat_websocket(websocket: WebSocket, user_id: str, user_name: str = None):
    """WebSocket endpoint for real-time chat collaboration."""
    await chat_service.handle_websocket(websocket, user_id, user_name)

@app.websocket("/chat/{user_id}/{user_name}")
async def chat_websocket_with_name(websocket: WebSocket, user_id: str, user_name: str):
    """WebSocket endpoint with explicit user name."""
    await chat_service.handle_websocket(websocket, user_id, user_name)

# =============================================================================
# HEALTH & INFO ENDPOINTS
# =============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    db_status = "not_initialized"
    
    if Database.client:
        try:
            await Database.client.admin.command('ping')
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)[:50]}"
    
    return {
        "status": "healthy",
        "service": "SafarBot API",
        "database": db_status,
        "version": "2.0.0"
    }

@app.get("/")
async def root():
    """API information endpoint."""
    return {
        "service": "SafarBot API",
        "version": "2.0.0",
        "description": "AI-powered travel planning platform",
        "docs": "/docs",
        "health": "/health",
        "features": [
            "AI itinerary generation (LangGraph + Gemini)",
            "Real-time collaboration",
            "Flight & hotel search",
            "Weather integration",
            "LangSmith tracing"
        ],
        "endpoints": {
            "itinerary": {
                "generate": "POST /itinerary/generate-itinerary"
            },
            "auth": {
                "login": "POST /auth/login",
                "signup": "POST /auth/signup",
                "me": "GET /auth/me"
            },
            "travel": {
                "flights": "POST /flights/search",
                "hotels": "POST /hotels/search-hotels",
                "weather": "GET /weather/current"
            },
            "collaboration": {
                "invite": "POST /collaboration/invite",
                "rooms": "POST /collaboration/room/create"
            }
        }
    }

# Block deprecated Socket.IO endpoint
@app.get("/socket.io/")
async def socket_io_blocked():
    return Response(
        content="Socket.IO discontinued. Use WebSocket at /chat/{user_id}",
        status_code=410,
        headers={"Connection": "close"}
    )

# =============================================================================
# RUN SERVER
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
