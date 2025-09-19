
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from database import get_database
from mongo_models import NotificationDocument, NotificationStatus, PyObjectId
from routers.auth import get_current_user
from models import APIResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=APIResponse)
async def get_notifications(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all notifications for the current user"""
    try:
        # Get notifications with pagination
        cursor = db.notifications.find(
            {"user_id": PyObjectId(current_user.id)}
        ).sort("created_at", -1).skip(offset).limit(limit)
        
        notifications = []
        async for notification in cursor:
            notifications.append({
                "id": str(notification["_id"]),
                "type": notification["type"],
                "title": notification["title"],
                "message": notification["message"],
                "data": notification.get("data", {}),
                "is_read": notification["status"] == NotificationStatus.READ,
                "created_at": notification["created_at"].isoformat(),
                "read_at": notification.get("read_at").isoformat() if notification.get("read_at") else None,
                "action_url": notification.get("action_url")
            })
        
        return APIResponse(
            success=True,
            message="Notifications retrieved successfully",
            data=notifications
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get notifications: {str(e)}"
        )

@router.get("/count", response_model=APIResponse)
async def get_notification_count(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get unread notification count for the current user"""
    try:
        unread_count = await db.notifications.count_documents({
            "user_id": PyObjectId(current_user.id),
            "status": NotificationStatus.UNREAD
        })
        
        return APIResponse(
            success=True,
            message="Notification count retrieved successfully",
            data={"unread_count": unread_count}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get notification count: {str(e)}"
        )

@router.put("/{notification_id}/read", response_model=APIResponse)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Mark a specific notification as read"""
    try:
        # Check if notification exists and belongs to user
        notification = await db.notifications.find_one({
            "_id": PyObjectId(notification_id),
            "user_id": PyObjectId(current_user.id)
        })
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        # Update notification status
        await db.notifications.update_one(
            {"_id": PyObjectId(notification_id)},
            {
                "$set": {
                    "status": NotificationStatus.READ,
                    "read_at": datetime.utcnow()
                }
            }
        )
        
        return APIResponse(
            success=True,
            message="Notification marked as read"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {str(e)}"
        )

@router.put("/read-all", response_model=APIResponse)
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Mark all notifications as read for the current user"""
    try:
        # Update all unread notifications for the user
        result = await db.notifications.update_many(
            {
                "user_id": PyObjectId(current_user.id),
                "status": NotificationStatus.UNREAD
            },
            {
                "$set": {
                    "status": NotificationStatus.READ,
                    "read_at": datetime.utcnow()
                }
            }
        )
        
        return APIResponse(
            success=True,
            message=f"Marked {result.modified_count} notifications as read"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark all notifications as read: {str(e)}"
        )

@router.delete("/{notification_id}", response_model=APIResponse)
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a specific notification"""
    try:
        # Check if notification exists and belongs to user
        notification = await db.notifications.find_one({
            "_id": PyObjectId(notification_id),
            "user_id": PyObjectId(current_user.id)
        })
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        # Delete notification
        await db.notifications.delete_one({"_id": PyObjectId(notification_id)})
        
        return APIResponse(
            success=True,
            message="Notification deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete notification: {str(e)}"
        )


