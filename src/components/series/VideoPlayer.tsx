import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
}

// 🔥 Función mejorada: Detecta URLs completas O IDs sueltos de 11 caracteres
const extractYouTubeId = (url: string) => {
  if (!url) return null;
  
  // 1. Si el string ya es un ID puro de 11 caracteres (ej: de la BD vieja)
  if (url.length === 11 && !url.includes('/') && !url.includes(' ')) {
    return url;
  }
  
  // 2. Si es un link completo de YouTube
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function VideoPlayer({ src, title = 'Video', poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Verificamos si la URL (o ID) es de YouTube
  const ytId = extractYouTubeId(src);

  useEffect(() => {
    // Si es YouTube, abortamos el efecto HLS
    if (ytId) return;

    const video = videoRef.current
    if (!video) return

    // Safari soporta HLS nativo
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } 
    // Otros navegadores → usar hls.js
    else if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
      })
      hls.loadSource(src)
      hls.attachMedia(video)

      return () => {
        hls.destroy()
      }
    }
  }, [src, ytId])

  // ==========================================
  // RENDER A: MODO YOUTUBE
  // ==========================================
  if (ytId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
    )
  }

  // ==========================================
  // RENDER B: MODO HLS (Tus videos privados)
  // ==========================================
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        controls
        poster={poster}
        className="w-full h-full"
        title={title}
      />
    </div>
  )
}