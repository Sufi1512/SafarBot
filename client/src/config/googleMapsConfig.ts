import { Library } from '@react-google-maps/api';

// Shared Google Maps configuration to prevent reloading issues
export const GOOGLE_MAPS_CONFIG = {
  id: 'google-map-script',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  libraries: ['places'] as Library[]
};
