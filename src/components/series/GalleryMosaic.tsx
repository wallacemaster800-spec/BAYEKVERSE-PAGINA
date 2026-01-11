import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useGaleria } from '@/hooks/useSeries';
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
              className="group aspect-square rounded-lg overflow-hidden bg-card border border-border hover:border-muted-foreground/30 transition-all duration-300 relative"
            >
              <OptimizedImage
                src={image.imagen_url}
                alt={image.titulo || 'Gallery image'}
                size="gallery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 hidden md:flex"
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('prev');
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 hidden md:flex"
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('next');
              }}
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={optimizeCloudinaryUrl(images[lightboxIndex].imagen_url, { size: 'full' })}
              alt={images[lightboxIndex].titulo || 'Gallery image'}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Aquí borré el bloque que mostraba el título */}
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}