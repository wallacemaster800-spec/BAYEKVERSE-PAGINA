import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronDown, Lock, CheckCircle2 } from 'lucide-react'; // Agregamos CheckCircle2
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
  hasPurchased?: boolean; // usuario compró la serie
}

export function EpisodeGrid({
  seriesId,
  onSelectEpisode,
  selectedEpisodeId,
  hasPurchased = false,
}: EpisodeGridProps) {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useCapitulos(seriesId, page);

  // LOG DE DEBUG: Si ves "Compra en el componente: false" en la consola, 
  // el problema es que la prop no está llegando desde SeasonTabs.
  console.log(`🎬 Serie: ${seriesId} | Compra en el componente:`, hasPurchased);

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
          // LÓGICA DE ESTADO
          const isLocked = episode.es_pago && !hasPurchased;
          const isVip = episode.es_pago && hasPurchased;

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
                  src={
                    episode.miniatura_url ||
                    getYoutubeThumbnail(episode.youtube_id)
                  }
                  alt={episode.titulo}
                  size="thumbnail"
                  className={`w-full h-full transition-all ${
                    isLocked ? 'grayscale-[50%] brightness-50' : 'grayscale-0'
                  }`}
                />

                {/* Ícono hover central */}
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      isLocked
                        ? 'bg-amber-500/90'
                        : 'bg-primary/90'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-black" fill="currentColor" />
                    ) : (
                      <Play
                        className="w-4 h-4 text-primary-foreground ml-0.5"
                        fill="currentColor"
                      />
                    )}
                  </div>
                </div>

                {/* Número episodio */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">
                  EP. {episode.orden}
                </div>

                {/* BADGE PREMIUM / VIP (Aquí es donde ocurre la magia) */}
                {episode.es_pago && (
                  <div
                    className={`absolute top-2 right-2 text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1.5 transition-colors ${
                      isLocked
                        ? 'bg-amber-500 text-black' 
                        : 'bg-green-500 text-white border border-green-400 animate-pulse-slow'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    <span>{isLocked ? 'Premium' : 'VIP'}</span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <h4
                  className={`text-sm font-medium line-clamp-2 transition-colors ${
                    isLocked
                      ? 'text-muted-foreground group-hover:text-amber-500'
                      : 'text-foreground group-hover:text-primary'
                  }`}
                >
                  {episode.titulo}
                </h4>
              </div>
            </motion.button>
          );
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