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
    } else if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 30 })
      hls.loadSource(src)
      hls.attachMedia(video)
      return () => hls.destroy()
    }
  }, [src, ytId])

  // YouTube player
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

  // HLS / MP4 player
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        controls
        playsInline
        poster={poster}
        className="w-full h-full object-contain block outline-none border-none"
        title={title}
      />
    </div>
  )
}
