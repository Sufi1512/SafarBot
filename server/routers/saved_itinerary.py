"""
Saved Itinerary API Router
Handles CRUD operations for user-saved itineraries
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import date
import logging

from services.saved_itinerary_service import SavedItineraryService
from routers.auth import get_current_user
from mongo_models import User, PyObjectId
from database import get_database

logger = logging.getLogger(__name__)

router = APIRouter()

async def check_itinerary_access(itinerary_id: str, user_id: str, db) -> Dict[str, Any]:
    """Check if user has access to itinerary and return access info"""
    itinerary = await db.saved_itineraries.find_one({
        "_id": PyObjectId(itinerary_id)
    })
    
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    # Check if user is owner
    if str(itinerary["user_id"]) == user_id:
        return {
            "has_access": True,
            "is_owner": True,
            "is_collaborator": False,
            "role": "owner"
        }
    
    # Check if user is collaborator
    collaborator = await db.itinerary_collaborators.find_one({
        "itinerary_id": PyObjectId(itinerary_id),
        "user_id": PyObjectId(user_id)
    })
    
    if collaborator:
        return {
            "has_access": True,
            "is_owner": False,
            "is_collaborator": True,
            "role": collaborator["role"]
        }
    
    return {
        "has_access": False,
        "is_owner": False,
        "is_collaborator": False,
        "role": None
    }

# Pydantic models for request/response
class ItineraryDayRequest(BaseModel):
    day_number: int
    date: Optional[date] = None
    activities: List[Dict[str, Any]] = []
    accommodations: Optional[Dict[str, Any]] = None
    transportation: Optional[Dict[str, Any]] = None
    meals: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    estimated_cost: Optional[float] = None

class CreateItineraryRequest(BaseModel):
    title: str
    description: Optional[str] = None
    destination: str
    country: str
    city: str
    duration_days: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    travel_style: List[str] = []
    interests: List[str] = []
    days: List[ItineraryDayRequest] = []

class UpdateItineraryRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    duration_days: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    travel_style: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    days: Optional[List[ItineraryDayRequest]] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    status: Optional[str] = None

class ItinerarySummary(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    destination: str
    country: str
    city: str
    duration_days: int
    budget: Optional[float]
    travel_style: List[str]
    interests: List[str]
    total_estimated_cost: Optional[float]
    is_favorite: bool
    is_collaborative: Optional[bool] = False
    tags: List[str]
    cover_image: Optional[str]
    status: str
    views_count: int
    likes_count: int
    shares_count: int
    created_at: str
    updated_at: str

class ItineraryDetail(ItinerarySummary):
    days: List[Dict[str, Any]]
    is_public: bool

class ItineraryStats(BaseModel):
    total_itineraries: int
    published_itineraries: int
    favorite_itineraries: int
    draft_itineraries: int
    total_views: int

# API Endpoints
@router.post("/", response_model=ItineraryDetail)
async def create_itinerary(
    itinerary_data: CreateItineraryRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new saved itinerary"""
    try:
        # Convert ItineraryDayRequest to dict
        days_data = [day.dict() for day in itinerary_data.days]
        
        itinerary = await SavedItineraryService.create_itinerary(
            user_id=str(current_user.id),
            title=itinerary_data.title,
            description=itinerary_data.description,
            destination=itinerary_data.destination,
            country=itinerary_data.country,
            city=itinerary_data.city,
            duration_days=itinerary_data.duration_days,
            start_date=itinerary_data.start_date,
            end_date=itinerary_data.end_date,
            budget=itinerary_data.budget,
            travel_style=itinerary_data.travel_style,
            interests=itinerary_data.interests,
            days=days_data
        )
        
        return ItineraryDetail(**itinerary)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create itinerary: {str(e)}"
        )

@router.get("/", response_model=List[ItinerarySummary])
async def get_user_itineraries(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    status: Optional[str] = Query(None, regex="^(draft|published|archived)$"),
    is_favorite: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    """Get user's saved itineraries"""
    try:
        itineraries = await SavedItineraryService.get_user_itineraries(
            user_id=str(current_user.id),
            limit=limit,
            skip=skip,
            status=status,
            is_favorite=is_favorite
        )
        
        return [ItinerarySummary(**itinerary) for itinerary in itineraries]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get itineraries: {str(e)}"
        )

