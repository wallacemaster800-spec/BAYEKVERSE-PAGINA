import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronDown, Lock } from 'lucide-react';
import { useCapitulos, Capitulo } from '@/hooks/useSeries';
import { SkeletonEpisode } from '@/components/ui/skeleton-card';
import { getYoutubeThumbnail } from '@/lib/cloudinary';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';
import { PAGINATION_LIMIT } from '@/lib/constants';

interface EpisodeGridProps {
  seriesId: string;
  onSelectEpisode: (episode: Capitulo) => void;
  selectedEpisodeId?: string;
  hasPurchased?: boolean; // 🔥 Nuevo prop para saber si compró
}

export function EpisodeGrid({ seriesId, onSelectEpisode, selectedEpisodeId, hasPurchased = false }: EpisodeGridProps) {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useCapitulos(seriesId, page);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error al cargar episodios</p>
      </div>
    );
  }

  if (isLoading && page === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonEpisode key={i} />
        ))}
      </div>
    );
  }

  const episodes = data?.data || [];
  const totalCount = data?.count || 0;
  const hasMore = (page + 1) * PAGINATION_LIMIT < totalCount;

  if (episodes.length === 0 && page === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay episodios disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {episodes.map((episode, index) => {
          
          // Lógica de bloqueo
          const isLocked = episode.es_pago && !hasPurchased;

          return (
            <motion.button
              key={episode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectEpisode(episode)}
              className={`group text-left rounded-lg overflow-hidden bg-card border transition-all duration-300 hover:border-muted-foreground/30 ${
                selectedEpisodeId === episode.id
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border'
              }`}
            >
              <div className="relative aspect-video">
                <OptimizedImage
                  src={episode.miniatura_url || getYoutubeThumbnail(episode.youtube_id)}
                  alt={episode.titulo}
                  size="thumbnail"
                  className={`w-full h-full ${isLocked ? 'grayscale-[50%] brightness-75' : ''}`} // Oscurece un poco si está bloqueado
                />
                
                {/* Ícono central al hacer hover (Play o Candado) */}
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLocked ? 'bg-amber-500/90' : 'bg-primary/90'}`}>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-black" fill="currentColor" />
                    ) : (
                      <Play className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" />
                    )}
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-background/80 rounded text-xs font-medium">
                  Ep. {episode.orden}
                </div>
                
                {/* Etiqueta Premium fija arriba a la derecha si es de pago */}
                {episode.es_pago && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-black text-[9px] uppercase font-black px-1.5 py-0.5 rounded shadow-sm">
                    {isLocked ? <Lock className="w-2.5 h-2.5 inline mr-1" /> : ''}
                    Premium
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className={`text-sm font-medium line-clamp-2 transition-colors ${isLocked ? 'group-hover:text-amber-500' : 'group-hover:text-primary'}`}>
                  {episode.titulo}
                </h4>
              </div>
            </motion.button>
          )
        })}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            Cargar más episodios
          </Button>
        </div>
      )}
    </div>
  );
}