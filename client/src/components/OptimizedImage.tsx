import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  quality?: 'low' | 'medium' | 'high';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  loading = 'lazy',
  quality = 'medium',
  onLoad,
  onError
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, [loading]);

  // Generate optimized image URL based on quality
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return '';
    
    // For Google Places photos, add size parameters
    if (originalSrc.includes('maps.googleapis.com')) {
      const size = quality === 'high' ? '400x300' : quality === 'medium' ? '300x200' : '200x150';
      return originalSrc.replace(/=s\d+/, `=s${size.split('x')[0]}`);
    }
    
    // For other images, you could add image optimization service here
    return originalSrc;
  };

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageState('loading');
    } else {
      setImageState('error');
      onError?.();
    }
  };

  const optimizedSrc = isInView ? getOptimizedSrc(currentSrc) : '';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading state */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs">Image unavailable</div>
          </div>
        </div>
      )}

      {/* Actual image */}
      {optimizedSrc && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageState === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedImage;



