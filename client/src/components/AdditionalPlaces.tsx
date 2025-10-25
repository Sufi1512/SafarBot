import React, { useState, useMemo } from 'react';
import { Plus, Star, MapPin, Filter, Search, X } from 'lucide-react';
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
  enablePagination = true // Default to pagination for better performance
}) => {
  const [selectedPlace, setSelectedPlace] = useState<AdditionalPlace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const placesPerPage = 6; // 2 rows of 3 places each
  
  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Categories with counts - handle null/undefined additionalPlaces
  const safeAdditionalPlaces = additionalPlaces || {
    hotels: [],
    restaurants: [],
    cafes: [],
    attractions: [],
    interest_based: []
  };

  // Available categories with counts
  const categories = useMemo(() => {
    const cats = [
      { id: 'all', label: 'All Places', count: 0 },
      { id: 'hotels', label: 'Hotels', count: safeAdditionalPlaces.hotels?.length || 0 },
      { id: 'restaurants', label: 'Restaurants', count: safeAdditionalPlaces.restaurants?.length || 0 },
      { id: 'cafes', label: 'Cafes', count: safeAdditionalPlaces.cafes?.length || 0 },
      { id: 'attractions', label: 'Attractions', count: safeAdditionalPlaces.attractions?.length || 0 },
      { id: 'interest_based', label: 'Interest Based', count: safeAdditionalPlaces.interest_based?.length || 0 }
    ];
    
    // Calculate total count for 'all'
    cats[0].count = cats.slice(1).reduce((sum, cat) => sum + cat.count, 0);
    
    return cats;
  }, [safeAdditionalPlaces]);

  // Get filtered and searched places
  const filteredPlaces = useMemo(() => {
    let places: AdditionalPlace[] = [];
    
    // Get places based on selected category
    if (selectedCategory === 'all') {
      places = [
        ...(safeAdditionalPlaces.hotels || []),
        ...(safeAdditionalPlaces.restaurants || []),
        ...(safeAdditionalPlaces.cafes || []),
        ...(safeAdditionalPlaces.attractions || []),
        ...(safeAdditionalPlaces.interest_based || [])
      ];
    } else {
      places = safeAdditionalPlaces[selectedCategory as keyof typeof safeAdditionalPlaces] || [];
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      places = places.filter(place => {
        const title = (place.title || place.name || '').toLowerCase();
        const description = (place.description || '').toLowerCase();
        const address = (place.address || place.location || '').toLowerCase();
        const category = (place.category || '').toLowerCase();
        
        return title.includes(query) || 
               description.includes(query) || 
               address.includes(query) || 
               category.includes(query);
      });
    }
    
    return places;
  }, [selectedCategory, searchQuery, safeAdditionalPlaces]);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredPlaces.length / placesPerPage);
  const startIndex = (currentPage - 1) * placesPerPage;
  const endIndex = startIndex + placesPerPage;
  const paginatedPlaces = filteredPlaces.slice(startIndex, endIndex);
  
  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);
  

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
                loading="lazy"
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

  if (filteredPlaces.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'No Places Found' : 'No Additional Places Found'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'We couldn\'t find any additional places for this destination.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Additional Places to Explore</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Filter className="w-4 h-4" />
            <span>{filteredPlaces.length} places</span>
            {(searchQuery || selectedCategory !== 'all') && (
              <span className="text-blue-600">(filtered)</span>
            )}
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent w-36"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showFilters || selectedCategory !== 'all'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            Filter
          </button>
        </div>
      </div>
      
      {/* Category Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Places Grid - Optimized for 6 items (2 rows x 3 columns) */}
      <div className={enablePagination ? '' : 'max-h-96 overflow-y-auto'}>
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 ${!enablePagination ? 'pr-2' : ''}`}>
          {(enablePagination ? paginatedPlaces : filteredPlaces).map((place, index) => {
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
            Showing {startIndex + 1}-{Math.min(endIndex, filteredPlaces.length)} of {filteredPlaces.length} places
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
