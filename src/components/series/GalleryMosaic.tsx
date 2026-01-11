import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useGaleria, GaleriaItem } from '@/hooks/useSeries';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { SkeletonGallery } from '@/components/ui/skeleton-card';
import { Button } from '@/components/ui/button';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';
import { PAGINATION_LIMIT } from '@/lib/constants';

interface GalleryMosaicProps {
  seriesId: string;
  isActive?: boolean;
}

export function GalleryMosaic({ seriesId, isActive = true }: GalleryMosaicProps) {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useGaleria(isActive ? seriesId : '', page);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error al cargar la galería</p>
      </div>
    );
  }

  if (isLoading && page === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonGallery key={i} />
        ))}
      </div>
    );
  }

  const images = data?.data || [];
  const totalCount = data?.count || 0;
  const hasMore = (page + 1) * PAGINATION_LIMIT < totalCount;

  if (images.length === 0 && page === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay imágenes en la galería</p>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;

    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1);
    } else {
      setLightboxIndex(lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.button
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="group aspect-square rounded-lg overflow-hidden bg-card border border-border hover:border-muted-foreground/30 transition-all duration-300"
            >
              <OptimizedImage
                src={image.imagen_url}
                alt={image.titulo || 'Gallery image'}
                size="gallery"
                className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </motion.button>
          ))}
        </div>

        {hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading}
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              Cargar más imágenes
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox-overlay"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('prev');
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('next');
              }}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={optimizeCloudinaryUrl(images[lightboxIndex].imagen_url, { size: 'full' })}
              alt={images[lightboxIndex].titulo || 'Gallery image'}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {images[lightboxIndex].titulo && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 rounded-lg">
                <p className="text-sm font-medium">{images[lightboxIndex].titulo}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}