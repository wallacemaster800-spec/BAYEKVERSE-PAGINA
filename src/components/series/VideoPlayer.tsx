import { useState } from 'react';
import { Play } from 'lucide-react';
import { getYoutubeThumbnail } from '@/lib/cloudinary';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
}

export function VideoPlayer({ videoId, title = 'Video' }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '100px',
  });

  const thumbnailUrl = getYoutubeThumbnail(videoId, 'maxres');

  return (
    <div ref={ref} className="video-container group">
      {!isPlaying ? (
        <>
          {/* Thumbnail with lazy loading */}
          {isVisible && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}

          {/* Play button overlay */}
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-background/30 transition-all duration-300 group-hover:bg-background/40"
            aria-label={`Reproducir ${title}`}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-glow-red flex items-center justify-center glow-red transition-transform duration-300 group-hover:scale-110">
              <Play className="w-7 h-7 md:w-8 md:h-8 text-white ml-1" fill="currentColor" />
            </div>
          </button>
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}