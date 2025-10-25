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

logger = logging.getLogger(__name__)

class ChatCollaborationManager:
    """Manages WebSocket connections for chat collaboration"""
    
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []
        # Store connections by user with user info
        self.user_connections: Dict[str, Dict] = {}  # {user_id: {websocket, user_name, status}}
        # Store chat rooms and their members
        self.chat_rooms: Dict[str, Dict] = {}  # {room_id: {members: Set, messages: List, typing_users: Set}}
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
        
        logger.info(f"User {user_id} connected. Active connections: {len(self.active_connections)}")
        
        # Notify all rooms this user is in about their online status
        await self._notify_user_status_change(user_id, 'online')
        
    async def disconnect_user(self, websocket: WebSocket, user_id: str = None):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
        if user_id and user_id in self.user_connections:
            # Remove from all chat rooms
            await self._leave_all_rooms(user_id)
            
            # Remove from typing indicators
            for room_id in self.typing_users:
                self.typing_users[room_id].discard(user_id)
            
            # Notify about offline status
            await self._notify_user_status_change(user_id, 'offline')
            
            del self.user_connections[user_id]
                    
        logger.info(f"User {user_id} disconnected. Active connections: {len(self.active_connections)}")
        
    async def join_room(self, websocket: WebSocket, room_id: str):
        """Add connection to a room"""
        if room_id not in self.room_connections:
            self.room_connections[room_id] = []
            
        if websocket not in self.room_connections[room_id]:
            self.room_connections[room_id].append(websocket)
            
        logger.info(f"WebSocket joined room {room_id}. Room size: {len(self.room_connections[room_id])}")
        
    async def leave_room(self, websocket: WebSocket, room_id: str):
        """Remove connection from a room"""
        if room_id in self.room_connections and websocket in self.room_connections[room_id]:
            self.room_connections[room_id].remove(websocket)
            
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]
                
        logger.info(f"WebSocket left room {room_id}")
        
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to specific connection"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            
    async def send_to_user(self, message: str, user_id: str):
        """Send message to specific user"""
        if user_id in self.user_connections:
            await self.send_personal_message(message, self.user_connections[user_id])
            
    async def broadcast(self, message: str):
        """Send message to all connections"""
        for connection in self.active_connections[:]:  # Copy list to avoid modification during iteration
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                self.active_connections.remove(connection)
                
    async def broadcast_to_room(self, message: str, room_id: str):
        """Send message to all connections in a room"""
        if room_id in self.room_connections:
            for connection in self.room_connections[room_id][:]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to room {room_id}: {e}")
                    self.room_connections[room_id].remove(connection)

# Global connection manager
manager = ConnectionManager()

class NativeWebSocketService:
    """Native WebSocket service using FastAPI WebSockets"""
    
    def __init__(self):
        self.manager = manager
        logger.info("Native WebSocket service initialized")
        
    async def handle_websocket(self, websocket: WebSocket, user_id: str = None):
        """Handle a WebSocket connection"""
        await self.manager.connect(websocket, user_id)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                
                try:
                    message = json.loads(data)
                    await self.handle_message(websocket, message, user_id)
                except json.JSONDecodeError:
                    # Handle plain text messages
                    await self.handle_text_message(websocket, data, user_id)
                    
        except WebSocketDisconnect:
            self.manager.disconnect(websocket, user_id)
            
    async def handle_message(self, websocket: WebSocket, message: dict, user_id: str = None):
        """Handle structured JSON messages"""
        event_type = message.get("type", "message")
        
        if event_type == "join_room":
            room_id = message.get("room_id")
            if room_id:
                await self.manager.join_room(websocket, room_id)
                response = {
                    "type": "room_joined",
                    "room_id": room_id,
                    "timestamp": datetime.now().isoformat()
                }
                await self.manager.send_personal_message(json.dumps(response), websocket)
                
        elif event_type == "leave_room":
            room_id = message.get("room_id")
            if room_id:
                await self.manager.leave_room(websocket, room_id)
                response = {
                    "type": "room_left",
                    "room_id": room_id,
                    "timestamp": datetime.now().isoformat()
                }
                await self.manager.send_personal_message(json.dumps(response), websocket)
                
        elif event_type == "itinerary_update":
            room_id = message.get("itinerary_id")
            if room_id:
                # Broadcast update to all users in the itinerary room
                broadcast_message = {
                    "type": "itinerary_updated",
                    "itinerary_id": room_id,
                    "data": message.get("data"),
                    "user_id": user_id,
                    "timestamp": datetime.now().isoformat()
                }
                await self.manager.broadcast_to_room(json.dumps(broadcast_message), f"itinerary_{room_id}")
                
        elif event_type == "typing":
            room_id = message.get("itinerary_id")
            if room_id:
                # Broadcast typing indicator
                broadcast_message = {
                    "type": "user_typing",
                    "itinerary_id": room_id,
                    "user_id": user_id,
                    "is_typing": message.get("is_typing", True),
                    "timestamp": datetime.now().isoformat()
                }
                await self.manager.broadcast_to_room(json.dumps(broadcast_message), f"itinerary_{room_id}")
                
        else:
            # Echo message back
            response = {
                "type": "echo",
                "original_message": message,
                "timestamp": datetime.now().isoformat()
            }
            await self.manager.send_personal_message(json.dumps(response), websocket)
            
    async def handle_text_message(self, websocket: WebSocket, text: str, user_id: str = None):
        """Handle plain text messages"""
        response = {
            "type": "text_message",
            "message": f"Received: {text}",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }
        await self.manager.send_personal_message(json.dumps(response), websocket)

# Global service instance
native_websocket_service = NativeWebSocketService()