@router.get("/{itinerary_id}", response_model=ItineraryDetail)
async def get_itinerary(
    itinerary_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get a specific itinerary by ID (supports collaborative access)"""
    try:
        # Check access permissions
        access_info = await check_itinerary_access(itinerary_id, str(current_user.id), db)
        
        if not access_info["has_access"]:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        # Get itinerary (service will handle the rest)
        itinerary = await SavedItineraryService.get_itinerary_by_id(
            itinerary_id=itinerary_id,
            user_id=str(current_user.id)
        )
        
        if not itinerary:
            raise HTTPException(
                status_code=404,
                detail="Itinerary not found"
            )
        
        # Add access info to response
        itinerary["access_info"] = access_info
        
        return ItineraryDetail(**itinerary)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get itinerary: {str(e)}"
        )

@router.put("/{itinerary_id}", response_model=ItineraryDetail)
async def update_itinerary(
    itinerary_id: str,
    update_data: UpdateItineraryRequest,
    current_user: User = Depends(get_current_user)
):
    """Update an existing itinerary"""
    try:
        # Convert update data to dict, excluding None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        # Convert days if provided
        if "days" in update_dict:
            update_dict["days"] = [day.dict() for day in update_dict["days"]]
        
        itinerary = await SavedItineraryService.update_itinerary(
            itinerary_id=itinerary_id,
            user_id=str(current_user.id),
            update_data=update_dict
        )
        
        if not itinerary:
            raise HTTPException(
                status_code=404,
                detail="Itinerary not found"
            )
        
        return ItineraryDetail(**itinerary)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update itinerary: {str(e)}"
        )

@router.delete("/{itinerary_id}")
async def delete_itinerary(
    itinerary_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an itinerary"""
    try:
        success = await SavedItineraryService.delete_itinerary(
            itinerary_id=itinerary_id,
            user_id=str(current_user.id)
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Itinerary not found"
            )
        
        return {"message": "Itinerary deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete itinerary: {str(e)}"
        )

@router.post("/{itinerary_id}/favorite")
async def toggle_favorite(
    itinerary_id: str,
    current_user: User = Depends(get_current_user)
):
    """Toggle favorite status of an itinerary"""
    try:
        success = await SavedItineraryService.toggle_favorite(
            itinerary_id=itinerary_id,
            user_id=str(current_user.id)
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Itinerary not found"
            )
        
        return {"message": "Favorite status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to toggle favorite: {str(e)}"
        )

@router.get("/public/discover", response_model=List[ItinerarySummary])
async def discover_public_itineraries(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    destination: Optional[str] = None,
    travel_style: Optional[str] = None
):
    """Discover public itineraries"""
    try:
        itineraries = await SavedItineraryService.get_public_itineraries(
            limit=limit,
            skip=skip,
            destination=destination,
            travel_style=travel_style
        )
        
        return [ItinerarySummary(**itinerary) for itinerary in itineraries]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get public itineraries: {str(e)}"
        )

@router.get("/stats/summary", response_model=ItineraryStats)
async def get_itinerary_stats(
    current_user: User = Depends(get_current_user)
):
    """Get itinerary statistics for the user"""
    try:
        stats = await SavedItineraryService.get_itinerary_stats(
            user_id=str(current_user.id)
        )
        
        return ItineraryStats(**stats)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get itinerary stats: {str(e)}"
        )

@router.post("/{itinerary_id}/share")
async def share_itinerary(
    itinerary_id: str,
    current_user: User = Depends(get_current_user)
):
    """Share an itinerary and generate a public link"""
    try:
        # Get the itinerary to ensure it exists and user owns it
        itinerary = await SavedItineraryService.get_itinerary_by_id(itinerary_id, str(current_user.id))
        if not itinerary:
            raise HTTPException(status_code=404, detail="Itinerary not found")
        
        # Generate a share token (you can use UUID or any other method)
        import uuid
        share_token = str(uuid.uuid4())
        
        # Update the itinerary with the share token and make it public
        await SavedItineraryService.update_itinerary(
            itinerary_id, 
            str(current_user.id),
            {"is_public": True, "share_token": share_token}
        )
        
        # Generate the public URL
        public_url = f"/public/itinerary/{share_token}"
        
        return {
            "message": "Itinerary shared successfully",
            "public_url": public_url,
            "share_token": share_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing itinerary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to share itinerary")

@router.get("/public/{share_token}", response_model=ItineraryDetail)
async def get_public_itinerary(share_token: str):
    """Get a public itinerary by share token"""
    try:
        itinerary = await SavedItineraryService.get_public_itinerary(share_token)
        if not itinerary:
            raise HTTPException(status_code=404, detail="Itinerary not found or not public")
        
        # Increment view count
        await SavedItineraryService.increment_view_count(itinerary["id"])
        
        return itinerary
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting public itinerary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get public itinerary")