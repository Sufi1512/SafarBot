from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
import uuid
import asyncio
from enum import Enum

router = APIRouter()

class AlertType(str, Enum):
    FLIGHT = "flight"
    HOTEL = "hotel"

class AlertStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIGGERED = "triggered"

class PriceAlertCreate(BaseModel):
    destination: str
    current_price: float
    target_price: float
    alert_type: AlertType
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    departure_date: Optional[date] = None
    return_date: Optional[date] = None
    passengers: Optional[int] = 1
    guests: Optional[int] = 1
    user_id: Optional[str] = None

class PriceAlertResponse(BaseModel):
    id: str
    destination: str
    current_price: float
    target_price: float
    alert_type: AlertType
    status: AlertStatus
    is_active: bool
    created_at: datetime
    last_checked: datetime
    next_check: datetime
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    departure_date: Optional[date] = None
    return_date: Optional[date] = None
    passengers: Optional[int] = 1
    guests: Optional[int] = 1
    user_id: Optional[str] = None

class PriceAlertUpdate(BaseModel):
    target_price: Optional[float] = None
    is_active: Optional[bool] = None

class AlertNotification(BaseModel):
    alert_id: str
    destination: str
    current_price: float
    target_price: float
    price_drop: float
    percentage_drop: float
    alert_type: AlertType
    triggered_at: datetime
    booking_url: Optional[str] = None

# Mock database for price alerts
price_alerts_db = {}
alert_notifications_db = {}

@router.post("/alerts/create", response_model=PriceAlertResponse)
async def create_price_alert(alert: PriceAlertCreate):
    """Create a new price alert for flights or hotels"""
    try:
        alert_id = str(uuid.uuid4())
        now = datetime.now()
        
        # Calculate next check time (check every 6 hours)
        next_check = datetime.fromtimestamp(now.timestamp() + (6 * 60 * 60))
        
        alert_record = {
            "id": alert_id,
            "destination": alert.destination,
            "current_price": alert.current_price,
            "target_price": alert.target_price,
            "alert_type": alert.alert_type,
            "status": AlertStatus.ACTIVE,
            "is_active": True,
            "created_at": now,
            "last_checked": now,
            "next_check": next_check,
            "check_in_date": alert.check_in_date,
            "check_out_date": alert.check_out_date,
            "departure_date": alert.departure_date,
            "return_date": alert.return_date,
            "passengers": alert.passengers,
            "guests": alert.guests,
            "user_id": alert.user_id
        }
        
        price_alerts_db[alert_id] = alert_record
        
        return PriceAlertResponse(**alert_record)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating price alert: {str(e)}")

