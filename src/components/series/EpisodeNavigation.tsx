import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Capitulo } from '@/hooks/useSeries';

interface EpisodeNavigationProps {
  currentEpisode: Capitulo;
  allEpisodes: Capitulo[];
  onNavigate: (episode: Capitulo) => void;
}

export function EpisodeNavigation({ 
  currentEpisode, 
  allEpisodes, 
  onNavigate 
}: EpisodeNavigationProps) {
  const currentIndex = allEpisodes.findIndex(ep => ep.id === currentEpisode.id);
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  const handleNavigate = (episode: Capitulo) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNavigate(episode);
  };

  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      <Button
        variant="outline"
        onClick={() => prevEpisode && handleNavigate(prevEpisode)}
        disabled={!prevEpisode}
        className="flex-1 max-w-[200px]"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        <span className="truncate">
          {prevEpisode ? `Ep. ${prevEpisode.orden}` : 'Anterior'}
        </span>
      </Button>

      <div className="text-center text-sm text-muted-foreground hidden sm:block">
        <span className="font-medium text-foreground">
          T{currentEpisode.temporada || 1} · Ep. {currentEpisode.orden}
        </span>
      </div>

      <Button
        variant="outline"
        onClick={() => nextEpisode && handleNavigate(nextEpisode)}
        disabled={!nextEpisode}
        className="flex-1 max-w-[200px]"
      >
        <span className="truncate">
          {nextEpisode ? `Ep. ${nextEpisode.orden}` : 'Siguiente'}
        </span>
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
