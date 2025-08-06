from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, date
import uuid
from enum import Enum

router = APIRouter()

class AffiliatePlatform(str, Enum):
    BOOKING_COM = "booking.com"
    EXPEDIA = "expedia"
    AGODA = "agoda"
    HOTELS_COM = "hotels.com"
    TRIP_COM = "trip.com"
    SKYSCANNER = "skyscanner"
    KAYAK = "kayak"

class CommissionType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class ClickStatus(str, Enum):
    PENDING = "pending"
    CONVERTED = "converted"
    EXPIRED = "expired"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class AffiliateClick(BaseModel):
    id: str
    platform: AffiliatePlatform
    affiliate_id: str
    user_id: Optional[str] = None
    destination: str
    search_query: Optional[str] = None
    price: Optional[float] = None
    commission_rate: float
    commission_type: CommissionType
    click_timestamp: datetime
    expiry_timestamp: datetime
    status: ClickStatus
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None

class AffiliateBooking(BaseModel):
    id: str
    click_id: str
    platform: AffiliatePlatform
    affiliate_id: str
    user_id: Optional[str] = None
    booking_reference: str
    booking_type: str  # "flight" or "hotel"
    destination: str
    booking_amount: float
    commission_amount: float
    commission_rate: float
    booking_date: datetime
    travel_date: Optional[date] = None
    status: BookingStatus
    platform_booking_id: Optional[str] = None
    customer_info: Optional[Dict[str, Any]] = None

class CommissionReport(BaseModel):
    platform: AffiliatePlatform
    total_clicks: int
    total_bookings: int
    conversion_rate: float
    total_revenue: float
    total_commission: float
    period_start: date
    period_end: date

class AffiliateLink(BaseModel):
    platform: AffiliatePlatform
    affiliate_id: str
    base_url: str
    commission_rate: float
    commission_type: CommissionType
    is_active: bool
    created_at: datetime
    last_updated: datetime

# Mock database for affiliate tracking
affiliate_clicks_db = {}
affiliate_bookings_db = {}
affiliate_links_db = {}

# Initialize mock affiliate links
def initialize_affiliate_links():
    if not affiliate_links_db:
        links = [
            {
                "platform": AffiliatePlatform.BOOKING_COM,
                "affiliate_id": "safarbot_booking_1",
                "base_url": "https://booking.com",
                "commission_rate": 8.5,
                "commission_type": CommissionType.PERCENTAGE,
                "is_active": True,
                "created_at": datetime.now(),
                "last_updated": datetime.now()
            },
            {
                "platform": AffiliatePlatform.EXPEDIA,
                "affiliate_id": "safarbot_expedia_1",
                "base_url": "https://expedia.com",
                "commission_rate": 7.2,
                "commission_type": CommissionType.PERCENTAGE,
                "is_active": True,
                "created_at": datetime.now(),
                "last_updated": datetime.now()
            },
            {
                "platform": AffiliatePlatform.AGODA,
                "affiliate_id": "safarbot_agoda_1",
                "base_url": "https://agoda.com",
                "commission_rate": 9.1,
                "commission_type": CommissionType.PERCENTAGE,
                "is_active": True,
                "created_at": datetime.now(),
                "last_updated": datetime.now()
            },
            {
                "platform": AffiliatePlatform.HOTELS_COM,
                "affiliate_id": "safarbot_hotels_1",
                "base_url": "https://hotels.com",
                "commission_rate": 6.8,
                "commission_type": CommissionType.PERCENTAGE,
                "is_active": True,
                "created_at": datetime.now(),
                "last_updated": datetime.now()
            },
            {
                "platform": AffiliatePlatform.TRIP_COM,
                "affiliate_id": "safarbot_trip_1",
                "base_url": "https://trip.com",
                "commission_rate": 8.9,
                "commission_type": CommissionType.PERCENTAGE,
                "is_active": True,
                "created_at": datetime.now(),
                "last_updated": datetime.now()
            }
        ]
        
        for link in links:
            affiliate_links_db[link["affiliate_id"]] = link

# Initialize affiliate links on startup
initialize_affiliate_links()

