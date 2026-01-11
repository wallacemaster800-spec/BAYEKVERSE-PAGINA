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
    // CAMBIO IMPORTANTE AQUÍ:
    // 1. 'relative': Para que lo de adentro (absolute) se posicione respecto a este div.
    // 2. 'w-full': Para que ocupe el ancho disponible.
    // 3. 'aspect-video': Mantiene la relación 16:9 y RESERVA el espacio vertical aunque el hijo sea absolute.
    <div 
      ref={ref} 
      className="video-container group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
    >
      {!isPlaying ? (
        <>
          {/* Thumbnail with lazy loading */}
          {isVisible && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
            />
          )}

          {/* Play button overlay */}
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors duration-300 cursor-pointer z-10"
            aria-label={`Reproducir ${title}`}
          >
            {/* Círculo rojo optimizado */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ff0000] flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shadow-lg">
              <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" />
            </div>
          </button>
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          // El iframe usa absolute para llenar el espacio reservado por 'aspect-video' del padre
          className="absolute inset-0 w-full h-full z-20" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}