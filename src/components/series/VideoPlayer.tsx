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
    <div
      ref={ref}
      className="video-container group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
    >
      {!isPlaying ? (
        <>
          {isVisible && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
            />
          )}

          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors duration-300 cursor-pointer z-10"
            aria-label={`Reproducir ${title}`}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shadow-lg">
              <Play
                className="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
                fill="currentColor"
              />
            </div>
          </button>
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      )}
    </div>
  );
}
