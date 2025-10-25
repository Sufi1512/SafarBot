import React from 'react';
import { ChatCollaboration } from '../components/ChatCollaboration';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ChatPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Itinerary Collaboration
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Chat with collaborators while planning trips together
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)]">
          <ChatCollaboration className="h-full" />
        </div>
      </div>
    </div>
  );
};
