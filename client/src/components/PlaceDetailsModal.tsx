import React from 'react';
import { X, Star, MapPin, Phone, Globe, Clock, Plus } from 'lucide-react';
import { PlaceDetails, AdditionalPlace } from '../services/api';

interface PlaceDetailsModalProps {
  place: PlaceDetails | AdditionalPlace | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToItinerary?: (place: PlaceDetails | AdditionalPlace) => void;
  showAddButton?: boolean;
}

const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  place,
  isOpen,
  onClose,
  onAddToItinerary,
  showAddButton = false
}) => {
  if (!isOpen || !place) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto m-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{placeTitle}</h2>
            {placeRating && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold text-gray-900">{placeRating}</span>
                </div>
                {isPlaceDetails(place) && place.reviews && (
                  <span className="text-gray-600">({place.reviews} reviews)</span>
                )}
              </div>
            )}
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {placeCategory}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          {placeThumbnail && (
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
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

          {/* Description */}
          {placeDescription && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700">{placeDescription}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placeAddress && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-700">{placeAddress}</p>
                  <a
                    href={getMapUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>
            )}

            {placePhone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <a href={`tel:${placePhone}`} className="text-blue-600 hover:text-blue-800">
                    {placePhone}
                  </a>
                </div>
              </div>
            )}

            {placeWebsite && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Website</p>
                  <a
                    href={placeWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            )}

            {placeHours && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Hours</p>
                  <p className="text-gray-700">{placeHours}</p>
                </div>
              </div>
            )}
          </div>

          {/* Operating Hours (if detailed schedule available) */}
          {isPlaceDetails(place) && place.operating_hours && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Operating Hours</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(place.operating_hours).map(([day, hours]) => (
                  hours && (
                    <div key={day} className="flex justify-between py-1">
                      <span className="font-medium text-gray-900 capitalize">{day}</span>
                      <span className="text-gray-700">{hours}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Additional amenities for hotels */}
          {!isPlaceDetails(place) && place.amenities && place.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {place.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          {((!isPlaceDetails(place) && place.price_range) || (isPlaceDetails(place) && place.price)) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Range</h3>
              <p className="text-gray-700">
                {(!isPlaceDetails(place) && place.price_range) || (isPlaceDetails(place) && place.price)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {isPlaceDetails(place) && place.place_id && (
              <span>ID: {place.place_id}</span>
            )}
          </div>
          <div className="flex gap-3">
            {showAddButton && onAddToItinerary && (
              <button
                onClick={() => onAddToItinerary(place)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add to Itinerary
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailsModal;
