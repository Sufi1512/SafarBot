import React, { useState, useRef, useEffect } from 'react';
import { useChatCollaboration } from '../hooks/useChatCollaboration';
import { useAuth } from '../contexts/AuthContext';

interface ChatCollaborationProps {
  className?: string;
  defaultRoomId?: string;
  onClose?: () => void;
}

export const ChatCollaboration: React.FC<ChatCollaborationProps> = ({
  className = '',
  defaultRoomId,
  onClose
}) => {
  const { user } = useAuth();
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(defaultRoomId || null);
  const [messageInput, setMessageInput] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isConnected,
    isConnecting,
    currentRoom,
    rooms,
    connectionError,
    connect,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    setTyping,
    getRoomMessages,
    getRoomTypingUsers,
    getRoomMembers
  } = useChatCollaboration({
    userId: user?.id || 'anonymous',
    userName: user?.name || user?.email || 'Anonymous User',
    autoConnect: true,
    onMessageReceived: (message) => {
      console.log('New message:', message);
      // Scroll to bottom when new message arrives
      setTimeout(() => scrollToBottom(), 100);
    },
    onUserJoined: (user) => {
      console.log('User joined:', user);
    },
    onUserLeft: (user) => {
      console.log('User left:', user);
    },
    onTypingUpdate: (typingUsers) => {
      console.log('Typing update:', typingUsers);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [getRoomMessages(selectedRoom || '')]);

  const handleCreateRoom = () => {
    if (!newRoomId.trim()) return;
    
    createRoom(newRoomId.trim(), newRoomName.trim() || undefined);
    setNewRoomId('');
    setNewRoomName('');
    setShowCreateRoom(false);
  };

  const handleJoinRoom = (roomId: string) => {
    if (currentRoom) {
      leaveRoom(currentRoom);
    }
    joinRoom(roomId);
    setSelectedRoom(roomId);
  };

  const handleSendMessage = () => {
    if (!selectedRoom || !messageInput.trim()) return;
    
    sendChatMessage(selectedRoom, messageInput.trim());
    setMessageInput('');
    
    // Stop typing indicator
    setTyping(selectedRoom, false);
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);
    
    if (!selectedRoom) return;
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Start typing
    setTyping(selectedRoom, true);
    
    // Stop typing after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(selectedRoom, false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentMessages = getRoomMessages(selectedRoom || '');
  const typingUsers = getRoomTypingUsers(selectedRoom || '');
  const roomMembers = getRoomMembers(selectedRoom || '');

  return (
    <div className={`flex flex-col h-full bg-white shadow-lg rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <h2 className="text-lg font-semibold">Itinerary Collaboration</h2>
          <span className="text-sm opacity-75">
            {isConnected ? '🟢 Connected' : isConnecting ? '🟡 Connecting...' : '🔴 Disconnected'}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          <div className="flex">
            <div className="flex-1">
              <p className="text-sm">{connectionError}</p>
            </div>
            <button
              onClick={connect}
              className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Reconnect
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Room List */}
        <div className="w-1/3 border-r bg-gray-50 flex flex-col">
          <div className="p-3 border-b">
            <button
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
            >
              + Create Itinerary Room
            </button>
          </div>

          {/* Create Room Form */}
          {showCreateRoom && (
            <div className="p-3 border-b bg-white">
              <input
                type="text"
                placeholder="Itinerary ID (required)"
                value={newRoomId}
                onChange={(e) => setNewRoomId(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm mb-2"
              />
              <input
                type="text"
                placeholder="Trip Name (optional)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm mb-2"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoomId.trim()}
                  className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Room List */}
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm">
                No itinerary rooms available. Create a room to start collaborating!
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.room_id}
                  onClick={() => handleJoinRoom(room.room_id)}
                  className={`w-full text-left p-3 border-b hover:bg-gray-100 ${
                    selectedRoom === room.room_id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-sm">{room.room_name}</div>
                  <div className="text-xs text-gray-500">
                    {room.member_count} member{room.member_count !== 1 ? 's' : ''}
                  </div>
                  {room.last_message && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {room.last_message.user_name}: {room.last_message.message}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {rooms.find(r => r.room_id === selectedRoom)?.room_name || selectedRoom}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {roomMembers.length} member{roomMembers.length !== 1 ? 's' : ''} online
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (currentRoom) leaveRoom(currentRoom);
                      setSelectedRoom(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Leave Room
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.user_id === (user?.id || 'anonymous') ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.user_id === (user?.id || 'anonymous')
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.user_id !== (user?.id || 'anonymous') && (
                        <div className="text-xs font-medium mb-1 opacity-75">
                          {message.user_name}
                        </div>
                      )}
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">
                      {typingUsers.map(u => u.user_name).join(', ')} 
                      {typingUsers.length === 1 ? ' is' : ' are'} typing...
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t">
                <div className="flex space-x-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isConnected}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <div className="text-lg font-medium mb-2">Welcome to Itinerary Collaboration!</div>
                <div className="text-sm">
                  Create an itinerary room or join an existing one to collaborate with your travel companions.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
