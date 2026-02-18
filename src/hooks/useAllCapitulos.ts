import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Capitulo {
  id: string
  titulo: string
  video_url?: string
  orden: number
  temporada: number
  miniatura_url?: string
  es_pago?: boolean   // ✅ NUEVO
}

/**
 * Fetch ALL episodes for a series (no pagination)
 */
export function useAllCapitulos(seriesId: string) {

  return useQuery({

    queryKey: ['all-capitulos', seriesId],

    queryFn: async () => {

      const { data, error } = await supabase
        .from('capitulos')
        .select('*')
        .eq('series_id', seriesId)
        .order('temporada', { ascending: true })
        .order('orden', { ascending: true });

      if (error) throw error;

      return data as Capitulo[];

    },

    enabled: !!seriesId,

    staleTime: 1000 * 60 * 60 * 24,

  });
}

/**
 * Group episodes by season
 */
export function groupBySeason(episodes: Capitulo[]) {

  const grouped = new Map<number, Capitulo[]>();

  for (const ep of episodes) {

    const season = ep.temporada || 1;

    if (!grouped.has(season)) grouped.set(season, []);

    grouped.get(season)!.push(ep);
  }

  return grouped;
}
