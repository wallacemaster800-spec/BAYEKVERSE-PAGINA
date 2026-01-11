import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pencil } from 'lucide-react';
import { Series } from '@/hooks/useSeries';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface SeriesCardProps {
  series: Series;
  index: number;
}

export function SeriesCard({ series, index }: SeriesCardProps) {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/series/${series.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/series/${series.slug}`} className="block group">
        <article className="card-cinematic">
          {/* Cover Image */}
          <div className="relative">
            <OptimizedImage
              src={series.portada_url || ''}
              alt={series.titulo}
              size="poster"
              className="aspect-[2/3] w-full"
            />

            {/* Admin Edit Button */}
            {session && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={handleEditClick}
                title="Editar serie"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40">
              <motion.div
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center"
              >
                <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              {series.estado === 'En emisión' ? (
                <span className="badge-emision">En emisión</span>
              ) : (
                <span className="badge-finalizada">Finalizada</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {series.titulo}
            </h3>
            {series.descripcion && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {series.descripcion}
              </p>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}