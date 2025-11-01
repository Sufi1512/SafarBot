import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Plus, ExternalLink, Copy, Check } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext'; // Currently unused but may be needed for future features

interface RoomStatus {
  exists: boolean;
  room_id?: string;
  can_join: boolean;
  is_member: boolean;
  room_name?: string;
  member_count: number;
}

interface ItineraryRoomManagerProps {
  itineraryId: string;
  itineraryTitle: string;
  onRoomJoined?: (roomId: string) => void;
  className?: string;
}

export const ItineraryRoomManager: React.FC<ItineraryRoomManagerProps> = ({
  itineraryId,
  itineraryTitle,
  onRoomJoined,
  className = ''
}) => {
  // const { user } = useAuth(); // Currently unused but may be needed for future features
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch room status for this itinerary
  useEffect(() => {
    fetchRoomStatus();
  }, [itineraryId]);

  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8000/api/v1/collaboration/room/status/${itineraryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room status');
      }

      const data = await response.json();
      if (data.success) {
        setRoomStatus(data.data);
      } else {
        setError(data.message || 'Failed to get room status');
      }
    } catch (error) {
      console.error('Error fetching room status:', error);
      setError('Failed to load collaboration status');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/v1/collaboration/room/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itinerary_id: itineraryId,
          room_name: `${itineraryTitle} - Collaboration`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create room');
      }

      const data = await response.json();
      if (data.success) {
        // Refresh room status
        await fetchRoomStatus();
        
        // Auto-join the created room
        if (onRoomJoined) {
          onRoomJoined(data.data.room_id);
        }
      } else {
        setError(data.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setError(error instanceof Error ? error.message : 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!roomStatus?.room_id) return;

    try {
      setJoining(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/api/v1/collaboration/room/${roomStatus.room_id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to join room');
      }

      const data = await response.json();
      if (data.success) {
        // Refresh room status
        await fetchRoomStatus();
        
        if (onRoomJoined) {
          onRoomJoined(roomStatus.room_id);
        }
      } else {
        setError(data.message || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      setError(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const copyRoomId = async () => {
    if (!roomStatus?.room_id) return;

    try {
      await navigator.clipboard.writeText(roomStatus.room_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy room ID:', error);
    }
  };

  const openChat = () => {
    if (roomStatus?.room_id && onRoomJoined) {
      onRoomJoined(roomStatus.room_id);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading collaboration status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900 dark:text-white">Collaboration</h3>
        </div>
        
        {roomStatus?.exists && roomStatus.member_count > 0 && (
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{roomStatus.member_count}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* No Room Exists - Show Create Button */}
      {!roomStatus?.exists && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a collaboration room to chat with other travelers about this itinerary.
          </p>
          <button
            onClick={createRoom}
            disabled={creating}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {creating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{creating ? 'Creating...' : 'Create Collaboration Room'}</span>
          </button>
        </div>
      )}

      {/* Room Exists - Show Status and Actions */}
      {roomStatus?.exists && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {roomStatus.room_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Room ID: {roomStatus.room_id}
              </p>
            </div>
            <button
              onClick={copyRoomId}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* User is not a member - Show Join Button */}
          {roomStatus.can_join && !roomStatus.is_member && (
            <button
              onClick={joinRoom}
              disabled={joining}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {joining ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              <span>{joining ? 'Joining...' : 'Join Collaboration Room'}</span>
            </button>
          )}

          {/* User is a member - Show Open Chat Button */}
          {roomStatus.is_member && (
            <button
              onClick={openChat}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Chat</span>
            </button>
          )}

          {/* User cannot join - Show Info */}
          {!roomStatus.can_join && (
            <div className="p-2 bg-yellow-100 border border-yellow-200 text-yellow-700 rounded text-sm">
              You need to be invited to join this collaboration room.
            </div>
          )}

          {/* Share Room Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>💡 Share the Room ID with collaborators so they can join the discussion.</p>
          </div>
        </div>
      )}
    </div>
  );
};
