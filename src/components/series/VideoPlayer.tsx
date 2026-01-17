import { useState } from 'react';
import { Play } from 'lucide-react';
import { getYoutubeThumbnail } from '@/lib/cloudinary';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Plyr } from "plyr-react"; 
import "plyr/dist/plyr.css"; 

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

  // Configuración de la fuente de video
  const videoSource: any = {
    type: "video",
    sources: [
      {
        src: videoId,
        provider: "youtube",
      },
    ],
  };

  // Opciones de Plyr para ocultar el branding de YouTube
  const plyrOptions = {
    controls: [
      'play-large', 'play', 'progress', 'current-time', 
      'mute', 'volume', 'captions', 'settings', 'fullscreen'
    ],
    hideControls: true,
    resetOnEnd: true,
    youtube: {
      noCookie: true,
      rel: 0,            // Solo muestra videos de tu propio canal al pausar
      showinfo: 0,
      iv_load_policy: 3, // Oculta anotaciones
      modestbranding: 1, // Quita el logo de la barra
      autoplay: 1
    }
  };

  return (
    <div
      ref={ref}
      className="video-container group relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
    >
      <style>{`
        /* Hack para ocultar logo y barra de 'Más videos' de YouTube */
        .plyr-container-hide-yt .plyr__video-embed {
          transform: scale(1.15); 
          transform-origin: center;
        }
        /* Evita clics accidentales en el logo de YouTube */
        .plyr-container-hide-yt iframe {
          pointer-events: none;
        }
        /* Recupera los clics para los controles de Plyr */
        .plyr--full-ui {
          pointer-events: auto;
        }
        /* Personalización del color (Rojo para la serie) */
        :root {
          --plyr-color-main: #e11d48; 
        }
      `}</style>

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
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ff0000] flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shadow-lg">
              <Play
                className="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
                fill="currentColor"
              />
            </div>
          </button>
        </>
      ) : (
        <div className="absolute inset-0 w-full h-full z-20 overflow-hidden plyr-container-hide-yt">
          <Plyr 
            source={videoSource} 
            options={plyrOptions} 
            autoPlay={true} 
          />
        </div>
      )}
    </div>
  );
}
