from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from bson import ObjectId
import uuid

from database import get_collection, PRICE_ALERTS_COLLECTION, NOTIFICATIONS_COLLECTION
from mongo_models import (
    PriceAlertDocument, NotificationDocument,
    AlertType, AlertStatus, NotificationType, NotificationStatus
)

class AlertService:
    @staticmethod
    async def create_price_alert(
        user_id: str,
        alert_type: AlertType,
        destination: str,
        target_price: float,
        currency: str = "USD",
        departure_date: Optional[date] = None,
        return_date: Optional[date] = None,
        check_in_date: Optional[date] = None,
        check_out_date: Optional[date] = None,
        passengers: int = 1,
        guests: int = 1,
        current_price: Optional[float] = None,
        search_criteria: Optional[Dict[str, Any]] = None
    ) -> PriceAlertDocument:
        """Create a new price alert."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        
        alert_data = {
            "user_id": ObjectId(user_id),
            "alert_type": alert_type,
            "status": AlertStatus.ACTIVE,
            "destination": destination,
            "departure_date": departure_date,
            "return_date": return_date,
            "check_in_date": check_in_date,
            "check_out_date": check_out_date,
            "target_price": target_price,
            "current_price": current_price or target_price,
            "currency": currency,
            "passengers": passengers,
            "guests": guests,
            "email_notifications": True,
            "push_notifications": True,
            "search_criteria": search_criteria or {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await collection.insert_one(alert_data)
        alert_data["_id"] = result.inserted_id
        
        return PriceAlertDocument(**alert_data)

    @staticmethod
    async def get_user_alerts(
        user_id: str,
        status: Optional[AlertStatus] = None,
        alert_type: Optional[AlertType] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[PriceAlertDocument]:
        """Get price alerts for a specific user."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        
        query = {"user_id": ObjectId(user_id)}
        if status:
            query["status"] = status
        if alert_type:
            query["alert_type"] = alert_type
        
        cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        alerts = await cursor.to_list(length=limit)
        
        return [PriceAlertDocument(**alert) for alert in alerts]

    @staticmethod
    async def get_alert_by_id(alert_id: str) -> Optional[PriceAlertDocument]:
        """Get price alert by ID."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        alert_doc = await collection.find_one({"_id": ObjectId(alert_id)})
        return PriceAlertDocument(**alert_doc) if alert_doc else None

    @staticmethod
    async def update_alert(
        alert_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> bool:
        """Update a price alert."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await collection.update_one(
            {
                "_id": ObjectId(alert_id),
                "user_id": ObjectId(user_id)
            },
            {"$set": update_data}
        )
        
        return result.modified_count > 0

    @staticmethod
    async def toggle_alert_status(alert_id: str, user_id: str) -> bool:
        """Toggle alert status between active and inactive."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        
        # Get current alert
        alert_doc = await collection.find_one({
            "_id": ObjectId(alert_id),
            "user_id": ObjectId(user_id)
        })
        
        if not alert_doc:
            return False
        
        # Toggle status
        new_status = AlertStatus.INACTIVE if alert_doc["status"] == AlertStatus.ACTIVE else AlertStatus.ACTIVE
        
        result = await collection.update_one(
            {
                "_id": ObjectId(alert_id),
                "user_id": ObjectId(user_id)
            },
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0

    @staticmethod
    async def delete_alert(alert_id: str, user_id: str) -> bool:
        """Delete a price alert."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        
        result = await collection.delete_one({
            "_id": ObjectId(alert_id),
            "user_id": ObjectId(user_id)
        })
        
        return result.deleted_count > 0

    @staticmethod
    async def check_price_alerts() -> List[PriceAlertDocument]:
        """Check all active price alerts for price drops."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        
        # Get all active alerts
        query = {
            "status": AlertStatus.ACTIVE,
            "last_checked": {
                "$or": [
                    {"$lt": datetime.utcnow() - timedelta(hours=6)},
                    {"$exists": False}
                ]
            }
        }
        
        cursor = collection.find(query)
        alerts = await cursor.to_list(length=None)
        
        triggered_alerts = []
        
        for alert_doc in alerts:
            alert = PriceAlertDocument(**alert_doc)
            
            # Simulate price checking (in real implementation, this would call external APIs)
            current_price = await AlertService._simulate_price_check(alert)
            
            if current_price and current_price <= alert.target_price:
                # Price drop detected - trigger alert
                await AlertService._trigger_alert(alert, current_price)
                triggered_alerts.append(alert)
            
            # Update last checked time
            await collection.update_one(
                {"_id": alert.id},
                {
                    "$set": {
                        "current_price": current_price,
                        "last_checked": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        
        return triggered_alerts

    @staticmethod
    async def _simulate_price_check(alert: PriceAlertDocument) -> Optional[float]:
        """Simulate price checking (replace with actual API calls)."""
        import random
        
        # Simulate price fluctuations
        base_price = alert.current_price or alert.target_price
        variation = random.uniform(-0.2, 0.1)  # -20% to +10% variation
        new_price = base_price * (1 + variation)
        
        return round(new_price, 2)

    @staticmethod
    async def _trigger_alert(alert: PriceAlertDocument, current_price: float) -> None:
        """Trigger a price alert notification."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        
        # Update alert status
        await collection.update_one(
            {"_id": alert.id},
            {
                "$set": {
                    "status": AlertStatus.TRIGGERED,
                    "current_price": current_price,
                    "triggered_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Create notification
        await AlertService.create_notification(
            user_id=str(alert.user_id),
            notification_type=NotificationType.PRICE_ALERT,
            title=f"Price Drop Alert: {alert.destination}",
            message=f"Great news! Prices for {alert.destination} have dropped to ${current_price}",
            data={
                "alert_id": str(alert.id),
                "alert_type": alert.alert_type,
                "destination": alert.destination,
                "target_price": alert.target_price,
                "current_price": current_price,
                "currency": alert.currency
            }
        )

    @staticmethod
    async def create_notification(
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        priority: int = 1
    ) -> NotificationDocument:
        """Create a new notification."""
        collection = get_collection(NOTIFICATIONS_COLLECTION)
        
        notification_data = {
            "user_id": ObjectId(user_id),
            "type": notification_type,
            "status": NotificationStatus.UNREAD,
            "title": title,
            "message": message,
            "data": data or {},
            "is_email_sent": False,
            "is_push_sent": False,
            "priority": priority,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await collection.insert_one(notification_data)
        notification_data["_id"] = result.inserted_id
        
        return NotificationDocument(**notification_data)

    @staticmethod
    async def get_user_notifications(
        user_id: str,
        status: Optional[NotificationStatus] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[NotificationDocument]:
        """Get notifications for a specific user."""
        collection = get_collection(NOTIFICATIONS_COLLECTION)
        
        query = {"user_id": ObjectId(user_id)}
        if status:
            query["status"] = status
        
        cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        notifications = await cursor.to_list(length=limit)
        
        return [NotificationDocument(**notification) for notification in notifications]

    @staticmethod
    async def mark_notification_as_read(notification_id: str, user_id: str) -> bool:
        """Mark a notification as read."""
        collection = get_collection(NOTIFICATIONS_COLLECTION)
        
        result = await collection.update_one(
            {
                "_id": ObjectId(notification_id),
                "user_id": ObjectId(user_id)
            },
            {
                "$set": {
                    "status": NotificationStatus.READ,
                    "read_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0

    @staticmethod
    async def get_alert_statistics(user_id: str) -> Dict[str, Any]:
        """Get price alert statistics for a user."""
        collection = get_collection(PRICE_ALERTS_COLLECTION)
        
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        stats = await collection.aggregate(pipeline).to_list(length=None)
        
        # Convert to dictionary
        statistics = {
            "total_alerts": 0,
            "active": 0,
            "inactive": 0,
            "triggered": 0
        }
        
        for stat in stats:
            status = stat["_id"]
            count = stat["count"]
            
            statistics["total_alerts"] += count
            statistics[status] = count
        
        return statistics

    @staticmethod
    async def predict_prices(
        destination: str,
        alert_type: AlertType,
        travel_date: date
    ) -> Dict[str, Any]:
        """Predict price trends for a destination."""
        # This would integrate with external price prediction APIs
        # For now, return simulated data
        
        import random
        from datetime import timedelta
        
        days_until_travel = (travel_date - date.today()).days
        
        # Simulate price prediction
        base_price = random.uniform(200, 800)
        price_trend = []
        
        for i in range(30):  # Predict next 30 days
            day_price = base_price * (1 + random.uniform(-0.1, 0.15))
            price_trend.append({
                "date": (date.today() + timedelta(days=i)).isoformat(),
                "price": round(day_price, 2),
                "confidence": random.uniform(0.7, 0.95)
            })
        
        return {
            "destination": destination,
            "alert_type": alert_type,
            "travel_date": travel_date.isoformat(),
            "current_price": round(base_price, 2),
            "predicted_lowest": round(min(p["price"] for p in price_trend), 2),
            "predicted_highest": round(max(p["price"] for p in price_trend), 2),
            "recommendation": "wait" if days_until_travel > 14 else "book_now",
            "price_trend": price_trend
        } 