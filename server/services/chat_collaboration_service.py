"""
SafarBot Chat Collaboration WebSocket Service
Real-time chat and collaboration for travel planning
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional, Set
import json
import logging
import asyncio
from datetime import datetime
from services.redis_service import redis_service
from mongo_models import PyObjectId

logger = logging.getLogger(__name__)

class ChatCollaborationManager:
    """Manages WebSocket connections for chat collaboration"""
    
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []
        # Store connections by user with user info
        self.user_connections: Dict[str, Dict] = {}  # {user_id: {websocket, user_name, status}}
        # Store chat rooms and their members
        self.chat_rooms: Dict[str, Dict] = {}  # {room_id: {members: Set, messages: List, created_at: str}}
        # Track typing users per room
        self.typing_users: Dict[str, Set[str]] = {}  # {room_id: {user_ids}}
        
    async def connect_user(self, websocket: WebSocket, user_id: str, user_name: str = None):
        """Accept a WebSocket connection for a user"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Store user connection with info
        self.user_connections[user_id] = {
            'websocket': websocket,
            'user_name': user_name or user_id,
            'status': 'online',
            'connected_at': datetime.now().isoformat()
        }
        
        logger.info(f"User {user_id} ({user_name}) connected. Total: {len(self.active_connections)}")
        
        # Send welcome message
        await self.send_to_user(user_id, {
            'type': 'connection_success',
            'message': 'Connected to SafarBot Chat',
            'user_id': user_id,
            'user_name': user_name or user_id,
            'timestamp': datetime.now().isoformat()
        })
        
    async def disconnect_user(self, websocket: WebSocket, user_id: str = None):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
        if user_id and user_id in self.user_connections:
            user_name = self.user_connections[user_id]['user_name']
            
            # Remove from all chat rooms and notify
            await self._leave_all_rooms(user_id)
            
            # Remove from typing indicators
            for room_id in list(self.typing_users.keys()):
                if user_id in self.typing_users[room_id]:
                    self.typing_users[room_id].discard(user_id)
                    await self._broadcast_typing_update(room_id)
            
            del self.user_connections[user_id]
            logger.info(f"User {user_id} ({user_name}) disconnected")
    
    async def create_chat_room(self, room_id: str, creator_user_id: str, room_name: str = None):
        """Create a new chat room"""
        if room_id in self.chat_rooms:
            return {'success': False, 'message': 'Room already exists'}
        
        creator_info = self.user_connections.get(creator_user_id)
        if not creator_info:
            return {'success': False, 'message': 'User not connected'}
        
        self.chat_rooms[room_id] = {
            'members': {creator_user_id},
            'messages': [],
            'created_at': datetime.now().isoformat(),
            'created_by': creator_user_id,
            'room_name': room_name or f"Chat Room {room_id}",
            'room_id': room_id
        }
        
        self.typing_users[room_id] = set()
        
        # Send room created confirmation
        await self.send_to_user(creator_user_id, {
            'type': 'room_created',
            'room_id': room_id,
            'room_name': self.chat_rooms[room_id]['room_name'],
            'created_by': creator_user_id,
            'timestamp': datetime.now().isoformat()
        })
        
        # Store in Redis for persistence
        try:
            await redis_service.store_json(f"chat_room:{room_id}", self.chat_rooms[room_id])
        except Exception as e:
            logger.error(f"Failed to store room in Redis: {e}")
        
        logger.info(f"Chat room {room_id} created by {creator_user_id}")
        return {'success': True, 'room_id': room_id}
    
    async def join_chat_room(self, user_id: str, room_id: str):
        """Add user to a chat room with access control"""
        if user_id not in self.user_connections:
            return {'success': False, 'message': 'User not connected'}
        
        # Check room access in database
        try:
            from database import Database
            db = Database.get_db()
            room = await db.collaboration_rooms.find_one({"room_id": room_id})
            
            if not room:
                return {'success': False, 'message': 'Room does not exist'}
            
            # Check if user is invited to this room
            user_obj_id = PyObjectId(user_id)
            if user_obj_id not in room.get("invited_users", []):
                return {'success': False, 'message': 'Access denied - not invited to this room'}
            
            # Add user to joined_users in database
            await db.collaboration_rooms.update_one(
                {"room_id": room_id},
                {
                    "$addToSet": {"joined_users": user_obj_id},
                    "$set": {"last_activity": datetime.utcnow()}
                }
            )
            
        except Exception as e:
            logger.error(f"Database error checking room access: {e}")
            return {'success': False, 'message': 'Failed to verify room access'}
        
        # Create room in memory if not exists
        if room_id not in self.chat_rooms:
            self.chat_rooms[room_id] = {
                'members': set(),
                'messages': [],
                'created_at': datetime.now().isoformat(),
                'room_name': room.get('room_name', room_id),
                'room_id': room_id
            }
        
        user_info = self.user_connections[user_id]
        user_name = user_info['user_name']
        
        # Add user to room
        self.chat_rooms[room_id]['members'].add(user_id)
        
        # Send join confirmation to user
        await self.send_to_user(user_id, {
            'type': 'room_joined',
            'room_id': room_id,
            'room_name': self.chat_rooms[room_id]['room_name'],
            'members': await self._get_room_members_info(room_id),
            'recent_messages': self.chat_rooms[room_id]['messages'][-20:],  # Last 20 messages
            'timestamp': datetime.now().isoformat()
        })
        
        # Notify other room members
        join_message = {
            'type': 'user_joined_room',
            'room_id': room_id,
            'user_id': user_id,
            'user_name': user_name,
            'message': f"{user_name} joined the chat",
            'timestamp': datetime.now().isoformat()
        }
        
        await self._broadcast_to_room(room_id, join_message, exclude_user=user_id)
        
        logger.info(f"User {user_id} joined room {room_id}")
        return {'success': True, 'room_id': room_id}
    
    async def leave_chat_room(self, user_id: str, room_id: str):
        """Remove user from a chat room"""
        if room_id not in self.chat_rooms:
            return {'success': False, 'message': 'Room does not exist'}
        
        if user_id not in self.chat_rooms[room_id]['members']:
            return {'success': False, 'message': 'User not in room'}
        
        user_info = self.user_connections.get(user_id)
        user_name = user_info['user_name'] if user_info else user_id
        
        # Remove user from room
        self.chat_rooms[room_id]['members'].discard(user_id)
        
        # Remove from typing indicators
        if room_id in self.typing_users:
            self.typing_users[room_id].discard(user_id)
            await self._broadcast_typing_update(room_id)
        
        # Send leave confirmation
        if user_id in self.user_connections:
            await self.send_to_user(user_id, {
                'type': 'room_left',
                'room_id': room_id,
                'timestamp': datetime.now().isoformat()
            })
        
        # Notify other room members
        leave_message = {
            'type': 'user_left_room',
            'room_id': room_id,
            'user_id': user_id,
            'user_name': user_name,
            'message': f"{user_name} left the chat",
            'timestamp': datetime.now().isoformat()
        }
        
        await self._broadcast_to_room(room_id, leave_message)
        
        # Delete room if empty
        if not self.chat_rooms[room_id]['members']:
            del self.chat_rooms[room_id]
            if room_id in self.typing_users:
                del self.typing_users[room_id]
            logger.info(f"Empty room {room_id} deleted")
        
        logger.info(f"User {user_id} left room {room_id}")
        return {'success': True}
    
    async def send_chat_message(self, user_id: str, room_id: str, message: str, message_type: str = 'text'):
        """Send a chat message to a room"""
        if user_id not in self.user_connections:
            return {'success': False, 'message': 'User not connected'}
        
        if room_id not in self.chat_rooms:
            return {'success': False, 'message': 'Room does not exist'}
        
        if user_id not in self.chat_rooms[room_id]['members']:
            return {'success': False, 'message': 'User not in room'}
        
        user_info = self.user_connections[user_id]
        message_data = {
            'id': f"{room_id}_{len(self.chat_rooms[room_id]['messages'])}_{int(datetime.now().timestamp())}",
            'type': 'chat_message',
            'message_type': message_type,
            'room_id': room_id,
            'user_id': user_id,
            'user_name': user_info['user_name'],
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        
        # Store message in room
        self.chat_rooms[room_id]['messages'].append(message_data)
        
        # Keep only last 100 messages in memory
        if len(self.chat_rooms[room_id]['messages']) > 100:
            self.chat_rooms[room_id]['messages'] = self.chat_rooms[room_id]['messages'][-100:]
        
        # Broadcast to all room members
        await self._broadcast_to_room(room_id, message_data)
        
        # Store in Redis for persistence
        try:
            await redis_service.store_json(f"chat_message:{message_data['id']}", message_data)
        except Exception as e:
            logger.error(f"Failed to store message in Redis: {e}")
        
        logger.info(f"Message sent in room {room_id} by {user_id}")
        return {'success': True, 'message_id': message_data['id']}
    
    async def set_typing_indicator(self, user_id: str, room_id: str, is_typing: bool):
        """Set typing indicator for user in room"""
        if room_id not in self.typing_users:
            self.typing_users[room_id] = set()
        
        if is_typing:
            self.typing_users[room_id].add(user_id)
        else:
            self.typing_users[room_id].discard(user_id)
        
        await self._broadcast_typing_update(room_id, exclude_user=user_id)
        return {'success': True}
    
    async def get_room_list(self, user_id: str):
        """Get list of rooms user can access"""
        rooms = []
        for room_id, room_data in self.chat_rooms.items():
            if user_id in room_data['members']:
                rooms.append({
                    'room_id': room_id,
                    'room_name': room_data['room_name'],
                    'member_count': len(room_data['members']),
                    'last_message': room_data['messages'][-1] if room_data['messages'] else None,
                    'created_at': room_data['created_at']
                })
        
        return {'rooms': rooms}
    
    async def send_to_user(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.user_connections:
            websocket = self.user_connections[user_id]['websocket']
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send to user {user_id}: {e}")
    
    async def _broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        """Broadcast message to all users in a room"""
        if room_id not in self.chat_rooms:
            return
        
        for user_id in self.chat_rooms[room_id]['members']:
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_to_user(user_id, message)
    
    async def _broadcast_typing_update(self, room_id: str, exclude_user: str = None):
        """Broadcast typing indicators update to room"""
        if room_id not in self.typing_users:
            return
        
        typing_users_info = []
        for typing_user_id in self.typing_users[room_id]:
            if typing_user_id in self.user_connections:
                typing_users_info.append({
                    'user_id': typing_user_id,
                    'user_name': self.user_connections[typing_user_id]['user_name']
                })
        
        typing_message = {
            'type': 'typing_update',
            'room_id': room_id,
            'typing_users': typing_users_info,
            'timestamp': datetime.now().isoformat()
        }
        
        await self._broadcast_to_room(room_id, typing_message, exclude_user)
    
    async def _get_room_members_info(self, room_id: str):
        """Get detailed info about room members"""
        if room_id not in self.chat_rooms:
            return []
        
        members_info = []
        for user_id in self.chat_rooms[room_id]['members']:
            if user_id in self.user_connections:
                user_info = self.user_connections[user_id]
                members_info.append({
                    'user_id': user_id,
                    'user_name': user_info['user_name'],
                    'status': user_info['status'],
                    'connected_at': user_info['connected_at']
                })
        
        return members_info
    
    async def _leave_all_rooms(self, user_id: str):
        """Remove user from all rooms they're in"""
        rooms_to_leave = []
        for room_id, room_data in self.chat_rooms.items():
            if user_id in room_data['members']:
                rooms_to_leave.append(room_id)
        
        for room_id in rooms_to_leave:
            await self.leave_chat_room(user_id, room_id)

class ChatCollaborationService:
    """Service to handle chat collaboration WebSocket events"""
    
    def __init__(self):
        self.manager = ChatCollaborationManager()
        logger.info("Chat Collaboration service initialized")
    
    async def handle_websocket(self, websocket: WebSocket, user_id: str = None, user_name: str = None):
        """Handle a WebSocket connection for chat collaboration"""
        if not user_id:
            user_id = f"anonymous_{int(datetime.now().timestamp())}"
        
        try:
            await self.manager.connect_user(websocket, user_id, user_name)
            
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                
                try:
                    message = json.loads(data)
                    await self.handle_message(websocket, message, user_id)
                except json.JSONDecodeError:
                    # Handle plain text as chat message to default room
                    await self.handle_text_message(websocket, data, user_id)
                    
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for user: {user_id}")
            await self.manager.disconnect_user(websocket, user_id)
        except Exception as e:
            logger.error(f"WebSocket error for user {user_id}: {e}")
            try:
                await self.manager.disconnect_user(websocket, user_id)
            except:
                pass
    
    async def handle_message(self, websocket: WebSocket, message: dict, user_id: str):
        """Handle structured JSON messages"""
        action = message.get("action", "unknown")
        
        try:
            if action == "create_room":
                room_id = message.get("room_id")
                room_name = message.get("room_name")
                result = await self.manager.create_chat_room(room_id, user_id, room_name)
                await self.manager.send_to_user(user_id, {
                    'type': 'action_result',
                    'action': 'create_room',
                    'result': result,
                    'timestamp': datetime.now().isoformat()
                })
            
            elif action == "join_room":
                room_id = message.get("room_id")
                result = await self.manager.join_chat_room(user_id, room_id)
                await self.manager.send_to_user(user_id, {
                    'type': 'action_result',
                    'action': 'join_room',
                    'result': result,
                    'timestamp': datetime.now().isoformat()
                })
            
            elif action == "leave_room":
                room_id = message.get("room_id")
                result = await self.manager.leave_chat_room(user_id, room_id)
                await self.manager.send_to_user(user_id, {
                    'type': 'action_result',
                    'action': 'leave_room',
                    'result': result,
                    'timestamp': datetime.now().isoformat()
                })
            
            elif action == "send_message":
                room_id = message.get("room_id")
                chat_message = message.get("message")
                message_type = message.get("message_type", "text")
                result = await self.manager.send_chat_message(user_id, room_id, chat_message, message_type)
                # Don't send confirmation for successful messages (broadcasted already)
                if not result.get('success'):
                    await self.manager.send_to_user(user_id, {
                        'type': 'action_result',
                        'action': 'send_message',
                        'result': result,
                        'timestamp': datetime.now().isoformat()
                    })
            
            elif action == "typing":
                room_id = message.get("room_id")
                is_typing = message.get("is_typing", False)
                await self.manager.set_typing_indicator(user_id, room_id, is_typing)
            
            elif action == "get_rooms":
                result = await self.manager.get_room_list(user_id)
                await self.manager.send_to_user(user_id, {
                    'type': 'room_list',
                    'rooms': result['rooms'],
                    'timestamp': datetime.now().isoformat()
                })
            
            else:
                await self.manager.send_to_user(user_id, {
                    'type': 'error',
                    'message': f'Unknown action: {action}',
                    'timestamp': datetime.now().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Error handling message from {user_id}: {e}")
            await self.manager.send_to_user(user_id, {
                'type': 'error',
                'message': 'Failed to process request',
                'timestamp': datetime.now().isoformat()
            })
    
    async def handle_text_message(self, websocket: WebSocket, text: str, user_id: str):
        """Handle plain text messages"""
        # Send error asking for proper format
        await self.manager.send_to_user(user_id, {
            'type': 'error',
            'message': 'Please use JSON format with action field',
            'example': {
                'action': 'send_message',
                'room_id': 'room_123',
                'message': 'Hello everyone!'
            },
            'timestamp': datetime.now().isoformat()
        })

# Global service instance
chat_service = ChatCollaborationService()
