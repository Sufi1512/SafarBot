/**
 * Comprehensive API Caching Service
 * Provides intelligent caching for all API calls to prevent unnecessary repeated requests
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

interface CacheConfig {
  defaultTTL?: number; // Default TTL in milliseconds (5 minutes)
  maxSize?: number; // Maximum cache size
  enableMemoryCache?: boolean; // Enable in-memory caching
  enableLocalStorage?: boolean; // Enable localStorage caching
  enableSessionStorage?: boolean; // Enable sessionStorage caching
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private config: Required<CacheConfig>;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes
      maxSize: config.maxSize || 1000,
      enableMemoryCache: config.enableMemoryCache !== false,
      enableLocalStorage: config.enableLocalStorage || false,
      enableSessionStorage: config.enableSessionStorage || false,
    };
  }

  /**
   * Generate a cache key from API endpoint and parameters
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    const baseKey = endpoint;
    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }
    
    // Sort params to ensure consistent keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${baseKey}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    // Try memory cache first
    if (this.config.enableMemoryCache) {
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && this.isValid(memoryEntry)) {
        return memoryEntry.data as T;
      }
    }

    // Try sessionStorage
    if (this.config.enableSessionStorage) {
      try {
        const sessionEntry = sessionStorage.getItem(`cache_${key}`);
        if (sessionEntry) {
          const entry: CacheEntry = JSON.parse(sessionEntry);
          if (this.isValid(entry)) {
            // Also store in memory cache for faster access
            if (this.config.enableMemoryCache) {
              this.memoryCache.set(key, entry);
            }
            return entry.data as T;
          }
        }
      } catch (error) {
        console.warn('Failed to read from sessionStorage cache:', error);
      }
    }

    // Try localStorage
    if (this.config.enableLocalStorage) {
      try {
        const localEntry = localStorage.getItem(`cache_${key}`);
        if (localEntry) {
          const entry: CacheEntry = JSON.parse(localEntry);
          if (this.isValid(entry)) {
            // Also store in memory cache for faster access
            if (this.config.enableMemoryCache) {
              this.memoryCache.set(key, entry);
            }
            return entry.data as T;
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage cache:', error);
      }
    }

    return null;
  }

  /**
   * Store data in cache
   */
  private setCache<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key,
    };

    // Store in memory cache
    if (this.config.enableMemoryCache) {
      // Implement LRU eviction if cache is full
      if (this.memoryCache.size >= this.config.maxSize) {
        const firstKey = this.memoryCache.keys().next().value;
        if (firstKey) {
          this.memoryCache.delete(firstKey);
        }
      }
      this.memoryCache.set(key, entry);
    }

    // Store in sessionStorage
    if (this.config.enableSessionStorage) {
      try {
        sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to write to sessionStorage cache:', error);
      }
    }

    // Store in localStorage
    if (this.config.enableLocalStorage) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to write to localStorage cache:', error);
      }
    }
  }

  /**
   * Remove data from cache
   */
  private removeFromCache(key: string): void {
    // Remove from memory cache
    if (this.config.enableMemoryCache) {
      this.memoryCache.delete(key);
    }

    // Remove from sessionStorage
    if (this.config.enableSessionStorage) {
      try {
        sessionStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn('Failed to remove from sessionStorage cache:', error);
      }
    }

    // Remove from localStorage
    if (this.config.enableLocalStorage) {
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn('Failed to remove from localStorage cache:', error);
      }
    }
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    // Clear memory cache
    if (this.config.enableMemoryCache) {
      this.memoryCache.clear();
    }

    // Clear sessionStorage cache
    if (this.config.enableSessionStorage) {
      try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear sessionStorage cache:', error);
      }
    }

    // Clear localStorage cache
    if (this.config.enableLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear localStorage cache:', error);
      }
    }
  }

  /**
   * Clear cache for specific pattern
   */
  public clearCachePattern(pattern: string): void {
    const regex = new RegExp(pattern);

    // Clear memory cache
    if (this.config.enableMemoryCache) {
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
        }
      }
    }

    // Clear sessionStorage cache
    if (this.config.enableSessionStorage) {
      try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_') && regex.test(key.replace('cache_', ''))) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear sessionStorage cache pattern:', error);
      }
    }

    // Clear localStorage cache
    if (this.config.enableLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_') && regex.test(key.replace('cache_', ''))) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear localStorage cache pattern:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    memoryCacheSize: number;
    sessionStorageSize: number;
    localStorageSize: number;
    totalSize: number;
  } {
    let sessionStorageSize = 0;
    let localStorageSize = 0;

    if (this.config.enableSessionStorage) {
      try {
        const keys = Object.keys(sessionStorage);
        sessionStorageSize = keys.filter(key => key.startsWith('cache_')).length;
      } catch (error) {
        console.warn('Failed to get sessionStorage cache size:', error);
      }
    }

    if (this.config.enableLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        localStorageSize = keys.filter(key => key.startsWith('cache_')).length;
      } catch (error) {
        console.warn('Failed to get localStorage cache size:', error);
      }
    }

    return {
      memoryCacheSize: this.memoryCache.size,
      sessionStorageSize,
      localStorageSize,
      totalSize: this.memoryCache.size + sessionStorageSize + localStorageSize,
    };
  }

  /**
   * Cached API call wrapper
   */
  public async cachedCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    params?: Record<string, any>,
    options?: {
      ttl?: number;
      forceRefresh?: boolean;
      cacheKey?: string;
    }
  ): Promise<T> {
    const cacheKey = options?.cacheKey || this.generateKey(endpoint, params);
    
    // Check if we have a pending request for this key
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // If not forcing refresh, try to get from cache
    if (!options?.forceRefresh) {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData !== null) {
        console.log(`Cache hit for ${endpoint}`);
        return cachedData;
      }
    }

    // Create the API call promise
    const apiCallPromise = apiCall().then(data => {
      // Store in cache
      this.setCache(cacheKey, data, options?.ttl);
      console.log(`Cache miss for ${endpoint}, data cached`);
      return data;
    }).catch(error => {
      // Remove from pending requests on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    // Store the pending request
    this.pendingRequests.set(cacheKey, apiCallPromise);

    // Clean up pending request when done
    apiCallPromise.finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    return apiCallPromise;
  }

  /**
   * Invalidate cache for specific endpoint
   */
  public invalidateCache(endpoint: string, params?: Record<string, any>): void {
    const key = this.generateKey(endpoint, params);
    this.removeFromCache(key);
  }

  /**
   * Invalidate cache for endpoint pattern
   */
  public invalidateCachePattern(pattern: string): void {
    this.clearCachePattern(pattern);
  }
}

