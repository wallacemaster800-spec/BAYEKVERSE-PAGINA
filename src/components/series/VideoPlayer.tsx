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

  if (ytId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
          title={title}
        />
      </div>
    )
  }

  return (
    /* CONTENEDOR PADRE: 
       En landscape, se vuelve fixed y ocupa el 100% real de la pantalla (100dvh).
       Usamos flex para centrar el video perfectamente.
    */
    <div className="relative w-full aspect-video flex items-center justify-center bg-black overflow-hidden select-none 
                    landscape:fixed landscape:inset-0 landscape:z-[9999] landscape:w-screen landscape:h-[100dvh] landscape:aspect-auto">
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        /* CLAVE: object-contain. 
           Esto asegura que el video NO se corte. 
           Al estar el contenedor padre ocupando TODO el alto (100dvh), 
           el video se estirará hasta tocar arriba y abajo sin cortarse.
        */
        className="w-full h-full object-contain block outline-none border-none"
        title={title}
      />

      <style>{`
        /* Quitamos márgenes fantasmas del body al estar en landscape */
        @media (orientation: landscape) {
          body { overflow: hidden !important; }
        }

        /* Si el usuario igual presiona el botón nativo de Fullscreen, 
           forzamos a que el navegador NO meta padding extra.
        */
        video:fullscreen, video:-webkit-full-screen {
          object-fit: contain !important;
          background-color: black !important;
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Elimina bordes extra en iOS */
        video::-webkit-media-controls-enclosure {
          border-radius: 0 !important;
          width: 100% !important;
        }
      `}</style>
    </div>
  )
}