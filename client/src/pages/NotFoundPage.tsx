import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  MapPin, 
  Plane, 
  Hotel, 
  Car,
  MessageCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this was a redirect
  const redirectInfo = location.state as { 
    redirectedFrom?: string; 
    redirectReason?: string; 
  } | null;

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handlePlanTrip = () => {
    navigate('/trip-planner');
  };


  const handleContactSupport = () => {
    // In a real app, this would open a support chat or email
    window.open('mailto:support@safarbot.com', '_blank');
  };

  const handleHelpCenter = () => {
    // In a real app, this would navigate to help center
    alert('Help center coming soon!');
  };

  // Common routes that users might be looking for
  const suggestedRoutes = [
    { path: '/', label: 'Home', icon: Home, description: 'Go back to the main page' },
    { path: '/search', label: 'Search', icon: Search, description: 'Search for destinations' },
    { path: '/trip-planner', label: 'Plan Trip', icon: MapPin, description: 'Create a new itinerary' },
    { path: '/flights', label: 'Flights', icon: Plane, description: 'Book flights' },
    { path: '/hotels', label: 'Hotels', icon: Hotel, description: 'Book hotels' },
    { path: '/packages', label: 'Packages', icon: Car, description: 'Travel packages' },
  ];

  // Check if the user was trying to access login/signup
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Main 404 Content */}
        <div className="text-center mb-12 mt-20">
          <div className="mb-8">
            <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {redirectInfo?.redirectReason || 
               `The page "${location.pathname}" doesn't exist or has been moved.`
              }
            </p>
            <p className="text-gray-500">
              Don't worry, we'll help you find what you're looking for!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <ModernButton
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </ModernButton>
            
            <ModernButton
              onClick={handleGoBack}
              variant="outline"
              className="px-8 py-3 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </ModernButton>
          </div>
        </div>

        {/* Redirect Information */}
        {redirectInfo && (
          <ModernCard className="p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-4">
              <ExternalLink className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Redirect Information
                </h3>
                <p className="text-blue-800 mb-2">
                  {redirectInfo.redirectReason}
                </p>
                {redirectInfo.redirectedFrom && (
                  <p className="text-sm text-blue-700">
                    Original URL: <code className="bg-blue-100 px-2 py-1 rounded">{redirectInfo.redirectedFrom}</code>
                  </p>
                )}
              </div>
            </div>
          </ModernCard>
        )}

        {/* Special Messages for Common Routes */}
        {isAuthRoute && (
          <ModernCard className="p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-4">
              <MessageCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Authentication Not Available
                </h3>
                <p className="text-blue-800 mb-4 text-sm">
                  SafarBot uses popup modals for login and signup instead of separate pages. 
                  You can access these features from the main page header.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Click "Sign In" in the header
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Or "Sign Up" to create account
                  </span>
                </div>
              </div>
            </div>
          </ModernCard>
        )}

        {isDashboardRoute && (
          <ModernCard className="p-6 mb-8 bg-green-50 border-green-200">
            <div className="flex items-start space-x-4">
              <MapPin className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Dashboard Access
                </h3>
                <p className="text-green-800 mb-4">
                  You need to be logged in to access the dashboard. Please sign in first.
                </p>
                <ModernButton
                  onClick={handleGoHome}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Go to Home Page
                </ModernButton>
              </div>
            </div>
          </ModernCard>
        )}

        {/* Suggested Routes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <ModernCard
                  key={route.path}
                  className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(route.path)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {route.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {route.description}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </ModernCard>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ModernCard className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Search Destinations</h3>
                <p className="text-gray-600">Find your next travel destination</p>
              </div>
            </div>
            <ModernButton
              onClick={handleSearch}
              variant="outline"
              className="w-full"
            >
              Start Searching
            </ModernButton>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Plan Your Trip</h3>
                <p className="text-gray-600">Create a personalized itinerary</p>
              </div>
            </div>
            <ModernButton
              onClick={handlePlanTrip}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Plan Now
            </ModernButton>
          </ModernCard>
        </div>

        {/* Support Section */}
        <ModernCard className="p-6 bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Still can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you navigate SafarBot.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ModernButton
                onClick={handleContactSupport}
                variant="outline"
                className="flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </ModernButton>
              <ModernButton
                onClick={handleHelpCenter}
                variant="outline"
                className="flex items-center justify-center"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Center
              </ModernButton>
            </div>
          </div>
        </ModernCard>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Error Code: 404 | 
            Requested URL: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
          </p>
          <p className="mt-2">
            SafarBot - Your AI Travel Companion
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
