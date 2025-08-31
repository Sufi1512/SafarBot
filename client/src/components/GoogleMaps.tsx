import React, { useCallback, useRef, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

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
}

interface GoogleMapsProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minWidth: '100%',
  minHeight: '100%'
};

const defaultCenter = {
  lat: 19.0760, // Mumbai default
  lng: 72.8777
};

const defaultZoom = 12;

// Mumbai coordinates for fallback
const MUMBAI_COORDS = { lat: 19.0760, lng: 72.8777 };

const GoogleMaps: React.FC<GoogleMapsProps> = ({ 
  locations, 
  center = defaultCenter, 
  zoom = defaultZoom 
}) => {
  console.log('GoogleMaps component received locations:', locations);
  console.log('Locations length:', locations.length);
  
  // Calculate center based on available locations
  const mapCenter = locations.length > 0 ? 
    {
      lat: locations.reduce((sum, loc) => sum + loc.position.lat, 0) / locations.length,
      lng: locations.reduce((sum, loc) => sum + loc.position.lng, 0) / locations.length
    } : center;
  
  console.log('Map center calculated:', mapCenter);
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const hoverCloseTimer = useRef<NodeJS.Timeout | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCQjfB44UVroNAtmoxk-Fjlm9ssqYvHjow',
    libraries: ['places']
  });
  
  console.log('Google Maps API status:', { isLoaded, loadError });
  console.log('Google Maps API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'Using fallback key');

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Google Map loaded successfully');
    setMap(map);
    
    // Fit bounds to show all markers if there are locations
    if (locations.length > 0) {
      console.log('Fitting bounds for', locations.length, 'locations');
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(location => {
        console.log('Adding location to bounds:', location.name, location.position);
        bounds.extend(location.position);
      });
      
      // Add some padding to the bounds
      map.fitBounds(bounds);
      
      // If only one location, zoom in a bit
      if (locations.length === 1) {
        map.setZoom(14);
      }
      
      console.log('Map bounds set successfully');
    } else {
      console.log('No locations to fit bounds for');
    }
  }, [locations]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Refit bounds whenever locations change after map is ready
  React.useEffect(() => {
    if (!map || locations.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    locations.forEach(l => bounds.extend(l.position));
    map.fitBounds(bounds);
    if (locations.length === 1) map.setZoom(14);
  }, [map, locations]);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return '🏛️';
      case 'hotel':
        return '🏨';
      case 'restaurant':
        return '🍽️';
      case 'activity':
        return '🎯';
      default:
        return '📍';
    }
  };

  const getMarkerColorHex = (type: string) => {
    switch (type) {
      case 'destination':
        return '#2563EB'; // blue-600
      case 'hotel':
        return '#10B981'; // emerald-500
      case 'restaurant':
        return '#F59E0B'; // amber-500
      case 'activity':
        return '#A855F7'; // purple-500
      default:
        return '#EF4444'; // red-500
    }
  };

  // Track how many markers share the same lat/lng to slightly offset them
  const positionCountRef = useRef<Record<string, number>>({});
  React.useEffect(() => {
    positionCountRef.current = {};
  }, [locations]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center p-6">
          <div className="text-red-500 text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Google Maps Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load Google Maps</p>
          
          {loadError.message.includes('ApiNotActivatedMapError') ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">🔧 Fix Required:</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Enable <strong>Maps JavaScript API</strong> in Google Cloud Console</li>
                <li>• Enable <strong>Places API</strong> in Google Cloud Console</li>
                <li>• Wait 5-10 minutes for activation</li>
                <li>• Ensure billing is enabled</li>
              </ul>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">🔑 Check:</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• API key is correct</li>
                <li>• APIs are enabled</li>
                <li>• Billing is set up</li>
              </ul>
            </div>
          )}
          
          <a 
            href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go to Google Cloud Console
          </a>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Maps...</p>
        </div>
      </div>
    );
  }

  // If no locations, show a message
  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">🗺️</div>
          <p className="text-gray-600 dark:text-gray-400">No locations available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Locations will appear as you generate your itinerary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full min-h-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {locations.map((location) => {
          console.log('Rendering marker for:', location.name, 'at position:', location.position);
          
          // Use vector circle symbol to avoid external icon issues
          const markerIcon: google.maps.Symbol = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getMarkerColorHex(location.type),
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 1,
            scale: 7
          };

          // Slightly offset overlapping markers so they are all visible
          const key = `${location.position.lat.toFixed(5)},${location.position.lng.toFixed(5)}`;
          const seenCount = positionCountRef.current[key] || 0;
          positionCountRef.current[key] = seenCount + 1;
          const offsetStep = 0.0005; // ~55 meters
          const offsetLat = location.position.lat + seenCount * offsetStep;
          const offsetLng = location.position.lng + seenCount * offsetStep;
          const positionWithOffset = { lat: offsetLat, lng: offsetLng };
          
          return (
            <Marker
              key={location.id}
              position={positionWithOffset}
              onClick={() => {
                console.log('Marker clicked:', location.name);
                setSelectedLocation(location);
              }}
              onMouseOver={() => {
                if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
                setSelectedLocation(location);
              }}
              onMouseOut={() => {
                if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
                hoverCloseTimer.current = setTimeout(() => setSelectedLocation(null), 250);
              }}
              icon={markerIcon}
              zIndex={location.type === 'destination' ? 1000 : location.type === 'hotel' ? 900 : location.type === 'restaurant' ? 800 : 700}
              title={location.name}
              // Add animation to make markers more visible
              animation={google.maps.Animation.DROP}
            />
          );
        })}
        
        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.position}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="p-2 min-w-[220px]">
              <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">{selectedLocation.type}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{selectedLocation.name}</h3>
              <div className="flex items-center gap-3 text-sm mb-2">
                {selectedLocation.rating && (
                  <div className="flex items-center gap-1 text-amber-500"><span>⭐</span><span>{selectedLocation.rating}</span></div>
                )}
                {selectedLocation.price && (
                  <div className="text-green-600">{typeof selectedLocation.price === 'number' ? `$${selectedLocation.price}` : selectedLocation.price}</div>
                )}
              </div>
              {selectedLocation.description && (
                <div className="text-xs text-gray-600">{selectedLocation.description}</div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Hotels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Restaurants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Activities</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMaps;
