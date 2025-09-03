import React from 'react';
import { X, Star, MapPin, Phone, Globe, Clock, Plus } from 'lucide-react';
import { AdditionalPlace } from '../services/api';

interface PlaceDetailsModalProps {
  place: AdditionalPlace | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToItinerary?: (place: AdditionalPlace) => void;
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

  // Metadata mapping for AdditionalPlace type (raw SERP data)
  const getPlaceMetadata = () => {
    const metadata = {
      title: place.title || place.name || 'Unknown Place',
      rating: place.rating,
      address: place.address || place.location || 'Location not specified',
      phone: place.phone,
      website: place.website,
      hours: place.hours,
      description: place.description,
      category: place.category,
      thumbnail: place.thumbnail || place.serpapi_thumbnail,
      price: place.price_range,
      cuisine: place.cuisine,
      amenities: place.amenities,
      coordinates: place.gps_coordinates || place.coordinates
    };
    return metadata;
  };

  const metadata = getPlaceMetadata();

  // Get coordinates for map link
  const getMapUrl = () => {
    if (metadata.coordinates && 'lat' in metadata.coordinates) {
      const { lat, lng } = metadata.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(metadata.title + ' ' + (metadata.address || ''))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl max-h-[90vh] overflow-y-auto m-4 w-full shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{metadata.title}</h2>
            {metadata.rating && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold text-gray-900 dark:text-white">{metadata.rating}</span>
                </div>
              </div>
            )}
            <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {metadata.category}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          {metadata.thumbnail && (
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src={metadata.thumbnail}
                alt={metadata.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '1';
                }}
                style={{ opacity: 0 }}
              />
            </div>
          )}

          {/* Description */}
          {metadata.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
              <p className="text-gray-700 dark:text-gray-300">{metadata.description}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metadata.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Address</p>
                  <p className="text-gray-700 dark:text-gray-300">{metadata.address}</p>
                  <a
                    href={getMapUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>
            )}

            {metadata.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                  <a href={`tel:${metadata.phone}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    {metadata.phone}
                  </a>
                </div>
              </div>
            )}

            {metadata.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Website</p>
                  <a
                    href={metadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all transition-colors"
                  >
                    Visit Website →
                  </a>
                </div>
              </div>
            )}

            {metadata.hours && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Hours</p>
                  <p className="text-gray-700 dark:text-gray-300">{metadata.hours}</p>
                </div>
              </div>
            )}
          </div>

          {/* Operating Hours (if detailed schedule available) */}
          {place.operating_hours && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Operating Hours</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(place.operating_hours)
                  .filter(([, hours]) => hours)
                  .map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-1">
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{day}</span>
                      <span className="text-gray-700 dark:text-gray-300">{String(hours)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Additional amenities for hotels */}
          {metadata.amenities && metadata.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {metadata.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          {metadata.price && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Price Range</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {metadata.price}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {place.place_id && (
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
