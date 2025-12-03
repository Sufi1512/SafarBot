/**
 * WebSocket Hook for Real-time Collaboration
 * Provides real-time features for itinerary collaboration
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getApiBaseUrlWithoutProtocol } from '../config/apiConfig';

interface WebSocketOptions {
  autoConnect?: boolean;
  enableLogging?: boolean;
}

interface CollaborationState {
  isConnected: boolean;
  currentRoom?: string;
  collaborators: Array<{
    user_id: string;
    user_name: string;
    status: 'online' | 'offline';
    connected_at: string;
  }>;
  typingUsers: Array<{
    user_id: string;
    user_name: string;
    section?: string;
  }>;
}

export const useWebSocket = (options: WebSocketOptions = {}) => {
  const { autoConnect = true, enableLogging = false } = options;
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    isConnected: false,
    collaborators: [],
    typingUsers: []
  });
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const log = useCallback((message: string, data?: any) => {
    if (enableLogging) {
      console.log(`[WebSocket] ${message}`, data || '');
    }
  }, [enableLogging]);

  const connect = useCallback(() => {
    if (!user || socketRef.current?.connected) return;

    try {
      const socketUrl = getApiBaseUrlWithoutProtocol();

      socketRef.current = io(socketUrl, {
        auth: {
          user_id: user.id,
          user_name: `${user.first_name} ${user.last_name}`,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        retries: 3,
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        log('Connected to WebSocket server');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        
        setCollaborationState(prev => ({
          ...prev,
          isConnected: true
        }));
      });

      socket.on('disconnect', (reason) => {
        log('Disconnected from WebSocket server', reason);
        setIsConnected(false);
        
        setCollaborationState(prev => ({
          ...prev,
          isConnected: false,
          collaborators: [],
          typingUsers: []
        }));

        // Auto-reconnect logic
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          return;
        }

        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            log(`Reconnecting... attempt ${reconnectAttempts.current}`);
            socket.connect();
          }, delay);
        } else {
          setConnectionError('Failed to reconnect after multiple attempts');
          showToast({
            type: 'error',
            title: 'Connection Lost',
            message: 'Unable to reconnect to real-time services'
          });
        }
      });

      socket.on('connect_error', (error) => {
        log('Connection error', error.message);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      socket.on('connection_confirmed', (data) => {
        log('Connection confirmed', data);
        showToast({
          type: 'success',
          title: 'Connected',
          message: 'Real-time collaboration is active'
        });
      });

      // Collaboration events
      socket.on('collaboration_state', (data) => {
        log('Collaboration state updated', data);
        setCollaborationState(prev => ({
          ...prev,
          currentRoom: data.room_id,
          collaborators: data.collaborators
        }));
      });

      socket.on('user_joined_collaboration', (data) => {
        log('User joined collaboration', data);
        setCollaborationState(prev => ({
          ...prev,
          collaborators: [
            ...prev.collaborators,
            {
              user_id: data.user_id,
              user_name: data.user_name,
              status: 'online',
              connected_at: data.timestamp
            }
          ]
        }));

        showToast({
          type: 'info',
          title: 'Collaborator Joined',
          message: `${data.user_name} joined the collaboration`
        });
      });

      socket.on('user_left_collaboration', (data) => {
        log('User left collaboration', data);
        setCollaborationState(prev => ({
          ...prev,
          collaborators: prev.collaborators.filter(c => c.user_id !== data.user_id),
          typingUsers: prev.typingUsers.filter(u => u.user_id !== data.user_id)
        }));

        showToast({
          type: 'info',
          title: 'Collaborator Left',
          message: `${data.user_name} left the collaboration`
        });
      });

      socket.on('user_typing', (data) => {
        log('User typing status changed', data);
        setCollaborationState(prev => ({
          ...prev,
          typingUsers: data.is_typing
            ? [
                ...prev.typingUsers.filter(u => u.user_id !== data.user_id),
                { user_id: data.user_id, user_name: data.user_name, section: data.section }
              ]
            : prev.typingUsers.filter(u => u.user_id !== data.user_id)
        }));
      });

      // Notification events
      socket.on('notification_received', (data) => {
        log('Notification received', data);
        showToast({
          type: 'info',
          title: data.message,
          message: `From ${data.from_user.user_name}`
        });
      });

    } catch (error) {
      log('Error creating socket connection', error);
      setConnectionError('Failed to create connection');
    }
  }, [user, log, showToast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setCollaborationState({
      isConnected: false,
      collaborators: [],
      typingUsers: []
    });
  }, []);

  // Collaboration methods
  const joinItineraryCollaboration = useCallback(async (itineraryId: string) => {
    if (!socketRef.current?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('join_itinerary_collaboration', 
        { itinerary_id: itineraryId },
        (response: any) => {
          if (response.success) {
            log(`Joined itinerary collaboration: ${itineraryId}`);
            resolve(response);
          } else {
            log(`Failed to join collaboration: ${response.error}`);
            reject(new Error(response.error));
          }
        }
      );
    });
  }, [log]);

  const leaveItineraryCollaboration = useCallback(async (itineraryId: string) => {
    if (!socketRef.current?.connected) return;

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('leave_itinerary_collaboration',
        { itinerary_id: itineraryId },
        (response: any) => {
          if (response.success) {
            log(`Left itinerary collaboration: ${itineraryId}`);
            resolve(response);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }, [log]);

  const sendItineraryUpdate = useCallback((itineraryId: string, updateType: string, data: any) => {
    if (!socketRef.current?.connected) {
      throw new Error('WebSocket not connected');
    }

    socketRef.current.emit('itinerary_update', {
      itinerary_id: itineraryId,
      type: updateType,
      data: data
    });

    log(`Sent itinerary update: ${updateType}`, data);
  }, [log]);

  const sendTypingIndicator = useCallback((itineraryId: string, isTyping: boolean, section?: string) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('typing_indicator', {
      itinerary_id: itineraryId,
      is_typing: isTyping,
      section: section
    });
  }, []);

  const sendCursorPosition = useCallback((itineraryId: string, cursorData: any) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('cursor_position', {
      itinerary_id: itineraryId,
      cursor: cursorData
    });
  }, []);

  const sendNotification = useCallback(async (targetUserId: string, type: string, message: string, data?: any) => {
    if (!socketRef.current?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('send_notification',
        {
          target_user_id: targetUserId,
          type: type,
          message: message,
          data: data || {}
        },
        (response: any) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }, []);

  // Event subscription for custom events
  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(event, handler);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    };
  }, []);

  // Initialize connection
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    connectionError,
    collaborationState,
    
    // Connection methods
    connect,
    disconnect,
    
    // Collaboration methods
    joinItineraryCollaboration,
    leaveItineraryCollaboration,
    sendItineraryUpdate,
    sendTypingIndicator,
    sendCursorPosition,
    sendNotification,
    
    // Event subscription
    subscribe,
    
    // Socket instance (for advanced usage)
    socket: socketRef.current
  };
};

export default useWebSocket;








