import React from 'react';
import { Star, MapPin, Clock, DollarSign, Phone, Globe, Utensils, Hotel, MapPinIcon } from 'lucide-react';
import { PlaceDetails, AdditionalPlace } from '../services/api';

interface EnhancedHoverPopupProps {
  place: PlaceDetails | AdditionalPlace | null;
  position: { x: number; y: number } | null;
  type: 'activity' | 'restaurant' | 'hotel' | 'attraction' | null;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const EnhancedHoverPopup: React.FC<EnhancedHoverPopupProps> = ({
  place,
  position,
  type,
  isVisible,
  onMouseEnter,
  onMouseLeave
}) => {
  if (!isVisible || !place || !position) return null;

  // Helper function to check if place is PlaceDetails type
  const isPlaceDetails = (p: PlaceDetails | AdditionalPlace): p is PlaceDetails => {
    return 'title' in p;
  };

  const placeTitle = isPlaceDetails(place) ? place.title : place.name;
  const placeRating = place.rating;
  const placeAddress = isPlaceDetails(place) ? place.address : place.location;
  const placePhone = place.phone;
  const placeWebsite = place.website;
  const placeHours = isPlaceDetails(place) ? place.hours : place.hours;
  const placeDescription = place.description;
  const placeCategory = place.category;
  const placeThumbnail = isPlaceDetails(place) ? (place.thumbnail || place.serpapi_thumbnail) : undefined;
  const placeReviews = isPlaceDetails(place) ? place.reviews : undefined;
  const placePrice = isPlaceDetails(place) ? place.price : place.price_range;
  const placeCuisine = isPlaceDetails(place) ? place.cuisine : undefined;
  const placeAmenities = !isPlaceDetails(place) ? place.amenities : undefined;

  // Get coordinates for map link
  const getMapUrl = () => {
    if (isPlaceDetails(place) && place.gps_coordinates) {
      const { latitude, longitude } = place.gps_coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
    if (!isPlaceDetails(place) && place.coordinates) {
      const { lat, lng } = place.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeTitle + ' ' + (placeAddress || ''))}`;
  };

  // Get type icon
  const getTypeIcon = () => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-4 h-4" />;
      case 'restaurant':
        return <Utensils className="w-4 h-4" />;
      case 'activity':
      case 'attraction':
        return <MapPinIcon className="w-4 h-4" />;
      default:
        return <MapPinIcon className="w-4 h-4" />;
    }
  };

  // Get type label
  const getTypeLabel = () => {
    switch (type) {
      case 'hotel':
        return '🏨 Accommodation';
      case 'restaurant':
        return '🍽️ Restaurant';
      case 'activity':
        return '🎯 Activity';
      case 'attraction':
        return '🏛️ Attraction';
      default:
        return placeCategory || '📍 Place';
    }
  };

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[320px] max-w-[400px] pointer-events-none overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateY(-50%)'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Section */}
      {placeThumbnail && (
        <div className="w-full h-40 bg-gray-200 overflow-hidden">
          <img
            src={placeThumbnail}
            alt={placeTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
              {placeTitle}
            </h4>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                {getTypeIcon()}
                {getTypeLabel()}
              </span>
            </div>
          </div>
          {placeRating && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {placeRating}
              </span>
              {placeReviews && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({placeReviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {placeDescription && (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
            {placeDescription}
          </p>
        )}

        {/* Key Information */}
        <div className="space-y-2">
          {/* Location */}
          {placeAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {placeAddress}
                </p>
                <a
                  href={getMapUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  View on Maps →
                </a>
              </div>
            </div>
          )}

          {/* Hours */}
          {placeHours && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {placeHours}
              </span>
            </div>
          )}

          {/* Price */}
          {placePrice && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {placePrice}
              </span>
            </div>
          )}

          {/* Cuisine (for restaurants) */}
          {placeCuisine && (
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {placeCuisine}
              </span>
            </div>
          )}

          {/* Phone */}
          {placePhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a 
                href={`tel:${placePhone}`} 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {placePhone}
              </a>
            </div>
          )}

          {/* Website */}
          {placeWebsite && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <a
                href={placeWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate"
              >
                Visit Website →
              </a>
            </div>
          )}
        </div>

        {/* Amenities (for hotels) */}
        {placeAmenities && placeAmenities.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Amenities:
            </div>
            <div className="flex flex-wrap gap-1">
              {placeAmenities.slice(0, 4).map((amenity, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {placeAmenities.length > 4 && (
                <span className="text-xs text-gray-400">
                  +{placeAmenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Operating Hours (detailed) */}
        {isPlaceDetails(place) && place.operating_hours && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Operating Hours:
            </div>
            <div className="space-y-1">
              {Object.entries(place.operating_hours).slice(0, 3).map(([day, hours]) => (
                hours && (
                  <div key={day} className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{day}</span>
                    <span className="text-gray-700 dark:text-gray-300">{hours}</span>
                  </div>
                )
              ))}
              {Object.keys(place.operating_hours).length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{Object.keys(place.operating_hours).length - 3} more days
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHoverPopup;
