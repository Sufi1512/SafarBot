"""
SafarBot API - Main Application Entry Point
Production-ready FastAPI application for AI-powered travel planning platform
"""

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import logging
from dotenv import load_dotenv

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('.env')

# Configure logging - suppress MongoDB background task errors
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("pymongo.synchronous").setLevel(logging.ERROR)
logging.getLogger("pymongo.synchronous.mongo_client").setLevel(logging.ERROR)
logging.getLogger("pymongo.synchronous.pool").setLevel(logging.ERROR)
logging.getLogger("pymongo.synchronous.topology").setLevel(logging.ERROR)
logging.getLogger("pymongo.network_layer").setLevel(logging.ERROR)

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
from routers.image_proxy import router as image_proxy_router
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
# Security: Restricted headers and removed null origin
import os
cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    # Use environment variable if set
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip() and origin.strip() != "null"]
else:
    # Fallback to default origins (excluding null for security)
    allowed_origins = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://safarbot.vercel.app",
        "https://safarbot-git-main-sufi1512.vercel.app",
        "https://safarbot-sufi1512.vercel.app",
        "https://safarbot-frontend.vercel.app",
        "https://safarbot.netlify.app"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)

# Database events
@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB on startup."""
    from config import settings
    
    mode = "DEVELOPMENT" if settings.local_dev else "PRODUCTION"
    logging.info(f"Starting SafarBot API in {mode} mode")
    
    try:
        await Database.connect_db()
        logging.info("Database connection established")
    except Exception as e:
        logging.error(f"Database connection failed: {e}")
        logging.warning("Application will start without database connection")
        # Don't raise the exception to allow the app to start
        # This is important for deployment when MongoDB might not be available
    

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    await Database.close_db()
    logging.info("Database connection closed")

# =============================================================================
# ROUTER SETUP - Clean, organized endpoint structure
# =============================================================================

# Authentication & User Management
app.include_router(auth, prefix="/auth", tags=["authentication"])
app.include_router(google_auth_router, prefix="/google", tags=["google-auth"])

# Dashboard & User Data
app.include_router(dashboard, prefix="/dashboard", tags=["dashboard"])
app.include_router(saved_itinerary, prefix="/itineraries", tags=["saved-itineraries"])

# Travel Services
app.include_router(flights, prefix="/flights", tags=["flights"])
app.include_router(hotels_router, prefix="/hotels", tags=["hotels"])
app.include_router(restaurants_router, prefix="/restaurants", tags=["restaurants"])
app.include_router(weather_router, prefix="/weather", tags=["weather"])

# Itinerary & Planning
app.include_router(itinerary, prefix="/itinerary", tags=["itinerary"])
app.include_router(chat, prefix="/chat", tags=["chat"])

# Bookings & Payments
app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])

# Collaboration & Social
app.include_router(collaboration_router, prefix="/collaboration", tags=["collaboration"])
app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])

# Admin & Monitoring
app.include_router(ip_tracking_router, prefix="/admin/ip-tracking", tags=["admin", "ip-tracking"])

# Image Proxy (to avoid Google rate limits)
app.include_router(image_proxy_router, prefix="/images", tags=["images"])

# Chat Collaboration WebSocket endpoints
from services.chat_collaboration_service import chat_service
from services.auth_service import AuthService
from utils.validation import validate_object_id

@app.websocket("/chat/{user_id}")
async def chat_websocket_endpoint(websocket: WebSocket, user_id: str):
    """Chat collaboration WebSocket endpoint for authenticated users"""
    try:
        # Get token from query parameters
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=1008, reason="Authentication required")
            return
        
        # Verify token
        payload = AuthService.verify_token(token)
        if not payload or payload.get("type") != "access":
            await websocket.close(code=1008, reason="Invalid or expired token")
            return
        
        # Verify user_id matches token
        token_user_id = payload.get("sub")
        if not token_user_id or token_user_id != user_id:
            await websocket.close(code=1008, reason="Unauthorized: User ID mismatch")
            return
        
        # Validate ObjectId format
        try:
            validate_object_id(user_id, "User ID")
        except HTTPException:
            await websocket.close(code=1008, reason="Invalid user ID format")
            return
        
        # Get user info
        user = await AuthService.get_user_by_id(token_user_id)
        user_name = f"{user.first_name} {user.last_name}" if user else None
        
        # Connect to chat service
        await chat_service.handle_websocket(websocket, user_id, user_name)
        
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
        await websocket.close(code=1011, reason="Internal server error")

@app.websocket("/chat/{user_id}/{user_name}")
async def chat_websocket_with_name(websocket: WebSocket, user_id: str, user_name: str):
    """Chat collaboration WebSocket endpoint with user name (deprecated - use /chat/{user_id} with token)"""
    # Redirect to main endpoint - user_name will be fetched from token
    await chat_websocket_endpoint(websocket, user_id)

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
    """Block Socket.IO requests - service discontinued"""
    return Response(
        content="Socket.IO service discontinued. Use native WebSocket endpoints.",
        status_code=410,
        headers={
            "Connection": "close",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

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
            "authentication": {
                "base": "/auth",
                "login": "/auth/login",
                "signup": "/auth/signup",
                "logout": "/auth/logout",
                "me": "/auth/me",
                "otp_verification": "/auth/send-verification-otp"
            },
            "dashboard": {
                "base": "/dashboard",
                "stats": "/dashboard/stats",
                "bookings": "/dashboard/bookings",
                "trips": "/dashboard/trips",
                "itineraries": "/dashboard/itineraries"
            },
            "itineraries": {
                "base": "/itineraries",
                "list": "/itineraries",
                "create": "/itineraries",
                "get": "/itineraries/{itinerary_id}",
                "update": "/itineraries/{itinerary_id}",
                "delete": "/itineraries/{itinerary_id}"
            },
            "flights": {
                "base": "/flights",
                "search": "/flights/search",
                "popular": "/flights/popular",
                "airports": "/flights/airports/suggestions",
                "booking_options": "/flights/booking-options/{booking_token}",
                "details": "/flights/{flight_id}",
                "book": "/flights/book"
            },
            "hotels": {
                "base": "/hotels",
                "search": "/hotels/search-hotels",
                "popular": "/hotels/{location}/popular"
            },
            "restaurants": {
                "base": "/restaurants",
                "recommend": "/restaurants/recommend-restaurants",
                "popular": "/restaurants/{location}/popular"
            },
            "itinerary": {
                "base": "/itinerary",
                "generate_ai": "/itinerary/generate-itinerary-ai",
                "generate_complete": "/itinerary/generate-itinerary-complete",
                "generate": "/itinerary/generate-itinerary",
                "additional_places": "/itinerary/places/additional"
            },
            "chat": {
                "base": "/chat",
                "send": "/chat",
                "history": "/chat/history",
                "websocket": "/chat/{user_id}"
            },
            "bookings": {
                "base": "/bookings",
                "create": "/bookings/create",
                "list": "/bookings",
                "get": "/bookings/{booking_id}",
                "get_by_reference": "/bookings/reference/{booking_reference}",
                "cancel": "/bookings/{booking_id}/cancel",
                "payment": "/bookings/{booking_id}/payment"
            },
            "weather": {
                "base": "/weather",
                "current": "/weather/current",
                "forecast": "/weather/forecast",
                "coordinates": "/weather/coordinates",
                "itinerary_format": "/weather/itinerary-format"
            },
            "collaboration": {
                "base": "/collaboration",
                "invite": "/collaboration/invite",
                "resend_invitation": "/collaboration/resend-invitation",
                "invitations": "/collaboration/invitations",
                "invitation_info": "/collaboration/invitation/{token}/info",
                "accept": "/collaboration/invitation/{token}/accept",
                "decline": "/collaboration/invitation/{token}/decline",
                "collaborators": "/collaboration/itinerary/{itinerary_id}/collaborators",
                "remove_collaborator": "/collaboration/itinerary/{itinerary_id}/collaborator/{user_id}",
                "update_role": "/collaboration/itinerary/{itinerary_id}/collaborator/{user_id}/role",
                "my_collaborations": "/collaboration/my-collaborations",
                "room_status": "/collaboration/room/status/{itinerary_id}",
                "room_create": "/collaboration/room/create",
                "room_join": "/collaboration/room/{room_id}/join",
                "room_info": "/collaboration/room/{room_id}/info"
            },
            "notifications": {
                "base": "/notifications",
                "list": "/notifications",
                "count": "/notifications/count",
                "mark_read": "/notifications/{notification_id}/read",
                "mark_all_read": "/notifications/read-all",
                "delete": "/notifications/{notification_id}"
            },
            "admin": {
                "ip_tracking": {
                    "base": "/admin/ip-tracking",
                    "info": "/admin/ip-tracking/info",
                    "info_by_ip": "/admin/ip-tracking/info/{ip_address}",
                    "top": "/admin/ip-tracking/top",
                    "blacklist": "/admin/ip-tracking/blacklist/{ip_address}",
                    "whitelist": "/admin/ip-tracking/whitelist/{ip_address}",
                    "suspicious": "/admin/ip-tracking/suspicious",
                    "stats": "/admin/ip-tracking/stats"
                }
            },
            "websocket": {
                "chat": "/chat/{user_id}"
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 