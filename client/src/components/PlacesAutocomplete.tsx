import React, { useRef, useEffect, useState } from 'react';

// Add custom styles for Google Places Autocomplete
// Note: This component uses google.maps.places.Autocomplete which is deprecated.
// The @react-google-maps/api library doesn't support PlaceAutocompleteElement yet.
// The deprecation warning is informational - Autocomplete will continue to work for at least 12 months.
const addCustomStyles = () => {
  if (document.getElementById('places-autocomplete-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'places-autocomplete-styles';
  style.textContent = `
    .pac-container {
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      font-family: inherit;
      margin-top: 4px;
      z-index: 9999 !important;
      overflow: hidden;
    }
    
    .pac-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .pac-item:last-child {
      border-bottom: none;
    }
    
    .pac-item:hover,
    .pac-item-selected {
      background-color: #f8fafc;
      border-left: 3px solid #3b82f6;
      padding-left: 13px;
    }
    
    .pac-item-query {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }
    
    .pac-matched {
      font-weight: 700;
      color: #2563eb;
    }
    
    .pac-item-query .pac-matched {
      background-color: #dbeafe;
      padding: 1px 3px;
      border-radius: 3px;
    }
    
    .pac-icon {
      margin-right: 8px;
      opacity: 0.6;
    }
    
    /* Ensure no duplicate icons appear in the input field */
    .pac-target-input::before,
    .pac-target-input::after {
      display: none !important;
    }
    
    .pac-logo {
      padding: 8px 20px 8px 16px;
      border-top: 1px solid #f3f4f6;
      background-color: #f9fafb;
      font-size: 11px;
      color: #6b7280;
      text-align: right;
      margin-right: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
 
    
    .dark .pac-container {
      background-color: #1f2937;
      border-color: #374151;
    }
    
    .dark .pac-item {
      color: #f9fafb;
      border-bottom-color: #374151;
    }
    
    .dark .pac-item:hover,
    .dark .pac-item-selected {
      background-color: #374151;
    }
    
    .dark .pac-item-query {
      color: #f9fafb;
    }
    
    .dark .pac-matched {
      color: #60a5fa;
    }
    
    .dark .pac-item-query .pac-matched {
      background-color: #1e3a8a;
    }
    
    .dark .pac-logo {
      background-color: #111827;
      border-top-color: #374151;
      color: #9ca3af;
      padding: 8px 20px 8px 16px;
      margin-right: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(style);
};

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter destination...",
  className = "",
  icon,
  disabled = false,
  required = false,
  name,
  id
}) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add custom styles when component mounts
  useEffect(() => {
    addCustomStyles();
  }, []);

  // Check if Google Maps API is loaded (via APIProvider)
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait time (50 * 100ms)
    
    const checkGoogleMaps = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
        if (import.meta.env.DEV) {
          console.log('Google Maps Places API loaded successfully');
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        // Retry after a short delay if not loaded yet
        setTimeout(checkGoogleMaps, 100);
      } else {
        console.error('Google Maps Places API failed to load after multiple retries');
      }
    };
    checkGoogleMaps();
  }, []);

  // Initialize autocomplete when Google Maps is loaded
  // Note: google.maps.places.Autocomplete is deprecated in favor of PlaceAutocompleteElement
  // This warning is informational - Autocomplete will continue to work for at least 12 months
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocomplete || !window.google?.maps?.places) {
      return;
    }

    try {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'], // Use only cities for travel destinations
        componentRestrictions: { country: [] }, // Allow all countries
        fields: ['place_id', 'formatted_address', 'name', 'geometry', 'address_components', 'types']
      });

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        
        if (place.formatted_address) {
          onChange(place.formatted_address);
          
          // Call the onPlaceSelect callback if provided
          if (onPlaceSelect) {
            onPlaceSelect(place);
          }
        }
      });
      
      setAutocomplete(autocompleteInstance);
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
    }
  }, [isLoaded, autocomplete, onChange, onPlaceSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [autocomplete]);

  if (!isLoaded) {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          className={`pac-target-input w-full py-3 ${icon ? 'pl-12 pr-4' : 'px-4'} border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium hover:border-cyan-400 shadow-sm hover:shadow-md ${className}`}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      {/* Note: Using native google.maps.places.Autocomplete API (deprecated but still supported)
          Will migrate to PlaceAutocompleteElement in the future */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || !isLoaded}
        required={required}
        name={name}
        id={id}
        className={`w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium hover:border-cyan-400 shadow-sm hover:shadow-md ${className}`}
      />
    </div>
  );
};

export default PlacesAutocomplete;
