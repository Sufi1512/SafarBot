import React from 'react';
import { 
  MapPin, 
  CalendarDays, 
  DollarSign, 
  Heart, 
  Eye, 
  Share2, 
  Edit3, 
  Trash2,
  Clock,
  Users,
  Star
} from 'lucide-react';

interface ItineraryCardProps {
  itinerary: {
    id: string;
    title: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    budget?: number;
    total_estimated_cost?: number;
    travel_style: string[];
    interests: string[];
    is_favorite: boolean;
    status: string;
    cover_image?: string;
    views_count: number;
    likes_count: number;
    created_at: string;
  };
  onToggleFavorite: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({
  itinerary,
  onToggleFavorite,
  onEdit,
  onDelete,
  onShare
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTravelStyleColor = (style: string) => {
    const colors = {
      'adventure': 'bg-orange-100 text-orange-800',
      'luxury': 'bg-purple-100 text-purple-800',
      'budget': 'bg-green-100 text-green-800',
      'family': 'bg-pink-100 text-pink-800',
      'solo': 'bg-blue-100 text-blue-800',
      'business': 'bg-gray-100 text-gray-800',
      'romantic': 'bg-red-100 text-red-800',
      'cultural': 'bg-indigo-100 text-indigo-800'
    };
    return colors[style as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        {itinerary.cover_image ? (
          <img 
            src={itinerary.cover_image} 
            alt={itinerary.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
            <MapPin className="h-16 w-16 text-white opacity-80" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(itinerary.status)}`}>
            {itinerary.status}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(itinerary.id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            itinerary.is_favorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white bg-opacity-80 text-gray-600 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${itinerary.is_favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
            {itinerary.title}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{itinerary.destination}, {itinerary.country}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-4 w-4" />
            <span>{itinerary.duration_days} days</span>
          </div>
          {itinerary.total_estimated_cost && (
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>${itinerary.total_estimated_cost.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{itinerary.views_count}</span>
          </div>
        </div>

        {/* Travel Styles */}
        <div className="flex flex-wrap gap-1 mb-4">
          {itinerary.travel_style.slice(0, 3).map((style) => (
            <span 
              key={style} 
              className={`px-2 py-1 text-xs font-medium rounded-full ${getTravelStyleColor(style)}`}
            >
              {style}
            </span>
          ))}
          {itinerary.travel_style.length > 3 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              +{itinerary.travel_style.length - 3}
            </span>
          )}
        </div>

        {/* Interests */}
        {itinerary.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {itinerary.interests.slice(0, 4).map((interest) => (
                <span 
                  key={interest} 
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                >
                  {interest}
                </span>
              ))}
              {itinerary.interests.length > 4 && (
                <span className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-full">
                  +{itinerary.interests.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{itinerary.likes_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(itinerary.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(itinerary.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit itinerary"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onShare(itinerary.id)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Share itinerary"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(itinerary.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete itinerary"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;
