from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import date, datetime
import uuid

router = APIRouter()

class BookingRequest(BaseModel):
    booking_type: str  # "flight" or "hotel"
    item_id: str
    passengers: Optional[int] = 1
    guests: Optional[int] = 1
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    departure_date: Optional[date] = None
    return_date: Optional[date] = None
    customer_info: dict

class BookingResponse(BaseModel):
    success: bool
    booking_reference: str
    booking_id: str
    total_price: float
    message: str
    booking_details: dict

class BookingStatus(BaseModel):
    booking_id: str
    status: str  # "confirmed", "pending", "cancelled"
    booking_reference: str
    booking_type: str
    total_price: float
    created_at: datetime
    updated_at: datetime

# Mock database for bookings
bookings_db = {}

@router.post("/create", response_model=BookingResponse)
async def create_booking(request: BookingRequest):
    """Create a new booking for flight or hotel"""
    try:
        booking_id = str(uuid.uuid4())
        booking_reference = f"SB{booking_id[:8].upper()}"
        
        # Calculate total price based on booking type
        if request.booking_type == "flight":
            base_price = 850.0  # Mock flight price
            total_price = base_price * request.passengers
            booking_details = {
                "type": "flight",
                "flight_id": request.item_id,
                "passengers": request.passengers,
                "departure_date": str(request.departure_date),
                "return_date": str(request.return_date) if request.return_date else None
            }
        elif request.booking_type == "hotel":
            base_price = 250.0  # Mock hotel price per night
            nights = 1
            if request.check_in and request.check_out:
                nights = (request.check_out - request.check_in).days
            total_price = base_price * nights * request.guests
            booking_details = {
                "type": "hotel",
                "hotel_id": request.item_id,
                "guests": request.guests,
                "check_in": str(request.check_in),
                "check_out": str(request.check_out),
                "nights": nights
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid booking type")
        
        # Store booking in mock database
        booking_record = {
            "booking_id": booking_id,
            "booking_reference": booking_reference,
            "booking_type": request.booking_type,
            "total_price": total_price,
            "status": "confirmed",
            "customer_info": request.customer_info,
            "booking_details": booking_details,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        bookings_db[booking_id] = booking_record
        
        return BookingResponse(
            success=True,
            booking_reference=booking_reference,
            booking_id=booking_id,
            total_price=total_price,
            message=f"{request.booking_type.title()} booking created successfully",
            booking_details=booking_details
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating booking: {str(e)}")

@router.get("/{booking_id}", response_model=BookingStatus)
async def get_booking_status(booking_id: str):
    """Get booking status and details"""
    if booking_id not in bookings_db:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = bookings_db[booking_id]
    return BookingStatus(
        booking_id=booking["booking_id"],
        status=booking["status"],
        booking_reference=booking["booking_reference"],
        booking_type=booking["booking_type"],
        total_price=booking["total_price"],
        created_at=booking["created_at"],
        updated_at=booking["updated_at"]
    )

@router.get("/reference/{booking_reference}", response_model=BookingStatus)
async def get_booking_by_reference(booking_reference: str):
    """Get booking by reference number"""
    for booking in bookings_db.values():
        if booking["booking_reference"] == booking_reference:
            return BookingStatus(
                booking_id=booking["booking_id"],
                status=booking["status"],
                booking_reference=booking["booking_reference"],
                booking_type=booking["booking_type"],
                total_price=booking["total_price"],
                created_at=booking["created_at"],
                updated_at=booking["updated_at"]
            )
    
    raise HTTPException(status_code=404, detail="Booking not found")

@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: str):
    """Cancel a booking"""
    if booking_id not in bookings_db:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = bookings_db[booking_id]
    booking["status"] = "cancelled"
    booking["updated_at"] = datetime.now()
    
    return {
        "success": True,
        "message": f"Booking {booking['booking_reference']} cancelled successfully",
        "booking_id": booking_id,
        "status": "cancelled"
    }

@router.get("/", response_model=List[BookingStatus])
async def get_all_bookings(limit: int = 10, offset: int = 0):
    """Get all bookings with pagination"""
    bookings_list = list(bookings_db.values())
    paginated_bookings = bookings_list[offset:offset + limit]
    
    return [
        BookingStatus(
            booking_id=booking["booking_id"],
            status=booking["status"],
            booking_reference=booking["booking_reference"],
            booking_type=booking["booking_type"],
            total_price=booking["total_price"],
            created_at=booking["created_at"],
            updated_at=booking["updated_at"]
        )
        for booking in paginated_bookings
    ]

@router.post("/{booking_id}/payment")
async def process_payment(booking_id: str, payment_method: str = "credit_card"):
    """Process payment for a booking"""
    if booking_id not in bookings_db:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = bookings_db[booking_id]
    
    # Mock payment processing
    if payment_method == "credit_card":
        # Simulate payment processing
        booking["status"] = "paid"
        booking["updated_at"] = datetime.now()
        
        return {
            "success": True,
            "message": "Payment processed successfully",
            "booking_id": booking_id,
            "payment_method": payment_method,
            "amount": booking["total_price"],
            "transaction_id": f"TXN{str(uuid.uuid4())[:8].upper()}"
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported payment method") 