// Create default cache service instance
export const cacheService = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  enableMemoryCache: true,
  enableSessionStorage: true,
  enableLocalStorage: false, // Disabled by default to avoid localStorage bloat
});

// Cache configuration for different API types
export const CACHE_CONFIGS = {
  // Short-lived caches for frequently changing data
  DASHBOARD: { ttl: 2 * 60 * 1000 }, // 2 minutes
  STATS: { ttl: 1 * 60 * 1000 }, // 1 minute
  
  // Medium-lived caches for moderately changing data
  SAVED_ITINERARIES: { ttl: 5 * 60 * 1000 }, // 5 minutes
  USER_PROFILE: { ttl: 10 * 60 * 1000 }, // 10 minutes
  
  // Long-lived caches for relatively static data
  DESTINATIONS: { ttl: 30 * 60 * 1000 }, // 30 minutes
  WEATHER: { ttl: 10 * 60 * 1000 }, // 10 minutes
  FLIGHTS: { ttl: 15 * 60 * 1000 }, // 15 minutes
  HOTELS: { ttl: 20 * 60 * 1000 }, // 20 minutes
  RESTAURANTS: { ttl: 30 * 60 * 1000 }, // 30 minutes
  
  // Very long-lived caches for static data
  AIRPORTS: { ttl: 60 * 60 * 1000 }, // 1 hour
  CURRENCIES: { ttl: 24 * 60 * 60 * 1000 }, // 24 hours
};

export default cacheService;
