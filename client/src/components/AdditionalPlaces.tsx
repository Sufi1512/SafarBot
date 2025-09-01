import React, { useState } from 'react';
import { Plus, Star, MapPin, Filter } from 'lucide-react';
import { PlaceDetails, AdditionalPlace } from '../services/api';
import PlaceDetailsModal from './PlaceDetailsModal';

interface AdditionalPlacesProps {
  additionalPlaces: {
    hotels: AdditionalPlace[];
    restaurants: AdditionalPlace[];
    cafes: AdditionalPlace[];
    attractions: AdditionalPlace[];
    interest_based: PlaceDetails[];
  };
  onAddToItinerary?: (place: PlaceDetails | AdditionalPlace) => void;
}

const AdditionalPlaces: React.FC<AdditionalPlacesProps> = ({
  additionalPlaces,
  onAddToItinerary
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | AdditionalPlace | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Categories with counts
  const categories = [
    { key: 'all', label: 'All Places', count: Object.values(additionalPlaces).flat().length },
    { key: 'hotels', label: 'Hotels', count: additionalPlaces.hotels.length },
    { key: 'restaurants', label: 'Restaurants', count: additionalPlaces.restaurants.length },
    { key: 'cafes', label: 'Cafes', count: additionalPlaces.cafes.length },
    { key: 'attractions', label: 'Attractions', count: additionalPlaces.attractions.length },
    { key: 'interest_based', label: 'Interest-Based', count: additionalPlaces.interest_based.length }
  ];

  // Get places for current category
  const getCurrentPlaces = (): (PlaceDetails | AdditionalPlace)[] => {
    if (activeCategory === 'all') {
      return [
        ...additionalPlaces.hotels,
        ...additionalPlaces.restaurants,
        ...additionalPlaces.cafes,
        ...additionalPlaces.attractions,
        ...additionalPlaces.interest_based
      ];
    }
    return additionalPlaces[activeCategory as keyof typeof additionalPlaces] || [];
  };

  const currentPlaces = getCurrentPlaces();

  const handlePlaceClick = (place: PlaceDetails | AdditionalPlace) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleAddToItinerary = (place: PlaceDetails | AdditionalPlace) => {
    if (onAddToItinerary) {
      onAddToItinerary(place);
    }
    setIsModalOpen(false);
  };

  // Helper function to check if place is PlaceDetails type
  const isPlaceDetails = (place: PlaceDetails | AdditionalPlace): place is PlaceDetails => {
    return 'title' in place;
  };

  const PlaceCard: React.FC<{ place: PlaceDetails | AdditionalPlace }> = ({ place }) => {
    const placeTitle = isPlaceDetails(place) ? place.title : place.name;
    const placeRating = place.rating;
    const placeAddress = isPlaceDetails(place) ? place.address : place.location;
    const placeCategory = place.category;
    const placeThumbnail = isPlaceDetails(place) ? (place.thumbnail || place.serpapi_thumbnail) : undefined;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
        <div onClick={() => handlePlaceClick(place)} className="p-4">
          {/* Image */}
          {placeThumbnail && (
            <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
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
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{placeTitle}</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                {placeCategory}
              </span>
            </div>

            {placeRating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">{placeRating}</span>
                {isPlaceDetails(place) && place.reviews && (
                  <span className="text-xs text-gray-500">({place.reviews})</span>
                )}
              </div>
            )}

            {placeAddress && (
              <div className="flex items-start gap-1">
                <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 line-clamp-2">{placeAddress}</p>
              </div>
            )}

            {place.description && (
              <p className="text-xs text-gray-600 line-clamp-2">{place.description}</p>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="px-4 pb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToItinerary) {
                onAddToItinerary(place);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
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

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentPlaces.map((place, index) => {
          const placeId = isPlaceDetails(place) ? place.place_id : place.place_id;
          return (
            <PlaceCard
              key={`${placeId}-${index}`}
              place={place}
            />
          );
        })}
      </div>

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
