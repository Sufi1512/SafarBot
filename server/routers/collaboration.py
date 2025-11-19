from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import List, Optional
from datetime import datetime, timedelta, timezone
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
    PyObjectId,
    CollaborationRoomDocument,
    ChatMessageDocument,
    RoomInvitationDocument
)
from routers.auth import get_current_user
from models import APIResponse, InviteCollaboratorRequest, AcceptInvitationRequest, CollaboratorRole
from pydantic import BaseModel
from services.email_service import email_service

class ResendInvitationRequest(BaseModel):
    invitation_id: str
    message: Optional[str] = None
    itinerary_id: Optional[str] = None  # Optional for backward compatibility
    email: Optional[str] = None  # Optional for backward compatibility
    
    class Config:
        json_schema_extra = {
            "example": {
                "invitation_id": "507f1f77bcf86cd799439011",
                "message": "Resending invitation for the project"
            }
        }

router = APIRouter()
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
            # Return existing invitation info instead of error
            return APIResponse(
                success=False,
                message="Invitation already sent to this email",
                data={
                    "invitation_id": str(existing_invitation["_id"]),
                    "invited_email": existing_invitation["invited_email"],
                    "role": existing_invitation["role"],
                    "invited_at": existing_invitation["invited_at"].isoformat(),
                    "expires_at": existing_invitation["expires_at"].isoformat(),
                    "can_resend": True
                }
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
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),  # 7 days expiry
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
                    "updated_at": datetime.now(timezone.utc)
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
                action_url=f"/collaboration/accept/{invitation.invitation_token}"
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

