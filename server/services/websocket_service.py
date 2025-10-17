"""
WebSocket Service - Real-time collaboration features
Enables live itinerary editing, notifications, and collaboration
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import socketio
from services.redis_service import redis_service
from config import settings

logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000", "null"],  # Allow local development
    logger=True,
    engineio_logger=True
)

class WebSocketService:
    """
    WebSocket service for real-time collaboration and notifications
    """
    
    def __init__(self):
        self.connected_users: Dict[str, Dict[str, Any]] = {}
        self.room_users: Dict[str, List[str]] = {}  # room_id -> [user_ids]
        
    async def initialize(self):
        """Initialize WebSocket service with event handlers"""
        
        @sio.event
        async def connect(sid, environ, auth):
            """Handle client connection"""
            try:
                # Extract user info from auth token
                user_id = auth.get('user_id') if auth else None
                user_name = auth.get('user_name', 'Anonymous') if auth else 'Anonymous'
                
                if not user_id:
                    logger.warning(f"Connection rejected - no user_id: {sid}")
                    await sio.disconnect(sid)
                    return False
                
                # Store user connection info
                self.connected_users[sid] = {
                    'user_id': user_id,
                    'user_name': user_name,
                    'connected_at': datetime.utcnow().isoformat(),
                    'rooms': []
                }
                
                logger.info(f"User {user_name} ({user_id}) connected: {sid}")
                
                # Send connection confirmation
                await sio.emit('connection_confirmed', {
                    'user_id': user_id,
                    'user_name': user_name,
                    'server_time': datetime.utcnow().isoformat()
                }, room=sid)
                
                # Store session in Redis
                await redis_service.set_user_session(
                    user_id, 
                    {
                        'socket_id': sid,
                        'user_name': user_name,
                        'status': 'online',
                        'last_seen': datetime.utcnow().isoformat()
                    },
                    ttl=3600  # 1 hour
                )
                
                return True
                
            except Exception as e:
                logger.error(f"Connection error: {str(e)}")
                await sio.disconnect(sid)
                return False
        
        @sio.event
        async def disconnect(sid):
            """Handle client disconnection"""
            try:
                if sid in self.connected_users:
                    user_info = self.connected_users[sid]
                    user_id = user_info['user_id']
                    user_name = user_info['user_name']
                    
                    # Leave all rooms
                    for room_id in user_info['rooms']:
                        await self.leave_collaboration_room(sid, room_id)
                    
                    # Remove from connected users
                    del self.connected_users[sid]
                    
                    # Update Redis session
                    await redis_service.set_user_session(
                        user_id,
                        {
                            'status': 'offline',
                            'last_seen': datetime.utcnow().isoformat()
                        },
                        ttl=86400  # Keep offline status for 24 hours
                    )
                    
                    logger.info(f"User {user_name} ({user_id}) disconnected: {sid}")
                    
            except Exception as e:
                logger.error(f"Disconnection error: {str(e)}")
        
        @sio.event
        async def join_itinerary_collaboration(sid, data):
            """Join a collaborative itinerary room"""
            try:
                itinerary_id = data.get('itinerary_id')
                if not itinerary_id or sid not in self.connected_users:
                    return {'success': False, 'error': 'Invalid request'}
                
                user_info = self.connected_users[sid]
                room_id = f"itinerary_{itinerary_id}"
                
                # Join the room
                await sio.enter_room(sid, room_id)
                
                # Track room membership
                if room_id not in self.room_users:
                    self.room_users[room_id] = []
                if user_info['user_id'] not in self.room_users[room_id]:
                    self.room_users[room_id].append(user_info['user_id'])
                
                user_info['rooms'].append(room_id)
                
                # Notify other users in the room
                await sio.emit('user_joined_collaboration', {
                    'user_id': user_info['user_id'],
                    'user_name': user_info['user_name'],
                    'itinerary_id': itinerary_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, room=room_id, skip_sid=sid)
                
                # Send current collaborators to the new user
                collaborators = await self.get_room_collaborators(room_id)
                await sio.emit('collaboration_state', {
                    'itinerary_id': itinerary_id,
                    'collaborators': collaborators,
                    'room_id': room_id
                }, room=sid)
                
                logger.info(f"User {user_info['user_name']} joined collaboration room: {room_id}")
                
                return {'success': True, 'room_id': room_id}
                
            except Exception as e:
                logger.error(f"Join collaboration error: {str(e)}")
                return {'success': False, 'error': str(e)}
        
        @sio.event
        async def leave_itinerary_collaboration(sid, data):
            """Leave a collaborative itinerary room"""
            try:
                itinerary_id = data.get('itinerary_id')
                room_id = f"itinerary_{itinerary_id}"
                
                await self.leave_collaboration_room(sid, room_id)
                
                return {'success': True}
                
            except Exception as e:
                logger.error(f"Leave collaboration error: {str(e)}")
                return {'success': False, 'error': str(e)}
        
        @sio.event
        async def itinerary_update(sid, data):
            """Handle real-time itinerary updates"""
            try:
                if sid not in self.connected_users:
                    return {'success': False, 'error': 'Not authenticated'}
                
                itinerary_id = data.get('itinerary_id')
                update_type = data.get('type')  # 'activity_added', 'day_updated', etc.
                update_data = data.get('data')
                
                user_info = self.connected_users[sid]
                room_id = f"itinerary_{itinerary_id}"
                
                # Store update in Redis for persistence
                await redis_service.set_collaboration_state(
                    itinerary_id,
                    user_info['user_id'],
                    {
                        'last_update': datetime.utcnow().isoformat(),
                        'update_type': update_type,
                        'update_data': update_data
                    }
                )
                
                # Broadcast to other collaborators
                await sio.emit('itinerary_updated', {
                    'itinerary_id': itinerary_id,
                    'updated_by': {
                        'user_id': user_info['user_id'],
                        'user_name': user_info['user_name']
                    },
                    'update_type': update_type,
                    'data': update_data,
                    'timestamp': datetime.utcnow().isoformat()
                }, room=room_id, skip_sid=sid)
                
                # Publish to Redis for cross-server sync
                await redis_service.publish_event(
                    f"itinerary_updates_{itinerary_id}",
                    {
                        'type': update_type,
                        'data': update_data,
                        'user_id': user_info['user_id'],
                        'user_name': user_info['user_name']
                    }
                )
                
                return {'success': True}
                
            except Exception as e:
                logger.error(f"Itinerary update error: {str(e)}")
                return {'success': False, 'error': str(e)}
        
        @sio.event
        async def typing_indicator(sid, data):
            """Handle typing indicators for collaborative editing"""
            try:
                if sid not in self.connected_users:
                    return
                
                itinerary_id = data.get('itinerary_id')
                is_typing = data.get('is_typing', False)
                section = data.get('section')  # which part they're editing
                
                user_info = self.connected_users[sid]
                room_id = f"itinerary_{itinerary_id}"
                
                # Broadcast typing status
                await sio.emit('user_typing', {
                    'user_id': user_info['user_id'],
                    'user_name': user_info['user_name'],
                    'is_typing': is_typing,
                    'section': section,
                    'timestamp': datetime.utcnow().isoformat()
                }, room=room_id, skip_sid=sid)
                
            except Exception as e:
                logger.error(f"Typing indicator error: {str(e)}")
        
        @sio.event
        async def cursor_position(sid, data):
            """Handle cursor position sharing for collaborative editing"""
            try:
                if sid not in self.connected_users:
                    return
                
                itinerary_id = data.get('itinerary_id')
                cursor_data = data.get('cursor')
                
                user_info = self.connected_users[sid]
                room_id = f"itinerary_{itinerary_id}"
                
                # Broadcast cursor position
                await sio.emit('cursor_moved', {
                    'user_id': user_info['user_id'],
                    'user_name': user_info['user_name'],
                    'cursor': cursor_data,
                    'timestamp': datetime.utcnow().isoformat()
                }, room=room_id, skip_sid=sid)
                
            except Exception as e:
                logger.error(f"Cursor position error: {str(e)}")
        
        @sio.event
        async def send_notification(sid, data):
            """Send real-time notifications"""
            try:
                target_user_id = data.get('target_user_id')
                notification_type = data.get('type')
                message = data.get('message')
                notification_data = data.get('data', {})
                
                if sid not in self.connected_users:
                    return {'success': False, 'error': 'Not authenticated'}
                
                sender_info = self.connected_users[sid]
                
                # Find target user's socket
                target_sid = None
                for socket_id, user_info in self.connected_users.items():
                    if user_info['user_id'] == target_user_id:
                        target_sid = socket_id
                        break
                
                if target_sid:
                    # Send real-time notification
                    await sio.emit('notification_received', {
                        'type': notification_type,
                        'message': message,
                        'data': notification_data,
                        'from_user': {
                            'user_id': sender_info['user_id'],
                            'user_name': sender_info['user_name']
                        },
                        'timestamp': datetime.utcnow().isoformat()
                    }, room=target_sid)
                    
                    return {'success': True, 'delivered': True}
                else:
                    # Store for later delivery
                    await redis_service.set(
                        "pending_notifications",
                        f"{target_user_id}_{datetime.utcnow().timestamp()}",
                        {
                            'type': notification_type,
                            'message': message,
                            'data': notification_data,
                            'from_user_id': sender_info['user_id'],
                            'from_user_name': sender_info['user_name'],
                            'created_at': datetime.utcnow().isoformat()
                        },
                        ttl=86400  # 24 hours
                    )
                    
                    return {'success': True, 'delivered': False, 'stored': True}
                
            except Exception as e:
                logger.error(f"Send notification error: {str(e)}")
                return {'success': False, 'error': str(e)}
        
        logger.info("WebSocket event handlers initialized")
    
    async def leave_collaboration_room(self, sid: str, room_id: str):
        """Helper to leave a collaboration room"""
        try:
            if sid in self.connected_users:
                user_info = self.connected_users[sid]
                
                # Leave the room
                await sio.leave_room(sid, room_id)
                
                # Update tracking
                if room_id in self.room_users and user_info['user_id'] in self.room_users[room_id]:
                    self.room_users[room_id].remove(user_info['user_id'])
                    if not self.room_users[room_id]:  # Empty room
                        del self.room_users[room_id]
                
                if room_id in user_info['rooms']:
                    user_info['rooms'].remove(room_id)
                
                # Notify other users
                await sio.emit('user_left_collaboration', {
                    'user_id': user_info['user_id'],
                    'user_name': user_info['user_name'],
                    'timestamp': datetime.utcnow().isoformat()
                }, room=room_id)
                
        except Exception as e:
            logger.error(f"Leave room error: {str(e)}")
    
    async def get_room_collaborators(self, room_id: str) -> List[Dict[str, Any]]:
        """Get list of collaborators in a room"""
        try:
            collaborators = []
            if room_id in self.room_users:
                for user_id in self.room_users[room_id]:
                    # Find socket info
                    for sid, user_info in self.connected_users.items():
                        if user_info['user_id'] == user_id:
                            collaborators.append({
                                'user_id': user_id,
                                'user_name': user_info['user_name'],
                                'status': 'online',
                                'connected_at': user_info['connected_at']
                            })
                            break
            return collaborators
        except Exception as e:
            logger.error(f"Get collaborators error: {str(e)}")
            return []
    
    async def broadcast_to_itinerary(self, itinerary_id: str, event: str, data: Dict[str, Any]):
        """Broadcast event to all users collaborating on an itinerary"""
        try:
            room_id = f"itinerary_{itinerary_id}"
            await sio.emit(event, data, room=room_id)
        except Exception as e:
            logger.error(f"Broadcast error: {str(e)}")
    
    async def send_to_user(self, user_id: str, event: str, data: Dict[str, Any]):
        """Send event to a specific user if online"""
        try:
            for sid, user_info in self.connected_users.items():
                if user_info['user_id'] == user_id:
                    await sio.emit(event, data, room=sid)
                    return True
            return False
        except Exception as e:
            logger.error(f"Send to user error: {str(e)}")
            return False
    
    def get_online_users(self) -> List[Dict[str, Any]]:
        """Get list of currently online users"""
        return [
            {
                'user_id': user_info['user_id'],
                'user_name': user_info['user_name'],
                'connected_at': user_info['connected_at'],
                'rooms': len(user_info['rooms'])
            }
            for user_info in self.connected_users.values()
        ]
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get WebSocket connection statistics"""
        return {
            'total_connections': len(self.connected_users),
            'active_rooms': len(self.room_users),
            'total_room_users': sum(len(users) for users in self.room_users.values()),
            'server_status': 'running'
        }

# Global WebSocket service instance
websocket_service = WebSocketService()

# ASGI app for Socket.IO
socketio_app = socketio.ASGIApp(sio)