@router.post("/affiliate/track-click")
async def track_affiliate_click(
    platform: AffiliatePlatform,
    destination: str,
    price: Optional[float] = None,
    search_query: Optional[str] = None,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    referrer: Optional[str] = None
):
    """Track an affiliate click"""
    try:
        # Find the affiliate link for the platform
        affiliate_link = None
        for link in affiliate_links_db.values():
            if link["platform"] == platform and link["is_active"]:
                affiliate_link = link
                break
        
        if not affiliate_link:
            raise HTTPException(status_code=404, detail=f"No active affiliate link found for {platform}")
        
        click_id = str(uuid.uuid4())
        now = datetime.now()
        expiry_time = datetime.fromtimestamp(now.timestamp() + (24 * 60 * 60))  # 24 hours expiry
        
        click_record = {
            "id": click_id,
            "platform": platform,
            "affiliate_id": affiliate_link["affiliate_id"],
            "user_id": user_id,
            "destination": destination,
            "search_query": search_query,
            "price": price,
            "commission_rate": affiliate_link["commission_rate"],
            "commission_type": affiliate_link["commission_type"],
            "click_timestamp": now,
            "expiry_timestamp": expiry_time,
            "status": ClickStatus.PENDING,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "referrer": referrer
        }
        
        affiliate_clicks_db[click_id] = click_record
        
        # Generate booking URL with affiliate parameters
        booking_url = f"{affiliate_link['base_url']}/search?affiliate_id={affiliate_link['affiliate_id']}&click_id={click_id}&destination={destination}"
        if price:
            booking_url += f"&price={price}"
        if search_query:
            booking_url += f"&q={search_query}"
        
        return {
            "click_id": click_id,
            "booking_url": booking_url,
            "expiry_time": expiry_time.isoformat(),
            "commission_rate": affiliate_link["commission_rate"],
            "message": "Affiliate click tracked successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking affiliate click: {str(e)}")

@router.post("/affiliate/track-booking")
async def track_affiliate_booking(
    click_id: str,
    booking_reference: str,
    booking_type: str,
    booking_amount: float,
    travel_date: Optional[date] = None,
    platform_booking_id: Optional[str] = None,
    customer_info: Optional[Dict[str, Any]] = None
):
    """Track a booking conversion from an affiliate click"""
    try:
        if click_id not in affiliate_clicks_db:
            raise HTTPException(status_code=404, detail="Affiliate click not found")
        
        click = affiliate_clicks_db[click_id]
        
        # Check if click is still valid
        if datetime.now() > click["expiry_timestamp"]:
            click["status"] = ClickStatus.EXPIRED
            raise HTTPException(status_code=400, detail="Affiliate click has expired")
        
        # Calculate commission
        if click["commission_type"] == CommissionType.PERCENTAGE:
            commission_amount = (booking_amount * click["commission_rate"]) / 100
        else:
            commission_amount = click["commission_rate"]
        
        booking_id = str(uuid.uuid4())
        now = datetime.now()
        
        booking_record = {
            "id": booking_id,
            "click_id": click_id,
            "platform": click["platform"],
            "affiliate_id": click["affiliate_id"],
            "user_id": click["user_id"],
            "booking_reference": booking_reference,
            "booking_type": booking_type,
            "destination": click["destination"],
            "booking_amount": booking_amount,
            "commission_amount": round(commission_amount, 2),
            "commission_rate": click["commission_rate"],
            "booking_date": now,
            "travel_date": travel_date,
            "status": BookingStatus.PENDING,
            "platform_booking_id": platform_booking_id,
            "customer_info": customer_info
        }
        
        affiliate_bookings_db[booking_id] = booking_record
        
        # Update click status
        click["status"] = ClickStatus.CONVERTED
        
        return {
            "booking_id": booking_id,
            "commission_amount": commission_amount,
            "message": "Affiliate booking tracked successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking affiliate booking: {str(e)}")

