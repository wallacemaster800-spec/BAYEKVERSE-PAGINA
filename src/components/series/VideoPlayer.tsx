import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
}

const extractYouTubeId = (url: string) => {
  if (!url) return null
  if (url.length === 11 && !url.includes('/') && !url.includes(' ')) return url
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export function VideoPlayer({ src, title = 'Video', poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ytId = extractYouTubeId(src)

  useEffect(() => {
    if (ytId) return // YouTube → no HLS

    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    // 1️⃣ Primero HLS
    if (Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: 30 })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Inicializamos Plyr DESPUÉS de que HLS esté listo
        new Plyr(video, {
          controls: [
            'play-large','play','rewind','fast-forward','progress','current-time','mute','volume','fullscreen'
          ],
          ratio: '16:9',
          clickToPlay: true,
          fullscreen: { enabled: true, fallback: true, iosNative: true }
        })
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        new Plyr(video, {
          controls: [
            'play-large','play','rewind','fast-forward','progress','current-time','mute','volume','fullscreen'
          ],
          ratio: '16:9',
          clickToPlay: true,
          fullscreen: { enabled: true, fallback: true, iosNative: true }
        })
      })
    }

    return () => {
      if (hls) hls.destroy()
    }
  }, [src, ytId])

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
    )
  }

  // HLS/MP4
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 flex justify-center items-center">
      <video
        ref={videoRef}
        playsInline
        poster={poster} 
        className="max-h-full w-auto object-contain block outline-none border-none" // ⚡ ocupa todo el alto, márgenes laterales normales
        title={title}
      />

      <style>{`
        video:fullscreen, video:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          object-fit: contain !important; 
          background-color: black !important;
        }
        @media (orientation: landscape) {
          body { overflow: hidden !important; }
        }
      `}</style>
    </div>
  )
}
