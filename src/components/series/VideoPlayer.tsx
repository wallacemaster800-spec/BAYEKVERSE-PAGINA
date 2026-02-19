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
        fullscreen: { enabled: true, fallback: true, iosNative: true }
      });

      // Lógica para girar pantalla (Intacta)
      player.on('enterfullscreen', () => {
        if (window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock('landscape').catch(() => {});
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

  // 🔥 CSS inyectado de forma SEGURA para que no crashee React
  const customStyles = `
    /* --- DESKTOP (Intacto) --- */
    .plyr { width: 100%; height: 100%; }
    .plyr video { object-fit: contain; }
    
    .plyr__controls [data-plyr="rewind"] { order: 1; margin-right: 5px; }
    .plyr__controls [data-plyr="play"] { order: 2; }
    .plyr__controls [data-plyr="fast-forward"] { order: 3; margin-left: 5px; }

    .plyr--fullscreen-active video {
      object-fit: contain !important; 
      background-color: black;
    }

    /* --- MOBILE: Lógica Separada --- */
    @media (max-width: 768px) {
      .plyr--fullscreen-active video {
        /* Forzamos a que ocupe casi todo, pero dejando un ligerito margen a los lados */
        width: 96vw !important; 
        height: 100vh !important;
        object-fit: contain !important;
        margin: 0 auto !important; /* Centra el video en la pantalla */
        display: block;
      }
    }
  `;

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 custom-plyr-wrapper">
      <video
        ref={videoRef}
        playsInline
        poster={poster}
        title={title}
      />
      {/* Usamos dangerouslySetInnerHTML para evitar que el compilador se rompa */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
    </div>
  );
}