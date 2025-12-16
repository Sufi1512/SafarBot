import React, { useState, useMemo } from 'react';
import GoogleMaps from '../components/GoogleMaps';
import { EnhancedItineraryResponse, PlaceDetails } from '../services/api';

// Location interface matching GoogleMaps component
interface Location {
  id: string;
  name: string;
  type: 'destination' | 'hotel' | 'restaurant' | 'activity';
  position: {
    lat: number;
    lng: number;
  };
  description?: string;
  rating?: number;
  price?: string | number;
  address?: string;
  website?: string;
  phone?: string;
  open_state?: string;
  hours?: any;
  thumbnail?: string;
}

const MapTestPage: React.FC = () => {
  const [testMode, setTestMode] = useState<'mock' | 'backend'>('mock');
  const [backendResponse, setBackendResponse] = useState<string>('');

  // Mock data for testing
  const mockData: EnhancedItineraryResponse = {
    itinerary: {
      destination: 'Mumbai',
      total_days: 3,
      daily_plans: []
    },
    place_details: {
      'place1': {
        title: 'Gateway of India',
        description: 'Historic monument and major tourist attraction',
        address: 'Apollo Bandar, Colaba, Mumbai',
        rating: 4.5,
        category: 'attraction',
        gps_coordinates: {
          latitude: 18.9220,
          longitude: 72.8347
        },
        thumbnail: 'https://via.placeholder.com/300x200?text=Gateway+of+India'
      } as PlaceDetails,
      'place2': {
        title: 'Taj Mahal Palace Hotel',
        description: 'Luxury hotel near Gateway of India',
        address: 'Apollo Bunder, Mumbai',
        rating: 4.8,
        category: 'hotel',
        price_range: '$$$$',
        gps_coordinates: {
          latitude: 18.9217,
          longitude: 72.8331
        },
        thumbnail: 'https://via.placeholder.com/300x200?text=Taj+Hotel'
      } as PlaceDetails,
      'place3': {
        title: 'Leopold Cafe',
        description: 'Famous restaurant in Colaba',
        address: 'Colaba Causeway, Mumbai',
        rating: 4.2,
        category: 'restaurant',
        price_range: '$$',
        gps_coordinates: {
          latitude: 18.9175,
          longitude: 72.8316
        },
        thumbnail: 'https://via.placeholder.com/300x200?text=Leopold+Cafe'
      } as PlaceDetails,
      'place4': {
        title: 'Marine Drive',
        description: 'Beautiful waterfront promenade',
        address: 'Marine Drive, Mumbai',
        rating: 4.6,
        category: 'attraction',
        gps_coordinates: {
          latitude: 18.9449,
          longitude: 72.8249
        }
      } as PlaceDetails,
      'place5': {
        title: 'JW Marriott Mumbai',
        description: '5-star luxury hotel',
        address: 'Juhu Beach, Mumbai',
        rating: 4.7,
        category: 'hotel',
        price_range: '$$$$',
        gps_coordinates: {
          latitude: 19.0989,
          longitude: 72.8266
        }
      } as PlaceDetails
    }
  };

  // Helper function to extract locations from backend response format
  const extractLocationsFromResponse = (response: EnhancedItineraryResponse): Location[] => {
    const locations: Location[] = [];

    // Get destination coordinates
    const getDestinationCoordinates = (destination: string) => {
      const cityCoordinates: Record<string, { lat: number; lng: number }> = {
        'mumbai': { lat: 19.0760, lng: 72.8777 },
        'delhi': { lat: 28.7041, lng: 77.1025 },
        'bangalore': { lat: 12.9716, lng: 77.5946 },
        'new york': { lat: 40.7128, lng: -74.0060 },
        'london': { lat: 51.5074, lng: -0.1278 },
        'paris': { lat: 48.8566, lng: 2.3522 },
        'tokyo': { lat: 35.6762, lng: 139.6503 },
        'dubai': { lat: 25.2048, lng: 55.2708 },
        'singapore': { lat: 1.3521, lng: 103.8198 }
      };
      return cityCoordinates[destination.toLowerCase().trim()] || { lat: 19.0760, lng: 72.8777 };
    };

    const destination = response.itinerary?.destination;
    const defaultCoordinates = destination ? getDestinationCoordinates(destination) : { lat: 19.0760, lng: 72.8777 };

    // Add destination marker
    if (destination) {
      locations.push({
        id: 'destination',
        name: destination,
        type: 'destination',
        position: defaultCoordinates,
        description: 'Your travel destination'
      });
    }

    // Add places from place_details
    if (response.place_details) {
      Object.entries(response.place_details).forEach(([placeId, placeDetails], index) => {
        if (!placeDetails.title || !placeDetails.title.trim()) {
          return;
        }

        // Get coordinates
        let position = defaultCoordinates;
        
        if (placeDetails.gps_coordinates && 
            typeof placeDetails.gps_coordinates.latitude === 'number' && 
            typeof placeDetails.gps_coordinates.longitude === 'number') {
          position = {
            lat: placeDetails.gps_coordinates.latitude,
            lng: placeDetails.gps_coordinates.longitude
          };
        } else if ((placeDetails as any).coordinates && 
                   typeof (placeDetails as any).coordinates.lat === 'number' && 
                   typeof (placeDetails as any).coordinates.lng === 'number') {
          position = {
            lat: (placeDetails as any).coordinates.lat,
            lng: (placeDetails as any).coordinates.lng
          };
        } else {
          // Fallback with offset
          position = {
            lat: defaultCoordinates.lat + (index * 0.01),
            lng: defaultCoordinates.lng + (index * 0.01)
          };
        }

        // Validate coordinates
        if (isNaN(position.lat) || isNaN(position.lng) || 
            Math.abs(position.lat) > 90 || Math.abs(position.lng) > 180) {
          return;
        }

        // Determine place type from category
        let placeType: 'hotel' | 'restaurant' | 'activity' = 'activity';
        if (placeDetails.category) {
          const categoryLower = placeDetails.category.toLowerCase();
          if (categoryLower.includes('hotel') || categoryLower.includes('lodging')) {
            placeType = 'hotel';
          } else if (categoryLower.includes('restaurant') || 
                     categoryLower.includes('cafe') || 
                     categoryLower.includes('food')) {
            placeType = 'restaurant';
          }
        }

        locations.push({
          id: placeId,
          name: placeDetails.title,
          type: placeType,
          position,
          description: placeDetails.description || placeDetails.address,
          rating: placeDetails.rating,
          price: placeDetails.price_range || (placeDetails as any).price,
          address: placeDetails.address,
          website: placeDetails.website,
          phone: (placeDetails as any).phone,
          open_state: (placeDetails as any).open_state,
          hours: placeDetails.hours || (placeDetails as any).operating_hours,
          thumbnail: placeDetails.thumbnail || placeDetails.serpapi_thumbnail
        });
      });
    }

    // Add places from additional_places
    if (response.additional_places) {
      const additionalPlaces = [
        ...(response.additional_places.hotels || []),
        ...(response.additional_places.restaurants || []),
        ...(response.additional_places.attractions || []),
        ...(response.additional_places.cafes || []),
        ...(response.additional_places.interest_based || [])
      ];

      additionalPlaces.forEach((place, index) => {
        if (!place.title && !place.name) return;

        let position = defaultCoordinates;
        
        if (place.gps_coordinates) {
          position = {
            lat: place.gps_coordinates.latitude,
            lng: place.gps_coordinates.longitude
          };
        } else if (place.coordinates) {
          position = {
            lat: place.coordinates.lat,
            lng: place.coordinates.lng
          };
        } else {
          position = {
            lat: defaultCoordinates.lat + (index * 0.01),
            lng: defaultCoordinates.lng + (index * 0.01)
          };
        }

        if (isNaN(position.lat) || isNaN(position.lng) || 
            Math.abs(position.lat) > 90 || Math.abs(position.lng) > 180) {
          return;
        }

        let placeType: 'hotel' | 'restaurant' | 'activity' = 'activity';
        if (place.category) {
          const categoryLower = place.category.toLowerCase();
          if (categoryLower.includes('hotel') || categoryLower.includes('lodging')) {
            placeType = 'hotel';
          } else if (categoryLower.includes('restaurant') || 
                     categoryLower.includes('cafe') || 
                     categoryLower.includes('food')) {
            placeType = 'restaurant';
          }
        }

        locations.push({
          id: `additional-${index}`,
          name: place.title || place.name || 'Unknown Place',
          type: placeType,
          position,
          description: place.description || place.address,
          rating: place.rating,
          price: place.price_range || place.price,
          thumbnail: place.thumbnail || place.serpapi_thumbnail
        });
      });
    }

    return locations;
  };

  // Parse backend response JSON
  const parsedBackendResponse = useMemo(() => {
    if (testMode === 'backend' && backendResponse) {
      try {
        return JSON.parse(backendResponse) as EnhancedItineraryResponse;
      } catch (error) {
        console.error('Error parsing backend response:', error);
        return null;
      }
    }
    return null;
  }, [backendResponse, testMode]);

  // Get locations based on test mode
  const locations = useMemo(() => {
    if (testMode === 'mock') {
      return extractLocationsFromResponse(mockData);
    } else if (testMode === 'backend' && parsedBackendResponse) {
      return extractLocationsFromResponse(parsedBackendResponse);
    }
    return [];
  }, [testMode, parsedBackendResponse]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🗺️ Map Component Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Test the Google Maps component with Advanced Markers and clustering
          </p>

          {/* Test Mode Selector */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setTestMode('mock')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                testMode === 'mock'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Use Mock Data
            </button>
            <button
              onClick={() => setTestMode('backend')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                testMode === 'backend'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Use Backend Response
            </button>
          </div>

          {/* Backend Response Input */}
          {testMode === 'backend' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste Backend Response JSON:
              </label>
              <textarea
                value={backendResponse}
                onChange={(e) => setBackendResponse(e.target.value)}
                placeholder='{"itinerary": {"destination": "Mumbai"}, "place_details": {...}}'
                className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {parsedBackendResponse && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  ✓ Valid JSON parsed successfully
                </p>
              )}
              {backendResponse && !parsedBackendResponse && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  ✗ Invalid JSON. Please check your input.
                </p>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {locations.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Locations</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {locations.filter(l => l.type === 'destination').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Destinations</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {locations.filter(l => l.type === 'hotel').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hotels</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {locations.filter(l => l.type === 'restaurant').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Restaurants</div>
            </div>
          </div>

          {/* Location List */}
          {locations.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Locations ({locations.length}):
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                  >
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      loc.type === 'destination' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      loc.type === 'hotel' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      loc.type === 'restaurant' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {loc.type}
                    </span>
                    <span className="text-gray-900 dark:text-white">{loc.name}</span>
                    {loc.rating && (
                      <span className="text-gray-500 dark:text-gray-400">
                        ⭐ {loc.rating}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Interactive Map
          </h2>
          <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {locations.length > 0 ? (
              <GoogleMaps locations={locations} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                {testMode === 'backend' 
                  ? 'Paste backend response JSON to see locations on map'
                  : 'No locations to display'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTestPage;

