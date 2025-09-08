"""
Dashboard Service
Aggregates user data for dashboard display and analytics
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from bson import ObjectId
import logging

from database import get_collection
from mongo_models import BookingStatus, BookingType, UserPreferencesDocument
from services.booking_service import BookingService
from services.session_service import SessionService
from services.saved_itinerary_service import SavedItineraryService

logger = logging.getLogger(__name__)

class DashboardService:
    USERS_COLLECTION = "users"
    BOOKINGS_COLLECTION = "recent_bookings"
    ITINERARIES_COLLECTION = "saved_itineraries"
    TRIPS_COLLECTION = "upcoming_trips"
    NOTIFICATIONS_COLLECTION = "notifications"
    PRICE_ALERTS_COLLECTION = "price_alerts"
    
    @staticmethod
    async def get_dashboard_data(user_id: str) -> Dict[str, Any]:
        """Get comprehensive dashboard data for a user."""
        try:
            # Run all queries in parallel for better performance
            import asyncio
            
            tasks = [
                DashboardService._get_user_stats(user_id),
                DashboardService._get_recent_bookings(user_id, limit=5),
                DashboardService._get_upcoming_trips(user_id, limit=3),
                DashboardService._get_saved_itineraries(user_id, limit=5),
                DashboardService._get_active_price_alerts(user_id),
                DashboardService._get_notifications(user_id, limit=10),
                DashboardService._get_travel_analytics(user_id),
                SessionService.get_session_analytics(user_id)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Handle any exceptions
            user_stats = results[0] if not isinstance(results[0], Exception) else {}
            recent_bookings = results[1] if not isinstance(results[1], Exception) else []
            upcoming_trips = results[2] if not isinstance(results[2], Exception) else []
            saved_itineraries = results[3] if not isinstance(results[3], Exception) else []
            price_alerts = results[4] if not isinstance(results[4], Exception) else []
            notifications = results[5] if not isinstance(results[5], Exception) else []
            travel_analytics = results[6] if not isinstance(results[6], Exception) else {}
            session_analytics = results[7] if not isinstance(results[7], Exception) else {}
            
            return {
                "user_stats": user_stats,
                "recent_bookings": recent_bookings,
                "upcoming_trips": upcoming_trips,
                "saved_itineraries": saved_itineraries,
                "price_alerts": price_alerts,
                "notifications": notifications,
                "travel_analytics": travel_analytics,
                "session_analytics": session_analytics,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting dashboard data: {str(e)}")
            return {"error": f"Failed to load dashboard data: {str(e)}"}
    
    @staticmethod
    async def _get_user_stats(user_id: str) -> Dict[str, Any]:
        """Get user statistics and summary data."""
        try:
            collection = get_collection(DashboardService.BOOKINGS_COLLECTION)
            
            # Get booking statistics
            pipeline = [
                {"$match": {"user_id": user_id}},
                {
                    "$group": {
                        "_id": None,
                        "total_bookings": {"$sum": 1},
                        "total_spent": {"$sum": "$total_amount"},
                        "confirmed_bookings": {
                            "$sum": {
                                "$cond": [{"$eq": ["$status", "confirmed"]}, 1, 0]
                            }
                        },
                        "pending_bookings": {
                            "$sum": {
                                "$cond": [{"$eq": ["$status", "pending"]}, 1, 0]
                            }
                        },
                        "cancelled_bookings": {
                            "$sum": {
                                "$cond": [{"$eq": ["$status", "cancelled"]}, 1, 0]
                            }
                        },
                        "flight_bookings": {
                            "$sum": {
                                "$cond": [{"$eq": ["$type", "flight"]}, 1, 0]
                            }
                        },
                        "hotel_bookings": {
                            "$sum": {
                                "$cond": [{"$eq": ["$type", "hotel"]}, 1, 0]
                            }
                        }
                    }
                }
            ]
            
            stats_result = await collection.aggregate(pipeline).to_list(length=1)
            
            if stats_result:
                stats = stats_result[0]
                stats.pop("_id", None)
            else:
                stats = {
                    "total_bookings": 0,
                    "total_spent": 0,
                    "confirmed_bookings": 0,
                    "pending_bookings": 0,
                    "cancelled_bookings": 0,
                    "flight_bookings": 0,
                    "hotel_bookings": 0
                }
            
            # Get upcoming trips count from upcoming_trips collection
            upcoming_collection = get_collection(DashboardService.TRIPS_COLLECTION)
            upcoming_count = await upcoming_collection.count_documents({
                "user_id": user_id,
                "status": {"$in": ["pending", "confirmed"]}
            })
            
            # Get loyalty points (placeholder - implement based on your loyalty system)
            loyalty_points = stats.get("total_spent", 0) * 10  # 10 points per dollar spent
            
            return {
                **stats,
                "upcoming_trips": upcoming_count,
                "loyalty_points": int(loyalty_points),
                "loyalty_tier": DashboardService._get_loyalty_tier(loyalty_points)
            }
            
        except Exception as e:
            logger.error(f"Error getting user stats: {str(e)}")
            return {}
    
    @staticmethod
    async def _get_recent_bookings(user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent bookings for the user."""
        try:
            collection = get_collection(DashboardService.BOOKINGS_COLLECTION)
            
            cursor = collection.find({
                "user_id": user_id
            }).sort("created_at", -1).limit(limit)
            
            bookings = await cursor.to_list(length=limit)
            
            return [
                {
                    "id": str(booking["_id"]),
                    "booking_id": booking.get("booking_id", ""),
                    "type": booking.get("type", ""),
                    "status": booking.get("status", ""),
                    "total_amount": booking.get("total_amount", 0),
                    "currency": booking.get("currency", "USD"),
                    "travel_date": booking.get("travel_date", ""),
                    "return_date": booking.get("return_date"),
                    "passengers": booking.get("passengers", 1),
                    "created_at": booking.get("created_at").isoformat() if booking.get("created_at") else "",
                    "destination": booking.get("destination", "")
                }
                for booking in bookings
            ]
            
        except Exception as e:
            logger.error(f"Error getting recent bookings: {str(e)}")
            return []
    
    @staticmethod
    async def _get_upcoming_trips(user_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Get upcoming trips for the user."""
        try:
            collection = get_collection(DashboardService.TRIPS_COLLECTION)
            
            cursor = collection.find({
                "user_id": user_id
            }).sort("start_date", 1).limit(limit)
            
            trips = await cursor.to_list(length=limit)
            
            return [
                {
                    "id": str(trip["_id"]),
                    "booking_id": trip.get("booking_id", ""),
                    "type": trip.get("type", ""),
                    "status": trip.get("status", ""),
                    "total_amount": trip.get("total_amount", 0),
                    "currency": trip.get("currency", "USD"),
                    "travel_date": trip.get("travel_date", ""),
                    "return_date": trip.get("return_date"),
                    "passengers": trip.get("passengers", 1),
                    "destination": trip.get("destination", ""),
                    "days_until": trip.get("days_until", 0)
                }
                for trip in trips
            ]
            
        except Exception as e:
            logger.error(f"Error getting upcoming trips: {str(e)}")
            return []
    
    
    @staticmethod
    async def _get_active_price_alerts(user_id: str) -> List[Dict[str, Any]]:
        """Get active price alerts for the user."""
        try:
            collection = get_collection(DashboardService.PRICE_ALERTS_COLLECTION)
            
            cursor = collection.find({
                "user_id": ObjectId(user_id),
                "status": "active"
            }).sort("created_at", -1).limit(10)
            
            alerts = await cursor.to_list(length=10)
            
            return [
                {
                    "id": str(alert["_id"]),
                    "alert_id": alert.get("alert_id"),
                    "type": alert.get("alert_type"),
                    "destination": alert.get("destination"),
                    "target_price": alert.get("target_price"),
                    "current_price": alert.get("current_price"),
                    "currency": alert.get("currency", "USD"),
                    "departure_date": alert.get("departure_date").isoformat() if alert.get("departure_date") else None,
                    "return_date": alert.get("return_date").isoformat() if alert.get("return_date") else None,
                    "created_at": alert.get("created_at").isoformat() if alert.get("created_at") else None,
                    "last_checked": alert.get("last_checked").isoformat() if alert.get("last_checked") else None
                }
                for alert in alerts
            ]
            
        except Exception as e:
            logger.error(f"Error getting price alerts: {str(e)}")
            return []
    
    @staticmethod
    async def _get_notifications(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent notifications for the user."""
        try:
            collection = get_collection(DashboardService.NOTIFICATIONS_COLLECTION)
            
            cursor = collection.find({
                "user_id": ObjectId(user_id)
            }).sort("created_at", -1).limit(limit)
            
            notifications = await cursor.to_list(length=limit)
            
            return [
                {
                    "id": str(notification["_id"]),
                    "notification_id": notification.get("notification_id"),
                    "type": notification.get("type"),
                    "status": notification.get("status"),
                    "title": notification.get("title"),
                    "message": notification.get("message"),
                    "data": notification.get("data", {}),
                    "is_read": notification.get("status") == "read",
                    "created_at": notification.get("created_at").isoformat() if notification.get("created_at") else None,
                    "read_at": notification.get("read_at").isoformat() if notification.get("read_at") else None,
                    "action_url": notification.get("action_url")
                }
                for notification in notifications
            ]
            
        except Exception as e:
            logger.error(f"Error getting notifications: {str(e)}")
            return []
    
    @staticmethod
    async def _get_travel_analytics(user_id: str) -> Dict[str, Any]:
        """Get travel analytics and insights for the user."""
        try:
            collection = get_collection(DashboardService.BOOKINGS_COLLECTION)
            
            # Get monthly booking trends
            monthly_pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {
                    "$group": {
                        "_id": {
                            "year": {"$year": "$created_at"},
                            "month": {"$month": "$created_at"}
                        },
                        "count": {"$sum": 1},
                        "total_amount": {"$sum": "$total_amount"}
                    }
                },
                {"$sort": {"_id.year": 1, "_id.month": 1}}
            ]
            
            monthly_trends = await collection.aggregate(monthly_pipeline).to_list(length=12)
            
            # Get destination preferences
            destination_pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {
                    "$group": {
                        "_id": "$destination",
                        "count": {"$sum": 1},
                        "total_spent": {"$sum": "$total_amount"}
                    }
                },
                {"$sort": {"count": -1}},
                {"$limit": 5}
            ]
            
            top_destinations = await collection.aggregate(destination_pipeline).to_list(length=5)
            
            return {
                "monthly_trends": monthly_trends,
                "top_destinations": top_destinations,
                "total_countries": len(set([d["_id"] for d in top_destinations])),
                "average_booking_value": sum([d["total_spent"] for d in top_destinations]) / max(len(top_destinations), 1)
            }
            
        except Exception as e:
            logger.error(f"Error getting travel analytics: {str(e)}")
            return {}
    
    @staticmethod
    def _extract_destination(booking) -> str:
        """Extract destination from booking details."""
        if booking.flight_details:
            return booking.flight_details.get("arrival_city", "Unknown")
        elif booking.hotel_details:
            return booking.hotel_details.get("city", "Unknown")
        return "Unknown"
    
    @staticmethod
    def _get_loyalty_tier(points: int) -> str:
        """Determine loyalty tier based on points."""
        if points >= 50000:
            return "platinum"
        elif points >= 25000:
            return "gold"
        elif points >= 10000:
            return "silver"
        else:
            return "bronze"
    
    @staticmethod
    async def get_user_preferences(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user preferences and settings."""
        try:
            collection = get_collection(SessionService.PREFERENCES_COLLECTION)
            
            preferences_doc = await collection.find_one({"user_id": ObjectId(user_id)})
            
            if not preferences_doc:
                # Create default preferences
                default_prefs = {
                    "user_id": ObjectId(user_id),
                    "notification_preferences": {
                        "email_notifications": True,
                        "push_notifications": True,
                        "sms_notifications": False,
                        "booking_updates": True,
                        "price_alerts": True,
                        "promotional_offers": True,
                        "travel_reminders": True,
                        "weather_updates": True
                    },
                    "travel_preferences": {
                        "preferred_airlines": [],
                        "preferred_hotel_chains": [],
                        "budget_range": None,
                        "travel_style": [],
                        "dietary_restrictions": [],
                        "accessibility_needs": [],
                        "language_preferences": ["en"],
                        "currency_preference": "USD",
                        "timezone": "UTC"
                    },
                    "privacy_settings": {},
                    "theme_preference": "system",
                    "language": "en",
                    "region": "US",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                result = await collection.insert_one(default_prefs)
                default_prefs["_id"] = result.inserted_id
                preferences_doc = default_prefs
            
            return {
                "id": str(preferences_doc["_id"]),
                "notification_preferences": preferences_doc.get("notification_preferences", {}),
                "travel_preferences": preferences_doc.get("travel_preferences", {}),
                "privacy_settings": preferences_doc.get("privacy_settings", {}),
                "theme_preference": preferences_doc.get("theme_preference", "system"),
                "language": preferences_doc.get("language", "en"),
                "region": preferences_doc.get("region", "US"),
                "updated_at": preferences_doc.get("updated_at").isoformat() if preferences_doc.get("updated_at") else None
            }
            
        except Exception as e:
            logger.error(f"Error getting user preferences: {str(e)}")
            return None
    
    @staticmethod
    async def update_user_preferences(user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user preferences."""
        try:
            collection = get_collection(SessionService.PREFERENCES_COLLECTION)
            
            preferences["updated_at"] = datetime.utcnow()
            
            result = await collection.update_one(
                {"user_id": ObjectId(user_id)},
                {"$set": preferences},
                upsert=True
            )
            
            return result.modified_count > 0 or result.upserted_id is not None
            
        except Exception as e:
            logger.error(f"Error updating user preferences: {str(e)}")
            return False
    
    @staticmethod
    async def _get_saved_itineraries(user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get user's saved itineraries for dashboard."""
        try:
            collection = get_collection(DashboardService.ITINERARIES_COLLECTION)
            
            cursor = collection.find({
                "user_id": user_id
            }).sort("created_at", -1).limit(limit)
            
            itineraries = await cursor.to_list(length=limit)
            
            # Format for dashboard display with all required fields
            formatted_itineraries = []
            for itinerary in itineraries:
                formatted_itineraries.append({
                    "id": str(itinerary["_id"]),
                    "itinerary_id": str(itinerary["_id"]),  # Required field
                    "title": itinerary.get("title", ""),
                    "destination": itinerary.get("destination", ""),
                    "country": itinerary.get("country", ""),
                    "city": itinerary.get("city", ""),
                    "start_date": itinerary.get("start_date"),  # Required field
                    "end_date": itinerary.get("end_date"),  # Required field
                    "total_days": itinerary.get("duration_days", 0),  # Required field
                    "duration_days": itinerary.get("duration_days", 0),
                    "budget": itinerary.get("budget"),
                    "budget_estimate": itinerary.get("budget", 0),  # Required field
                    "total_estimated_cost": itinerary.get("total_estimated_cost"),
                    "currency": itinerary.get("currency", "USD"),  # Required field
                    "travel_style": itinerary.get("travel_style", []),
                    "interests": itinerary.get("interests", []),
                    "is_favorite": itinerary.get("is_favorite", False),
                    "is_public": itinerary.get("is_public", False),  # Required field
                    "status": itinerary.get("status", "draft"),
                    "tags": itinerary.get("tags", []),  # Required field
                    "cover_image": itinerary.get("cover_image"),
                    "views_count": itinerary.get("views_count", 0),
                    "likes_count": itinerary.get("likes_count", 0),
                    "created_at": itinerary.get("created_at").isoformat() if itinerary.get("created_at") else None,
                    "updated_at": itinerary.get("updated_at").isoformat() if itinerary.get("updated_at") else None
                })

            return formatted_itineraries

        except Exception as e:
            logger.error(f"Error getting saved itineraries: {str(e)}")
            return []