@router.get("/alerts", response_model=List[PriceAlertResponse])
async def get_price_alerts(
    user_id: Optional[str] = None,
    alert_type: Optional[AlertType] = None,
    status: Optional[AlertStatus] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all price alerts with optional filtering"""
    try:
        alerts = list(price_alerts_db.values())
        
        # Apply filters
        if user_id:
            alerts = [alert for alert in alerts if alert.get("user_id") == user_id]
        
        if alert_type:
            alerts = [alert for alert in alerts if alert["alert_type"] == alert_type]
        
        if status:
            alerts = [alert for alert in alerts if alert["status"] == status]
        
        # Apply pagination
        alerts = alerts[offset:offset + limit]
        
        return [PriceAlertResponse(**alert) for alert in alerts]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving price alerts: {str(e)}")

@router.get("/alerts/{alert_id}", response_model=PriceAlertResponse)
async def get_price_alert(alert_id: str):
    """Get a specific price alert by ID"""
    try:
        if alert_id not in price_alerts_db:
            raise HTTPException(status_code=404, detail="Price alert not found")
        
        return PriceAlertResponse(**price_alerts_db[alert_id])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving price alert: {str(e)}")

@router.put("/alerts/{alert_id}", response_model=PriceAlertResponse)
async def update_price_alert(alert_id: str, update: PriceAlertUpdate):
    """Update a price alert"""
    try:
        if alert_id not in price_alerts_db:
            raise HTTPException(status_code=404, detail="Price alert not found")
        
        alert = price_alerts_db[alert_id]
        
        if update.target_price is not None:
            alert["target_price"] = update.target_price
        
        if update.is_active is not None:
            alert["is_active"] = update.is_active
            alert["status"] = AlertStatus.ACTIVE if update.is_active else AlertStatus.INACTIVE
        
        alert["last_checked"] = datetime.now()
        
        return PriceAlertResponse(**alert)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating price alert: {str(e)}")

@router.delete("/alerts/{alert_id}")
async def delete_price_alert(alert_id: str):
    """Delete a price alert"""
    try:
        if alert_id not in price_alerts_db:
            raise HTTPException(status_code=404, detail="Price alert not found")
        
        del price_alerts_db[alert_id]
        
        return {"message": "Price alert deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting price alert: {str(e)}")

@router.post("/alerts/{alert_id}/toggle")
async def toggle_price_alert(alert_id: str):
    """Toggle the active status of a price alert"""
    try:
        if alert_id not in price_alerts_db:
            raise HTTPException(status_code=404, detail="Price alert not found")
        
        alert = price_alerts_db[alert_id]
        alert["is_active"] = not alert["is_active"]
        alert["status"] = AlertStatus.ACTIVE if alert["is_active"] else AlertStatus.INACTIVE
        alert["last_checked"] = datetime.now()
        
        return {
            "message": f"Price alert {'activated' if alert['is_active'] else 'deactivated'} successfully",
            "is_active": alert["is_active"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling price alert: {str(e)}")

@router.get("/alerts/notifications", response_model=List[AlertNotification])
async def get_alert_notifications(
    user_id: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Get price drop notifications"""
    try:
        notifications = list(alert_notifications_db.values())
        
        if user_id:
            notifications = [notif for notif in notifications if notif.get("user_id") == user_id]
        
        notifications = notifications[offset:offset + limit]
        
        return [AlertNotification(**notif) for notif in notifications]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving notifications: {str(e)}")

@router.post("/alerts/check-prices")
async def check_price_alerts():
    """Background job to check prices for all active alerts"""
    try:
        active_alerts = [
            alert for alert in price_alerts_db.values() 
            if alert["is_active"] and alert["status"] == AlertStatus.ACTIVE
        ]
        
        triggered_alerts = []
        
        for alert in active_alerts:
            # Simulate price checking (in real implementation, this would call external APIs)
            await asyncio.sleep(0.1)  # Simulate API call delay
            
            # Mock price change (random for demonstration)
            import random
            price_change = random.uniform(-0.2, 0.1)  # -20% to +10% change
            new_price = alert["current_price"] * (1 + price_change)
            
            # Update current price
            alert["current_price"] = round(new_price, 2)
            alert["last_checked"] = datetime.now()
            
            # Check if price dropped below target
            if new_price <= alert["target_price"]:
                alert["status"] = AlertStatus.TRIGGERED
                triggered_alerts.append(alert)
                
                # Create notification
                notification_id = str(uuid.uuid4())
                price_drop = alert["current_price"] - new_price
                percentage_drop = (price_drop / alert["current_price"]) * 100
                
                notification = {
                    "id": notification_id,
                    "alert_id": alert["id"],
                    "destination": alert["destination"],
                    "current_price": new_price,
                    "target_price": alert["target_price"],
                    "price_drop": round(price_drop, 2),
                    "percentage_drop": round(percentage_drop, 2),
                    "alert_type": alert["alert_type"],
                    "triggered_at": datetime.now(),
                    "booking_url": f"https://safarbot.com/book?alert_id={alert['id']}",
                    "user_id": alert.get("user_id")
                }
                
                alert_notifications_db[notification_id] = notification
        
        return {
            "message": f"Checked {len(active_alerts)} alerts, {len(triggered_alerts)} price drops detected",
            "alerts_checked": len(active_alerts),
            "alerts_triggered": len(triggered_alerts)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking price alerts: {str(e)}")

@router.get("/alerts/stats")
async def get_alert_statistics(user_id: Optional[str] = None):
    """Get statistics about price alerts"""
    try:
        alerts = list(price_alerts_db.values())
        
        if user_id:
            alerts = [alert for alert in alerts if alert.get("user_id") == user_id]
        
        total_alerts = len(alerts)
        active_alerts = len([alert for alert in alerts if alert["is_active"]])
        triggered_alerts = len([alert for alert in alerts if alert["status"] == AlertStatus.TRIGGERED])
        
        flight_alerts = len([alert for alert in alerts if alert["alert_type"] == AlertType.FLIGHT])
        hotel_alerts = len([alert for alert in alerts if alert["alert_type"] == AlertType.HOTEL])
        
        # Calculate average price drop for triggered alerts
        triggered_price_drops = []
        for alert in alerts:
            if alert["status"] == AlertStatus.TRIGGERED:
                price_drop = alert["current_price"] - alert["target_price"]
                triggered_price_drops.append(price_drop)
        
        avg_price_drop = sum(triggered_price_drops) / len(triggered_price_drops) if triggered_price_drops else 0
        
        return {
            "total_alerts": total_alerts,
            "active_alerts": active_alerts,
            "triggered_alerts": triggered_alerts,
            "flight_alerts": flight_alerts,
            "hotel_alerts": hotel_alerts,
            "average_price_drop": round(avg_price_drop, 2),
            "total_savings": round(sum(triggered_price_drops), 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving alert statistics: {str(e)}")

@router.post("/alerts/predict-prices")
async def predict_price_trends(destination: str, alert_type: AlertType, date_range: str):
    """Predict price trends for a destination"""
    try:
        # Mock price prediction (in real implementation, this would use ML models)
        import random
        
        predictions = {
            "destination": destination,
            "alert_type": alert_type,
            "date_range": date_range,
            "prediction": {
                "trend": random.choice(["increasing", "decreasing", "stable"]),
                "confidence": round(random.uniform(0.6, 0.95), 2),
                "expected_change_percentage": round(random.uniform(-15, 10), 1),
                "recommended_action": random.choice([
                    "Book now - prices expected to rise",
                    "Wait - prices expected to drop",
                    "Monitor closely - prices stable"
                ]),
                "factors": [
                    "Seasonal demand",
                    "Fuel prices",
                    "Competition",
                    "Economic conditions"
                ]
            },
            "historical_data": [
                {"date": "2024-01-01", "price": 850},
                {"date": "2024-01-15", "price": 820},
                {"date": "2024-02-01", "price": 780},
                {"date": "2024-02-15", "price": 750}
            ]
        }
        
        return predictions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting price trends: {str(e)}") 