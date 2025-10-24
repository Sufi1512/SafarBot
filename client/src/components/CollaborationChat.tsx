import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Users, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useChatCollaboration } from '../hooks/useChatCollaboration';
import { useAuth } from '../contexts/AuthContext';

interface CollaborationChatProps {
  itineraryId: string;
  className?: string;
}

export const CollaborationChat: React.FC<CollaborationChatProps> = ({
  itineraryId,
  className = ''
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roomId = `itinerary_${itineraryId}`;
  const roomName = `Itinerary Collaboration`;

  const {
    isConnected,
    currentRoom,
    connectionError,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    setTyping,
    getRoomMessages,
    getRoomTypingUsers,
    getRoomMembers
  } = useChatCollaboration({
    userId: user?.user_id || 'anonymous',
    userName: user?.name || user?.email || 'Anonymous User',
    autoConnect: true,
    onMessageReceived: (message) => {
      // Show notification dot or sound for new messages when minimized
      if (!isOpen) {
        // Could add notification dot here
      }
      setTimeout(() => scrollToBottom(), 100);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [getRoomMessages(roomId)]);

  // Auto-join the itinerary room when chat opens
  useEffect(() => {
    if (isOpen && isConnected && currentRoom !== roomId) {
      joinRoom(roomId);
    }
  }, [isOpen, isConnected, currentRoom, roomId, joinRoom]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentRoom) return;
    
    sendChatMessage(currentRoom, messageInput.trim());
    setMessageInput('');
    
    // Stop typing indicator
    setTyping(currentRoom, false);
    
    // Focus back to input
    messageInputRef.current?.focus();
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);
    
    if (!currentRoom) return;
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Start typing
    setTyping(currentRoom, true);
    
    // Stop typing after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(currentRoom, false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      if (currentRoom) {
        leaveRoom(currentRoom);
      }
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const currentMessages = getRoomMessages(roomId);
  const typingUsers = getRoomTypingUsers(roomId);
  const roomMembers = getRoomMembers(roomId);

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={toggleChat}
          className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="Open collaboration chat"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Notification dot for new messages */}
          {currentMessages.length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs font-bold text-white">{currentMessages.length}</span>
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 ${
        isMinimized ? 'w-80 h-12' : 'w-80 h-96'
      } transition-all duration-300`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <h3 className="font-medium text-sm">{roomName}</h3>
            {roomMembers.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span className="text-xs">{roomMembers.length}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-gray-200 p-1"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 p-1"
              title="Close chat"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Connection Error */}
            {connectionError && (
              <div className="p-2 bg-red-100 border-b border-red-200 text-red-700 text-xs">
                Connection issue: {connectionError}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 h-64">
              {currentRoom !== roomId ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  <div className="text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Joining collaboration chat...</p>
                  </div>
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  <div className="text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Start collaborating!</p>
                    <p className="text-xs mt-1">Send a message to begin the conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.user_id === (user?.user_id || 'anonymous') ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.user_id === (user?.user_id || 'anonymous')
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {message.user_id !== (user?.user_id || 'anonymous') && (
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
                      <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg text-sm">
                        {typingUsers.map(u => u.user_name).join(', ')} 
                        {typingUsers.length === 1 ? ' is' : ' are'} typing...
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={!isConnected || currentRoom !== roomId}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected || currentRoom !== roomId}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};








