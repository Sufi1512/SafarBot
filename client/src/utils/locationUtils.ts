/**
 * Utility functions for parsing and extracting location information
 */

/**
 * Extracts city name from a formatted address string
 * Examples:
 * - "Vasco Da Gama, Goa, India" -> "Vasco Da Gama"
 * - "Mumbai, Maharashtra, India" -> "Mumbai"
 * - "New York, NY, USA" -> "New York"
 * - "London, England, UK" -> "London"
 */
export const extractCityName = (formattedAddress: string): string => {
  if (!formattedAddress) return '';
  
  // Split by comma and take the first part (city name)
  const parts = formattedAddress.split(',').map(part => part.trim());
  
  // Return the first part (city name)
  return parts[0] || formattedAddress;
};

/**
 * Extracts country code from a formatted address string
 * Examples:
 * - "Vasco Da Gama, Goa, India" -> "IN"
 * - "New York, NY, USA" -> "US"
 * - "London, England, UK" -> "GB"
 */
export const extractCountryCode = (formattedAddress: string): string | undefined => {
  if (!formattedAddress) return undefined;
  
  const parts = formattedAddress.split(',').map(part => part.trim());
  const lastPart = parts[parts.length - 1];
  
  // Map common country names to ISO country codes
  const countryMap: Record<string, string> = {
    'India': 'IN',
    'USA': 'US',
    'United States': 'US',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'England': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Japan': 'JP',
    'China': 'CN',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Russia': 'RU',
    'South Korea': 'KR',
    'Thailand': 'TH',
    'Indonesia': 'ID',
    'Malaysia': 'MY',
    'Singapore': 'SG',
    'Philippines': 'PH',
    'Vietnam': 'VN',
    'Turkey': 'TR',
    'Egypt': 'EG',
    'South Africa': 'ZA',
    'Nigeria': 'NG',
    'Kenya': 'KE',
    'Morocco': 'MA',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Peru': 'PE',
    'Colombia': 'CO',
    'Venezuela': 'VE',
    'Ecuador': 'EC',
    'Bolivia': 'BO',
    'Paraguay': 'PY',
    'Uruguay': 'UY',
    'Guyana': 'GY',
    'Suriname': 'SR',
    'French Guiana': 'GF',
    'Falkland Islands': 'FK',
    'South Georgia': 'GS',
    'Antarctica': 'AQ'
  };
  
  return countryMap[lastPart] || undefined;
};

/**
 * Parses a Google Places formatted address to extract city and country code
 */
export const parseLocationForWeather = (formattedAddress: string): {
  city: string;
  countryCode?: string;
} => {
  return {
    city: extractCityName(formattedAddress),
    countryCode: extractCountryCode(formattedAddress)
  };
};



