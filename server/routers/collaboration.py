from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from database import get_database
from mongo_models import (
    ItineraryInvitationDocument, 
    ItineraryCollaboratorDocument,
    SavedItineraryDocument,
    NotificationDocument,
    InvitationStatus,
    NotificationType,
    NotificationStatus,
    PyObjectId
)
from routers.auth import get_current_user
from models import APIResponse, InviteCollaboratorRequest, AcceptInvitationRequest, CollaboratorRole
from services.email_service import email_service

router = APIRouter(prefix="/collaboration", tags=["collaboration"])
security = HTTPBearer()

@router.post("/invite", response_model=APIResponse)
async def invite_collaborator(
    request: InviteCollaboratorRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Invite a user to collaborate on an itinerary"""
    try:
        # Extract data from request
        itinerary_id = request.itinerary_id
        email = request.email
        role = request.role
        message = request.message
        
        # Check if itinerary exists
        itinerary = await db.saved_itineraries.find_one({
            "_id": PyObjectId(itinerary_id)
        })
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found"
            )
        
        # Check if user is the owner (only owners can invite collaborators)
        itinerary_owner_id = str(itinerary["user_id"])
        current_user_id = str(current_user.id)
        
        # Debug logging
        print(f"DEBUG: Itinerary owner ID: {itinerary_owner_id}")
        print(f"DEBUG: Current user ID: {current_user_id}")
        print(f"DEBUG: IDs match: {itinerary_owner_id == current_user_id}")
        
        if itinerary_owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the itinerary owner can invite collaborators"
            )
        
        # Check if user is trying to invite themselves
        if email == current_user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot invite yourself"
            )
        
        # Check if invitation already exists
        existing_invitation = await db.itinerary_invitations.find_one({
            "itinerary_id": PyObjectId(itinerary_id),
            "invited_email": email,
            "status": InvitationStatus.PENDING
        })
        
        if existing_invitation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation already sent to this email"
            )
        
        # Check if user is already a collaborator
        existing_collaborator = await db.itinerary_collaborators.find_one({
            "itinerary_id": PyObjectId(itinerary_id),
            "user_id": PyObjectId(current_user.id)  # This should check the invited user's ID
        })
        
        # Create invitation
        invitation = ItineraryInvitationDocument(
            itinerary_id=PyObjectId(itinerary_id),
            owner_id=PyObjectId(current_user.id),
            invited_email=email,
            role=role,
            invitation_token=str(uuid.uuid4()),
            expires_at=datetime.utcnow() + timedelta(days=7),  # 7 days expiry
            message=message
        )
        
        # Save invitation
        result = await db.itinerary_invitations.insert_one(invitation.model_dump(by_alias=True))
        
        # Update itinerary to be collaborative
        await db.saved_itineraries.update_one(
            {"_id": PyObjectId(itinerary_id)},
            {
                "$set": {
                    "is_collaborative": True,
                    "owner_id": PyObjectId(current_user.id),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Create notification for invited user (if they exist in system)
        invited_user = await db.users.find_one({"email": email})
        if invited_user:
            notification = NotificationDocument(
                user_id=PyObjectId(invited_user["_id"]),
                type=NotificationType.INVITATION_RECEIVED,
                title="New Collaboration Invitation",
                message=f"You've been invited to collaborate on '{itinerary['title']}'",
                data={
                    "itinerary_id": str(itinerary_id),
                    "invitation_id": str(result.inserted_id),
                    "owner_name": f"{current_user.first_name} {current_user.last_name}",
                    "role": role.value
                },
                action_url=f"/collaboration/invitation/{invitation.invitation_token}"
            )
            await db.notifications.insert_one(notification.model_dump(by_alias=True))
        
        # Send email invitation
        try:
            await email_service.send_invitation_email(
                to_email=email,
                invitation_token=invitation.invitation_token,
                itinerary_title=itinerary['title'],
                owner_name=f"{current_user.first_name} {current_user.last_name}",
                role=role.value,
                message=message
            )
        except Exception as email_error:
            # Log email error but don't fail the invitation
            print(f"Failed to send invitation email: {email_error}")
            # Continue with the invitation creation even if email fails
        
        return APIResponse(
            success=True,
            message="Invitation sent successfully",
            data={
                "invitation_id": str(result.inserted_id),
                "invitation_token": invitation.invitation_token,
                "expires_at": invitation.expires_at.isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send invitation: {str(e)}"
        )

@router.get("/invitations", response_model=APIResponse)
async def get_user_invitations(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all pending invitations for the current user"""
    try:
        invitations = []
        cursor = db.itinerary_invitations.find({
            "invited_email": current_user.email,
            "status": InvitationStatus.PENDING,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        async for invitation in cursor:
            # Get itinerary details
            itinerary = await db.saved_itineraries.find_one({
                "_id": invitation["itinerary_id"]
            })
            
            # Get owner details
            owner = await db.users.find_one({
                "_id": invitation["owner_id"]
            })
            
            if itinerary and owner:
                invitations.append({
                    "invitation_id": str(invitation["_id"]),
                    "invitation_token": invitation["invitation_token"],
                    "itinerary": {
                        "id": str(itinerary["_id"]),
                        "title": itinerary["title"],
                        "destination": itinerary["destination"],
                        "cover_image": itinerary.get("cover_image")
                    },
                    "owner": {
                        "id": str(owner["_id"]),
                        "name": f"{owner['first_name']} {owner['last_name']}",
                        "email": owner["email"]
                    },
                    "role": invitation["role"],
                    "message": invitation.get("message"),
                    "expires_at": invitation["expires_at"].isoformat(),
                    "created_at": invitation["created_at"].isoformat()
                })
        
        return APIResponse(
            success=True,
            message="Invitations retrieved successfully",
            data={"invitations": invitations}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get invitations: {str(e)}"
        )

@router.get("/invitation/{invitation_token}/info", response_model=APIResponse)
async def get_invitation_info(
    invitation_token: str,
    db = Depends(get_database)
):
    """Get invitation information (public endpoint)"""
    try:
        # Find invitation
        invitation = await db.itinerary_invitations.find_one({
            "invitation_token": invitation_token,
            "status": InvitationStatus.PENDING
        })
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or has expired"
            )
        
        # Check if invitation has expired
        if datetime.utcnow() > invitation["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )
        
        # Get itinerary info
        itinerary = await db.saved_itineraries.find_one({
            "_id": invitation["itinerary_id"]
        })
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found"
            )
        
        return APIResponse(
            success=True,
            message="Invitation found",
            data={
                "invitation": {
                    "id": str(invitation["_id"]),
                    "invitation_token": invitation["invitation_token"],
                    "role": invitation["role"],
                    "message": invitation.get("message"),
                    "expires_at": invitation["expires_at"].isoformat(),
                    "created_at": invitation["created_at"].isoformat()
                },
                "itinerary": {
                    "id": str(itinerary["_id"]),
                    "title": itinerary["title"],
                    "destination": itinerary["destination"],
                    "duration_days": itinerary["duration_days"]
                },
                "owner_email": invitation["invited_email"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get invitation info: {str(e)}"
        )

@router.post("/invitation/{invitation_token}/accept", response_model=APIResponse)
async def accept_invitation(
    invitation_token: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Accept a collaboration invitation"""
    try:
        # Find invitation
        invitation = await db.itinerary_invitations.find_one({
            "invitation_token": invitation_token,
            "invited_email": current_user.email,
            "status": InvitationStatus.PENDING
        })
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already processed"
            )
        
        # Check if invitation is expired
        if invitation["expires_at"] < datetime.utcnow():
            # Mark as expired
            await db.itinerary_invitations.update_one(
                {"_id": invitation["_id"]},
                {"$set": {"status": InvitationStatus.EXPIRED}}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )
        
        # Check if user is already a collaborator
        existing_collaborator = await db.itinerary_collaborators.find_one({
            "itinerary_id": invitation["itinerary_id"],
            "user_id": PyObjectId(current_user.id)
        })
        
        if existing_collaborator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already a collaborator on this itinerary"
            )
        
        # Create collaborator record
        collaborator = ItineraryCollaboratorDocument(
            itinerary_id=invitation["itinerary_id"],
            user_id=PyObjectId(current_user.id),
            role=invitation["role"],
            invited_by=invitation["owner_id"]
        )
        
        # Save collaborator
        await db.itinerary_collaborators.insert_one(collaborator.model_dump(by_alias=True))
        
        # Update invitation status
        await db.itinerary_invitations.update_one(
            {"_id": invitation["_id"]},
            {
                "$set": {
                    "status": InvitationStatus.ACCEPTED,
                    "invited_user_id": PyObjectId(current_user.id),
                    "accepted_at": datetime.utcnow()
                }
            }
        )
        
        # Add user to itinerary collaborators list
        await db.saved_itineraries.update_one(
            {"_id": invitation["itinerary_id"]},
            {
                "$addToSet": {"collaborators": PyObjectId(current_user.id)},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Create a saved itinerary record for the collaborator
        original_itinerary = await db.saved_itineraries.find_one({
            "_id": invitation["itinerary_id"]
        })
        
        if original_itinerary:
            # Create a copy of the itinerary for the collaborator
            collaborator_itinerary = original_itinerary.copy()
            del collaborator_itinerary["_id"]  # Remove original ID
            del collaborator_itinerary["created_at"]  # Will be set to current time
            del collaborator_itinerary["updated_at"]  # Will be set to current time
            
            # Set new fields for collaborator's copy
            collaborator_itinerary.update({
                "user_id": PyObjectId(current_user.id),
                "is_collaborative": True,
                "collaborators": [PyObjectId(current_user.id)],
                "owner_id": invitation["owner_id"],  # Keep reference to original owner
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            # Insert the collaborator's copy
            result = await db.saved_itineraries.insert_one(collaborator_itinerary)
            
            # Update the collaborator record with the new itinerary ID
            await db.itinerary_collaborators.update_one(
                {
                    "itinerary_id": invitation["itinerary_id"],
                    "user_id": PyObjectId(current_user.id)
                },
                {"$set": {"collaborator_itinerary_id": result.inserted_id}}
            )
        
        # Create notification for owner
        notification = NotificationDocument(
            user_id=invitation["owner_id"],
            type=NotificationType.INVITATION_ACCEPTED,
            title="Invitation Accepted",
            message=f"{current_user.first_name} {current_user.last_name} accepted your collaboration invitation",
            data={
                "itinerary_id": str(invitation["itinerary_id"]),
                "collaborator_id": str(current_user.id),
                "collaborator_name": f"{current_user.first_name} {current_user.last_name}"
            },
            action_url=f"/saved-itinerary/{invitation['itinerary_id']}"
        )
        await db.notifications.insert_one(notification.model_dump(by_alias=True))
        
        return APIResponse(
            success=True,
            message="Invitation accepted successfully",
            data={
                "itinerary_id": str(invitation["itinerary_id"]),
                "role": invitation["role"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept invitation: {str(e)}"
        )

@router.post("/invitation/{invitation_token}/decline", response_model=APIResponse)
async def decline_invitation(
    invitation_token: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Decline a collaboration invitation"""
    try:
        # Find invitation
        invitation = await db.itinerary_invitations.find_one({
            "invitation_token": invitation_token,
            "invited_email": current_user.email,
            "status": InvitationStatus.PENDING
        })
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already processed"
            )
        
        # Update invitation status
        await db.itinerary_invitations.update_one(
            {"_id": invitation["_id"]},
            {
                "$set": {
                    "status": InvitationStatus.DECLINED,
                    "declined_at": datetime.utcnow()
                }
            }
        )
        
        # Create notification for owner
        notification = NotificationDocument(
            user_id=invitation["owner_id"],
            type=NotificationType.INVITATION_DECLINED,
            title="Invitation Declined",
            message=f"{current_user.first_name} {current_user.last_name} declined your collaboration invitation",
            data={
                "itinerary_id": str(invitation["itinerary_id"]),
                "invitation_id": str(invitation["_id"])
            }
        )
        await db.notifications.insert_one(notification.model_dump(by_alias=True))
        
        return APIResponse(
            success=True,
            message="Invitation declined successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decline invitation: {str(e)}"
        )

@router.get("/itinerary/{itinerary_id}/collaborators", response_model=APIResponse)
async def get_itinerary_collaborators(
    itinerary_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all collaborators for an itinerary"""
    try:
        # Check if user has access to this itinerary
        itinerary = await db.saved_itineraries.find_one({
            "_id": PyObjectId(itinerary_id),
            "$or": [
                {"user_id": PyObjectId(current_user.id)},  # Owner
                {"collaborators": PyObjectId(current_user.id)}  # Collaborator
            ]
        })
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found or access denied"
            )
        
        # Get collaborators
        collaborators = []
        cursor = db.itinerary_collaborators.find({
            "itinerary_id": PyObjectId(itinerary_id)
        })
        
        async for collaborator in cursor:
            user = await db.users.find_one({"_id": collaborator["user_id"]})
            if user:
                collaborators.append({
                    "user_id": str(user["_id"]),
                    "name": f"{user['first_name']} {user['last_name']}",
                    "email": user["email"],
                    "role": collaborator["role"],
                    "joined_at": collaborator["joined_at"].isoformat(),
                    "last_activity": collaborator.get("last_activity").isoformat() if collaborator.get("last_activity") else None
                })
        
        # Add owner info
        owner = await db.users.find_one({"_id": itinerary["user_id"]})
        owner_info = {
            "user_id": str(owner["_id"]),
            "name": f"{owner['first_name']} {owner['last_name']}",
            "email": owner["email"],
            "role": "owner",
            "joined_at": itinerary["created_at"].isoformat(),
            "last_activity": None
        }
        
        return APIResponse(
            success=True,
            message="Collaborators retrieved successfully",
            data={
                "owner": owner_info,
                "collaborators": collaborators
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get collaborators: {str(e)}"
        )

@router.delete("/itinerary/{itinerary_id}/collaborator/{user_id}", response_model=APIResponse)
async def remove_collaborator(
    itinerary_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Remove a collaborator from an itinerary (owner only)"""
    try:
        # Check if current user is owner
        itinerary = await db.saved_itineraries.find_one({
            "_id": PyObjectId(itinerary_id),
            "user_id": PyObjectId(current_user.id)
        })
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found or you don't have permission"
            )
        
        # Check if trying to remove owner
        if user_id == str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the owner"
            )
        
        # Remove collaborator
        result = await db.itinerary_collaborators.delete_one({
            "itinerary_id": PyObjectId(itinerary_id),
            "user_id": PyObjectId(user_id)
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaborator not found"
            )
        
        # Remove from itinerary collaborators list
        await db.saved_itineraries.update_one(
            {"_id": PyObjectId(itinerary_id)},
            {
                "$pull": {"collaborators": PyObjectId(user_id)},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Create notification for removed user
        notification = NotificationDocument(
            user_id=PyObjectId(user_id),
            type=NotificationType.COLLABORATOR_REMOVED,
            title="Removed from Collaboration",
            message=f"You have been removed from the collaboration on '{itinerary['title']}'",
            data={
                "itinerary_id": str(itinerary_id),
                "owner_name": f"{current_user.first_name} {current_user.last_name}"
            }
        )
        await db.notifications.insert_one(notification.model_dump(by_alias=True))
        
        return APIResponse(
            success=True,
            message="Collaborator removed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove collaborator: {str(e)}"
        )

@router.get("/my-collaborations", response_model=APIResponse)
async def get_my_collaborations(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all itineraries where the user is a collaborator"""
    try:
        collaborations = []
        cursor = db.itinerary_collaborators.find({
            "user_id": PyObjectId(current_user.id)
        })
        
        async for collaboration in cursor:
            itinerary = await db.saved_itineraries.find_one({
                "_id": collaboration["itinerary_id"]
            })
            
            if itinerary:
                owner = await db.users.find_one({
                    "_id": itinerary["user_id"]
                })
                
                collaborations.append({
                    "itinerary_id": str(itinerary["_id"]),
                    "title": itinerary["title"],
                    "destination": itinerary["destination"],
                    "cover_image": itinerary.get("cover_image"),
                    "role": collaboration["role"],
                    "owner": {
                        "name": f"{owner['first_name']} {owner['last_name']}",
                        "email": owner["email"]
                    },
                    "joined_at": collaboration["joined_at"].isoformat(),
                    "last_activity": collaboration.get("last_activity").isoformat() if collaboration.get("last_activity") else None
                })
        
        return APIResponse(
            success=True,
            message="Collaborations retrieved successfully",
            data={"collaborations": collaborations}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get collaborations: {str(e)}"
        )
