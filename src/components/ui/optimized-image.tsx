import { useState } from 'react';
import { optimizeCloudinaryUrl, getBlurPlaceholder } from '@/lib/cloudinary';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: 'thumbnail' | 'card' | 'poster' | 'gallery' | 'full';
  className?: string;
  aspectRatio?: string;
  eager?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  size = 'card',
  className,
  aspectRatio,
  eager = false,
}: OptimizedImageProps) {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '100px',
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = optimizeCloudinaryUrl(src, { size });
  const placeholderSrc = getBlurPlaceholder(src);

  const shouldLoad = eager || isVisible;

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden bg-muted',
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: placeholderSrc ? `url(${placeholderSrc})` : undefined,
            filter: 'blur(10px)',
            transform: 'scale(1.05)',
          }}
        />
      )}

      {/* Main image */}
      {shouldLoad && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover will-change-opacity',
            isLoaded ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'
          )}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-xs">Error</span>
        </div>
      )}
    </div>
  );
}