"""
Utility functions for parsing and extracting location information
"""

def extract_city_name(formatted_address: str) -> str:
    """
    Extracts city name from a formatted address string
    
    Examples:
    - "Vasco Da Gama, Goa, India" -> "Vasco Da Gama"
    - "Mumbai, Maharashtra, India" -> "Mumbai"
    - "New York, NY, USA" -> "New York"
    - "London, England, UK" -> "London"
    """
    if not formatted_address:
        return ""
    
    # Split by comma and take the first part (city name)
    parts = [part.strip() for part in formatted_address.split(',')]
    
    # Return the first part (city name)
    return parts[0] if parts else formatted_address


def extract_country_code(formatted_address: str) -> str:
    """
    Extracts country code from a formatted address string
    
    Examples:
    - "Vasco Da Gama, Goa, India" -> "IN"
    - "New York, NY, USA" -> "US"
    - "London, England, UK" -> "GB"
    """
    if not formatted_address:
        return ""
    
    parts = [part.strip() for part in formatted_address.split(',')]
    last_part = parts[-1] if parts else ""
    
    # Map common country names to ISO country codes
    country_map = {
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
        'United Arab Emirates': 'AE',
        'UAE': 'AE',
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
    }
    
    return country_map.get(last_part, "")


def parse_location_for_weather(formatted_address: str) -> tuple[str, str]:
    """
    Parses a Google Places formatted address to extract city and country code
    
    Returns:
        Tuple of (city, country_code)
    """
    city = extract_city_name(formatted_address)
    country_code = extract_country_code(formatted_address)
    return city, country_code



