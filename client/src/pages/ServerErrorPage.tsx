import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, 
  RefreshCw, 
  Home, 
  AlertTriangle,
  Clock,
  MessageCircle
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@safarbot.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Main Error Content */}
        <div className="text-center mb-8">
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Server className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Internal Server Error
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Something went wrong on our end.
            </p>
            <p className="text-gray-500">
              We're working to fix this issue. Please try again in a few minutes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <ModernButton
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </ModernButton>
            
            <ModernButton
              onClick={handleGoHome}
              variant="bordered"
              className="px-4 py-2 text-sm"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </ModernButton>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ModernCard className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">What happened?</h3>
                <p className="text-gray-600">Our servers encountered an unexpected error</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Database connection issues</li>
              <li>• Third-party service failures</li>
              <li>• Application configuration problems</li>
              <li>• High server load</li>
            </ul>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">What can you do?</h3>
                <p className="text-gray-600">Try these solutions</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Refresh the page</li>
              <li>• Wait a few minutes and try again</li>
              <li>• Clear your browser cache</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </ModernCard>
        </div>

        {/* Support Section */}
        <ModernCard className="p-6 bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Still having trouble?
            </h3>
            <p className="text-gray-600 mb-4">
              Our technical team is monitoring this issue and working to resolve it quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ModernButton
                onClick={handleContactSupport}
                variant="bordered"
                className="flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </ModernButton>
              <ModernButton
                onClick={() => window.open('https://status.safarbot.com', '_blank')}
                variant="bordered"
                className="flex items-center justify-center"
              >
                Check Status
              </ModernButton>
            </div>
          </div>
        </ModernCard>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Error Code: 500 | 
            Timestamp: {new Date().toISOString()}
          </p>
          <p className="mt-2">
            SafarBot - Your AI Travel Companion
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
