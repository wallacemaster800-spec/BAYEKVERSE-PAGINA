import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Series } from '@/hooks/useSeries';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useState, useEffect } from 'react';

interface SeriesCardProps {
  series: Series;
  index: number;
}

export function SeriesCard({ series, index }: SeriesCardProps) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Detectar si el dispositivo es móvil para optimizar animaciones
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const animationProps = isMobile ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05, duration: 0.3 }
  };

  const hoverProps = isMobile ? {} : {
    whileHover: { scale: 1.05 }
  };

  return (
    <motion.div {...animationProps}>
      <Link to={`/series/${series.slug}`} className="block group">
        <article className="card-cinematic transform-gpu overflow-hidden bg-card/30 border border-white/5 hover:border-primary/50 transition-all duration-500 shadow-2xl">
          
          {/* Imagen de Portada */}
          <div className="relative overflow-hidden aspect-[2/3]">
            <OptimizedImage
              src={series.portada_url || ''}
              alt={series.titulo}
              size="card"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay de Play */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-[2px]">
              <motion.div
                {...hoverProps}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Etiqueta de Estado */}
            <div className="absolute top-4 right-4 z-10">
              {series.estado === 'En emisión' ? (
                <span className="badge-emision text-[10px] md:text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-md">
                  En emisión
                </span>
              ) : (
                <span className="badge-finalizada text-[10px] md:text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
                  Finalizada
                </span>
              )}
            </div>
          </div>

          {/* Contenido de Texto */}
          <div className="p-4 md:p-5">
            <h3 className="font-display font-bold text-lg md:text-xl line-clamp-1 group-hover:text-primary transition-colors duration-300 uppercase tracking-tighter italic">
              {series.titulo}
            </h3>
            {series.descripcion && (
              <p className="text-xs md:text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                {series.descripcion}
              </p>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}