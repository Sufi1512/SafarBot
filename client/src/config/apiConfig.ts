/**
 * Centralized API Configuration
 * 
 * This file provides a single source of truth for API URLs.
 * It automatically switches between localhost (development) and Render (production).
 * 
 * Environment Variables:
 * - VITE_API_URL: Override the default API URL
 * - VITE_DEV_MODE: Set to 'true' to use localhost, 'false' to use production URL
 * 
 * Usage:
 *   import { getApiBaseUrl, getWebSocketUrl } from '@/config/apiConfig';
 *   const apiUrl = getApiBaseUrl();
 *   const wsUrl = getWebSocketUrl();
 */

/**
 * Get the base API URL
 * Priority:
 * 1. VITE_API_URL environment variable (if explicitly set)
 * 2. VITE_DEV_MODE flag:
 *    - 'true': localhost:8000
 *    - 'false': Production URL (https://safarbot-n24f.onrender.com)
 * 3. Default: Based on Vite's PROD mode (PROD=true uses production, DEV mode uses localhost)
 */
export const getApiBaseUrl = (): string => {
  // Check for explicit API URL override
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Check dev mode flag (string comparison for environment variables)
  const devModeEnv = import.meta.env.VITE_DEV_MODE;
  
  if (devModeEnv !== undefined) {
    // VITE_DEV_MODE is explicitly set
    const devMode = devModeEnv.toLowerCase() === 'true';
    if (devMode) {
      return 'http://localhost:8000';
    } else {
      return 'https://safarbot-n24f.onrender.com';
    }
  }
  
  // If VITE_DEV_MODE is not set, fall back to Vite's PROD mode
  if (import.meta.env.PROD) {
    return 'https://safarbot-n24f.onrender.com';
  }
  
  // Development mode (default)
  return 'http://localhost:8000';
};

/**
 * Get WebSocket URL for chat/collaboration
 * Automatically uses ws:// for localhost and wss:// for production
 */
export const getWebSocketUrl = (path: string = ''): string => {
  const baseUrl = getApiBaseUrl();
  
  // Convert http/https to ws/wss
  if (baseUrl.startsWith('https://')) {
    return `wss://${baseUrl.replace('https://', '')}${path}`;
  } else if (baseUrl.startsWith('http://')) {
    return `ws://${baseUrl.replace('http://', '')}${path}`;
  }
  
  // Fallback
  return `${baseUrl}${path}`;
};

/**
 * Get the base URL without protocol (for Socket.IO)
 */
export const getApiBaseUrlWithoutProtocol = (): string => {
  const baseUrl = getApiBaseUrl();
  return baseUrl.replace(/^https?:\/\//, '');
};

// Export the base URL as a constant for convenience
export const API_BASE_URL = getApiBaseUrl();

