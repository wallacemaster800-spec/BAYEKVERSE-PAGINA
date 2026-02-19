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
    if (ytId) return

    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    const initPlyr = () => {
      new Plyr(video, {
        controls: [
          'play-large', 'play', 'rewind', 'fast-forward',
          'progress', 'current-time', 'mute', 'volume', 'fullscreen'
        ],
        ratio: '16:9',
        clickToPlay: true,
        fullscreen: { enabled: true, fallback: true, iosNative: true }
      })
    }

    if (Hls.isSupported()) {
      hls = new Hls({ maxBufferLength: 30 })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, initPlyr)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.addEventListener('loadedmetadata', initPlyr)
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

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5">
      <video
        ref={videoRef}
        playsInline
        poster={poster}
        className="w-full h-full object-cover block outline-none border-none" 
        title={title}
      />

      <style>{`
        video:fullscreen, video:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          object-fit: cover !important; /* zoom ligero para que no se vea cortado */
          background-color: black !important;
        }
        @media (orientation: landscape) {
          body { overflow: hidden !important; }
        }
      `}</style>
    </div>
  )
}
