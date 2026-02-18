import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
}

export function VideoPlayer({ src, title = 'Video', poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
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
  }, [src])

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
