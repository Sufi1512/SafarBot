"""
AIRIQ Backend - Clean implementation of AirIQ API integration
Provides flight search, booking, and management capabilities
"""

from .service import AirIQService
from .mapper import AirIQMapper
from .router import router as airiq_router
from .models import (
    AirIQAvailabilityRequest,
    AirIQAvailabilityResponse,
    AirIQBookingRequest,
    AirIQBookingResponse,
    AirIQPricingRequest,
    AirIQPricingResponse
)

__all__ = [
    "AirIQService",
    "AirIQMapper",
    "airiq_router",
    "AirIQAvailabilityRequest",
    "AirIQAvailabilityResponse",
    "AirIQBookingRequest",
    "AirIQBookingResponse",
    "AirIQPricingRequest",
    "AirIQPricingResponse"
]

