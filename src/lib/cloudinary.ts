/**
 * Cloudinary Image Optimizer for Bayekverse
 * Automatically injects optimization parameters to reduce egress costs
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddaeowmej';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;
const BAYEKVERSE_FOLDER = 'bayekverse';

type ImageSize = 'thumbnail' | 'card' | 'poster' | 'gallery' | 'full';

const SIZE_WIDTHS: Record<ImageSize, number> = {
  thumbnail: 320,
  card: 480,
  poster: 800,
  gallery: 1200,
  full: 1920,
};

interface OptimizeOptions {
  size?: ImageSize;
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop';
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Optimizes a Cloudinary URL with automatic format, quality, and size transformations
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: OptimizeOptions = {}
): string {
  // If not a Cloudinary URL, return as-is
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    size = 'card',
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  // Determine final width
  const finalWidth = width || SIZE_WIDTHS[size];

  // Build transformation string
  const transformations: string[] = [
    `f_${format}`,
    `q_${quality}`,
    `w_${finalWidth}`,
    `c_${crop}`,
    `g_${gravity}`,
  ];

  if (height) {
    transformations.push(`h_${height}`);
  }

  const transformString = transformations.join(',');

  // Parse and rebuild URL with transformations
  try {
    // Match Cloudinary URL patterns
    const uploadPattern = /\/upload\/(?:v\d+\/)?(.+)$/;
    const match = url.match(uploadPattern);

    if (match) {
      const imagePath = match[1];
      return `${CLOUDINARY_BASE_URL}/image/upload/${transformString}/${imagePath}`;
    }
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
  }

  return url;
}

/**
 * Builds a Cloudinary URL for an image in the bayekverse folder
 */
export function buildCloudinaryUrl(
  imageName: string,
  options: OptimizeOptions = {}
): string {
  const {
    size = 'card',
    width,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  const finalWidth = width || SIZE_WIDTHS[size];

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    `w_${finalWidth}`,
    `c_${crop}`,
    `g_${gravity}`,
  ].join(',');

  return `${CLOUDINARY_BASE_URL}/image/upload/${transformations}/${BAYEKVERSE_FOLDER}/${imageName}`;
}

/**
 * Creates a placeholder blur URL for lazy loading
 */
export function getBlurPlaceholder(url: string): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    const uploadPattern = /\/upload\/(?:v\d+\/)?(.+)$/;
    const match = url.match(uploadPattern);

    if (match) {
      const imagePath = match[1];
      return `${CLOUDINARY_BASE_URL}/image/upload/f_auto,q_auto:low,w_50,e_blur:500/${imagePath}`;
    }
  } catch (error) {
    console.error('Error creating blur placeholder:', error);
  }

  return url;
}

/**
 * Extracts YouTube video ID from various URL formats
 */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;

  // Already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generates a YouTube thumbnail URL
 */
export function getYoutubeThumbnail(
  videoId: string,
  quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'
): string {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}