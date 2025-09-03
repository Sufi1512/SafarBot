"""
IP tracking router for SafarBot API
Provides endpoints to view and manage IP tracking information
"""

from fastapi import APIRouter, Request, HTTPException, Depends, status
from typing import List, Dict, Optional
import logging

from middleware.ip_tracking import ip_tracker
from routers.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/ip/info")
async def get_ip_info(request: Request):
    """
    Get information about the current request's IP address
    """
    client_ip = getattr(request.state, 'client_ip', 'unknown')
    ip_info = ip_tracker.get_ip_info(client_ip)
    
    return {
        "success": True,
        "data": ip_info,
        "message": "IP information retrieved successfully"
    }

@router.get("/ip/info/{ip_address}")
async def get_specific_ip_info(ip_address: str, current_user: dict = Depends(get_current_user)):
    """
    Get information about a specific IP address (admin only)
    """
    # Check if user is admin (you can implement this check)
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    ip_info = ip_tracker.get_ip_info(ip_address)
    
    if not ip_info.get("valid"):
        raise HTTPException(status_code=400, detail="Invalid IP address")
    
    return {
        "success": True,
        "data": ip_info,
        "message": f"IP information for {ip_address} retrieved successfully"
    }

@router.get("/ip/top")
async def get_top_ips(limit: int = 10, current_user: dict = Depends(get_current_user)):
    """
    Get top IPs by request count (admin only)
    """
    # Check if user is admin
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    if limit > 100:
        limit = 100  # Cap at 100 for performance
    
    top_ips = ip_tracker.get_top_ips(limit)
    
    return {
        "success": True,
        "data": {
            "top_ips": top_ips,
            "total_tracked_ips": len(ip_tracker.ip_activity),
            "suspicious_ips_count": len(ip_tracker.suspicious_ips),
            "blacklisted_ips_count": len(ip_tracker.ip_blacklist),
            "whitelisted_ips_count": len(ip_tracker.ip_whitelist)
        },
        "message": f"Top {len(top_ips)} IPs retrieved successfully"
    }

@router.post("/ip/blacklist/{ip_address}")
async def add_to_blacklist(ip_address: str, current_user: dict = Depends(get_current_user)):
    """
    Add IP to blacklist (admin only)
    """
    # Check if user is admin
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    if not ip_tracker.is_valid_ip(ip_address):
        raise HTTPException(status_code=400, detail="Invalid IP address")
    
    ip_tracker.add_to_blacklist(ip_address)
    
    return {
        "success": True,
        "message": f"IP {ip_address} added to blacklist successfully"
    }

@router.delete("/ip/blacklist/{ip_address}")
async def remove_from_blacklist(ip_address: str, current_user: dict = Depends(get_current_user)):
    """
    Remove IP from blacklist (admin only)
    """
    # Check if user is admin
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    ip_tracker.remove_from_blacklist(ip_address)
    
    return {
        "success": True,
        "message": f"IP {ip_address} removed from blacklist successfully"
    }

@router.post("/ip/whitelist/{ip_address}")
async def add_to_whitelist(ip_address: str, current_user: dict = Depends(get_current_user)):
    """
    Add IP to whitelist (admin only)
    """
    # Check if user is admin
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    if not ip_tracker.is_valid_ip(ip_address):
        raise HTTPException(status_code=400, detail="Invalid IP address")
    
    ip_tracker.add_to_whitelist(ip_address)
    
    return {
        "success": True,
        "message": f"IP {ip_address} added to whitelist successfully"
    }

@router.delete("/ip/whitelist/{ip_address}")
async def remove_from_whitelist(ip_address: str, current_user: dict = Depends(get_current_user)):
    """
    Remove IP from whitelist (admin only)
    """
    # Check if user is admin
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    ip_tracker.remove_from_whitelist(ip_address)
    
    return {
        "success": True,
        "message": f"IP {ip_address} removed from whitelist successfully"
    }

@router.get("/ip/suspicious")
async def get_suspicious_ips(current_user: dict = Depends(get_current_user)):
    """
    Get list of suspicious IPs (admin only)
    """
    # Check if user is admin
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    suspicious_ips = []
    for ip in ip_tracker.suspicious_ips:
        ip_info = ip_tracker.get_ip_info(ip)
        suspicious_ips.append(ip_info)
    
    return {
        "success": True,
        "data": {
            "suspicious_ips": suspicious_ips,
            "count": len(suspicious_ips)
        },
        "message": f"Found {len(suspicious_ips)} suspicious IPs"
    }

@router.get("/ip/stats")
async def get_ip_stats(current_user: dict = Depends(get_current_user)):
    """
    Get IP tracking statistics (admin only)
    """
    # Check if user is admin
    # if current_user.get("role") != "admin":
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    total_ips = len(ip_tracker.ip_activity)
    suspicious_count = len(ip_tracker.suspicious_ips)
    blacklisted_count = len(ip_tracker.ip_blacklist)
    whitelisted_count = len(ip_tracker.ip_whitelist)
    
    # Calculate total requests
    total_requests = sum(len(activities) for activities in ip_tracker.ip_activity.values())
    
    return {
        "success": True,
        "data": {
            "total_tracked_ips": total_ips,
            "total_requests": total_requests,
            "suspicious_ips": suspicious_count,
            "blacklisted_ips": blacklisted_count,
            "whitelisted_ips": whitelisted_count,
            "average_requests_per_ip": round(total_requests / total_ips, 2) if total_ips > 0 else 0
        },
        "message": "IP tracking statistics retrieved successfully"
    }
