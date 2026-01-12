// src/utils/youtube.ts

export function extractYoutubeId(url: string): string | null {
  if (!url) return null;

  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(
  youtubeId: string,
  quality: "default" | "mq" | "hq" | "sd" | "maxres" = "hq"
): string {
  const qualityMap: Record<string, string> = {
    default: "default.jpg",
    mq: "mqdefault.jpg",
    hq: "hqdefault.jpg",
    sd: "sddefault.jpg",
    maxres: "maxresdefault.jpg",
  };

  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}`;
}
