import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { GOOGLE_MAPS_MAP_ID } from '../config/googleMapsConfig';

interface Location {
  id: string; // this should be place_id if coming from Places API
  name: string;
  type: 'destination' | 'hotel' | 'restaurant' | 'activity';
  position: {
    lat: number;
    lng: number;
  };
  description?: string;
  rating?: number;
  price?: string | number;
  // Extended metadata (optional)
  address?: string;
  website?: string;
  phone?: string;
  open_state?: string;
  hours?: any;
  thumbnail?: string;
}

interface GoogleMapsProps {
  locations: Location[];
  hoveredLocationId?: string | null; // ID of location being hovered from external source (e.g., itinerary cards)
  onLocationHover?: (locationId: string | null) => void; // Callback when location is hovered on map
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

// Calculate center from locations
const calculateCenter = (locations: Location[]) => {
  if (locations.length === 0) return defaultCenter;
  
  // Find destination or use first location as center
  const destination = locations.find(loc => loc.type === 'destination');
  if (destination) {
    return destination.position;
  }
  
  // Use first location as center
  return locations[0].position;
};

const defaultZoom = 12;

// Get marker color based on type
const getMarkerColor = (type: string): string => {
  const iconColors: Record<string, string> = {
    destination: '#FF0000', // Red
    hotel: '#4285F4', // Blue
    restaurant: '#34A853', // Green
    activity: '#FBBC05' // Yellow
  };
  return iconColors[type] || '#FF0000';
};

// Get unique emoji icon based on type
const getMarkerIcon = (type: string): string => {
  const icons: Record<string, string> = {
    destination: '🎯', // Target/bullseye for destination
    hotel: '🏨', // Hotel icon
    restaurant: '🍽️', // Restaurant/food icon
    activity: '🎢' // Activity/entertainment icon
  };
  return icons[type] || '📍';
};


// Component for rendering markers with clustering
const LocationMarkers: React.FC<{ 
  locations: Location[]; 
  onMarkerClick: (location: Location) => void;
  hoveredLocationId: string | null;
  onMarkerHover: (locationId: string | null) => void;
}> = ({ 
  locations, 
  onMarkerClick,
  hoveredLocationId,
  onMarkerHover
}) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{[key: string]: Marker}>({});
  const clusterer = useRef<MarkerClusterer | null>(null);

