"""
IP tracking middleware for SafarBot API
Enhanced IP address tracking, geolocation, and IP-based features
"""

from fastapi import Request
import logging
import json
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from collections import defaultdict, deque
import ipaddress

logger = logging.getLogger(__name__)

class IPTracker:
    """Enhanced IP tracking and analysis"""
    
    def __init__(self):
        # Store IP activity history
        self.ip_activity: Dict[str, deque] = defaultdict(deque)
        # Store IP metadata
        self.ip_metadata: Dict[str, Dict] = {}
        # Suspicious IP patterns
        self.suspicious_ips: set = set()
        # IP whitelist/blacklist
        self.ip_whitelist: set = set()
        self.ip_blacklist: set = set()
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP address with proxy support"""
        # Check for forwarded headers (common with proxies/load balancers)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # X-Forwarded-For can contain multiple IPs, take the first one
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        # Fallback to direct connection
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def is_valid_ip(self, ip: str) -> bool:
        """Check if IP address is valid"""
        try:
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False
    
    def is_private_ip(self, ip: str) -> bool:
        """Check if IP is private/internal"""
        try:
            return ipaddress.ip_address(ip).is_private
        except ValueError:
            return False
    
    def is_loopback_ip(self, ip: str) -> bool:
        """Check if IP is loopback (localhost)"""
        try:
            return ipaddress.ip_address(ip).is_loopback
        except ValueError:
            return False
    
    def record_ip_activity(self, ip: str, path: str, method: str, user_agent: str = ""):
        """Record IP activity for analysis"""
        if not self.is_valid_ip(ip) or ip == "unknown":
            return
        
        now = datetime.utcnow()
        activity = {
            "timestamp": now,
            "path": path,
            "method": method,
            "user_agent": user_agent[:100]  # Truncate long user agents
        }
        
        # Store activity
        self.ip_activity[ip].append(activity)
        
        # Keep only last 100 activities per IP
        if len(self.ip_activity[ip]) > 100:
            self.ip_activity[ip].popleft()
        
        # Analyze for suspicious patterns
        self._analyze_ip_patterns(ip)
    
    def _analyze_ip_patterns(self, ip: str):
        """Analyze IP for suspicious patterns"""
        activities = self.ip_activity[ip]
        now = datetime.utcnow()
        
        # Check for rapid requests (potential bot/attack)
        recent_activities = [
            activity for activity in activities
            if now - activity["timestamp"] < timedelta(minutes=1)
        ]
        
        if len(recent_activities) > 30:  # More than 30 requests per minute
            self.suspicious_ips.add(ip)
            logger.warning(f"Suspicious activity detected from IP: {ip} - {len(recent_activities)} requests in 1 minute")
        
        # Check for scanning patterns (many different paths)
        unique_paths = set(activity["path"] for activity in recent_activities)
        if len(unique_paths) > 10:  # More than 10 different paths in 1 minute
            self.suspicious_ips.add(ip)
            logger.warning(f"Potential scanning detected from IP: {ip} - {len(unique_paths)} different paths")
    
    def get_ip_info(self, ip: str) -> Dict:
        """Get comprehensive IP information"""
        if not self.is_valid_ip(ip) or ip == "unknown":
            return {"ip": ip, "valid": False}
        
        activities = self.ip_activity.get(ip, deque())
        recent_activities = [
            activity for activity in activities
            if datetime.utcnow() - activity["timestamp"] < timedelta(hours=24)
        ]
        
        return {
            "ip": ip,
            "valid": True,
            "is_private": self.is_private_ip(ip),
            "is_loopback": self.is_loopback_ip(ip),
            "is_suspicious": ip in self.suspicious_ips,
            "is_whitelisted": ip in self.ip_whitelist,
            "is_blacklisted": ip in self.ip_blacklist,
            "total_requests": len(activities),
            "recent_requests_24h": len(recent_activities),
            "unique_paths": len(set(activity["path"] for activity in recent_activities)),
            "last_seen": activities[-1]["timestamp"].isoformat() if activities else None,
            "user_agents": list(set(activity["user_agent"] for activity in recent_activities if activity["user_agent"]))
        }
    
    def get_top_ips(self, limit: int = 10) -> List[Dict]:
        """Get top IPs by request count"""
        ip_counts = [(ip, len(activities)) for ip, activities in self.ip_activity.items()]
        ip_counts.sort(key=lambda x: x[1], reverse=True)
        
        return [
            {
                "ip": ip,
                "request_count": count,
                "info": self.get_ip_info(ip)
            }
            for ip, count in ip_counts[:limit]
        ]
    
    def add_to_blacklist(self, ip: str):
        """Add IP to blacklist"""
        if self.is_valid_ip(ip):
            self.ip_blacklist.add(ip)
            logger.info(f"IP {ip} added to blacklist")
    
    def add_to_whitelist(self, ip: str):
        """Add IP to whitelist"""
        if self.is_valid_ip(ip):
            self.ip_whitelist.add(ip)
            logger.info(f"IP {ip} added to whitelist")
    
    def remove_from_blacklist(self, ip: str):
        """Remove IP from blacklist"""
        self.ip_blacklist.discard(ip)
        logger.info(f"IP {ip} removed from blacklist")
    
    def remove_from_whitelist(self, ip: str):
        """Remove IP from whitelist"""
        self.ip_whitelist.discard(ip)
        logger.info(f"IP {ip} removed from whitelist")

# Global IP tracker instance
ip_tracker = IPTracker()

class IPTrackingMiddleware:
    """Middleware for comprehensive IP tracking"""
    
    @staticmethod
    async def track_ip_activity(request: Request, call_next):
        """Track IP activity for all requests"""
        # Get client IP
        client_ip = ip_tracker.get_client_ip(request)
        
        # Record activity
        ip_tracker.record_ip_activity(
            ip=client_ip,
            path=request.url.path,
            method=request.method,
            user_agent=request.headers.get("user-agent", "")
        )
        
        # Add IP info to request state
        request.state.client_ip = client_ip
        request.state.ip_info = ip_tracker.get_ip_info(client_ip)
        
        # Check if IP is blacklisted
        if client_ip in ip_tracker.ip_blacklist:
            logger.warning(f"Blacklisted IP {client_ip} attempted access to {request.url.path}")
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Process request
        response = await call_next(request)
        
        # Add IP tracking headers
        response.headers["X-Client-IP"] = client_ip
        response.headers["X-IP-Info"] = json.dumps({
            "ip": client_ip,
            "is_private": request.state.ip_info.get("is_private", False),
            "is_suspicious": request.state.ip_info.get("is_suspicious", False)
        })
        
        return response

