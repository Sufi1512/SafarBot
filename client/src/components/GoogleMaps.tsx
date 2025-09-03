import React, { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

// Keep libraries constant to avoid reloading warnings
const LIBRARIES: ("places")[] = ['places'];

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
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minWidth: '100%',
  minHeight: '100%'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const defaultZoom = 12;

const GoogleMaps: React.FC<GoogleMapsProps> = ({
  locations
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const hoverCloseTimer = useRef<NodeJS.Timeout | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES
  });

  const fitToLocations = useCallback((map: google.maps.Map, locs: Location[]) => {
    const validLocations = locs.filter(
      (loc) =>
        !isNaN(loc.position.lat) &&
        !isNaN(loc.position.lng) &&
        loc.position.lat !== 0 &&
        loc.position.lng !== 0
    );

    if (validLocations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      validLocations.forEach((location) => bounds.extend(location.position));
      map.fitBounds(bounds);
      if (locs.length === 1) map.setZoom(14);
    } else {
      // Fall back to a sane center/zoom if no valid locations
      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
    }
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    fitToLocations(map, locations);
  }, [locations, fitToLocations]);

  useEffect(() => {
    if (map) {
      fitToLocations(map, locations);
    }
  }, [map, locations, fitToLocations]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 🔹 Fetch place details with photos when a marker is clicked
  const fetchPlaceDetails = (location: Location) => {
    if (!map) return;

    const service = new google.maps.places.PlacesService(map);

    service.getDetails(
      {
        placeId: location.id, // assumes id = place_id
        fields: ['name', 'photos', 'rating', 'formatted_address']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          setSelectedLocation({
            ...location,
            description: place.formatted_address || location.description,
            rating: place.rating || location.rating
          });

          if (place.photos) {
            const urls = place.photos.map((p) =>
              p.getUrl({ maxWidth: 300, maxHeight: 200 })
            );
            setSelectedPhotos(urls);
          } else {
            setSelectedPhotos([]);
          }
        }
      }
    );
  };

  const handleMarkerMouseOver = (location: Location) => {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    // Show basic metadata immediately on hover; photos only on click to avoid quota hits
    setSelectedLocation(location);
  };

  const handleMarkerMouseOut = () => {
    // Delay closing a bit to allow smooth movement
    hoverCloseTimer.current = setTimeout(() => {
      setSelectedLocation(null);
      setSelectedPhotos([]);
    }, 150);
  };

  if (loadError) {
    return <div>Google Maps failed to load</div>;
  }

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  if (locations.length === 0) {
    return <div>No locations available</div>;
  }

  return (
    <div className="relative h-full w-full min-h-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            onClick={() => fetchPlaceDetails(location)}
            onMouseOver={() => handleMarkerMouseOver(location)}
            onMouseOut={handleMarkerMouseOut}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.position}
            onCloseClick={() => {
              setSelectedLocation(null);
              setSelectedPhotos([]);
            }}
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
      </GoogleMap>
    </div>
  );
};

export default GoogleMaps;
