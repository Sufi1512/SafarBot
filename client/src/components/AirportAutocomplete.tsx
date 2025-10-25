import React, { useRef, useEffect, useState } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Plane } from 'lucide-react';
import { GOOGLE_MAPS_CONFIG, LIBRARIES } from '../config/googleMapsConfig';

interface AirportSuggestion {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAirportSelect?: (airport: AirportSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

const AirportAutocomplete: React.FC<AirportAutocompleteProps> = ({
  value,
  onChange,
  onAirportSelect,
  placeholder = "Enter airport name or code...",
  className = "",
  disabled = false,
  required = false,
  name,
  id
}) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_CONFIG);

  // Debug logging
  useEffect(() => {
    console.log('AirportAutocomplete - Google Maps API Status:', { isLoaded, loadError });
    console.log('AirportAutocomplete - API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
  }, [isLoaded, loadError]);

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.formatted_address) {
        // Extract airport information from Google Places result
        const airportSuggestion: AirportSuggestion = {
          code: extractAirportCode(place),
          name: place.name || place.formatted_address,
          city: extractCity(place),
          country: extractCountry(place)
        };
        
        onChange(airportSuggestion.code);
        
        if (onAirportSelect) {
          onAirportSelect(airportSuggestion);
        }
      }
    }
  };

  // Airport data is now fetched from external API

  // Extract airport code from place result
  const extractAirportCode = (place: google.maps.places.PlaceResult): string => {
    const name = place.name || '';
    const addressComponents = place.address_components || [];
    
    // First, try to find IATA code in the place name (most reliable)
    // Look for patterns like "JFK Airport", "Heathrow (LHR)", "LAX - Los Angeles"
    const iataPatterns = [
      /\b([A-Z]{3})\b/,  // 3-letter code anywhere
      /\(([A-Z]{3})\)/,  // Code in parentheses
      /^([A-Z]{3})\s*[-–]\s*/,  // Code at start followed by dash
      /\s([A-Z]{3})\s*[-–]\s*/,  // Code in middle followed by dash
    ];
    
    for (const pattern of iataPatterns) {
      const match = name.match(pattern);
      if (match && match[1] && match[1].length === 3) {
        return match[1];
      }
    }
    
    // Look in address components for airport codes
    for (const component of addressComponents) {
      if (component.types.includes('airport') && component.short_name && component.short_name.length === 3) {
        return component.short_name.toUpperCase();
      }
      // Also check for establishment types that might contain airport codes
      if (component.types.includes('establishment') && component.short_name && component.short_name.length === 3 && /^[A-Z]{3}$/.test(component.short_name)) {
        return component.short_name;
      }
    }
    
    // Try to extract from formatted address
    const formattedAddress = place.formatted_address || '';
    const addressIataMatch = formattedAddress.match(/\b([A-Z]{3})\b/);
    if (addressIataMatch) {
      return addressIataMatch[1];
    }
    
    // Fallback: Check against our airport database
    const normalizedName = name.toLowerCase().trim();
    if (airportDatabase[normalizedName]) {
      return airportDatabase[normalizedName];
    }
    
    // Try partial matches in the database
    for (const [dbName, code] of Object.entries(airportDatabase)) {
      if (normalizedName.includes(dbName) || dbName.includes(normalizedName)) {
        return code;
      }
    }
    
    // If still no IATA code found, return a placeholder that indicates it needs manual entry
    return '???';
  };

  const extractCity = (place: google.maps.places.PlaceResult): string => {
    const addressComponents = place.address_components || [];
    
    for (const component of addressComponents) {
      if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
        return component.long_name;
      }
    }
    
    return place.name || 'Unknown City';
  };

  const extractCountry = (place: google.maps.places.PlaceResult): string => {
    const addressComponents = place.address_components || [];
    
    for (const component of addressComponents) {
      if (component.types.includes('country')) {
        return component.long_name;
      }
    }
    
    return 'Unknown Country';
  };

  // Handle manual input changes
  const handleInputChange = async (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.length >= 2) {
      console.log('Fetching airport suggestions from external API');
      
      try {
        const suggestions = await getAirportSuggestions(inputValue);
        
        if (suggestions.length > 0) {
          console.log('Airport suggestions found:', suggestions);
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          console.log('No airport suggestions found');
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching airport suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Fetch airport suggestions from external API
  const getAirportSuggestions = async (inputValue: string): Promise<AirportSuggestion[]> => {
    const normalizedInput = inputValue.toLowerCase().trim();
    const suggestions: AirportSuggestion[] = [];
    
    try {
      // Fetch airport data from the external API
      const response = await fetch('https://raw.githubusercontent.com/mwgg/Airports/master/airports.json');
      const airportsData = await response.json();
      
      // Filter airports that have IATA codes and match the input
      const matchingAirports = Object.values(airportsData).filter((airport: any) => {
        if (!airport.iata || airport.iata.trim() === '') return false;
        
        const iataMatch = airport.iata.toLowerCase() === normalizedInput;
        const nameMatch = airport.name.toLowerCase().includes(normalizedInput);
        const cityMatch = airport.city.toLowerCase().includes(normalizedInput);
        
        return iataMatch || nameMatch || cityMatch;
      });
      
      // Convert to our suggestion format
      matchingAirports.forEach((airport: any) => {
        suggestions.push({
          code: airport.iata,
          name: airport.name,
          city: airport.city,
          country: airport.country
        });
      });
      
      // Sort by relevance (exact IATA match first, then by name)
      suggestions.sort((a, b) => {
        if (a.code.toLowerCase() === normalizedInput) return -1;
        if (b.code.toLowerCase() === normalizedInput) return 1;
        return a.name.localeCompare(b.name);
      });
      
      return suggestions.slice(0, 8);
    } catch (error) {
      console.error('Error fetching airport data:', error);
      return [];
    }
  };

  // Helper functions removed - using external API data directly

  const selectAirport = (airport: AirportSuggestion) => {
    onChange(airport.code);
    setShowSuggestions(false);
    
    if (onAirportSelect) {
      onAirportSelect(airport);
    }
  };

  if (!isLoaded) {
    return (
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
          <Plane className="h-5 w-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          className={`w-full py-3 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium hover:border-cyan-400 shadow-sm hover:shadow-md ${className}`}
        />
        <div className="text-xs text-gray-500 mt-1">Loading Google Maps API...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
        <Plane className="h-5 w-5" />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => value.length >= 2 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className={`w-full py-3 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium hover:border-cyan-400 shadow-sm hover:shadow-md ${className}`}
      />
      
      {/* Custom Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((airport, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                onClick={() => selectAirport(airport)}
              >
                <div className="flex items-center justify-between">
                  <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900 dark:text-white">{airport.code}</div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Valid IATA Code"></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{airport.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{airport.city}, {airport.country}</div>
                  </div>
                  <Plane className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No airport suggestions found. Try typing an IATA code (e.g., "JFK", "LHR") or airport name
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
