"""
Dashboard API Router
Handles dashboard-related endpoints and user data aggregation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

from services.dashboard_service import DashboardService
from services.session_service import SessionService
from routers.auth import get_current_user
from mongo_models import User

router = APIRouter()

# Pydantic models for request/response
class DashboardStatsResponse(BaseModel):
    total_bookings: int
    total_spent: float
    confirmed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    flight_bookings: int
    hotel_bookings: int
    upcoming_trips: int
    loyalty_points: int
    loyalty_tier: str

class BookingSummary(BaseModel):
    id: str
    booking_id: str
    type: str
    status: str
    total_amount: float
    currency: str
    travel_date: str
    return_date: Optional[str]
    passengers: int
    destination: str
    created_at: str

class TripSummary(BaseModel):
    id: str
    booking_id: str
    type: str
    status: str
    total_amount: float
    currency: str
    travel_date: str
    return_date: Optional[str]
    passengers: int
    destination: str
    days_until: int

class ItinerarySummary(BaseModel):
    id: str
    itinerary_id: str
    title: str
    destination: str
    start_date: Optional[str]
    end_date: Optional[str]
    total_days: int
    budget_estimate: float
    currency: str
    is_public: bool
    tags: List[str]
    created_at: Optional[str]
    updated_at: Optional[str]

class PriceAlertSummary(BaseModel):
    id: str
    alert_id: str
    type: str
    destination: str
    target_price: float
    current_price: float
    currency: str
    departure_date: Optional[str]
    return_date: Optional[str]
    created_at: Optional[str]
    last_checked: Optional[str]

class NotificationSummary(BaseModel):
    id: str
    notification_id: str
    type: str
    status: str
    title: str
    message: str
    data: Dict[str, Any]
    is_read: bool
    created_at: Optional[str]
    read_at: Optional[str]
    action_url: Optional[str]

class TravelAnalytics(BaseModel):
    monthly_trends: List[Dict[str, Any]]
    top_destinations: List[Dict[str, Any]]
    total_countries: int
    average_booking_value: float

class SessionAnalytics(BaseModel):
    total_sessions: int
    active_sessions: int
    device_types: List[str]
    last_activity: Optional[str]

class DashboardResponse(BaseModel):
    user_stats: DashboardStatsResponse
    recent_bookings: List[BookingSummary]
    upcoming_trips: List[TripSummary]
    saved_itineraries: List[ItinerarySummary]
    price_alerts: List[PriceAlertSummary]
    notifications: List[NotificationSummary]
    travel_analytics: TravelAnalytics
    session_analytics: SessionAnalytics
    last_updated: str

class UserPreferencesResponse(BaseModel):
    id: str
    notification_preferences: Dict[str, Any]
    travel_preferences: Dict[str, Any]
    privacy_settings: Dict[str, Any]
    theme_preference: str
    language: str
    region: str
    updated_at: Optional[str]

class UpdatePreferencesRequest(BaseModel):
    notification_preferences: Optional[Dict[str, Any]] = None
    travel_preferences: Optional[Dict[str, Any]] = None
    privacy_settings: Optional[Dict[str, Any]] = None
    theme_preference: Optional[str] = None
    language: Optional[str] = None
    region: Optional[str] = None

@router.get("/", response_model=DashboardResponse)
async def get_dashboard_data(current_user: User = Depends(get_current_user)):
    """Get comprehensive dashboard data for the current user."""
    try:
        dashboard_data = await DashboardService.get_dashboard_data(str(current_user.id))
        
        if "error" in dashboard_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=dashboard_data["error"]
            )
        
        return DashboardResponse(**dashboard_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard data: {str(e)}"
        )

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    """Get user statistics and summary data."""
    try:
        stats = await DashboardService._get_user_stats(str(current_user.id))
        return DashboardStatsResponse(**stats)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load user stats: {str(e)}"
        )

@router.get("/bookings", response_model=List[BookingSummary])
async def get_recent_bookings(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Get recent bookings for the user."""
    try:
        bookings = await DashboardService._get_recent_bookings(str(current_user.id), limit)
        return [BookingSummary(**booking) for booking in bookings]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load recent bookings: {str(e)}"
        )

