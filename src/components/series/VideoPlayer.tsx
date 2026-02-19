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

  // --- CONTENEDOR BASE ---
  // Eliminamos 'aspect-video' para que el contenedor sea flexible
  const containerClass = "relative w-full flex items-center justify-center bg-black rounded-xl overflow-hidden shadow-2xl select-none border border-white/5";

  if (ytId) {
    return (
      <div className={`${containerClass} aspect-video`}>
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
        /* CLAVE: 
           - w-full y h-auto en vertical.
           - max-h-[80vh] para que en horizontal no "rebalse" la pantalla.
           - object-contain para asegurar que NO se pierda ni un píxel.
        */
        className="w-full h-auto max-h-[85vh] md:max-h-[none] object-contain rounded-xl"
        title={title}
      />
    </div>
  )
}