import React, { useState } from 'react';
import { Plus, Star, MapPin, Filter } from 'lucide-react';
import { AdditionalPlace } from '../services/api';
import PlaceDetailsModal from './PlaceDetailsModal';

interface AdditionalPlacesProps {
  additionalPlaces: {
    hotels: AdditionalPlace[];
    restaurants: AdditionalPlace[];
    cafes: AdditionalPlace[];
    attractions: AdditionalPlace[];
    interest_based: AdditionalPlace[];
  };
  onAddToItinerary?: (place: AdditionalPlace) => void;
  onPlaceHover?: (e: React.MouseEvent, place: AdditionalPlace, type: 'hotel' | 'restaurant' | 'attraction') => void;
  onPlaceHoverLeave?: () => void;
  enablePagination?: boolean; // New prop to control pagination vs scroll
}

const AdditionalPlaces: React.FC<AdditionalPlacesProps> = ({
  additionalPlaces,
  onAddToItinerary,
  onPlaceHover,
  onPlaceHoverLeave,
  enablePagination = false // Default to scrollable behavior
}) => {
  const [selectedPlace, setSelectedPlace] = useState<AdditionalPlace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state (only used when enablePagination is true)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const placesPerPage = 6; // 2 rows of 3 places each

  // Categories with counts - handle null/undefined additionalPlaces
  const safeAdditionalPlaces = additionalPlaces || {
    hotels: [],
    restaurants: [],
    cafes: [],
    attractions: [],
    interest_based: []
  };
  

  // Get all places (no category filtering)
  const getCurrentPlaces = (): AdditionalPlace[] => {
    return [
      ...(safeAdditionalPlaces.hotels || []),
      ...(safeAdditionalPlaces.restaurants || []),
      ...(safeAdditionalPlaces.cafes || []),
      ...(safeAdditionalPlaces.attractions || []),
      ...(safeAdditionalPlaces.interest_based || [])
    ];
  };

  const currentPlaces = getCurrentPlaces();
  
  // Pagination logic (only used when enablePagination is true)
  const totalPages = Math.ceil(currentPlaces.length / placesPerPage);
  const startIndex = (currentPage - 1) * placesPerPage;
  const endIndex = startIndex + placesPerPage;
  const paginatedPlaces = currentPlaces.slice(startIndex, endIndex);
  

  const handlePlaceClick = (place: AdditionalPlace) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleAddToItinerary = (place: AdditionalPlace) => {
    if (onAddToItinerary) {
      onAddToItinerary(place);
    }
    setIsModalOpen(false);
  };

  // All places are now AdditionalPlace type

  const PlaceCard: React.FC<{ place: AdditionalPlace }> = ({ place }) => {
    // Handle both 'title' (SERP API) and 'name' (legacy) fields
    const placeTitle = place.title || place.name || 'Unknown Place';
    const placeRating = place.rating;
    const placeAddress = place.address || place.location || 'Location not specified';
    const placeCategory = place.category;
    // Photo detection for AdditionalPlace - prioritize high-res image
    const placeThumbnail = place.high_res_image || place.thumbnail || place.serpapi_thumbnail;
    
    // Debug photo sources in development
    if (process.env.NODE_ENV === 'development' && !placeThumbnail) {
      console.log('No photo found for place:', {
        title: place.title,
        name: place.name,
        category: place.category,
        availableFields: Object.keys(place),
        hasThumbnail: !!place.thumbnail,
        hasSerpapiThumbnail: !!place.serpapi_thumbnail
      });
    }

    // Determine place type for hover
    const getPlaceType = (): 'hotel' | 'restaurant' | 'attraction' => {
      const category = placeCategory?.toLowerCase() || '';
      if (category.includes('hotel') || category.includes('accommodation')) return 'hotel';
      if (category.includes('restaurant') || category.includes('food') || category.includes('cafe')) return 'restaurant';
      return 'attraction';
    };

    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer"
        onMouseEnter={(e) => onPlaceHover?.(e, place, getPlaceType())}
        onMouseLeave={onPlaceHoverLeave}
      >
        <div onClick={() => handlePlaceClick(place)} className="p-3">
          {/* Image Section */}
          {placeThumbnail ? (
            <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 overflow-hidden relative">
              <img
                src={placeThumbnail}
                alt={placeTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('Image failed to load:', placeThumbnail);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log('Image loaded successfully:', placeThumbnail);
                  (e.target as HTMLImageElement).style.opacity = '1';
                }}
                style={{ opacity: 0 }}
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            // Placeholder when no photo is available
            <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-1">📷</div>
                <div className="text-xs">No Photo</div>
              </div>
            </div>
          )}

          {/* Content - Compact design */}
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-medium text-gray-900 text-xs line-clamp-2 flex-1">{placeTitle}</h3>
            </div>

            {placeRating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs font-medium text-gray-900">{placeRating}</span>
                {/* Reviews not available for AdditionalPlace type */}
              </div>
            )}

            {placeAddress && (
              <div className="flex items-start gap-1">
                <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 line-clamp-1">{placeAddress}</p>
              </div>
            )}

            {place.description && (
              <p className="text-xs text-gray-600 line-clamp-1">{place.description}</p>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="px-3 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToItinerary) {
                onAddToItinerary(place);
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs"
          >
            <Plus className="w-3 h-3" />
            Add to Itinerary
          </button>
        </div>
      </div>
    );
  };

  if (currentPlaces.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Additional Places Found</h3>
          <p className="text-gray-600">We couldn't find any additional places for this destination.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Additional Places to Explore</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>{currentPlaces.length} places</span>
        </div>
      </div>


      {/* Places Grid - Conditional scroll or pagination */}
      <div className={enablePagination ? '' : 'max-h-96 overflow-y-auto'}>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${!enablePagination ? 'pr-2' : ''}`}>
          {(enablePagination ? paginatedPlaces : currentPlaces).map((place, index) => {
            const placeId = place.place_id;
            return (
              <PlaceCard
                key={`${placeId}-${index}`}
                place={place}
              />
            );
          })}
        </div>
      </div>
      
      {/* Pagination Controls (only when enablePagination is true) */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, currentPlaces.length)} of {currentPlaces.length} places
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {(() => {
                const pages = [];
                const showEllipsis = totalPages > 7;
                
                if (!showEllipsis) {
                  // Show all pages if 7 or fewer
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-2.5 py-1 text-sm font-medium rounded-lg ${
                          currentPage === i
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                } else {
                  // Smart pagination: first 3, ..., last 3
                  const firstPages = [1, 2, 3];
                  const lastPages = [totalPages - 2, totalPages - 1, totalPages];
                  
                  // First 3 pages
                  firstPages.forEach(page => {
                    pages.push(
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2.5 py-1 text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                  
                  // Always show ellipsis if there's a gap between first 3 and last 3
                  if (totalPages > 6) {
                    pages.push(
                      <span key="ellipsis" className="px-2 text-gray-400">...</span>
                    );
                  }
                  
                  // Last 3 pages (only if not overlapping with first 3)
                  if (totalPages > 6) {
                    lastPages.forEach(page => {
                      if (page > 3) { // Avoid duplicates
                        pages.push(
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2.5 py-1 text-sm font-medium rounded-lg ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    });
                  }
                }
                
                return pages;
              })()}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Place Details Modal */}
      <PlaceDetailsModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToItinerary={handleAddToItinerary}
        showAddButton={true}
      />
    </div>
  );
};

export default AdditionalPlaces;
