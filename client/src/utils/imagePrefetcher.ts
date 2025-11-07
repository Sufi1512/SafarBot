export type ImageQuality = 'low' | 'medium' | 'high';

const QUALITY_TO_WIDTH: Record<ImageQuality, number> = {
  low: 200,
  medium: 320,
  high: 480
};

const QUALITY_TO_HEIGHT: Record<ImageQuality, number> = {
  low: 150,
  medium: 240,
  high: 360
};

const prefetchCache = new Map<string, Promise<void>>();

const buildGooglePhotoUrl = (url: string, quality: ImageQuality) => {
  const width = QUALITY_TO_WIDTH[quality];
  const height = QUALITY_TO_HEIGHT[quality];

  if (/=s\d+/.test(url)) {
    return url.replace(/=s\d+/, `=s${width}`);
  }

  if (/=w\d+-h\d+/.test(url)) {
    return url.replace(/=w\d+-h\d+/, `=w${width}-h${height}`);
  }

  if (/=w\d+/.test(url)) {
    return url.replace(/=w\d+/, `=w${width}`);
  }

  if (/=h\d+/.test(url)) {
    return url.replace(/=h\d+/, `=h${height}`);
  }

  if (url.includes('?')) {
    const separator = url.endsWith('&') || url.endsWith('?') ? '' : '&';
    return `${url}${separator}w=${width}`;
  }

  if (url.includes('=')) {
    return `${url}=w${width}-h${height}`;
  }

  return `${url}?w=${width}&h=${height}`;
};

export const getOptimizedImageUrl = (originalSrc: string, quality: ImageQuality = 'medium'): string => {
  if (!originalSrc) {
    return '';
  }

  if (originalSrc.includes('maps.googleapis.com')) {
    return buildGooglePhotoUrl(originalSrc, quality);
  }

  return originalSrc;
};

export const prefetchImage = (originalSrc: string, quality: ImageQuality = 'medium') => {
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return Promise.resolve();
  }

  const optimizedSrc = getOptimizedImageUrl(originalSrc, quality);
  if (!optimizedSrc) {
    return Promise.resolve();
  }

  if (prefetchCache.has(optimizedSrc)) {
    return prefetchCache.get(optimizedSrc)!;
  }

  const promise = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = optimizedSrc;
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
  });

  prefetchCache.set(optimizedSrc, promise);
  return promise;
};

interface PrefetchPlaceMediaOptions {
  placeDetails?: Array<{ thumbnail?: string; high_res_image?: string; serpapi_thumbnail?: string; photos_link?: string }>;
  additionalPlaces?: Array<{ thumbnail?: string; high_res_image?: string; serpapi_thumbnail?: string }>;
}

export const prefetchPlaceMedia = ({
  placeDetails = [],
  additionalPlaces = []
}: PrefetchPlaceMediaOptions) => {
  const imageUrls = new Set<string>();

  placeDetails.forEach((place) => {
    [place.high_res_image, place.thumbnail, place.serpapi_thumbnail, place.photos_link]
      .filter((url): url is string => Boolean(url))
      .forEach((url) => imageUrls.add(url));
  });

  additionalPlaces.forEach((place) => {
    [place.high_res_image, place.thumbnail, place.serpapi_thumbnail]
      .filter((url): url is string => Boolean(url))
      .forEach((url) => imageUrls.add(url));
  });

  const promises: Promise<void>[] = [];

  imageUrls.forEach((url) => {
    const quality: ImageQuality = url.includes('high_res') ? 'high' : 'medium';
    promises.push(prefetchImage(url, quality));
  });

  return Promise.all(promises).then(() => ({
    totalRequested: imageUrls.size
  }));
};


