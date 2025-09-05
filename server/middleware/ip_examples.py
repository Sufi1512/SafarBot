"""
Examples of using IP tracking in SafarBot API
Shows how to access and use IP information in route handlers
"""

from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any

router = APIRouter()

@router.get("/my-ip")
async def get_my_ip(request: Request):
    """
    Get the current user's IP address and information
    """
    # Get IP from middleware (set by IPTrackingMiddleware)
    client_ip = getattr(request.state, 'client_ip', 'unknown')
    ip_info = getattr(request.state, 'ip_info', {})
    
    return {
        "success": True,
        "data": {
            "ip_address": client_ip,
            "ip_info": ip_info,
            "headers": {
                "user_agent": request.headers.get("user-agent", "unknown"),
                "x_forwarded_for": request.headers.get("X-Forwarded-For", "none"),
                "x_real_ip": request.headers.get("X-Real-IP", "none")
            }
        },
        "message": "IP information retrieved successfully"
    }

@router.get("/ip-based-features")
async def ip_based_features(request: Request):
    """
    Example of using IP information for different features
    """
    client_ip = getattr(request.state, 'client_ip', 'unknown')
    ip_info = getattr(request.state, 'ip_info', {})
    
    # Example: Different features based on IP type
    features = {
        "basic_features": True,
        "premium_features": False,
        "admin_features": False
    }
    
    # Premium features for non-private IPs
    if not ip_info.get("is_private", True):
        features["premium_features"] = True
    
    # Admin features for specific IPs (you can customize this)
    admin_ips = ["127.0.0.1", "::1"]  # localhost
    if client_ip in admin_ips:
        features["admin_features"] = True
    
    # Block suspicious IPs
    if ip_info.get("is_suspicious", False):
        raise HTTPException(
            status_code=403, 
            detail="Access denied due to suspicious activity"
        )
    
    return {
        "success": True,
        "data": {
            "ip_address": client_ip,
            "available_features": features,
            "ip_type": {
                "is_private": ip_info.get("is_private", False),
                "is_loopback": ip_info.get("is_loopback", False),
                "is_suspicious": ip_info.get("is_suspicious", False)
            },
            "request_count": ip_info.get("recent_requests_24h", 0)
        },
        "message": "IP-based features determined successfully"
    }

@router.get("/location-based-content")
async def location_based_content(request: Request):
    """
    Example of serving different content based on IP location
    (This is a simplified example - in production you'd use a geolocation service)
    """
    client_ip = getattr(request.state, 'client_ip', 'unknown')
    ip_info = getattr(request.state, 'ip_info', {})
    
    # Simple location detection based on IP patterns
    # In production, use services like MaxMind GeoIP2, IPinfo, etc.
    location_info = {
        "country": "Unknown",
        "region": "Unknown",
        "city": "Unknown",
        "timezone": "UTC"
    }
    
    # Example: Detect localhost
    if ip_info.get("is_loopback", False):
        location_info = {
            "country": "Local",
            "region": "Development",
            "city": "Localhost",
            "timezone": "Local"
        }
    
    # Example: Detect private networks
    elif ip_info.get("is_private", False):
        location_info = {
            "country": "Private Network",
            "region": "Internal",
            "city": "Private",
            "timezone": "Local"
        }
    
    # Content based on location
    content = {
        "welcome_message": f"Welcome from {location_info['country']}!",
        "currency": "USD",  # Default
        "language": "en",   # Default
        "local_offers": [],
        "timezone": location_info["timezone"]
    }
    
    # Example: Different currency based on "location"
    if location_info["country"] == "Local":
        content["currency"] = "USD"
        content["language"] = "en"
        content["local_offers"] = ["Development discount: 50% off!"]
    
    return {
        "success": True,
        "data": {
            "ip_address": client_ip,
            "location": location_info,
            "content": content
        },
        "message": "Location-based content served successfully"
    }

@router.post("/report-suspicious-activity")
async def report_suspicious_activity(request: Request, activity_type: str = "general"):
    """
    Allow users to report suspicious activity from their IP
    """
    client_ip = getattr(request.state, 'client_ip', 'unknown')
    ip_info = getattr(request.state, 'ip_info', {})
    
    # Log the report
    print(f"Suspicious activity reported from {client_ip}: {activity_type}")
    
    return {
        "success": True,
        "data": {
            "ip_address": client_ip,
            "activity_type": activity_type,
            "reported_at": "2024-01-01T00:00:00Z",  # You'd use datetime.utcnow()
            "status": "Reported"
        },
        "message": "Suspicious activity reported successfully"
    }