@router.post("/resend-invitation", response_model=APIResponse)
async def resend_invitation(
    request: ResendInvitationRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Resend an existing invitation"""
    try:
        print(f"DEBUG: Resend invitation request - invitation_id: {request.invitation_id}, itinerary_id: {request.itinerary_id}, email: {request.email}, message: {request.message}")
        
        # Validate invitation_id format
        try:
            invitation_object_id = PyObjectId(request.invitation_id)
            print(f"DEBUG: Valid ObjectId created: {invitation_object_id}")
        except Exception as e:
            print(f"DEBUG: Invalid ObjectId format: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid invitation ID format"
            )
        
        # Find the existing invitation
        invitation = await db.itinerary_invitations.find_one({
            "_id": invitation_object_id,
            "owner_id": PyObjectId(current_user.id)  # Ensure user owns the invitation
        })
        
        if not invitation:
            print(f"DEBUG: Invitation not found for ID: {invitation_object_id}, owner: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or you don't have permission to resend it"
            )
        
        print(f"DEBUG: Found invitation: {invitation}")
        
        # Check if invitation is still pending
        if invitation["status"] != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot resend invitation that has been accepted or declined"
            )
        
        # Update invitation with new token and expiry
        new_token = str(uuid.uuid4())
        new_expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.itinerary_invitations.update_one(
            {"_id": invitation_object_id},
            {
                "$set": {
                    "invitation_token": new_token,
                    "expires_at": new_expires_at,
                    "invited_at": datetime.now(timezone.utc),  # Update invitation time
                    "message": request.message or invitation.get("message", ""),
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Get itinerary details
        itinerary = await db.saved_itineraries.find_one({
            "_id": invitation["itinerary_id"]
        })
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found"
            )
        
        # Send email invitation
        try:
            await email_service.send_invitation_email(
                to_email=invitation["invited_email"],
                invitation_token=new_token,
                itinerary_title=itinerary['title'],
                owner_name=f"{current_user.first_name} {current_user.last_name}",
                role=invitation["role"].value if hasattr(invitation["role"], 'value') else invitation["role"],
                message=request.message or invitation.get("message", "")
            )
        except Exception as email_error:
            # Log email error but don't fail the resend
            print(f"Failed to resend invitation email: {email_error}")
            # Continue with the resend even if email fails
        
        return APIResponse(
            success=True,
            message="Invitation resent successfully",
            data={
                "invitation_id": str(invitation["_id"]),
                "invitation_token": new_token,
                "expires_at": new_expires_at.isoformat(),
                "invited_email": invitation["invited_email"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend invitation: {str(e)}"
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
            "expires_at": {"$gt": datetime.now(timezone.utc)}
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
        if datetime.now(timezone.utc) > invitation["expires_at"]:
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
        if invitation["expires_at"] < datetime.now(timezone.utc):
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
                    "accepted_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Add user to itinerary collaborators list
        await db.saved_itineraries.update_one(
            {"_id": invitation["itinerary_id"]},
            {
                "$addToSet": {"collaborators": PyObjectId(current_user.id)},
                "$set": {"updated_at": datetime.now(timezone.utc)}
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
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
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
        
        # Return the collaborator's itinerary ID if it was created, otherwise the original
        collaborator_itinerary_id = None
        if original_itinerary:
            # Get the collaborator's itinerary ID from the collaborator record
            collaborator_record = await db.itinerary_collaborators.find_one({
                "itinerary_id": invitation["itinerary_id"],
                "user_id": PyObjectId(current_user.id)
            })
            if collaborator_record and collaborator_record.get("collaborator_itinerary_id"):
                collaborator_itinerary_id = str(collaborator_record["collaborator_itinerary_id"])
        
        return APIResponse(
            success=True,
            message="Invitation accepted successfully",
            data={
                "itinerary_id": collaborator_itinerary_id or str(invitation["itinerary_id"]),
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
                    "declined_at": datetime.now(timezone.utc)
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
        # Validate itinerary ID format
        try:
            PyObjectId(itinerary_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid itinerary ID format"
            )
        
        # Check if user has access to this itinerary
        itinerary = await db.saved_itineraries.find_one({
            "_id": PyObjectId(itinerary_id)
        })
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found"
            )
        
        print(f"Itinerary found: {itinerary.get('_id')}")
        print(f"Itinerary user_id: {itinerary.get('user_id')}")
        print(f"Itinerary user_id type: {type(itinerary.get('user_id'))}")
        
        # Check if user is owner
        is_owner = str(itinerary.get("user_id")) == str(current_user.id)
        
        # Check if user is a collaborator
        is_collaborator = False
        if not is_owner:
            collaborator = await db.itinerary_collaborators.find_one({
                "itinerary_id": PyObjectId(itinerary_id),
                "user_id": PyObjectId(current_user.id)
            })
            is_collaborator = collaborator is not None
        
        if not is_owner and not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get collaborators (accepted invitations)
        collaborators = []
        cursor = db.itinerary_collaborators.find({
            "itinerary_id": PyObjectId(itinerary_id)
        })
        
        async for collaborator in cursor:
            # Try to find user in users collection first
            user = await db.users.find_one({"_id": collaborator.get("user_id")})
            
            # If not found in users, try user_fields collection
            if not user:
                user = await db.user_fields.find_one({"_id": collaborator.get("user_id")})
            
            if user:
                collaborators.append({
                    "user_id": str(user["_id"]),
                    "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
                    "email": user.get("email", ""),
                    "role": collaborator.get("role", "viewer"),
                    "status": "accepted",
                    "joined_at": collaborator.get("joined_at", datetime.now(timezone.utc)).isoformat() if hasattr(collaborator.get("joined_at", datetime.now(timezone.utc)), 'isoformat') else datetime.now(timezone.utc).isoformat(),
                    "last_activity": collaborator.get("last_activity").isoformat() if collaborator.get("last_activity") and hasattr(collaborator.get("last_activity"), 'isoformat') else None
                })
        
        # Get invitations (pending, rejected, etc.)
        invitations = []
        invitation_cursor = db.itinerary_invitations.find({
            "itinerary_id": PyObjectId(itinerary_id)
        })
        
        async for invitation in invitation_cursor:
            # Skip if this invitation was accepted (user is already in collaborators)
            if invitation.get("status") == "accepted":
                continue
                
            invitations.append({
                "invitation_id": str(invitation.get("_id")),
                "email": invitation.get("invited_email", ""),
                "role": invitation.get("role", "viewer"),
                "status": invitation.get("status", "pending"),
                "invited_at": invitation.get("created_at", datetime.now(timezone.utc)).isoformat() if hasattr(invitation.get("created_at", datetime.now(timezone.utc)), 'isoformat') else datetime.now(timezone.utc).isoformat(),
                "expires_at": invitation.get("expires_at", datetime.now(timezone.utc)).isoformat() if hasattr(invitation.get("expires_at", datetime.now(timezone.utc)), 'isoformat') else None,
                "message": invitation.get("message", ""),
                "accepted_at": invitation.get("accepted_at", "").isoformat() if invitation.get("accepted_at") and hasattr(invitation.get("accepted_at"), 'isoformat') else None,
                "declined_at": invitation.get("declined_at", "").isoformat() if invitation.get("declined_at") and hasattr(invitation.get("declined_at"), 'isoformat') else None
                })
        
        # Add owner info
        owner_id = itinerary.get("user_id")
        print(f"Looking for owner with ID: {owner_id}")
        print(f"Owner ID type: {type(owner_id)}")
        
        # Try multiple ways to find the owner
        owner = None
        
        # Method 1: Check if current user is the owner by looking at invitations
        if not owner:
            try:
                # Check if current user is the owner by looking at invitations for this itinerary
                invitation = await db.itinerary_invitations.find_one({
                    "itinerary_id": PyObjectId(itinerary_id),
                    "owner_id": PyObjectId(current_user.id)
                })
                
                if invitation:
                    print(f"Found owner via invitation: {invitation.get('owner_id')}")
                    # Try to find the user in the users collection first
                    owner = await db.users.find_one({"_id": PyObjectId(current_user.id)})
                    print(f"Owner found in users collection: {owner is not None}")
                    
                    # If not found in users, try user_fields collection
                    if not owner:
                        print("Checking user_fields collection...")
                        owner = await db.user_fields.find_one({"_id": PyObjectId(current_user.id)})
                        print(f"Owner found in user_fields collection: {owner is not None}")
                    
                    # If still not found, create a basic owner info
                    if not owner:
                        print("User not found in any collection, creating basic owner info")
                        owner = {
                            "_id": PyObjectId(current_user.id),
                            "first_name": "User",
                            "last_name": "Unknown",
                            "email": "user@example.com"
                        }
                    
                    # Update the itinerary with the correct user_id
                    if not owner_id:
                        print("Updating itinerary with correct user_id from invitation...")
                        await db.saved_itineraries.update_one(
                            {"_id": PyObjectId(itinerary_id)},
                            {"$set": {"user_id": PyObjectId(current_user.id)}}
                        )
                        print("Itinerary updated with user_id from invitation")
            except Exception as e:
                print(f"Error checking invitations: {e}")
        
        # Method 2: Direct ObjectId lookup in users collection
        if not owner and owner_id:
            try:
                owner = await db.users.find_one({"_id": PyObjectId(owner_id)})
                print(f"Owner found in users with PyObjectId: {owner is not None}")
            except:
                pass
        
        # Method 3: Direct ObjectId lookup in user_fields collection
        if not owner and owner_id:
            try:
                owner = await db.user_fields.find_one({"_id": PyObjectId(owner_id)})
                print(f"Owner found in user_fields with PyObjectId: {owner is not None}")
            except:
                pass
        
        # Method 4: String ID lookup in users collection
        if not owner and owner_id:
            try:
                owner = await db.users.find_one({"_id": str(owner_id)})
                print(f"Owner found in users with string ID: {owner is not None}")
            except:
                pass
        
        # Method 5: String ID lookup in user_fields collection
        if not owner and owner_id:
            try:
                owner = await db.user_fields.find_one({"_id": str(owner_id)})
                print(f"Owner found in user_fields with string ID: {owner is not None}")
            except:
                pass
        
        # Method 6: Try to find by the current user ID in users collection
        if not owner:
            try:
                owner = await db.users.find_one({"_id": PyObjectId(current_user.id)})
                print(f"Owner found in users with current user ID: {owner is not None}")
            except:
                pass
        
        # Method 7: Try to find by the current user ID in user_fields collection
        if not owner:
            try:
                owner = await db.user_fields.find_one({"_id": PyObjectId(current_user.id)})
                print(f"Owner found in user_fields with current user ID: {owner is not None}")
            except:
                pass
            
        if not owner:
            # If owner not found, try to get current user info as fallback
            print(f"Warning: Owner not found for user_id: {owner_id}")
            try:
                # Try users collection first
                current_user_info = await db.users.find_one({"_id": PyObjectId(current_user.id)})
                if not current_user_info:
                    # Try user_fields collection
                    print("Checking user_fields collection for current user...")
                    current_user_info = await db.user_fields.find_one({"_id": PyObjectId(current_user.id)})
                    print(f"Current user found in user_fields: {current_user_info is not None}")
                
                if current_user_info:
                    owner_info = {
                        "user_id": str(current_user_info["_id"]),
                        "name": f"{current_user_info.get('first_name', '')} {current_user_info.get('last_name', '')}".strip(),
                        "email": current_user_info.get("email", ""),
                        "role": "owner",
                        "joined_at": itinerary.get("created_at", datetime.now(timezone.utc)).isoformat() if hasattr(itinerary.get("created_at", datetime.now(timezone.utc)), 'isoformat') else datetime.now(timezone.utc).isoformat(),
                        "last_activity": None
                    }
                else:
                    # User not found in any collection, create basic info
                    print("Current user not found in any collection, creating basic owner info")
                    owner_info = {
                        "user_id": str(current_user.id),
                        "name": "Current User",
                        "email": "user@example.com",
                        "role": "owner",
                        "joined_at": itinerary.get("created_at", datetime.now(timezone.utc)).isoformat() if hasattr(itinerary.get("created_at", datetime.now(timezone.utc)), 'isoformat') else datetime.now(timezone.utc).isoformat(),
                        "last_activity": None
                    }
            except Exception as e:
                print(f"Error getting current user info: {e}")
                owner_info = {
                    "user_id": str(owner_id) if owner_id else str(current_user.id),
                    "name": "Unknown User",
                    "email": "unknown@example.com",
                    "role": "owner",
                    "joined_at": datetime.now(timezone.utc).isoformat(),
                    "last_activity": None
                }
        else:
            owner_info = {
                "user_id": str(owner["_id"]),
                "name": f"{owner.get('first_name', '')} {owner.get('last_name', '')}".strip(),
                "email": owner.get("email", ""),
                "role": "owner",
                "joined_at": itinerary.get("created_at", datetime.utcnow()).isoformat() if hasattr(itinerary.get("created_at", datetime.utcnow()), 'isoformat') else datetime.utcnow().isoformat(),
                "last_activity": None
            }
        
        return APIResponse(
            success=True,
            message="Collaborators retrieved successfully",
            data={
                "owner": owner_info,
                "collaborators": collaborators,
                "invitations": invitations
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
    """Remove a collaborator from an itinerary (owner and admin only)"""
    try:
        print(f"DEBUG: Remove collaborator request - itinerary_id: {itinerary_id}, user_id: {user_id}, current_user_id: {current_user.id}")
        print(f"DEBUG: Current user details: {current_user}")
        
        # Validate ObjectIds
        try:
            itinerary_object_id = PyObjectId(itinerary_id)
            user_object_id = PyObjectId(user_id)
            current_user_object_id = PyObjectId(current_user.id)
            print(f"DEBUG: ObjectIds created successfully")
        except Exception as e:
            print(f"DEBUG: ObjectId validation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )
        
        # Check if itinerary exists
        itinerary = await db.saved_itineraries.find_one({
            "_id": itinerary_object_id
        })
        
        print(f"DEBUG: Found itinerary: {itinerary is not None}")
        if itinerary:
            print(f"DEBUG: Itinerary title: {itinerary.get('title', 'No title')}")
            print(f"DEBUG: Itinerary owner: {itinerary.get('user_id')}")
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found"
            )
        
        # Check permissions: user must be owner or admin
        is_owner = str(itinerary.get("user_id")) == str(current_user.id)
        is_admin = False
        
        if not is_owner:
            # Check if current user is an admin collaborator
            collaborator = await db.itinerary_collaborators.find_one({
                "itinerary_id": itinerary_object_id,
                "user_id": current_user_object_id,
                "role": "admin"
            })
            is_admin = collaborator is not None
        
        print(f"DEBUG: User is owner: {is_owner}")
        print(f"DEBUG: User is admin: {is_admin}")
        
        if not is_owner and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owners and admins can remove collaborators"
            )
        
        # Check if trying to remove owner
        if user_id == str(itinerary.get("user_id")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the owner"
            )
        
        # Remove collaborator
        result = await db.itinerary_collaborators.delete_one({
            "itinerary_id": itinerary_object_id,
            "user_id": user_object_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaborator not found"
            )
        
        # Remove from itinerary collaborators list
        await db.saved_itineraries.update_one(
            {"_id": itinerary_object_id},
            {
                "$pull": {"collaborators": user_object_id},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
        
        # Create notification for removed user
        notification = NotificationDocument(
            user_id=user_object_id,
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

@router.put("/itinerary/{itinerary_id}/collaborator/{user_id}/role", response_model=APIResponse)
async def update_collaborator_role(
    itinerary_id: str,
    user_id: str,
    role_data: dict,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a collaborator's role (owner only)"""
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
        
        # Check if trying to update owner's role
        if user_id == str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update owner's role"
            )
        
        # Validate role
        new_role = role_data.get("role")
        if new_role not in ["viewer", "editor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'viewer', 'editor', or 'admin'"
            )
        
        # Update collaborator role
        result = await db.itinerary_collaborators.update_one(
            {
                "itinerary_id": PyObjectId(itinerary_id),
                "user_id": PyObjectId(user_id)
            },
            {
                "$set": {
                    "role": new_role,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collaborator not found"
            )
        
        # Create notification for the collaborator whose role was updated
        notification = NotificationDocument(
            user_id=PyObjectId(user_id),
            type=NotificationType.ROLE_UPDATED,
            title="Role Updated",
            message=f"Your role in '{itinerary['title']}' has been updated to {new_role}",
            data={
                "itinerary_id": str(itinerary_id),
                "new_role": new_role,
                "owner_name": f"{current_user.first_name} {current_user.last_name}"
            }
        )
        await db.notifications.insert_one(notification.model_dump(by_alias=True))
        
        return APIResponse(
            success=True,
            message="Collaborator role updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update collaborator role: {str(e)}"
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

# ============ COLLABORATION ROOM ENDPOINTS ============

class CreateRoomRequest(BaseModel):
    itinerary_id: str
    room_name: Optional[str] = None

class RoomStatusResponse(BaseModel):
    exists: bool
    room_id: Optional[str] = None
    can_join: bool = False
    is_member: bool = False
    room_name: Optional[str] = None
    member_count: int = 0

@router.get("/room/status/{itinerary_id}", response_model=APIResponse)
async def get_room_status(
    itinerary_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get collaboration room status for an itinerary"""
    try:
        user_id = PyObjectId(current_user["user_id"])
        itinerary_obj_id = PyObjectId(itinerary_id)
        
        # Check if user has access to the itinerary
        itinerary = await db.saved_itineraries.find_one({
            "_id": itinerary_obj_id,
            "$or": [
                {"user_id": user_id},  # Owner
                {"collaborators": user_id}  # Collaborator
            ]
        })
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found or access denied"
            )
        
        # Check if room exists
        room = await db.collaboration_rooms.find_one({"itinerary_id": itinerary_obj_id})
        
        if not room:
            return APIResponse(
                success=True,
                message="No room exists for this itinerary",
                data=RoomStatusResponse(
                    exists=False,
                    can_join=False,
                    is_member=False
                )
            )
        
        # Check if user can join
        can_join = (
            user_id == room["created_by"] or 
            user_id in room.get("invited_users", []) or
            user_id == itinerary["user_id"]  # Itinerary owner
        )
        
        is_member = user_id in room.get("joined_users", [])
        member_count = len(room.get("joined_users", []))
        
        return APIResponse(
            success=True,
            message="Room status retrieved",
            data=RoomStatusResponse(
                exists=True,
                room_id=room["room_id"],
                can_join=can_join,
                is_member=is_member,
                room_name=room["room_name"],
                member_count=member_count
            )
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get room status: {str(e)}"
        )

@router.post("/room/create", response_model=APIResponse)
async def create_collaboration_room(
    request: CreateRoomRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Create a collaboration room for an itinerary"""
    try:
        user_id = PyObjectId(current_user["user_id"])
        itinerary_obj_id = PyObjectId(request.itinerary_id)
        
        # Verify user owns the itinerary or is a collaborator
        itinerary = await db.saved_itineraries.find_one({
            "_id": itinerary_obj_id,
            "$or": [
                {"user_id": user_id},  # Owner
                {"collaborators": user_id}  # Collaborator
            ]
        })
        
        if not itinerary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Itinerary not found or access denied"
            )
        
        # Check if room already exists
        existing_room = await db.collaboration_rooms.find_one({"itinerary_id": itinerary_obj_id})
        if existing_room:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Room already exists for this itinerary"
            )
        
        # Create room
        room_name = request.room_name or f"{itinerary['title']} - Collaboration"
        
        room_data = CollaborationRoomDocument(
            itinerary_id=itinerary_obj_id,
            created_by=user_id,
            room_name=room_name,
            invited_users=[user_id],  # Creator is automatically invited
            joined_users=[user_id]   # Creator automatically joins
        )
        
        # Add all existing collaborators to invited list
        if "collaborators" in itinerary:
            room_data.invited_users.extend(itinerary["collaborators"])
        
        result = await db.collaboration_rooms.insert_one(room_data.model_dump(by_alias=True))
        
        return APIResponse(
            success=True,
            message="Collaboration room created successfully",
            data={
                "room_id": room_data.room_id,
                "room_name": room_data.room_name,
                "itinerary_id": request.itinerary_id
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create room: {str(e)}"
        )

@router.post("/room/{room_id}/join", response_model=APIResponse)
async def join_room(
    room_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Join a collaboration room"""
    try:
        user_id = PyObjectId(current_user["user_id"])
        
        # Find the room
        room = await db.collaboration_rooms.find_one({"room_id": room_id})
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
        
        # Check if user is invited
        if user_id not in room.get("invited_users", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not invited to this room"
            )
        
        # Check if already joined
        if user_id in room.get("joined_users", []):
            return APIResponse(
                success=True,
                message="Already a member of this room",
                data={"room_id": room_id}
            )
        
        # Add user to joined_users
        await db.collaboration_rooms.update_one(
            {"room_id": room_id},
            {
                "$addToSet": {"joined_users": user_id},
                "$set": {"last_activity": datetime.now(timezone.utc)}
            }
        )
        
        return APIResponse(
            success=True,
            message="Successfully joined the room",
            data={"room_id": room_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join room: {str(e)}"
        )

@router.get("/room/{room_id}/info", response_model=APIResponse)
async def get_room_info(
    room_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get room information"""
    try:
        user_id = PyObjectId(current_user["user_id"])
        
        room = await db.collaboration_rooms.find_one({"room_id": room_id})
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
        
        # Check access
        if user_id not in room.get("invited_users", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get member details
        members = []
        for member_id in room.get("joined_users", []):
            user_doc = await db.users.find_one({"_id": member_id})
            if user_doc:
                members.append({
                    "user_id": str(member_id),
                    "name": user_doc.get("name", "Unknown"),
                    "email": user_doc.get("email", "")
                })
        
        return APIResponse(
            success=True,
            message="Room info retrieved",
            data={
                "room_id": room_id,
                "room_name": room["room_name"],
                "created_by": str(room["created_by"]),
                "created_at": room["created_at"].isoformat(),
                "member_count": len(room.get("joined_users", [])),
                "members": members,
                "is_active": room.get("is_active", True)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get room info: {str(e)}"
        )