  // Initialize MarkerClusterer
  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  // Update markers when the markers list changes
  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string): void => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers(prev => {
      if (marker) {
        return {...prev, [key]: marker};
      } else {
        const newMarkers = {...prev};
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  const validLocations = locations.filter(
    (loc) =>
      loc &&
      loc.position &&
      !isNaN(loc.position.lat) &&
      !isNaN(loc.position.lng) &&
      loc.position.lat !== 0 &&
      loc.position.lng !== 0 &&
      Math.abs(loc.position.lat) <= 90 &&
      Math.abs(loc.position.lng) <= 180
  );

  return (
    <>
      {validLocations.map((location, index) => {
        const locationId = location.id || `marker-${index}`;
        const isHovered = hoveredLocationId === locationId;
        
        return (
          <AdvancedMarker
            key={locationId}
            position={location.position}
            onClick={() => onMarkerClick(location)}
            onMouseEnter={() => onMarkerHover(locationId)}
            onMouseLeave={() => onMarkerHover(null)}
            ref={marker => setMarkerRef(marker, locationId)}
            title={location.name}
          >
            <div
              style={{
                transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                zIndex: isHovered ? 1000 : 1,
              }}
            >
              {/* Outer glow/halo on hover */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: getMarkerColor(location.type),
                    opacity: 0.3,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              )}
              {/* Custom marker icon */}
              <div
                style={{
                  backgroundColor: getMarkerColor(location.type),
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `3px solid ${isHovered ? '#FFFFFF' : getMarkerColor(location.type)}`,
                  boxShadow: isHovered 
                    ? `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 4px ${getMarkerColor(location.type)}40`
                    : '0 4px 12px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  fontSize: '24px',
                }}
              >
                <span style={{ 
                  filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}>
                  {getMarkerIcon(location.type)}
                </span>
              </div>
              {/* Bottom pointer/shadow */}
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderTop: `16px solid ${getMarkerColor(location.type)}`,
                  filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
          </AdvancedMarker>
        );
      })}
      {/* Add CSS animation for pulse effect */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.15;
          }
        }
      `}</style>
    </>
  );
};

// Component to fetch place details - must be inside Map component to access map instance
const PlaceDetailsFetcher: React.FC<{ 
  location: Location | null;
  onPlaceDetailsFetched: (location: Location, photos: string[]) => void;
}> = ({ location, onPlaceDetailsFetched }) => {
  const map = useMap();

  useEffect(() => {
    if (!location || !map || !location.id) return;

    const service = new google.maps.places.PlacesService(map);
    service.getDetails(
      {
        placeId: location.id,
        fields: ['name', 'photos', 'rating', 'formatted_address']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const updatedLocation: Location = {
            ...location,
            description: place.formatted_address || location.description,
            rating: place.rating || location.rating
          };

          const photos = place.photos
            ? place.photos.map((p) => p.getUrl({ maxWidth: 300, maxHeight: 200 }))
            : [];

          onPlaceDetailsFetched(updatedLocation, photos);
        }
      }
    );
  }, [location, map, onPlaceDetailsFetched]);

  return null;
};

// Component to handle map fitting - must be inside Map component
const MapController: React.FC<{ locations: Location[] }> = ({ locations }) => {
  const map = useMap();

  const fitToLocations = useCallback((mapInstance: google.maps.Map, locs: Location[]) => {
    const validLocations = locs.filter(
      (loc) =>
        loc &&
        loc.position &&
        !isNaN(loc.position.lat) &&
        !isNaN(loc.position.lng) &&
        loc.position.lat !== 0 &&
        loc.position.lng !== 0 &&
        Math.abs(loc.position.lat) <= 90 &&
        Math.abs(loc.position.lng) <= 180
    );

    if (validLocations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      validLocations.forEach((location) => {
        bounds.extend(location.position);
      });
      
      // Add some padding to the bounds
      mapInstance.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      
      // Set appropriate zoom level based on number of locations
      setTimeout(() => {
        if (validLocations.length === 1) {
          mapInstance.setZoom(15);
        } else if (validLocations.length <= 3) {
          mapInstance.setZoom(13);
        } else {
          mapInstance.setZoom(12);
        }
      }, 500);
    } else {
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(defaultZoom);
    }
  }, []);

  // Fit map to locations when locations change
  useEffect(() => {
    if (map && locations.length > 0) {
      if (import.meta.env.DEV) {
        console.debug(`Fitting map to ${locations.length} locations`);
        console.debug('Sample locations:', locations.slice(0, 3).map(l => ({
          name: l.name,
          position: l.position,
          type: l.type
        })));
      }
      // Small delay to ensure map is fully rendered
      setTimeout(() => {
        fitToLocations(map, locations);
      }, 100);
    }
  }, [map, locations, fitToLocations]);

  return null;
};

const GoogleMaps: React.FC<GoogleMapsProps> = ({
  locations,
  hoveredLocationId: externalHoveredLocationId = null,
  onLocationHover
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [internalHoveredLocationId, setInternalHoveredLocationId] = useState<string | null>(null);
  
  // Use external hover ID if provided, otherwise use internal state
  const hoveredLocationId = externalHoveredLocationId !== null ? externalHoveredLocationId : internalHoveredLocationId;
  
  // Find the hovered location for showing metadata
  const hoveredLocation = useMemo(() => {
    if (!hoveredLocationId) return null;
    return locations.find(loc => (loc.id || '') === hoveredLocationId);
  }, [hoveredLocationId, locations]);

  // Calculate map center before using it
  const mapCenter = calculateCenter(locations);
  
  // Fallback center if calculation fails
  const fallbackCenter = { lat: 15.3838, lng: 73.8162 }; // Vasco Da Gama, Goa
  const finalCenter = mapCenter.lat && mapCenter.lng ? mapCenter : fallbackCenter;

  const handleMarkerClick = useCallback((location: Location) => {
    // Set location immediately; PlaceDetailsFetcher will fetch details
    setSelectedLocation(location);
  }, []);

  const handlePlaceDetailsFetched = useCallback((location: Location, photos: string[]) => {
    setSelectedLocation(location);
    setSelectedPhotos(photos);
  }, []);


  return (
    <div className="relative h-full w-full min-h-0">
      <Map
        defaultZoom={defaultZoom}
        defaultCenter={finalCenter}
        mapId={GOOGLE_MAPS_MAP_ID}
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <MapController locations={locations} />
        <LocationMarkers 
          locations={locations} 
          onMarkerClick={handleMarkerClick}
          hoveredLocationId={hoveredLocationId}
          onMarkerHover={(id) => {
            setInternalHoveredLocationId(id);
            onLocationHover?.(id);
          }}
        />
        <PlaceDetailsFetcher 
          location={selectedLocation}
          onPlaceDetailsFetched={handlePlaceDetailsFetched}
        />

        {/* Hover InfoWindow - shows when hovering over a location */}
        {hoveredLocation && hoveredLocation !== selectedLocation && (
          <InfoWindow
            position={hoveredLocation.position}
            zIndex={999}
          >
            <div className="p-2 min-w-[200px] max-w-[280px]">
              <div className="flex items-start gap-2">
                {hoveredLocation.thumbnail && (
                  <img
                    src={hoveredLocation.thumbnail}
                    alt={hoveredLocation.name}
                    className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1">
                  <div className="text-[9px] uppercase tracking-wide text-gray-500 mb-0.5">
                    {hoveredLocation.type}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {hoveredLocation.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {hoveredLocation.rating !== undefined && (
                      <span className="text-amber-500">⭐ {hoveredLocation.rating}</span>
                    )}
                    {hoveredLocation.price !== undefined && (
                      <span className="text-green-600">
                        {typeof hoveredLocation.price === 'number' ? `$${hoveredLocation.price}` : hoveredLocation.price}
                      </span>
                    )}
                  </div>
                  {hoveredLocation.description && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {hoveredLocation.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Click InfoWindow - shows when clicking on a location */}
        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.position}
            onCloseClick={() => {
              setSelectedLocation(null);
              setSelectedPhotos([]);
            }}
            zIndex={1000}
          >
            <div className="p-3 min-w-[280px] max-w-[320px]">
              <div className="flex items-start gap-3">
                {selectedLocation.thumbnail && (
                  <img
                    src={selectedLocation.thumbnail}
                    alt={selectedLocation.name}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-0.5">
                    {selectedLocation.type}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-0.5">
                    {selectedLocation.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    {selectedLocation.rating !== undefined && (
                      <span className="text-amber-500">⭐ {selectedLocation.rating}</span>
                    )}
                    {selectedLocation.price !== undefined && (
                      <span className="text-green-600">
                        {typeof selectedLocation.price === 'number' ? `$${selectedLocation.price}` : selectedLocation.price}
                      </span>
                    )}
                    {selectedLocation.open_state && (
                      <span className="text-gray-500">{selectedLocation.open_state}</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedLocation.description && (
                <div className="text-xs text-gray-700 mt-2">
                  {selectedLocation.description}
                </div>
              )}

              {selectedLocation.address && (
                <div className="text-[11px] text-gray-500 mt-1">{selectedLocation.address}</div>
              )}

              {selectedPhotos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mt-2">
                  {selectedPhotos.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={selectedLocation.name}
                      className="rounded-md w-24 h-16 object-cover"
                    />
                  ))}
                </div>
              )}

              {(selectedLocation.website || selectedLocation.phone) && (
                <div className="flex items-center gap-3 text-xs text-blue-600 mt-2">
                  {selectedLocation.website && (
                    <a href={selectedLocation.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a>
                  )}
                  {selectedLocation.phone && (
                    <span className="text-gray-600">{selectedLocation.phone}</span>
                  )}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};

export default GoogleMaps;
