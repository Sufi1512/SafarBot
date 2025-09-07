import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Home, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';

const OfflinePage: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Main Offline Content */}
        <div className="text-center mb-8">
          <div className="mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isOnline ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {isOnline ? (
                <Wifi className="w-12 h-12 text-green-600" />
              ) : (
                <WifiOff className="w-12 h-12 text-yellow-600" />
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {isOnline 
                ? 'Great! Your internet connection is back.'
                : 'It looks like you\'re not connected to the internet.'
              }
            </p>
            <p className="text-gray-500">
              {isOnline 
                ? 'You can now continue using SafarBot normally.'
                : 'Please check your internet connection and try again.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {isOnline ? (
              <ModernButton
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Continue
              </ModernButton>
            ) : (
              <ModernButton
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </ModernButton>
            )}
            
            <ModernButton
              onClick={handleGoHome}
              variant="bordered"
              className="px-8 py-3 text-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </ModernButton>
          </div>
        </div>

        {/* Connection Status */}
        <ModernCard className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="font-medium text-gray-900">
                Connection Status: {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {retryCount > 0 && (
              <span className="text-sm text-gray-500">
                Retry attempts: {retryCount}
              </span>
            )}
          </div>
        </ModernCard>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ModernCard className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Check Your Connection</h3>
                <p className="text-gray-600">Verify your internet connection</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Check your Wi-Fi or mobile data</li>
              <li>• Try accessing other websites</li>
              <li>• Restart your router if needed</li>
              <li>• Move to a different location</li>
            </ul>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">What to Do Next</h3>
                <p className="text-gray-600">Steps to get back online</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Wait for connection to restore</li>
              <li>• Refresh the page when online</li>
              <li>• Clear browser cache if needed</li>
              <li>• Contact your ISP if issues persist</li>
            </ul>
          </ModernCard>
        </div>

        {/* Offline Features */}
        {!isOnline && (
          <ModernCard className="p-6 bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Offline Features
              </h3>
              <p className="text-gray-600 mb-4">
                Some features may still work while you're offline.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>View cached itineraries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Read saved content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Access offline maps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Draft new itineraries</span>
                </div>
              </div>
            </div>
          </ModernCard>
        )}

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Status: {isOnline ? 'Online' : 'Offline'} | 
            Last checked: {new Date().toLocaleTimeString()}
          </p>
          <p className="mt-2">
            SafarBot - Your AI Travel Companion
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
