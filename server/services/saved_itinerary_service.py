"""
Saved Itinerary Service
Handles CRUD operations for user-saved itineraries
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from database import get_collection, SAVED_TRIPS_COLLECTION
from mongo_models import SavedItineraryDocument, ItineraryDay, PyObjectId
import logging

logger = logging.getLogger(__name__)

class SavedItineraryService:
    """Service for managing saved itineraries"""
    
    @staticmethod
    async def create_itinerary(
        user_id: str,
        title: str,
        destination: str,
        country: str,
        city: str,
        duration_days: int,
        description: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        budget: Optional[float] = None,
        travel_style: List[str] = None,
        interests: List[str] = None,
        days: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new saved itinerary"""
        try:
            collection = get_collection(SAVED_TRIPS_COLLECTION)
            if collection is None:
                raise Exception("Database connection not available")
            
            # Convert days data to ItineraryDay objects
            itinerary_days = []
            if days:
                for day_data in days:
                    itinerary_days.append(ItineraryDay(**day_data))
            
            # Calculate total estimated cost
            total_cost = 0
            if days:
                for day in itinerary_days:
                    if day.estimated_cost:
                        total_cost += day.estimated_cost
            
            itinerary_data = {
                "user_id": user_id,
                "title": title,
                "description": description,
                "destination": destination,
                "country": country,
                "city": city,
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None,
                "duration_days": duration_days,
                "budget": budget,
                "travel_style": travel_style or [],
                "interests": interests or [],
                "days": [day.dict() for day in itinerary_days],
                "total_estimated_cost": total_cost if total_cost > 0 else budget,
                "is_public": False,
                "is_favorite": False,
                "tags": [],
                "cover_image": None,
                "status": "draft",
                "views_count": 0,
                "likes_count": 0,
                "shares_count": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await collection.insert_one(itinerary_data)
            
            if result.inserted_id:
                # Return the created itinerary
                created_itinerary = await collection.find_one({"_id": result.inserted_id})
                if created_itinerary:
                    created_itinerary["id"] = str(created_itinerary["_id"])
                    created_itinerary["user_id"] = str(created_itinerary["user_id"])
                    # Convert datetime objects to ISO strings
                    if created_itinerary.get("created_at"):
                        created_itinerary["created_at"] = created_itinerary["created_at"].isoformat()
                    if created_itinerary.get("updated_at"):
                        created_itinerary["updated_at"] = created_itinerary["updated_at"].isoformat()
                    if created_itinerary.get("start_date"):
                        created_itinerary["start_date"] = created_itinerary["start_date"].isoformat() if hasattr(created_itinerary["start_date"], 'isoformat') else created_itinerary["start_date"]
                    if created_itinerary.get("end_date"):
                        created_itinerary["end_date"] = created_itinerary["end_date"].isoformat() if hasattr(created_itinerary["end_date"], 'isoformat') else created_itinerary["end_date"]
                    return created_itinerary
            
            raise Exception("Failed to create itinerary")
            
        except Exception as e:
            logger.error(f"Error creating itinerary: {str(e)}")
            raise Exception(f"Failed to create itinerary: {str(e)}")
    
    @staticmethod
    async def get_user_itineraries(
        user_id: str,
        limit: int = 200,
        skip: int = 0,
        status: Optional[str] = None,
        is_favorite: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """Get user's saved itineraries"""
        try:
            collection = get_collection(SAVED_TRIPS_COLLECTION)
            if collection is None:
                raise Exception("Database connection not available")
            
            # Build query
            query = {"user_id": user_id}
            if status:
                query["status"] = status
            if is_favorite is not None:
                query["is_favorite"] = is_favorite
            
            # Get itineraries
            cursor = collection.find(query).sort("updated_at", -1).skip(skip).limit(limit)
            itineraries = await cursor.to_list(length=limit)
            
            # Convert ObjectIds to strings
            for itinerary in itineraries:
                itinerary["_id"] = str(itinerary["_id"])
                itinerary["user_id"] = str(itinerary["user_id"])
            
            return itineraries
            
        except Exception as e:
            logger.error(f"Error getting user itineraries: {str(e)}")
            raise Exception(f"Failed to get itineraries: {str(e)}")
    
    @staticmethod
    async def get_itinerary_by_id(itinerary_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific itinerary by ID"""
        try:
            collection = get_collection(SAVED_TRIPS_COLLECTION)
            if collection is None:
                raise Exception("Database connection not available")
            
            itinerary = await collection.find_one({
                "_id": ObjectId(itinerary_id),
                "user_id": ObjectId(user_id)
            })
            
            if itinerary:
                itinerary["_id"] = str(itinerary["_id"])
                itinerary["user_id"] = str(itinerary["user_id"])
                
                # Increment view count
                await collection.update_one(
                    {"_id": ObjectId(itinerary_id)},
                    {"$inc": {"views_count": 1}}
                )
            
            return itinerary
            
        except Exception as e:
            logger.error(f"Error getting itinerary: {str(e)}")
            raise Exception(f"Failed to get itinerary: {str(e)}")
    
    @staticmethod
    async def update_itinerary(
        itinerary_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update an existing itinerary"""
        try:
            collection = get_collection(SAVED_TRIPS_COLLECTION)
            if collection is None:
                raise Exception("Database connection not available")
            
            # Remove fields that shouldn't be updated directly
            update_data.pop("_id", None)
            update_data.pop("user_id", None)
            update_data.pop("created_at", None)
            update_data["updated_at"] = datetime.utcnow()
            
            # If days are being updated, recalculate total cost
            if "days" in update_data:
                total_cost = 0
                for day_data in update_data["days"]:
                    if isinstance(day_data, dict) and "estimated_cost" in day_data:
                        total_cost += day_data.get("estimated_cost", 0)
                update_data["total_estimated_cost"] = total_cost
            
            result = await collection.update_one(
                {"_id": ObjectId(itinerary_id), "user_id": user_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # Return updated itinerary
                updated_itinerary = await collection.find_one({"_id": ObjectId(itinerary_id)})
                if updated_itinerary:
                    updated_itinerary["_id"] = str(updated_itinerary["_id"])
                    updated_itinerary["user_id"] = str(updated_itinerary["user_id"])
                    return updated_itinerary
            
            return None
            
        except Exception as e:
            logger.error(f"Error updating itinerary: {str(e)}")
            raise Exception(f"Failed to update itinerary: {str(e)}")
    
    @staticmethod
    async def delete_itinerary(itinerary_id: str, user_id: str) -> bool:
        """Delete an itinerary"""
        try:
            collection = get_collection(SAVED_TRIPS_COLLECTION)
            if collection is None:
                raise Exception("Database connection not available")
            
            result = await collection.delete_one({
                "_id": ObjectId(itinerary_id),
                "user_id": ObjectId(user_id)
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting itinerary: {str(e)}")
            raise Exception(f"Failed to delete itinerary: {str(e)}")
    
    @staticmethod
    async def toggle_favorite(itinerary_id: str, user_id: str) -> bool:
        """Toggle favorite status of an itinerary"""
        try:
            collection = get_collection(SAVED_TRIPS_COLLECTION)
            if collection is None:
                raise Exception("Database connection not available")
            
            # Get current favorite status
            itinerary = await collection.find_one({
                "_id": ObjectId(itinerary_id),
                "user_id": ObjectId(user_id)
            })
            
            if not itinerary:
                return False
            
            # Toggle favorite status
            new_favorite_status = not itinerary.get("is_favorite", False)
            
            result = await collection.update_one(
                {"_id": ObjectId(itinerary_id), "user_id": user_id},
                {
                    "$set": {
                        "is_favorite": new_favorite_status,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error toggling favorite: {str(e)}")
            raise Exception(f"Failed to toggle favorite: {str(e)}")
    
    @staticmethod
    async def get_public_itineraries(
        limit: int = 200,
        skip: int = 0,
        destination: Optional[str] = None,
        travel_style: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get public itineraries for discovery"""
        try:
            collection = get_collection(SAVED_TRIPS_COLLECTION)
            if collection is None:
                raise Exception("Database connection not available")
            
            # Build query for public itineraries
            query = {"is_public": True, "status": "published"}
            
            if destination:
                query["$or"] = [
                    {"destination": {"$regex": destination, "$options": "i"}},
                    {"city": {"$regex": destination, "$options": "i"}},
                    {"country": {"$regex": destination, "$options": "i"}}
                ]
            
            if travel_style:
                query["travel_style"] = {"$in": [travel_style]}
            
            # Get public itineraries
            cursor = collection.find(query).sort("likes_count", -1).skip(skip).limit(limit)
            itineraries = await cursor.to_list(length=limit)
            
            # Convert ObjectIds to strings
            for itinerary in itineraries:
                itinerary["_id"] = str(itinerary["_id"])
                itinerary["user_id"] = str(itinerary["user_id"])
            
            return itineraries
            
        except Exception as e:
            logger.error(f"Error getting public itineraries: {str(e)}")
            raise Exception(f"Failed to get public itineraries: {str(e)}")
    
    @staticmethod
    async def get_itinerary_stats(user_id: str) -> Dict[str, Any]:
        """Get itinerary statistics for a user"""
        try:
            collection = get_collection(SAVED_TRIPS_COLLECTION)
            if collection is None:
                raise Exception("Database connection not available")
            
            # Get various counts
            total_itineraries = await collection.count_documents({"user_id": user_id})
            published_itineraries = await collection.count_documents({
                "user_id": user_id,
                "status": "published"
            })
            favorite_itineraries = await collection.count_documents({
                "user_id": user_id,
                "is_favorite": True
            })
            draft_itineraries = await collection.count_documents({
                "user_id": user_id,
                "status": "draft"
            })
            
            # Get total views across all user's itineraries
            pipeline = [
                {"$match": {"user_id": ObjectId(user_id)}},
                {"$group": {"_id": None, "total_views": {"$sum": "$views_count"}}}
            ]
            views_result = await collection.aggregate(pipeline).to_list(1)
            total_views = views_result[0]["total_views"] if views_result else 0
            
            return {
                "total_itineraries": total_itineraries,
                "published_itineraries": published_itineraries,
                "favorite_itineraries": favorite_itineraries,
                "draft_itineraries": draft_itineraries,
                "total_views": total_views
            }
            
        except Exception as e:
            logger.error(f"Error getting itinerary stats: {str(e)}")
            raise Exception(f"Failed to get itinerary stats: {str(e)}")
