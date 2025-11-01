import React, { useEffect, useRef, useState } from 'react';
import { Star, MapPin, Clock, DollarSign, Phone, Globe, Utensils, Hotel } from 'lucide-react';
import { PlaceDetails, AdditionalPlace } from '../services/api';
import OptimizedImage from './OptimizedImage';

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
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper function to check if place is PlaceDetails type
  const isPlaceDetails = (p: PlaceDetails | AdditionalPlace): p is PlaceDetails => {
    return 'title' in p;
  };

  // Enhanced metadata mapping with fallbacks
  const getPlaceMetadata = () => {
    if (!place) return null;

    const metadata = {
      title: isPlaceDetails(place) ? place.title : place.name,
      rating: place.rating,
      address: isPlaceDetails(place) ? place.address : place.location,
      phone: place.phone,
      website: place.website,
      hours: isPlaceDetails(place) ? place.hours : place.hours,
      description: place.description,
      category: place.category,
      thumbnail: isPlaceDetails(place) ? (place.high_res_image || place.thumbnail || place.serpapi_thumbnail) : undefined,
      reviews: isPlaceDetails(place) ? place.reviews : undefined,
      price: isPlaceDetails(place) ? place.price : place.price_range,
      cuisine: !isPlaceDetails(place) ? place.cuisine : undefined,
      amenities: !isPlaceDetails(place) ? place.amenities : undefined,
      operatingHours: isPlaceDetails(place) ? place.operating_hours : undefined,
      coordinates: isPlaceDetails(place) ? place.gps_coordinates : place.coordinates
    };

    return metadata;
  };

  const metadata = getPlaceMetadata();

  // Smart positioning logic to keep popup within viewport
  useEffect(() => {
    if (!position) return;

    const estimatedWidth = 400;
    const estimatedHeight = 300;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;
    
    let x = position.x;
    let y = position.y;

    // Horizontal positioning - prefer right side, fallback to left
    if (x + estimatedWidth > viewportWidth - padding) {
      x = position.x - estimatedWidth - 15; // Position to the left with gap
    }
    
    // Ensure popup doesn't go off the left edge
    if (x < padding) {
      x = padding;
    }

    // Vertical positioning - center on element, adjust if needed
    y = position.y - (estimatedHeight / 2);
    
    // Adjust if popup would go off-screen vertically
    if (y + estimatedHeight > viewportHeight - padding) {
      y = viewportHeight - estimatedHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }

    setAdjustedPosition({ x, y });
  }, [position]);

  // Smooth animation handling
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible || !place || !adjustedPosition || !metadata) return null;

  // Get coordinates for map link with better fallback handling
  const getMapUrl = () => {
    if (metadata.coordinates) {
      if ('latitude' in metadata.coordinates) {
        const { latitude, longitude } = metadata.coordinates;
        return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else if ('lat' in metadata.coordinates) {
        const { lat, lng } = metadata.coordinates;
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      }
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(metadata.title + ' ' + (metadata.address || ''))}`;
  };

  // Get type icon with better mapping
  const getTypeIcon = () => {
    const category = metadata.category?.toLowerCase() || '';
    
    if (type === 'hotel' || category.includes('hotel') || category.includes('accommodation')) {
      return <Hotel className="w-4 h-4" />;
    }
    if (type === 'restaurant' || category.includes('restaurant') || category.includes('food')) {
      return <Utensils className="w-4 h-4" />;
    }
    if (type === 'activity' || type === 'attraction' || category.includes('attraction') || category.includes('museum')) {
      return <MapPin className="w-4 h-4" />;
    }
    return <MapPin className="w-4 h-4" />;
  };

  // Get type label with better mapping
  const getTypeLabel = () => {
    const category = metadata.category?.toLowerCase() || '';
    
    if (type === 'hotel' || category.includes('hotel') || category.includes('accommodation')) {
      return '🏨 Accommodation';
    }
    if (type === 'restaurant' || category.includes('restaurant') || category.includes('food')) {
      return '🍽️ Restaurant';
    }
    if (type === 'activity' || category.includes('activity')) {
      return '🎯 Activity';
    }
    if (type === 'attraction' || category.includes('attraction') || category.includes('museum')) {
      return '🏛️ Attraction';
    }
    return metadata.category || '📍 Place';
  };

  return (
    <div
      ref={popupRef}
      className={`fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[320px] max-w-[400px] overflow-hidden transition-all duration-200 ease-out ${
        isAnimating 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-2'
      }`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image Section with optimized loading */}
      {metadata.thumbnail ? (
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
          <OptimizedImage
            src={metadata.thumbnail ?? ''}
            alt={metadata.title || ''}
            className="w-full h-full"
            quality="medium"
            loading="eager"
            fallbackSrc="/api/placeholder/400/300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="w-full h-40 bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-500 text-sm">
          <div className="text-center">
            <div>📷 No Photo Available</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1 truncate">
              {metadata.title}
            </h4>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                {getTypeIcon()}
                {getTypeLabel()}
              </span>
            </div>
          </div>
          {metadata.rating && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg flex-shrink-0">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {metadata.rating}
              </span>
              {metadata.reviews && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({metadata.reviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {metadata.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
            {metadata.description}
          </p>
        )}

        {/* Key Information */}
        <div className="space-y-2">
          {/* Location */}
          {metadata.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {metadata.address}
                </p>
                <a
                  href={getMapUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                >
                  View on Maps →
                </a>
              </div>
            </div>
          )}

          {/* Hours */}
          {metadata.hours && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {metadata.hours}
              </span>
            </div>
          )}

          {/* Price */}
          {metadata.price && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {metadata.price}
              </span>
            </div>
          )}

          {/* Cuisine (for restaurants) */}
          {metadata.cuisine && (
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {metadata.cuisine}
              </span>
            </div>
          )}

          {/* Phone */}
          {metadata.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a 
                href={`tel:${metadata.phone}`} 
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {metadata.phone}
              </a>
            </div>
          )}

          {/* Website */}
          {metadata.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <a
                href={metadata.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate transition-colors"
              >
                Visit Website →
              </a>
            </div>
          )}
        </div>

        {/* Amenities (for hotels) */}
        {metadata.amenities && metadata.amenities.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Amenities:
            </div>
            <div className="flex flex-wrap gap-1">
              {metadata.amenities.slice(0, 4).map((amenity, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {metadata.amenities.length > 4 && (
                <span className="text-xs text-gray-400">
                  +{metadata.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Operating Hours (detailed) */}
        {metadata.operatingHours && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Operating Hours:
            </div>
            <div className="space-y-1">
              {Object.entries(metadata.operatingHours).slice(0, 3).map(([day, hours]) => (
                hours && (
                  <div key={day} className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{day}</span>
                    <span className="text-gray-700 dark:text-gray-300">{hours}</span>
                  </div>
                )
              ))}
              {Object.keys(metadata.operatingHours).length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{Object.keys(metadata.operatingHours).length - 3} more days
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
