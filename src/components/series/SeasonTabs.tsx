import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Capitulo } from '@/hooks/useSeries';
import { groupBySeason } from '@/hooks/useAllCapitulos';
import { getYoutubeThumbnail } from '@/lib/cloudinary';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface SeasonTabsProps {
  episodes: Capitulo[];
  onSelectEpisode: (episode: Capitulo) => void;
  selectedEpisodeId?: string;
  hasPurchased?: boolean; // 🔥 Prop agregada
}

export function SeasonTabs({ episodes, onSelectEpisode, selectedEpisodeId, hasPurchased = false }: SeasonTabsProps) {
  const seasonMap = groupBySeason(episodes);
  const seasons = Array.from(seasonMap.keys()).sort((a, b) => a - b);
  const hasMultipleSeasons = seasons.length > 1;

  const [activeSeason, setActiveSeason] = useState(String(seasons[0] || 1));

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay episodios disponibles</p>
      </div>
    );
  }

  // Single season - simple grid
  if (!hasMultipleSeasons) {
    return <EpisodeList episodes={episodes} onSelectEpisode={onSelectEpisode} selectedEpisodeId={selectedEpisodeId} hasPurchased={hasPurchased} />;
  }

  // Multiple seasons - tabbed interface
  return (
    <Tabs value={activeSeason} onValueChange={setActiveSeason} className="w-full">
      <TabsList className="w-full justify-start bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
        {seasons.map((season) => (
          <TabsTrigger
            key={season}
            value={String(season)}
            className="tab-cinematic"
          >
            Temporada {season}
          </TabsTrigger>
        ))}
      </TabsList>

      {seasons.map((season) => (
        <TabsContent key={season} value={String(season)}>
          <EpisodeList 
            episodes={seasonMap.get(season) || []} 
            onSelectEpisode={onSelectEpisode} 
            selectedEpisodeId={selectedEpisodeId} 
            hasPurchased={hasPurchased}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

interface EpisodeListProps {
  episodes: Capitulo[];
  onSelectEpisode: (episode: Capitulo) => void;
  selectedEpisodeId?: string;
  hasPurchased?: boolean; // 🔥 Prop agregada
}

function EpisodeList({ episodes, onSelectEpisode, selectedEpisodeId, hasPurchased = false }: EpisodeListProps) {
  return (
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
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onSelectEpisode(episode);
            }}
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
                className={`w-full h-full ${isLocked ? 'grayscale-[50%] brightness-75' : ''}`}
              />
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
              
              {/* Etiqueta Premium */}
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
  );
}