/**
 * Real-time Collaboration Component
 * Provides live collaboration features for itinerary editing
 */

import React, { useEffect, useState } from 'react';
import { Users, Wifi, WifiOff, Edit3, MessageCircle } from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import { useToast } from '../contexts/ToastContext';

interface RealTimeCollaborationProps {
  itineraryId?: string;
  enabled?: boolean;
  showCollaborators?: boolean;
  showTypingIndicators?: boolean;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  itineraryId,
  enabled = true,
  showCollaborators = true,
  showTypingIndicators = true
}) => {
  const { showToast } = useToast();
  const [isInCollaboration, setIsInCollaboration] = useState(false);
  
  const {
    isConnected,
    connectionError,
    collaborationState,
    joinItineraryCollaboration,
    leaveItineraryCollaboration,
    subscribe
  } = useWebSocket({ 
    autoConnect: enabled,
    enableLogging: process.env.NODE_ENV === 'development'
  });

  // Join collaboration when itinerary changes
  useEffect(() => {
    if (!enabled || !itineraryId || !isConnected) return;

    const joinCollaboration = async () => {
      try {
        await joinItineraryCollaboration(itineraryId);
        setIsInCollaboration(true);
      } catch (error) {
        console.error('Failed to join collaboration:', error);
        showToast({
          type: 'error',
          title: 'Collaboration Error',
          message: 'Failed to join real-time collaboration'
        });
      }
    };

    joinCollaboration();

    // Cleanup - leave collaboration
    return () => {
      if (isInCollaboration) {
        leaveItineraryCollaboration(itineraryId).catch(console.error);
        setIsInCollaboration(false);
      }
    };
  }, [enabled, itineraryId, isConnected, joinItineraryCollaboration, leaveItineraryCollaboration, showToast, isInCollaboration]);

  // Subscribe to itinerary updates
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribe('itinerary_updated', (data) => {
      console.log('Itinerary updated by:', data.updated_by.user_name);
      
      // Show toast notification for updates from other users
      showToast({
        type: 'info',
        title: 'Itinerary Updated',
        message: `${data.updated_by.user_name} made changes to ${data.update_type.replace('_', ' ')}`
      });

      // Here you would typically update your local state/cache
      // For example, with React Query:
      // queryClient.invalidateQueries(['itinerary', itineraryId]);
    });

    return unsubscribe;
  }, [enabled, subscribe, showToast]);

  // Subscribe to cursor movements (optional advanced feature)
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribe('cursor_moved', (data) => {
      // Handle cursor position updates
      console.log('Cursor moved by:', data.user_name, data.cursor);
      // You could show cursor indicators here
    });

    return unsubscribe;
  }, [enabled, subscribe]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Live</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline</span>
          </div>
        )}
      </div>

      {/* Collaborators */}
      {showCollaborators && collaborationState.collaborators.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div className="flex -space-x-1">
            {collaborationState.collaborators.slice(0, 3).map((collaborator) => (
              <div
                key={collaborator.user_id}
                className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800"
                title={collaborator.user_name}
              >
                {collaborator.user_name.charAt(0).toUpperCase()}
              </div>
            ))}
            {collaborationState.collaborators.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800">
                +{collaborationState.collaborators.length - 3}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {collaborationState.collaborators.length} online
          </span>
        </div>
      )}

      {/* Typing Indicators */}
      {showTypingIndicators && collaborationState.typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Edit3 className="w-4 h-4" />
          <span className="text-sm">
            {collaborationState.typingUsers.length === 1
              ? `${collaborationState.typingUsers[0].user_name} is editing...`
              : `${collaborationState.typingUsers.length} people are editing...`
            }
          </span>
        </div>
      )}

      {/* Connection Error */}
      {connectionError && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Connection issue</span>
        </div>
      )}

      {/* Collaboration Status */}
      {isInCollaboration && (
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-sm">Collaborating</span>
        </div>
      )}
    </div>
  );
};

export default RealTimeCollaboration;








