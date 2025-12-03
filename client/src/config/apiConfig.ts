/**
 * Centralized API Configuration
 * 
 * This file provides a single source of truth for API URLs.
 * It automatically switches between localhost (development) and Render (production).
 * 
 * Environment Variables:
 * - VITE_API_URL or VITE_API_BASE_URL: Override the default API URL
 * 
 * Usage:
 *   import { getApiBaseUrl, getWebSocketUrl } from '@/config/apiConfig';
 *   const apiUrl = getApiBaseUrl();
 *   const wsUrl = getWebSocketUrl();
 */

/**
 * Get the base API URL
 * Priority:
 * 1. VITE_API_URL environment variable
 * 2. VITE_API_BASE_URL environment variable
 * 3. Production: Render URL
 * 4. Development: localhost:8000
 */
export const getApiBaseUrl = (): string => {
  // Check for environment variable override
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Default based on environment
  if (import.meta.env.PROD) {
    return 'https://safarbot-n24f.onrender.com';
  }
  
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

