import { useSeries } from '@/hooks/useSeries';
import { SeriesCard } from './SeriesCard';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { Film } from 'lucide-react';

export function SeriesGrid() {
  const { data: series, isLoading, error } = useSeries();

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar las series</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!series || series.length === 0) {
    return (
      <div className="text-center py-20">
        <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-display font-semibold mb-2">No hay series disponibles</h3>
        <p className="text-muted-foreground">Vuelve pronto para ver nuevo contenido.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {series.map((s, index) => (
        <SeriesCard key={s.id} series={s} index={index} />
      ))}
    </div>
  );
}