import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketUrl } from '../config/apiConfig';

interface ChatMessage {
  id: string;
  type: 'chat_message';
  message_type: string;
  room_id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: string;
}

interface ChatRoom {
  room_id: string;
  room_name: string;
  member_count: number;
  last_message: ChatMessage | null;
  created_at: string;
}

interface TypingUser {
  user_id: string;
  user_name: string;
}

interface ChatUser {
  user_id: string;
  user_name: string;
  status: 'online' | 'offline';
  connected_at: string;
}

interface UseChatCollaborationOptions {
  userId: string;
  userName?: string;
  autoConnect?: boolean;
  onMessageReceived?: (message: ChatMessage) => void;
  onUserJoined?: (user: ChatUser) => void;
  onUserLeft?: (user: ChatUser) => void;
  onTypingUpdate?: (typingUsers: TypingUser[]) => void;
}

interface ChatCollaborationState {
  isConnected: boolean;
  isConnecting: boolean;
  currentRoom: string | null;
  rooms: ChatRoom[];
  messages: { [roomId: string]: ChatMessage[] };
  typingUsers: { [roomId: string]: TypingUser[] };
  roomMembers: { [roomId: string]: ChatUser[] };
  connectionError: string | null;
}

export const useChatCollaboration = (options: UseChatCollaborationOptions) => {
  const {
    userId,
    userName = userId,
    autoConnect = true,
    onMessageReceived,
    onUserJoined,
    onUserLeft,
    onTypingUpdate
  } = options;

  const [state, setState] = useState<ChatCollaborationState>({
    isConnected: false,
    isConnecting: false,
    currentRoom: null,
    rooms: [],
    messages: {},
    typingUsers: {},
    roomMembers: {},
    connectionError: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = useCallback((updates: Partial<ChatCollaborationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    updateState({ isConnecting: true, connectionError: null });

    const wsUrl = getWebSocketUrl(`/chat/${encodeURIComponent(userId)}/${encodeURIComponent(userName)}`);
    console.log('🔌 Connecting to chat:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Chat connected successfully');
        updateState({ 
          isConnected: true, 
          isConnecting: false, 
          connectionError: null 
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 Chat disconnected:', event.code, event.reason);
        updateState({ 
          isConnected: false, 
          isConnecting: false,
          connectionError: event.code === 1000 ? null : 'Connection lost'
        });
        wsRef.current = null;

        // Auto-reconnect after 3 seconds if not a normal closure
        if (event.code !== 1000 && autoConnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Chat WebSocket error:', error);
        updateState({ 
          connectionError: 'Connection failed',
          isConnecting: false
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      updateState({ 
        isConnecting: false,
        connectionError: 'Failed to create connection'
      });
    }
  }, [userId, userName, autoConnect, updateState]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }

    updateState({ 
      isConnected: false, 
      isConnecting: false,
      connectionError: null
    });
  }, [updateState]);

  const sendMessage = useCallback((action: string, data: any = {}) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('Not connected to chat');
      return false;
    }

    try {
      const message = { action, ...data };
      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }, []);

  const handleMessage = useCallback((data: any) => {
    console.log('📥 Chat message received:', data);

    switch (data.type) {
      case 'connection_success':
        console.log('✅ Chat connection confirmed');
        // Get available rooms
        sendMessage('get_rooms');
        break;

      case 'chat_message':
        if (onMessageReceived) {
          onMessageReceived(data as ChatMessage);
        }
        
        setState(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            [data.room_id]: [
              ...(prev.messages[data.room_id] || []),
              data as ChatMessage
            ].slice(-100) // Keep last 100 messages
          }
        }));
        break;

      case 'room_joined':
        setState(prev => ({
          ...prev,
          currentRoom: data.room_id,
          messages: {
            ...prev.messages,
            [data.room_id]: data.recent_messages || []
          },
          roomMembers: {
            ...prev.roomMembers,
            [data.room_id]: data.members || []
          }
        }));
        break;

      case 'room_created':
        setState(prev => ({
          ...prev,
          rooms: [
            ...prev.rooms,
            {
              room_id: data.room_id,
              room_name: data.room_name,
              member_count: 1,
              last_message: null,
              created_at: data.timestamp
            }
          ]
        }));
        break;

      case 'room_list':
        setState(prev => ({
          ...prev,
          rooms: data.rooms || []
        }));
        break;

      case 'user_joined_room':
        if (onUserJoined) {
          onUserJoined({
            user_id: data.user_id,
            user_name: data.user_name,
            status: 'online',
            connected_at: data.timestamp
          });
        }
        break;

      case 'user_left_room':
        if (onUserLeft) {
          onUserLeft({
            user_id: data.user_id,
            user_name: data.user_name,
            status: 'offline',
            connected_at: data.timestamp
          });
        }
        break;

      case 'typing_update':
        if (onTypingUpdate) {
          onTypingUpdate(data.typing_users || []);
        }
        
        setState(prev => ({
          ...prev,
          typingUsers: {
            ...prev.typingUsers,
            [data.room_id]: data.typing_users || []
          }
        }));
        break;

      case 'action_result':
        if (!data.result?.success) {
          console.error('Action failed:', data.action, data.result?.message);
        }
        break;

      case 'error':
        console.error('Chat error:', data.message);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }, [onMessageReceived, onUserJoined, onUserLeft, onTypingUpdate, sendMessage]);

  // Chat actions
  const createRoom = useCallback((roomId: string, roomName?: string) => {
    return sendMessage('create_room', { room_id: roomId, room_name: roomName });
  }, [sendMessage]);

  const joinRoom = useCallback((roomId: string) => {
    return sendMessage('join_room', { room_id: roomId });
  }, [sendMessage]);

  const leaveRoom = useCallback((roomId: string) => {
    return sendMessage('leave_room', { room_id: roomId });
  }, [sendMessage]);

  const sendChatMessage = useCallback((roomId: string, message: string, messageType: string = 'text') => {
    return sendMessage('send_message', { 
      room_id: roomId, 
      message, 
      message_type: messageType 
    });
  }, [sendMessage]);

  const setTyping = useCallback((roomId: string, isTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendMessage('typing', { room_id: roomId, is_typing: isTyping });

    if (isTyping) {
      // Auto stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        sendMessage('typing', { room_id: roomId, is_typing: false });
      }, 3000);
    }
  }, [sendMessage]);

  const getRooms = useCallback(() => {
    return sendMessage('get_rooms');
  }, [sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    setTyping,
    getRooms,
    
    // Utils
    isInRoom: (roomId: string) => state.currentRoom === roomId,
    getRoomMessages: (roomId: string) => state.messages[roomId] || [],
    getRoomTypingUsers: (roomId: string) => state.typingUsers[roomId] || [],
    getRoomMembers: (roomId: string) => state.roomMembers[roomId] || []
  };
};








