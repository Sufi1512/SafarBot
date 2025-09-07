import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Info,
  Share2
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ItineraryRedirectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking if this itinerary has a public share token
    // In a real implementation, you might want to call an API to check
    const checkForPublicVersion = async () => {
      try {
        // For now, we'll just show the redirect message
        // In the future, you could call an API to check if this itinerary is public
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    checkForPublicVersion();
  }, [id]);

  const handleGoHome = () => {
    navigate('/');
  };


  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Itinerary Access
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              This itinerary is not publicly accessible.
            </p>
            <p className="text-gray-500">
              Itinerary ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{id}</code>
            </p>
          </div>
        </div>

        <ModernCard className="p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <Share2 className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How to Access This Itinerary
              </h3>
              <div className="space-y-3 text-blue-800">
                <p>
                  <strong>If you own this itinerary:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Sign in to your account</li>
                  <li>Go to Dashboard → Saved Itineraries</li>
                  <li>Find and view your itinerary</li>
                </ul>
                
                <p className="mt-4">
                  <strong>If this is a shared itinerary:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Ask the owner for the public share link</li>
                  <li>Public links look like: <code className="bg-blue-100 px-2 py-1 rounded text-xs">/public/itinerary/abc123</code></li>
                </ul>
              </div>
            </div>
          </div>
        </ModernCard>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ModernButton
            onClick={handleGoHome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </ModernButton>
          
          <ModernButton
            onClick={handleGoToDashboard}
            variant="bordered"
            className="px-6 py-3"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to Dashboard
          </ModernButton>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Need help? Contact support or check our help center.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItineraryRedirectPage;
