import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle, Minimize2, Maximize2, RotateCcw } from 'lucide-react';
import { chatAPI } from '../services/api';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isError?: boolean;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}`); // Persistent conversation ID
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '🌍 Hello! I\'m SafarBot, your AI travel assistant powered by Google Gemini 2.5 Flash.\n\nI can help you with:\n✈️ Planning personalized itineraries\n🏨 Finding accommodations\n🍽️ Restaurant recommendations\n🗺️ Travel tips and advice\n\nTo get started, try asking me something like:\n• "Plan a 3-day trip to Paris"\n• "Find hotels in Tokyo under $200"\n• "What are the best restaurants in Rome?"\n• "Give me travel tips for Thailand"\n\nWhat would you like to explore today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputText;
    setInputText('');
    setIsTyping(true);
    setError(null);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.sender !== 'bot' || !msg.isError) // Exclude error messages
        .slice(-10) // Keep last 10 messages for context (5 user + 5 bot)
        .map(msg => `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      // Use real API with conversation context
      const response = await chatAPI.sendMessage({
        message: `${conversationHistory ? conversationHistory + '\nHuman: ' : ''}${currentMessage}`,
        context: { 
          type: 'travel_planning',
          conversation_id: conversationId,
          user_intent: 'travel_assistance',
          has_history: messages.length > 1
        }
      });
      
      // The response is now directly {response: string, context?: any}
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response || 'I apologize, but I couldn\'t process your request right now.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to connect to SafarBot. Please check your internet connection and try again.');
      
      // Fallback response with error indication
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble connecting to my servers right now. This might be due to:\n\n• Network connectivity issues\n• Server maintenance\n• High traffic\n\nPlease try again in a few moments. If the problem persists, contact support.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to render markdown-like text with basic formatting
  const renderMarkdownText = (text: string) => {
    // Convert **bold** to <strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert bullet points (•) 
    formattedText = formattedText.replace(/^\s*\*\s+(.+)$/gm, '• $1');
    
    return formattedText;
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: '🌍 Hello! I\'m SafarBot, your AI travel assistant powered by Google Gemini 2.5 Flash.\n\nI can help you with:\n✈️ Planning personalized itineraries\n🏨 Finding accommodations\n🍽️ Restaurant recommendations\n🗺️ Travel tips and advice\n\nTo get started, try asking me something like:\n• "Plan a 3-day trip to Paris"\n• "Find hotels in Tokyo under $200"\n• "What are the best restaurants in Rome?"\n• "Give me travel tips for Thailand"\n\nWhat would you like to explore today?',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setError(null);
    // Note: conversationId stays the same to maintain session context
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 transform hover:scale-110 ${
          isOpen ? 'rotate-180' : ''
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300" />
        ) : (
          <MessageCircle className="w-7 h-7 transition-transform duration-300" />
        )}
      </button>

      {/* Notification Badge */}
      {!isOpen && messages.length > 1 && (
        <div className="fixed bottom-16 right-4 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse z-50">
          {messages.filter(m => m.sender === 'bot').length - 1}
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 transform transition-all duration-300 ease-out ${
          isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-8rem)]'
        } animate-slide-up`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="w-8 h-8" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <span className="font-bold text-lg">SafarBot</span>
                  <p className="text-xs text-purple-100">AI Travel Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={clearChat}
                  className="text-white hover:text-purple-200 transition-colors p-1 rounded-full hover:bg-white/10 button-ripple"
                  title="Clear Chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:text-purple-200 transition-colors p-1 rounded-full hover:bg-white/10 button-ripple"
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-purple-200 transition-colors p-1 rounded-full hover:bg-white/10 button-ripple"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {!isMinimized && (
              <div className="mt-2 text-sm text-purple-100 animate-fade-in">
                🌍 Ready to plan your next adventure? Ask me anything!
              </div>
            )}
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white chat-scroll">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm message-bubble transition-all duration-200 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white ml-4'
                          : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200 mr-4'
                          : 'bg-white text-gray-900 border border-gray-200 mr-4 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === 'bot' && (
                          <Bot className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            message.isError ? 'text-red-500' : 'text-primary-600'
                          }`} />
                        )}
                        <div className="flex-1">
                          <div 
                            className="text-sm leading-relaxed whitespace-pre-wrap text-left"
                            dangerouslySetInnerHTML={{ 
                              __html: message.sender === 'bot' ? renderMarkdownText(message.text) : message.text 
                            }}
                          />
                          <p className={`text-xs mt-2 text-left ${
                            message.sender === 'user' 
                              ? 'text-purple-200' 
                              : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        {message.sender === 'user' && (
                          <User className="w-5 h-5 mt-0.5 flex-shrink-0 text-purple-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white text-gray-900 px-4 py-3 rounded-2xl shadow-sm border border-gray-200 mr-4">
                      <div className="flex items-center space-x-3">
                        <Bot className="w-5 h-5 text-primary-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">SafarBot is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                {error && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600 transition-colors button-ripple"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    style={{ color: 'black' }}
                    
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about destinations, hotels, activities..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-full hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg button-ripple"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">
                  Powered by Google Gemini 2.5 Flash ✨
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget; 