@router.get("/affiliate/clicks", response_model=List[AffiliateClick])
async def get_affiliate_clicks(
    platform: Optional[AffiliatePlatform] = None,
    user_id: Optional[str] = None,
    status: Optional[ClickStatus] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get affiliate clicks with optional filtering"""
    try:
        clicks = list(affiliate_clicks_db.values())
        
        # Apply filters
        if platform:
            clicks = [click for click in clicks if click["platform"] == platform]
        
        if user_id:
            clicks = [click for click in clicks if click["user_id"] == user_id]
        
        if status:
            clicks = [click for click in clicks if click["status"] == status]
        
        # Apply pagination
        clicks = clicks[offset:offset + limit]
        
        return [AffiliateClick(**click) for click in clicks]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving affiliate clicks: {str(e)}")

@router.get("/affiliate/bookings", response_model=List[AffiliateBooking])
async def get_affiliate_bookings(
    platform: Optional[AffiliatePlatform] = None,
    user_id: Optional[str] = None,
    status: Optional[BookingStatus] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get affiliate bookings with optional filtering"""
    try:
        bookings = list(affiliate_bookings_db.values())
        
        # Apply filters
        if platform:
            bookings = [booking for booking in bookings if booking["platform"] == platform]
        
        if user_id:
            bookings = [booking for booking in bookings if booking["user_id"] == user_id]
        
        if status:
            bookings = [booking for booking in bookings if booking["status"] == status]
        
        # Apply pagination
        bookings = bookings[offset:offset + limit]
        
        return [AffiliateBooking(**booking) for booking in bookings]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving affiliate bookings: {str(e)}")

@router.get("/affiliate/reports", response_model=List[CommissionReport])
async def get_commission_reports(
    start_date: date,
    end_date: date,
    platform: Optional[AffiliatePlatform] = None
):
    """Get commission reports for a date range"""
    try:
        reports = []
        
        # Get all platforms or specific platform
        platforms = [platform] if platform else list(AffiliatePlatform)
        
        for plat in platforms:
            # Filter clicks and bookings for this platform and date range
            platform_clicks = [
                click for click in affiliate_clicks_db.values()
                if click["platform"] == plat and 
                start_date <= click["click_timestamp"].date() <= end_date
            ]
            
            platform_bookings = [
                booking for booking in affiliate_bookings_db.values()
                if booking["platform"] == plat and 
                start_date <= booking["booking_date"].date() <= end_date
            ]
            
            total_clicks = len(platform_clicks)
            total_bookings = len(platform_bookings)
            conversion_rate = (total_bookings / total_clicks * 100) if total_clicks > 0 else 0
            total_revenue = sum(booking["booking_amount"] for booking in platform_bookings)
            total_commission = sum(booking["commission_amount"] for booking in platform_bookings)
            
            report = CommissionReport(
                platform=plat,
                total_clicks=total_clicks,
                total_bookings=total_bookings,
                conversion_rate=round(conversion_rate, 2),
                total_revenue=round(total_revenue, 2),
                total_commission=round(total_commission, 2),
                period_start=start_date,
                period_end=end_date
            )
            
            reports.append(report)
        
        return reports
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating commission reports: {str(e)}")

@router.get("/affiliate/stats")
async def get_affiliate_statistics():
    """Get overall affiliate statistics"""
    try:
        total_clicks = len(affiliate_clicks_db)
        total_bookings = len(affiliate_bookings_db)
        conversion_rate = (total_bookings / total_clicks * 100) if total_clicks > 0 else 0
        
        total_revenue = sum(booking["booking_amount"] for booking in affiliate_bookings_db.values())
        total_commission = sum(booking["commission_amount"] for booking in affiliate_bookings_db.values())
        
        # Platform breakdown
        platform_stats = {}
        for platform in AffiliatePlatform:
            platform_clicks = len([click for click in affiliate_clicks_db.values() if click["platform"] == platform])
            platform_bookings = len([booking for booking in affiliate_bookings_db.values() if booking["platform"] == platform])
            platform_revenue = sum(booking["booking_amount"] for booking in affiliate_bookings_db.values() if booking["platform"] == platform)
            platform_commission = sum(booking["commission_amount"] for booking in affiliate_bookings_db.values() if booking["platform"] == platform)
            
            platform_stats[platform.value] = {
                "clicks": platform_clicks,
                "bookings": platform_bookings,
                "revenue": round(platform_revenue, 2),
                "commission": round(platform_commission, 2)
            }
        
        return {
            "total_clicks": total_clicks,
            "total_bookings": total_bookings,
            "conversion_rate": round(conversion_rate, 2),
            "total_revenue": round(total_revenue, 2),
            "total_commission": round(total_commission, 2),
            "platform_breakdown": platform_stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving affiliate statistics: {str(e)}")

@router.get("/affiliate/links", response_model=List[AffiliateLink])
async def get_affiliate_links():
    """Get all affiliate links"""
    try:
        return [AffiliateLink(**link) for link in affiliate_links_db.values()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving affiliate links: {str(e)}")

@router.put("/affiliate/links/{affiliate_id}")
async def update_affiliate_link(
    affiliate_id: str,
    commission_rate: Optional[float] = None,
    is_active: Optional[bool] = None
):
    """Update affiliate link settings"""
    try:
        if affiliate_id not in affiliate_links_db:
            raise HTTPException(status_code=404, detail="Affiliate link not found")
        
        link = affiliate_links_db[affiliate_id]
        
        if commission_rate is not None:
            link["commission_rate"] = commission_rate
        
        if is_active is not None:
            link["is_active"] = is_active
        
        link["last_updated"] = datetime.now()
        
        return {
            "message": "Affiliate link updated successfully",
            "affiliate_id": affiliate_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating affiliate link: {str(e)}")

@router.post("/affiliate/simulate-conversion")
async def simulate_booking_conversion(click_id: str):
    """Simulate a booking conversion for testing purposes"""
    try:
        if click_id not in affiliate_clicks_db:
            raise HTTPException(status_code=404, detail="Affiliate click not found")
        
        # Simulate booking data
        import random
        
        booking_data = {
            "click_id": click_id,
            "booking_reference": f"BK{random.randint(100000, 999999)}",
            "booking_type": random.choice(["flight", "hotel"]),
            "booking_amount": round(random.uniform(200, 2000), 2),
            "travel_date": date.today(),
            "platform_booking_id": f"PLAT{random.randint(10000, 99999)}",
            "customer_info": {
                "name": "Test Customer",
                "email": "test@example.com"
            }
        }
        
        return await track_affiliate_booking(**booking_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error simulating conversion: {str(e)}") 