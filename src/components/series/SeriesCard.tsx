import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pencil } from 'lucide-react';
import { Series } from '@/hooks/useSeries';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SeriesCardProps {
  series: Series;
  index: number;
}

export function SeriesCard({ series, index }: SeriesCardProps) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(true); // Asumimos móvil primero para evitar flash pesados

  useEffect(() => {
    // Detectamos si es pantalla grande (Desktop/Tablet)
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/series/${series.slug}`);
  };

  // Configuración de animación: Si es móvil, todo es null (sin cálculo JS)
  const animationProps = isMobile ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05, duration: 0.3 } // Reduje el delay para que cargue antes
  };

  const hoverProps = isMobile ? {} : {
    whileHover: { scale: 1.1 }
  };

  return (
    <motion.div {...animationProps}>
      <Link to={`/series/${series.slug}`} className="block group">
        <article className="card-cinematic transform-gpu"> {/* transform-gpu fuerza aceleración de hardware */}
          {/* Cover Image */}
          <div className="relative overflow-hidden rounded-t-lg">
            <OptimizedImage
              src={series.portada_url || ''}
              alt={series.titulo}
              size="card" // Aseguramos tamaño card, no poster gigante
              className="aspect-[2/3] w-full object-cover"
            />

            {/* Admin Edit Button */}
            {session && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-3 left-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                onClick={handleEditClick}
                title="Editar serie"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}

            {/* Play overlay - Simplificado en móvil */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
              <motion.div
                {...hoverProps}
                className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg"
              >
                <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Status Badge */}
            <div className="absolute top-3 right-3 z-10">
              {series.estado === 'En emisión' ? (
                <span className="badge-emision shadow-md">En emisión</span>
              ) : (
                <span className="badge-finalizada shadow-md">Finalizada</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-3 md:p-4">
            <h3 className="font-display font-semibold text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {series.titulo}
            </h3>
            {series.descripcion && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 line-clamp-2">
                {series.descripcion}
              </p>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}