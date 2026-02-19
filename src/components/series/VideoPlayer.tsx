import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
}

const extractYouTubeId = (url: string) => {
  if (!url) return null;
  if (url.length === 11 && !url.includes('/') && !url.includes(' ')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function VideoPlayer({ src, title = 'Video', poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ytId = extractYouTubeId(src);

  useEffect(() => {
    if (ytId) return;
    const video = videoRef.current
    if (!video) return

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } 
    else if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 30 })
      hls.loadSource(src)
      hls.attachMedia(video)
      return () => hls.destroy()
    }
  }, [src, ytId])

  // Contenedor que se adapta totalmente
  const containerClass = "relative w-full flex items-center justify-center bg-black overflow-hidden select-none";

  if (ytId) {
    return (
      <div className={`${containerClass} aspect-video rounded-xl shadow-2xl`}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
          title={title}
        />
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        /* - h-auto en vertical.
           - landscape:h-[100dvh] fuerza a que toque el borde superior e inferior en horizontal.
           - object-contain asegura que NO se corte nada de la imagen.
        */
        className="w-full h-auto landscape:h-[100dvh] landscape:w-auto object-contain mx-auto"
        title={title}
        style={{ backgroundColor: 'black' }}
      />
    </div>
  )
}