@router.get("/trips", response_model=List[TripSummary])
async def get_upcoming_trips(
    limit: int = 5,
    current_user: User = Depends(get_current_user)
):
    """Get upcoming trips for the user."""
    try:
        trips = await DashboardService._get_upcoming_trips(str(current_user.id), limit)
        return [TripSummary(**trip) for trip in trips]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load upcoming trips: {str(e)}"
        )

@router.get("/itineraries", response_model=List[ItinerarySummary])
async def get_saved_itineraries(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Get saved itineraries for the user."""
    try:
        itineraries = await DashboardService._get_saved_itineraries(str(current_user.id), limit)
        return [ItinerarySummary(**itinerary) for itinerary in itineraries]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load saved itineraries: {str(e)}"
        )

@router.get("/price-alerts", response_model=List[PriceAlertSummary])
async def get_price_alerts(current_user: User = Depends(get_current_user)):
    """Get active price alerts for the user."""
    try:
        alerts = await DashboardService._get_active_price_alerts(str(current_user.id))
        return [PriceAlertSummary(**alert) for alert in alerts]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load price alerts: {str(e)}"
        )

@router.get("/notifications", response_model=List[NotificationSummary])
async def get_notifications(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get recent notifications for the user."""
    try:
        print(f"DEBUG: Dashboard notifications endpoint called for user: {current_user.id}")
        notifications = await DashboardService._get_notifications(str(current_user.id), limit)
        print(f"DEBUG: Dashboard service returned {len(notifications)} notifications")
        return [NotificationSummary(**notification) for notification in notifications]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load notifications: {str(e)}"
        )

@router.get("/analytics", response_model=TravelAnalytics)
async def get_travel_analytics(current_user: User = Depends(get_current_user)):
    """Get travel analytics and insights for the user."""
    try:
        analytics = await DashboardService._get_travel_analytics(str(current_user.id))
        return TravelAnalytics(**analytics)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load travel analytics: {str(e)}"
        )

@router.get("/sessions", response_model=SessionAnalytics)
async def get_session_analytics(current_user: User = Depends(get_current_user)):
    """Get session analytics for the user."""
    try:
        analytics = await SessionService.get_session_analytics(str(current_user.id))
        return SessionAnalytics(**analytics)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load session analytics: {str(e)}"
        )

@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(current_user: User = Depends(get_current_user)):
    """Get user preferences and settings."""
    try:
        preferences = await DashboardService.get_user_preferences(str(current_user.id))
        
        if not preferences:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User preferences not found"
            )
        
        return UserPreferencesResponse(**preferences)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load user preferences: {str(e)}"
        )

@router.put("/preferences", response_model=Dict[str, str])
async def update_user_preferences(
    preferences: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user preferences and settings."""
    try:
        # Convert to dict and remove None values
        prefs_dict = {k: v for k, v in preferences.dict().items() if v is not None}
        
        if not prefs_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No preferences provided to update"
            )
        
        success = await DashboardService.update_user_preferences(
            str(current_user.id), 
            prefs_dict
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update preferences"
            )
        
        return {"message": "Preferences updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(e)}"
        )

@router.get("/sessions")
async def get_active_sessions(current_user: User = Depends(get_current_user)):
    """Get all active sessions for the user."""
    try:
        sessions = await SessionService.get_active_sessions(str(current_user.id))
        
        return [
            {
                "id": str(session.id),
                "session_id": session.session_id,
                "device_type": session.device_type.value,
                "device_name": session.device_name,
                "ip_address": session.ip_address,
                "location": session.location,
                "last_activity": session.last_activity.isoformat(),
                "is_remember_me": session.is_remember_me,
                "created_at": session.created_at.isoformat()
            }
            for session in sessions
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load active sessions: {str(e)}"
        )

@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Revoke a specific session."""
    try:
        success = await SessionService.revoke_session(session_id, str(current_user.id))
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or already revoked"
            )
        
        return {"message": "Session revoked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke session: {str(e)}"
        )

@router.delete("/sessions")
async def revoke_all_sessions(
    current_user: User = Depends(get_current_user)
):
    """Revoke all sessions for the user (except current one)."""
    try:
        revoked_count = await SessionService.revoke_all_sessions(str(current_user.id))
        
        return {
            "message": f"Revoked {revoked_count} sessions successfully",
            "revoked_count": revoked_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke sessions: {str(e)}"
        )
