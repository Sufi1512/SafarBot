from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from bson import ObjectId
from enum import Enum
import uuid

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        return handler(ObjectId)

class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

# User Models
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"
    PENDING = "pending"  # Legacy status for existing users

class User(MongoBaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    hashed_password: str
    role: UserRole = UserRole.USER
    status: UserStatus = UserStatus.ACTIVE
    is_email_verified: bool = False
    is_phone_verified: bool = False
    profile_picture: Optional[str] = None
    date_of_birth: Optional[date] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    last_login: Optional[datetime] = None
    login_attempts: int = 0
    reset_password_token: Optional[str] = None
    reset_password_expires: Optional[datetime] = None
    email_verification_token: Optional[str] = None
    email_verification_expires: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    date_of_birth: Optional[date] = None
    preferences: Optional[Dict[str, Any]] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Flight Models
class FlightStatus(str, Enum):
    AVAILABLE = "available"
    BOOKED = "booked"
    CANCELLED = "cancelled"
    DELAYED = "delayed"

class FlightDocument(MongoBaseModel):
    flight_id: str
    airline: str
    airline_logo: Optional[str] = None
    flight_number: str
    departure_airport: str
    departure_city: str
    departure_time: datetime
    arrival_airport: str
    arrival_city: str
    arrival_time: datetime
    duration_minutes: int
    price: float
    currency: str = "USD"
    available_seats: int
    status: FlightStatus = FlightStatus.AVAILABLE
    amenities: List[str] = Field(default_factory=list)
    aircraft: str
    travel_class: str
    stops: int = 0
    layovers: List[Dict[str, Any]] = Field(default_factory=list)
    carbon_emissions: Optional[Dict[str, Any]] = None
    booking_url: Optional[str] = None
    affiliate_links: List[Dict[str, Any]] = Field(default_factory=list)

# Hotel Models
class HotelType(str, Enum):
    BUDGET = "budget"
    MID_RANGE = "mid_range"
    LUXURY = "luxury"
    BOUTIQUE = "boutique"
    RESORT = "resort"

class HotelDocument(MongoBaseModel):
    hotel_id: str
    name: str
    address: str
    city: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hotel_type: HotelType
    star_rating: int
    price_per_night: float
    currency: str = "USD"
    amenities: List[str] = Field(default_factory=list)
    description: str
    images: List[str] = Field(default_factory=list)
    rating: float
    review_count: int = 0
    available_rooms: int
    check_in_time: str = "15:00"
    check_out_time: str = "11:00"
    booking_url: Optional[str] = None
    affiliate_links: List[Dict[str, Any]] = Field(default_factory=list)
    policies: Dict[str, Any] = Field(default_factory=dict)

# Booking Models
class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REFUNDED = "refunded"

class BookingType(str, Enum):
    FLIGHT = "flight"
    HOTEL = "hotel"
    PACKAGE = "package"

class BookingDocument(MongoBaseModel):
    booking_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: PyObjectId
    booking_type: BookingType
    status: BookingStatus = BookingStatus.PENDING
    total_amount: float
    currency: str = "USD"
    booking_date: datetime
    travel_date: datetime
    return_date: Optional[datetime] = None
    passengers: int = 1
    guest_details: List[Dict[str, Any]] = Field(default_factory=list)
    flight_details: Optional[Dict[str, Any]] = None
    hotel_details: Optional[Dict[str, Any]] = None
    payment_status: str = "pending"
    payment_method: Optional[str] = None
    cancellation_policy: Optional[Dict[str, Any]] = None
    special_requests: Optional[str] = None
    affiliate_commission: Optional[float] = None
    affiliate_partner: Optional[str] = None

# Itinerary Models
class ItineraryDocument(MongoBaseModel):
    itinerary_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: PyObjectId
    title: str
    destination: str
    start_date: date
    end_date: date
    total_days: int
    budget_estimate: float
    currency: str = "USD"
    interests: List[str] = Field(default_factory=list)
    travelers: int = 1
    accommodation_type: Optional[str] = None
    daily_plans: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: Dict[str, Any] = Field(default_factory=dict)
    weather_info: Optional[Dict[str, Any]] = None
    is_public: bool = False
    is_favorite: bool = False
    tags: List[str] = Field(default_factory=list)

# Price Alert Models
class AlertType(str, Enum):
    FLIGHT = "flight"
    HOTEL = "hotel"

class AlertStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIGGERED = "triggered"

class PriceAlertDocument(MongoBaseModel):
    alert_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: PyObjectId
    alert_type: AlertType
    status: AlertStatus = AlertStatus.ACTIVE
    destination: str
    departure_date: Optional[date] = None
    return_date: Optional[date] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    target_price: float
    current_price: float
    currency: str = "USD"
    passengers: int = 1
    guests: int = 1
    email_notifications: bool = True
    push_notifications: bool = True
    last_checked: Optional[datetime] = None
    triggered_at: Optional[datetime] = None
    search_criteria: Dict[str, Any] = Field(default_factory=dict)

# Affiliate Models
class AffiliatePartner(str, Enum):
    BOOKING_COM = "booking.com"
    AGODA = "agoda"
    EXPEDIA = "expedia"
    AIRBNB = "airbnb"
    SKYSCANNER = "skyscanner"

class AffiliateClickDocument(MongoBaseModel):
    click_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[PyObjectId] = None
    session_id: str
    partner: AffiliatePartner
    product_type: str  # flight, hotel, package
    product_id: str
    click_url: str
    referrer_url: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    conversion_value: Optional[float] = None
    commission_rate: float = 0.0
    commission_earned: Optional[float] = None
    is_converted: bool = False
    conversion_date: Optional[datetime] = None

class AffiliateBookingDocument(MongoBaseModel):
    booking_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    affiliate_click_id: PyObjectId
    user_id: Optional[PyObjectId] = None
    partner: AffiliatePartner
    product_type: str
    product_id: str
    booking_amount: float
    currency: str = "USD"
    commission_rate: float
    commission_earned: float
    booking_date: datetime
    travel_date: datetime
    status: str = "confirmed"
    tracking_id: Optional[str] = None

# Chat Models
class ChatSessionDocument(MongoBaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[PyObjectId] = None
    session_token: str
    context: Dict[str, Any] = Field(default_factory=dict)
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    is_active: bool = True
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    platform: str = "web"  # web, whatsapp, telegram
    language: str = "en"

# Restaurant Models
class RestaurantDocument(MongoBaseModel):
    restaurant_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    cuisine: str
    address: str
    city: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_range: str
    rating: float
    review_count: int = 0
    specialties: List[str] = Field(default_factory=list)
    description: str
    images: List[str] = Field(default_factory=list)
    opening_hours: Dict[str, str] = Field(default_factory=dict)
    contact_info: Dict[str, str] = Field(default_factory=dict)
    amenities: List[str] = Field(default_factory=list)
    dietary_options: List[str] = Field(default_factory=list)
    booking_url: Optional[str] = None

# Saved Trip Models
class SavedTripDocument(MongoBaseModel):
    trip_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: PyObjectId
    title: str
    destination: str
    start_date: date
    end_date: date
    description: Optional[str] = None
    is_favorite: bool = False
    tags: List[str] = Field(default_factory=list)
    itinerary_id: Optional[PyObjectId] = None
    bookings: List[PyObjectId] = Field(default_factory=list)
    notes: Optional[str] = None
    budget: Optional[float] = None
    currency: str = "USD"

# Notification Models
class NotificationType(str, Enum):
    PRICE_ALERT = "price_alert"
    BOOKING_CONFIRMATION = "booking_confirmation"
    BOOKING_REMINDER = "booking_reminder"
    SYSTEM_UPDATE = "system_update"
    PROMOTIONAL = "promotional"
    # Collaboration notifications
    INVITATION_RECEIVED = "invitation_received"
    INVITATION_ACCEPTED = "invitation_accepted"
    INVITATION_DECLINED = "invitation_declined"
    COLLABORATOR_ADDED = "collaborator_added"
    COLLABORATOR_REMOVED = "collaborator_removed"
    ROLE_UPDATED = "role_updated"
    ITINERARY_UPDATED = "itinerary_updated"
    ITINERARY_SHARED = "itinerary_shared"

class NotificationStatus(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"

class NotificationDocument(MongoBaseModel):
    notification_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: PyObjectId
    type: NotificationType
    status: NotificationStatus = NotificationStatus.UNREAD
    title: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    is_email_sent: bool = False
    is_push_sent: bool = False
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None
    priority: int = 1  # 1=low, 2=medium, 3=high

# Session Management Models
class SessionStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"

class DeviceType(str, Enum):
    WEB = "web"
    MOBILE = "mobile"
    TABLET = "tablet"
    DESKTOP = "desktop"

class UserSessionDocument(MongoBaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: PyObjectId
    device_type: DeviceType
    device_name: str  # e.g., "Chrome on Windows", "Safari on iPhone"
    ip_address: str
    user_agent: str
    location: Optional[Dict[str, Any]] = None  # city, country, coordinates
    status: SessionStatus = SessionStatus.ACTIVE
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    is_remember_me: bool = False
    refresh_token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# User Preferences Models
class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    booking_updates: bool = True
    price_alerts: bool = True
    promotional_offers: bool = True
    travel_reminders: bool = True
    weather_updates: bool = True

class TravelPreferences(BaseModel):
    preferred_airlines: List[str] = Field(default_factory=list)
    preferred_hotel_chains: List[str] = Field(default_factory=list)
    budget_range: Optional[str] = None  # budget, mid_range, luxury
    travel_style: List[str] = Field(default_factory=list)  # adventure, luxury, family, business
    dietary_restrictions: List[str] = Field(default_factory=list)
    accessibility_needs: List[str] = Field(default_factory=list)
    language_preferences: List[str] = Field(default_factory=["en"])
    currency_preference: str = "USD"
    timezone: str = "UTC"

class UserPreferencesDocument(MongoBaseModel):
    user_id: PyObjectId
    notification_preferences: NotificationPreferences = Field(default_factory=NotificationPreferences)
    travel_preferences: TravelPreferences = Field(default_factory=TravelPreferences)
    privacy_settings: Dict[str, Any] = Field(default_factory=dict)
    theme_preference: str = "system"  # light, dark, system
    language: str = "en"
    region: str = "US"

# Dashboard Analytics Models
class UserAnalyticsDocument(MongoBaseModel):
    user_id: PyObjectId
    total_bookings: int = 0
    total_spent: float = 0.0
    countries_visited: List[str] = Field(default_factory=list)
    cities_visited: List[str] = Field(default_factory=list)
    favorite_destinations: List[Dict[str, Any]] = Field(default_factory=list)
    booking_patterns: Dict[str, Any] = Field(default_factory=dict)
    spending_patterns: Dict[str, Any] = Field(default_factory=dict)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# Saved Itinerary Models
class ItineraryDay(BaseModel):
    day_number: int
    date: Optional[date] = None
    activities: List[Dict[str, Any]] = Field(default_factory=list)
    accommodations: Optional[Dict[str, Any]] = None
    transportation: Optional[Dict[str, Any]] = None
    meals: List[Dict[str, Any]] = Field(default_factory=list)
    notes: Optional[str] = None
    estimated_cost: Optional[float] = None

class SavedItineraryDocument(MongoBaseModel):
    user_id: PyObjectId
    title: str
    description: Optional[str] = None
    destination: str
    country: str
    city: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_days: int
    budget: Optional[float] = None
    travel_style: List[str] = Field(default_factory=list)  # adventure, luxury, budget, family, solo, etc.
    interests: List[str] = Field(default_factory=list)  # culture, nature, food, history, etc.
    days: List[ItineraryDay] = Field(default_factory=list)
    total_estimated_cost: Optional[float] = None
    is_public: bool = False
    is_favorite: bool = False
    tags: List[str] = Field(default_factory=list)
    cover_image: Optional[str] = None
    status: str = "draft"  # draft, published, archived
    views_count: int = 0
    likes_count: int = 0
    shares_count: int = 0
    share_token: Optional[str] = None
    # Collaborative features
    is_collaborative: bool = False
    collaborators: List[PyObjectId] = Field(default_factory=list)  # User IDs of collaborators
    owner_id: PyObjectId  # Original creator/owner

# Collaborative Itinerary Models
class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class CollaboratorRole(str, Enum):
    VIEWER = "viewer"  # Can only view
    EDITOR = "editor"  # Can edit content
    ADMIN = "admin"    # Can edit and manage collaborators

class ItineraryInvitationDocument(MongoBaseModel):
    invitation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    itinerary_id: PyObjectId
    owner_id: PyObjectId  # User who sent the invitation
    invited_email: EmailStr
    invited_user_id: Optional[PyObjectId] = None  # Set when user accepts
    role: CollaboratorRole = CollaboratorRole.EDITOR
    status: InvitationStatus = InvitationStatus.PENDING
    invitation_token: str = Field(default_factory=lambda: str(uuid.uuid4()))
    expires_at: datetime
    message: Optional[str] = None  # Optional message from owner
    accepted_at: Optional[datetime] = None
    declined_at: Optional[datetime] = None

class ItineraryCollaboratorDocument(MongoBaseModel):
    itinerary_id: PyObjectId
    user_id: PyObjectId
    role: CollaboratorRole
    invited_by: PyObjectId  # User who invited them
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: Optional[datetime] = None
    permissions: Dict[str, bool] = Field(default_factory=dict)  # Custom permissions
    collaborator_itinerary_id: Optional[PyObjectId] = None  # ID of collaborator's copy of the itinerary

# Enhanced Notification Types for Collaboration
class CollaborationNotificationType(str, Enum):
    INVITATION_RECEIVED = "invitation_received"
    INVITATION_ACCEPTED = "invitation_accepted"
    INVITATION_DECLINED = "invitation_declined"
    COLLABORATOR_ADDED = "collaborator_added"
    COLLABORATOR_REMOVED = "collaborator_removed"
    ITINERARY_UPDATED = "itinerary_updated"
    ITINERARY_SHARED = "itinerary_shared"

# Enhanced User Model with additional fields
class EnhancedUser(User):
    preferences: Optional[PyObjectId] = None  # Reference to UserPreferencesDocument
    analytics: Optional[PyObjectId] = None  # Reference to UserAnalyticsDocument
    last_session_id: Optional[str] = None
    is_premium: bool = False
    loyalty_tier: str = "bronze"  # bronze, silver, gold, platinum
    loyalty_points: int = 0
    referral_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    referred_by: Optional[str] = None 