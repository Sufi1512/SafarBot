from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from bson import ObjectId
import uuid

from database import get_collection, BOOKINGS_COLLECTION, FLIGHTS_COLLECTION, HOTELS_COLLECTION
from mongo_models import (
    BookingDocument, FlightDocument, HotelDocument, 
    BookingStatus, BookingType, FlightStatus
)

class BookingService:
    @staticmethod
    async def create_booking(
        user_id: str,
        booking_type: BookingType,
        travel_date: datetime,
        total_amount: float,
        currency: str = "USD",
        passengers: int = 1,
        flight_details: Optional[Dict[str, Any]] = None,
        hotel_details: Optional[Dict[str, Any]] = None,
        return_date: Optional[datetime] = None,
        guest_details: Optional[List[Dict[str, Any]]] = None,
        special_requests: Optional[str] = None
    ) -> BookingDocument:
        """Create a new booking."""
        collection = get_collection(BOOKINGS_COLLECTION)
        
        booking_data = {
            "user_id": ObjectId(user_id),
            "booking_type": booking_type,
            "status": BookingStatus.PENDING,
            "total_amount": total_amount,
            "currency": currency,
            "booking_date": datetime.utcnow(),
            "travel_date": travel_date,
            "return_date": return_date,
            "passengers": passengers,
            "guest_details": guest_details or [],
            "flight_details": flight_details,
            "hotel_details": hotel_details,
            "payment_status": "pending",
            "special_requests": special_requests,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await collection.insert_one(booking_data)
        booking_data["_id"] = result.inserted_id
        
        return BookingDocument(**booking_data)

    @staticmethod
    async def get_user_bookings(
        user_id: str, 
        status: Optional[BookingStatus] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[BookingDocument]:
        """Get bookings for a specific user."""
        collection = get_collection(BOOKINGS_COLLECTION)
        
        query = {"user_id": ObjectId(user_id)}
        if status:
            query["status"] = status
        
        cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        bookings = await cursor.to_list(length=limit)
        
        return [BookingDocument(**booking) for booking in bookings]

    @staticmethod
    async def get_booking_by_id(booking_id: str) -> Optional[BookingDocument]:
        """Get booking by ID."""
        collection = get_collection(BOOKINGS_COLLECTION)
        booking_doc = await collection.find_one({"_id": ObjectId(booking_id)})
        return BookingDocument(**booking_doc) if booking_doc else None

    @staticmethod
    async def update_booking_status(
        booking_id: str, 
        status: BookingStatus,
        payment_status: Optional[str] = None
    ) -> bool:
        """Update booking status."""
        collection = get_collection(BOOKINGS_COLLECTION)
        
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if payment_status:
            update_data["payment_status"] = payment_status
        
        result = await collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_data}
        )
        
        return result.modified_count > 0

    @staticmethod
    async def cancel_booking(booking_id: str, user_id: str) -> bool:
        """Cancel a booking."""
        collection = get_collection(BOOKINGS_COLLECTION)
        
        result = await collection.update_one(
            {
                "_id": ObjectId(booking_id),
                "user_id": ObjectId(user_id)
            },
            {
                "$set": {
                    "status": BookingStatus.CANCELLED,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0

    @staticmethod
    async def get_booking_statistics(user_id: str) -> Dict[str, Any]:
        """Get booking statistics for a user."""
        collection = get_collection(BOOKINGS_COLLECTION)
        
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "total_amount": {"$sum": "$total_amount"}
                }
            }
        ]
        
        stats = await collection.aggregate(pipeline).to_list(length=None)
        
        # Convert to dictionary
        statistics = {
            "total_bookings": 0,
            "total_spent": 0,
            "pending": 0,
            "confirmed": 0,
            "cancelled": 0,
            "completed": 0
        }
        
        for stat in stats:
            status = stat["_id"]
            count = stat["count"]
            amount = stat["total_amount"]
            
            statistics["total_bookings"] += count
            statistics["total_spent"] += amount
            statistics[status] = count
        
        return statistics

    @staticmethod
    async def search_flights(
        from_location: str,
        to_location: str,
        departure_date: date,
        return_date: Optional[date] = None,
        passengers: int = 1,
        class_type: str = "economy"
    ) -> List[FlightDocument]:
        """Search for available flights."""
        collection = get_collection(FLIGHTS_COLLECTION)
        
        # Build query
        query = {
            "departure_city": {"$regex": from_location, "$options": "i"},
            "arrival_city": {"$regex": to_location, "$options": "i"},
            "departure_time": {
                "$gte": datetime.combine(departure_date, datetime.min.time()),
                "$lt": datetime.combine(departure_date + timedelta(days=1), datetime.min.time())
            },
            "status": FlightStatus.AVAILABLE,
            "available_seats": {"$gte": passengers}
        }
        
        cursor = collection.find(query).sort("price", 1).limit(50)
        flights = await cursor.to_list(length=50)
        
        return [FlightDocument(**flight) for flight in flights]

    @staticmethod
    async def search_hotels(
        location: str,
        check_in: date,
        check_out: date,
        guests: int = 1,
        budget_range: Optional[str] = None
    ) -> List[HotelDocument]:
        """Search for available hotels."""
        collection = get_collection(HOTELS_COLLECTION)
        
        # Build query
        query = {
            "city": {"$regex": location, "$options": "i"},
            "available_rooms": {"$gte": guests}
        }
        
        if budget_range:
            if budget_range == "budget":
                query["price_per_night"] = {"$lte": 100}
            elif budget_range == "mid_range":
                query["price_per_night"] = {"$gt": 100, "$lte": 300}
            elif budget_range == "luxury":
                query["price_per_night"] = {"$gt": 300}
        
        cursor = collection.find(query).sort("rating", -1).limit(50)
        hotels = await cursor.to_list(length=50)
        
        return [HotelDocument(**hotel) for hotel in hotels]

    @staticmethod
    async def get_flight_by_id(flight_id: str) -> Optional[FlightDocument]:
        """Get flight by ID."""
        collection = get_collection(FLIGHTS_COLLECTION)
        flight_doc = await collection.find_one({"flight_id": flight_id})
        return FlightDocument(**flight_doc) if flight_doc else None

    @staticmethod
    async def get_hotel_by_id(hotel_id: str) -> Optional[HotelDocument]:
        """Get hotel by ID."""
        collection = get_collection(HOTELS_COLLECTION)
        hotel_doc = await collection.find_one({"hotel_id": hotel_id})
        return HotelDocument(**hotel_doc) if hotel_doc else None

    @staticmethod
    async def update_flight_availability(flight_id: str, seats_booked: int) -> bool:
        """Update flight seat availability."""
        collection = get_collection(FLIGHTS_COLLECTION)
        
        result = await collection.update_one(
            {"flight_id": flight_id},
            {"$inc": {"available_seats": -seats_booked}}
        )
        
        return result.modified_count > 0

    @staticmethod
    async def update_hotel_availability(hotel_id: str, rooms_booked: int) -> bool:
        """Update hotel room availability."""
        collection = get_collection(HOTELS_COLLECTION)
        
        result = await collection.update_one(
            {"hotel_id": hotel_id},
            {"$inc": {"available_rooms": -rooms_booked}}
        )
        
        return result.modified_count > 0

    @staticmethod
    async def get_upcoming_trips(user_id: str, limit: int = 10) -> List[BookingDocument]:
        """Get upcoming trips for a user."""
        collection = get_collection(BOOKINGS_COLLECTION)
        
        query = {
            "user_id": ObjectId(user_id),
            "travel_date": {"$gte": datetime.utcnow()},
            "status": {"$in": [BookingStatus.PENDING, BookingStatus.CONFIRMED]}
        }
        
        cursor = collection.find(query).sort("travel_date", 1).limit(limit)
        bookings = await cursor.to_list(length=limit)
        
        return [BookingDocument(**booking) for booking in bookings]

    @staticmethod
    async def get_past_trips(user_id: str, limit: int = 10) -> List[BookingDocument]:
        """Get past trips for a user."""
        collection = get_collection(BOOKINGS_COLLECTION)
        
        query = {
            "user_id": ObjectId(user_id),
            "travel_date": {"$lt": datetime.utcnow()},
            "status": {"$in": [BookingStatus.COMPLETED, BookingStatus.CANCELLED]}
        }
        
        cursor = collection.find(query).sort("travel_date", -1).limit(limit)
        bookings = await cursor.to_list(length=limit)
        
        return [BookingDocument(**booking) for booking in bookings] 