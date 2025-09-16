import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Star,
  Heart,
  Share2,
  Edit,
  Trash2,
  Download,
  Printer
} from 'lucide-react';
import { savedItineraryAPI } from '../services/cachedApi';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import ShareModal from '../components/ShareModal';

interface SavedItinerary {
  id: string;
  title: string;
  description?: string;
  destination: string;
  country: string;
  city: string;
  duration_days: number;
  budget?: number;
  travel_style: string[];
  interests: string[];
  total_estimated_cost?: number;
  is_favorite: boolean;
  tags: string[];
  cover_image?: string;
  status: string;
  views_count: number;
  likes_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  days: Array<{
    day_number: number;
    date?: string;
    activities: Array<{
      name: string;
      time: string;
      location: string;
      description: string;
      cost: number;
      duration?: string;
      type?: string;
    }>;
    meals: Array<{
      name: string;
      time: string;
      location: string;
      description?: string;
      cuisine?: string;
      cost: number;
      type?: string;
    }>;
    accommodations?: {
      name: string;
      location?: string;
      check_in?: string;
      check_out?: string;
      cost?: number;
      type?: string;
      cost_per_night?: number;
    };
    transportation?: {
      type?: string;
      from?: string;
      to?: string;
      departure_time?: string;
      arrival_time?: string;
      cost?: number;
    };
    notes?: string;
    estimated_cost?: number;
  }>;
  is_public: boolean;
  share_token?: string;
}

const SavedItineraryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{
    title: string;
    url: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    if (id) {
      loadItinerary();
    }
  }, [id, isAuthenticated, user, navigate]);

  const loadItinerary = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await savedItineraryAPI.getItinerary(id);
      setItinerary(data);
    } catch (err: any) {
      console.error('Error loading itinerary:', err);
      setError(err.message || 'Failed to load itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleEdit = () => {
    if (itinerary) {
      navigate(`/edit-itinerary`, { 
        state: { 
          itineraryData: itinerary,
          isEditing: true 
        } 
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!itinerary) return;
    
    try {
      await savedItineraryAPI.toggleFavorite(itinerary.id);
      setItinerary(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorite status');
    }
  };

  const handleShare = async () => {
    if (!itinerary) return;
    
    try {
      const shareResponse = await savedItineraryAPI.shareItinerary(itinerary.id);
      const shareUrl = `${window.location.origin}${shareResponse.public_url}`;
      
      setShareData({
        title: itinerary.title,
        url: shareUrl,
        description: `Check out my travel itinerary for ${itinerary.destination}`
      });
      setShowShareModal(true);
    } catch (err: any) {
      console.error('Error sharing itinerary:', err);
      alert('Failed to share itinerary');
    }
  };

  const handleDelete = async () => {
    if (!itinerary) return;
    
    if (window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      try {
        await savedItineraryAPI.deleteItinerary(itinerary.id);
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Error deleting itinerary:', err);
        alert('Failed to delete itinerary');
      }
    }
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    alert('Download functionality coming soon!');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading itinerary..." />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested itinerary could not be found.'}</p>
          <ModernButton onClick={handleGoBack} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </ModernButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ModernButton
                onClick={handleGoBack}
                variant="bordered"
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </ModernButton>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{itinerary.title}</h1>
                <p className="text-sm text-gray-500">{itinerary.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ModernButton
                onClick={handleToggleFavorite}
                variant="bordered"
                className={itinerary.is_favorite ? "text-red-600 border-red-600" : ""}
              >
                <Heart className={`w-4 h-4 ${itinerary.is_favorite ? "fill-current" : ""}`} />
              </ModernButton>
              
              <ModernButton onClick={handleShare} variant="bordered">
                <Share2 className="w-4 h-4" />
              </ModernButton>
              
              <ModernButton onClick={handleEdit} variant="bordered">
                <Edit className="w-4 h-4" />
              </ModernButton>
              
              <ModernButton onClick={handleDownload} variant="bordered">
                <Download className="w-4 h-4" />
              </ModernButton>
              
              <ModernButton onClick={handlePrint} variant="bordered">
                <Printer className="w-4 h-4" />
              </ModernButton>
              
              <ModernButton onClick={handleDelete} variant="bordered" className="text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </ModernButton>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Itinerary Overview */}
        <ModernCard className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-semibold text-gray-900">{itinerary.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-semibold text-gray-900">{itinerary.duration_days} days</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Travel Style</p>
                <p className="font-semibold text-gray-900">{itinerary.travel_style.join(', ')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-semibold text-gray-900">
                  {itinerary.budget ? `$${itinerary.budget}` : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
          
          {itinerary.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{itinerary.description}</p>
            </div>
          )}
          
          {itinerary.interests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {itinerary.interests.map((interest, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ModernCard>

        {/* Daily Itinerary */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Daily Itinerary</h2>
          
          {itinerary.days.map((day, index) => (
            <ModernCard key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Day {day.day_number}</h3>
                {day.date && (
                  <p className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString()}</p>
                )}
              </div>
              
              {/* Activities */}
              {day.activities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Activities</h4>
                  <div className="space-y-3">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">{activity.name}</h5>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {activity.location}
                            </span>
                            {activity.duration && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {activity.duration}
                              </span>
                            )}
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${activity.cost}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Meals */}
              {day.meals.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Meals</h4>
                  <div className="space-y-3">
                    {day.meals.map((meal, mealIndex) => (
                      <div key={mealIndex} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Star className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">{meal.name}</h5>
                            <span className="text-sm text-gray-500">{meal.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{meal.cuisine || meal.description || 'Restaurant'}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {meal.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${meal.cost}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Accommodation */}
              {day.accommodations && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Accommodation</h4>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h5 className="font-medium text-gray-900">{day.accommodations.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{day.accommodations.location}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {day.accommodations.check_in && <span>Check-in: {day.accommodations.check_in}</span>}
                      {day.accommodations.check_out && <span>Check-out: {day.accommodations.check_out}</span>}
                      {(day.accommodations.cost || day.accommodations.cost_per_night) && (
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${day.accommodations.cost || day.accommodations.cost_per_night}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {day.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                  <p className="text-sm text-gray-600">{day.notes}</p>
                </div>
              )}
            </ModernCard>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && shareData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={shareData.title}
          url={shareData.url}
          description={shareData.description}
        />
      )}
    </div>
  );
};

export default SavedItineraryViewPage;
