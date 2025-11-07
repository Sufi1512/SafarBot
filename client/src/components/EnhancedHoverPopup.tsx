import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  const [orientation, setOrientation] = useState<'left' | 'right'>('right');

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

    const estimatedWidth = 420;
    const estimatedHeight = 320;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;
    
    let x = position.x;
    let y = position.y;
    let nextOrientation: 'left' | 'right' = 'right';

    if (x + estimatedWidth > viewportWidth - padding) {
      x = position.x - estimatedWidth - 16;
      nextOrientation = 'left';
    }

    if (x < padding) {
      x = padding;
      nextOrientation = 'right';
    }

    y = position.y - (estimatedHeight / 2);

    if (y + estimatedHeight > viewportHeight - padding) {
      y = viewportHeight - estimatedHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }

    setOrientation(nextOrientation);
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

  const highlightTags = useMemo(() => {
    if (!metadata) {
      return [] as Array<{ key: string; icon: React.ReactNode; value: string }>;
    }

    const tags: Array<{ key: string; icon: React.ReactNode; value: string }> = [];

    if (metadata.price) {
      tags.push({
        key: 'price',
        icon: <DollarSign className="w-3.5 h-3.5 text-emerald-500" />,
        value: metadata.price
      });
    }

    if (metadata.hours) {
      tags.push({
        key: 'hours',
        icon: <Clock className="w-3.5 h-3.5 text-blue-500" />,
        value: metadata.hours
      });
    }

    if (metadata.cuisine) {
      tags.push({
        key: 'cuisine',
        icon: <Utensils className="w-3.5 h-3.5 text-amber-500" />,
        value: metadata.cuisine
      });
    }

    if (metadata.category) {
      tags.push({
        key: 'category',
        icon: <MapPin className="w-3.5 h-3.5 text-indigo-500" />,
        value: metadata.category
      });
    }

    return tags;
  }, [metadata]);

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
      className={`fixed z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/70 dark:border-slate-700/60 min-w-[320px] max-w-[420px] overflow-hidden transition-all duration-200 ease-out ${
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
      <div
        className={`absolute top-1/2 w-3.5 h-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 transform -translate-y-1/2 rotate-45 ${
          orientation === 'left' ? 'right-[-7px]' : 'left-[-7px]'
        }`}
        aria-hidden="true"
      />
      {/* Image Section with optimized loading */}
      {metadata.thumbnail ? (
        <div className="w-full h-44 bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
          <OptimizedImage
            src={metadata.thumbnail ?? ''}
            alt={metadata.title || ''}
            className="w-full h-full"
            quality="medium"
            loading="eager"
            fallbackSrc="/api/placeholder/400/300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
            <div className="space-y-1 text-white drop-shadow-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium uppercase tracking-wide">
                {getTypeIcon()}
                <span>{getTypeLabel()}</span>
              </div>
              <h4 className="text-lg font-semibold leading-tight max-w-[260px]">
                {metadata.title}
              </h4>
            </div>
            {metadata.rating && (
              <div className="flex items-center gap-1 bg-black/60 px-2.5 py-1.5 rounded-full text-sm font-semibold text-white">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span>{metadata.rating}</span>
                {metadata.reviews && (
                  <span className="text-xs text-white/80">
                    ({metadata.reviews})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center text-gray-600 dark:text-slate-300 text-sm">
          <div className="text-center space-y-1">
            <div className="text-2xl">📷</div>
            <div>No Photo Available</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {metadata.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
            {metadata.description}
          </p>
        )}

        {highlightTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {highlightTags.map((tag) => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/80 dark:bg-slate-800/80 text-xs font-medium text-gray-700 dark:text-slate-200 shadow-sm"
              >
                {tag.icon}
                <span className="truncate max-w-[120px]">{tag.value}</span>
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {metadata.address && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/40">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                  {metadata.address}
                </p>
                <a
                  href={getMapUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300"
                >
                  View on Maps
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          )}

          {metadata.phone && (
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <a
                href={`tel:${metadata.phone}`}
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
              >
                {metadata.phone}
              </a>
            </div>
          )}

          {metadata.website && (
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30">
                <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <a
                href={metadata.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 truncate max-w-[220px]"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        {metadata.amenities && metadata.amenities.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Amenities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metadata.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={`${amenity}-${idx}`}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 text-xs rounded-full"
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

        {metadata.operatingHours && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Operating Hours
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
              {Object.entries(metadata.operatingHours)
                .filter(([, hours]) => Boolean(hours))
                .slice(0, 4)
                .map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between gap-3 capitalize">
                    <span className="font-medium text-gray-500 dark:text-gray-400">{day}</span>
                    <span>{hours}</span>
                  </div>
                ))}
            </div>
            {Object.keys(metadata.operatingHours).length > 4 && (
              <div className="text-xs text-gray-400">
                +{Object.keys(metadata.operatingHours).length - 4} more days
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHoverPopup;
