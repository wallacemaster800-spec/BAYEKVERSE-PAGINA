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

  // --- RENDER YOUTUBE ---
  if (ytId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl select-none">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      </div>
    )
  }

  // --- RENDER HLS (Punto Zero) ---
  return (
    <div className="relative w-full aspect-video flex items-center justify-center bg-black overflow-hidden select-none 
                    landscape:fixed landscape:inset-0 landscape:z-[100] landscape:w-screen landscape:h-[100dvh] landscape:aspect-auto">
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        /* Usamos object-contain. Esto garantiza que el video SIEMPRE se vea completo.
           Al estar en un contenedor que ocupa 100dvh en landscape, tocará techo y suelo,
           dejando márgenes negros a los lados si la pantalla del celular es muy alargada. */
        className="w-full h-full object-contain mx-auto block outline-none border-none"
        title={title}
        style={{ 
          backgroundColor: 'black',
          WebkitTapHighlightColor: 'transparent'
        }}
      />

      {/* ESTILOS CRÍTICOS PARA PANTALLA COMPLETA NATIVA */}
      <style>{`
        /* Forzamos contain en modo Fullscreen nativo para evitar el zoom/recorte */
        video:fullscreen {
          object-fit: contain !important;
        }
        /* Para navegadores basados en Webkit (Safari/iOS/Chrome Mobile) */
        video:-webkit-full-screen {
          object-fit: contain !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        /* Elimina la línea blanca de renderizado en los bordes */
        video::-webkit-media-controls-enclosure {
          border-radius: 0 !important;
        }
        /* Asegura que el fondo sobrante a los lados sea negro puro */
        video::backdrop {
          background-color: black;
        }
      `}</style>
    </div>
  )
}