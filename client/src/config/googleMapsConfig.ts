// Shared Google Maps configuration to prevent reloading issues
// IMPORTANT: Keep libraries as a const array to prevent LoadScript reload warnings
export const GOOGLE_MAPS_LIBRARIES: ('places' | 'marker')[] = ['places'];

export const GOOGLE_MAPS_CONFIG = {
  id: 'google-map-script',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  libraries: GOOGLE_MAPS_LIBRARIES
};
