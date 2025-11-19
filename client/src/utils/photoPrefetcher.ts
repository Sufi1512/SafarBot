/**
 * Photo Prefetcher Utility
 * Automatically prefetches and caches images from the itinerary response
 */

interface PhotoPrefetchMetadata {
  photo_urls: string[];
  total_photos: number;
  prefetch_strategy?: string;
  cache_policy?: string;
  priority?: string;
}

class PhotoPrefetcher {
  private prefetchedUrls: Set<string> = new Set();
  private prefetchQueue: string[] = [];
  private isProcessing: boolean = false;
  private maxConcurrent: number = 6; // Maximum concurrent prefetch requests

  /**
   * Prefetch all photos from the itinerary response
   */
  async prefetchPhotos(metadata: PhotoPrefetchMetadata): Promise<void> {
    if (!metadata || !metadata.photo_urls || metadata.photo_urls.length === 0) {
      console.log('📸 No photos to prefetch');
      return;
    }

    console.log(`📸 Starting prefetch for ${metadata.total_photos} photos`);

    // Filter out already prefetched URLs
    const newUrls = metadata.photo_urls.filter(url => !this.prefetchedUrls.has(url));

    if (newUrls.length === 0) {
      console.log('📸 All photos already prefetched');
      return;
    }

    console.log(`📸 Prefetching ${newUrls.length} new photos`);

    // Add to queue
    this.prefetchQueue.push(...newUrls);

    // Start processing if not already running
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Process the prefetch queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.prefetchQueue.length > 0) {
      // Take batch of URLs
      const batch = this.prefetchQueue.splice(0, this.maxConcurrent);

      // Prefetch batch in parallel
      await Promise.allSettled(
        batch.map(url => this.prefetchSinglePhoto(url))
      );
    }

    this.isProcessing = false;
    console.log('📸 Photo prefetch complete');
  }

  /**
   * Prefetch a single photo URL
   */
  private async prefetchSinglePhoto(url: string): Promise<void> {
    if (this.prefetchedUrls.has(url)) {
      return;
    }

    try {
      // Method 1: Use fetch API with cache
      await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache',
        priority: 'low', // Don't interfere with critical resources
      });

      this.prefetchedUrls.add(url);
      console.log(`✅ Prefetched: ${url.substring(0, 50)}...`);
    } catch (error) {
      console.warn(`⚠️  Failed to prefetch: ${url.substring(0, 50)}...`, error);
    }
  }

  /**
   * Alternative: Use link prefetch (for browsers that support it)
   */
  prefetchViaLinkTag(urls: string[]): void {
    urls.forEach(url => {
      if (this.prefetchedUrls.has(url)) return;

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = url;
      link.crossOrigin = 'anonymous';

      document.head.appendChild(link);
      this.prefetchedUrls.add(url);
    });

    console.log(`📸 Added ${urls.length} link prefetch tags`);
  }

  /**
   * Preload critical images (for above-the-fold content)
   */
  preloadCriticalImages(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.crossOrigin = 'anonymous';

      document.head.appendChild(link);
    });

    console.log(`🚀 Preloaded ${urls.length} critical images`);
  }

  /**
   * Clear prefetch cache
   */
  clearCache(): void {
    this.prefetchedUrls.clear();
    this.prefetchQueue = [];
    console.log('🗑️  Prefetch cache cleared');
  }

  /**
   * Get prefetch statistics
   */
  getStats(): { prefetched: number; queued: number } {
    return {
      prefetched: this.prefetchedUrls.size,
      queued: this.prefetchQueue.length,
    };
  }
}

// Global instance
export const photoPrefetcher = new PhotoPrefetcher();

/**
 * Hook to automatically prefetch photos from itinerary response
 */
export function usePrefetchPhotos(response: any) {
  if (!response || !response.photo_prefetch) {
    return;
  }

  // Prefetch photos asynchronously
  photoPrefetcher.prefetchPhotos(response.photo_prefetch).catch(error => {
    console.error('Failed to prefetch photos:', error);
  });
}

