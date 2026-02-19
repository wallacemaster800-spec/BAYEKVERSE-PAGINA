import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
}

const extractYouTubeId = (url: string) => {
  if (!url) return null;
  if (url.length === 11 && !url.includes('/') && !url.includes(' ')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function VideoPlayer({ src, title = 'Video', poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytId = extractYouTubeId(src);

  useEffect(() => {
    if (ytId) return;

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    let player: Plyr | null = null;

    const initPlyr = () => {
      player = new Plyr(video, {
        controls: [
          'play-large',
          'rewind',
          'play',
          'fast-forward',
          'progress',
          'current-time',
          'mute',
          'volume',
          'fullscreen'
        ],
        ratio: '16:9',
        clickToPlay: true,
        // Configuración robusta para fullscreen en móviles
        fullscreen: { enabled: true, fallback: true, iosNative: true }
      });

      // Lógica para intentar rotar la pantalla en móviles al entrar en Fullscreen
      player.on('enterfullscreen', () => {
        if (window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock('landscape').catch((err) => {
            console.warn('No se pudo bloquear la orientación:', err);
          });
        }
      });

      player.on('exitfullscreen', () => {
        if (window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      });
    };

    if (Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: 30 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, initPlyr);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', initPlyr);
    }

    return () => {
      if (hls) hls.destroy();
      if (player) player.destroy();
    };
  }, [src, ytId]);

  if (ytId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
          title={title}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 custom-plyr-wrapper">
      <video
        ref={videoRef}
        playsInline
        poster={poster}
        title={title}
      />

      <style>{`
        /* --- ESTILOS BASE DE PLYR --- */
        
        /* Aseguramos que la caja de Plyr ocupe el contenedor aspect-video */
        .plyr {
          width: 100%;
          height: 100%;
        }

        /* Comportamiento del video en estado normal (Desktop y Mobile) */
        .plyr video {
          object-fit: contain; /* Nunca recorta, muestra bandas negras si no encaja la proporción */
        }

        /* --- CONTROLES: ADELANTAR / REBOBINAR AL LADO DEL PLAY --- */
        
        /* Ocultar los botones de salto de la barra inferior por defecto si queremos */
        /* .plyr__controls [data-plyr="rewind"], .plyr__controls [data-plyr="fast-forward"] { display: none; } */
        
        /* Pero en tu código pedías ordenarlos, así que los acomodamos en la barra inferior: */
        .plyr__controls [data-plyr="rewind"] { order: 1; margin-right: 5px; }
        .plyr__controls [data-plyr="play"] { order: 2; }
        .plyr__controls [data-plyr="fast-forward"] { order: 3; margin-left: 5px; }


        /* --- LÓGICA FULLSCREEN (DESKTOP Y MOBILE) --- */

        /* Cuando está en fullscreen, forzamos que cubra la pantalla sin recortar los lados vitales, 
           pero llenando lo más posible (contain es seguro, cover recorta) */
        .plyr--fullscreen-active video {
          object-fit: contain !important; 
          width: 100vw !important;
          height: 100vh !important;
          background-color: black;
        }

        /* Ajustes específicos para iOS para evitar márgenes blancos o controles superpuestos */
        .plyr--ios.plyr--fullscreen-active video {
           object-fit: contain !important;
        }

        /* Si el dispositivo se pone en landscape físicamente, maximizamos el contenedor */
        @media (orientation: landscape) and (max-width: 900px) {
           .custom-plyr-wrapper {
              /* Quitamos los bordes redondeados si estamos en landscape móvil */
              border-radius: 0;
              border: none;
           }
        }
      `}</style>
    </div>
  );
}