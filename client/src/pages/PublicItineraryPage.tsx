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
  Eye,
  Download,
  Printer
} from 'lucide-react';
import { savedItineraryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ModernCard from '../components/ui/ModernCard';

interface PublicItinerary {
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
    }>;
    accommodations?: {
      name: string;
      type: string;
      cost_per_night: number;
    };
    transportation?: Record<string, any>;
    meals: Array<{
      name: string;
      time: string;
      location: string;
      description: string;
      cost: number;
    }>;
    notes?: string;
    estimated_cost?: number;
  }>;
  is_public: boolean;
}

const PublicItineraryPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<PublicItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (shareToken) {
      loadPublicItinerary();
    }
  }, [shareToken]);

  const loadPublicItinerary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await savedItineraryAPI.getPublicItinerary(shareToken!);
      setItinerary(data);
    } catch (err: any) {
      console.error('Error loading public itinerary:', err);
      setError(err.message || 'Failed to load itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // In a real app, you would call an API to like the itinerary
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: itinerary?.title,
        text: `Check out this travel itinerary for ${itinerary?.destination}`,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    // In a real app, you would generate a PDF or export the itinerary
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
          <div className="text-red-500 mb-4">
            <MapPin className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Itinerary Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'This itinerary may have been removed or is no longer public.'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Go Home
            </button>
          </div>
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
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{itinerary.title}</h1>
                <p className="text-sm text-gray-600">{itinerary.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg transition-colors ${
                  isLiked 
                    ? 'bg-red-50 text-red-600' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Printer className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Itinerary Overview */}
            <ModernCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{itinerary.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{itinerary.destination}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{itinerary.duration_days} days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{itinerary.views_count} views</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${itinerary.total_estimated_cost?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </div>
              </div>
              
              {itinerary.description && (
                <p className="text-gray-700 mb-4">{itinerary.description}</p>
              )}
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {itinerary.travel_style.map((style, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {style}
                  </span>
                ))}
                {itinerary.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </ModernCard>

            {/* Daily Itinerary */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Daily Itinerary</h3>
              {itinerary.days.map((day, index) => (
                <ModernCard key={index} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Day {day.day_number}
                    </h4>
                    {day.date && (
                      <span className="text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Activities */}
                  {day.activities.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Activities</h5>
                      <div className="space-y-2">
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h6 className="font-medium text-gray-900">{activity.name}</h6>
                                <span className="text-sm text-gray-600">{activity.time}</span>
                              </div>
                              <p className="text-sm text-gray-600">{activity.location}</p>
                              <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                              {activity.cost > 0 && (
                                <p className="text-sm text-green-600 font-medium mt-1">
                                  ${activity.cost}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Meals */}
                  {day.meals.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Meals</h5>
                      <div className="space-y-2">
                        {day.meals.map((meal, mealIndex) => (
                          <div key={mealIndex} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h6 className="font-medium text-gray-900">{meal.name}</h6>
                                <span className="text-sm text-gray-600">{meal.time}</span>
                              </div>
                              <p className="text-sm text-gray-600">{meal.location}</p>
                              <p className="text-sm text-gray-700 mt-1">{meal.description}</p>
                              {meal.cost > 0 && (
                                <p className="text-sm text-green-600 font-medium mt-1">
                                  ${meal.cost}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Day Total */}
                  {day.estimated_cost && day.estimated_cost > 0 && (
                    <div className="flex justify-end">
                      <div className="text-sm text-gray-600">
                        Day Total: <span className="font-medium text-green-600">${day.estimated_cost}</span>
                      </div>
                    </div>
                  )}
                </ModernCard>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Itinerary Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{itinerary.duration_days} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="font-medium text-green-600">
                    ${itinerary.total_estimated_cost?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{itinerary.views_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">{itinerary.likes_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shares</span>
                  <span className="font-medium">{itinerary.shares_count}</span>
                </div>
              </div>
            </ModernCard>

            {/* Quick Actions */}
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleLike}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicItineraryPage;
