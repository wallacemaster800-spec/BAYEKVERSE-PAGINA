import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PAGINATION_LIMIT } from '@/lib/constants';

export interface Series {
  id: string;
  titulo: string;
  descripcion: string | null;
  portada_url: string | null;
  estado: 'En emisión' | 'Finalizada';
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Capitulo {
  id: string;
  series_id: string;
  titulo: string;
  youtube_id: string;
  miniatura_url: string | null;
  orden: number;
  temporada: number;
  created_at: string;
}

export interface Lore {
  id: string;
  series_id: string;
  titulo: string;
  contenido_md: string | null;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface GaleriaItem {
  id: string;
  series_id: string;
  imagen_url: string;
  titulo: string | null;
  created_at: string;
}

// Fetch all series
export function useSeries() {
  return useQuery({
    queryKey: ['series'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Series[];
    },
    // 24 horas de cache para data estática
    staleTime: 1000 * 60 * 60 * 24,
  });
}

// Fetch single series by slug
export function useSeriesBySlug(slug: string) {
  return useQuery({
    queryKey: ['series', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Series | null;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Fetch episodes with pagination
export function useCapitulos(seriesId: string, page: number = 0) {
  return useQuery({
    queryKey: ['capitulos', seriesId, page],
    queryFn: async () => {
      const from = page * PAGINATION_LIMIT;
      const to = from + PAGINATION_LIMIT - 1;

      const { data, error, count } = await supabase
        .from('capitulos')
        .select('*', { count: 'exact' })
        .eq('series_id', seriesId)
        .order('orden', { ascending: true })
        .range(from, to);

      if (error) throw error;
      return { data: data as Capitulo[], count: count ?? 0 };
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Fetch lore
export function useLore(seriesId: string) {
  return useQuery({
    queryKey: ['lore', seriesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lore')
        .select('*')
        .eq('series_id', seriesId)
        .order('orden', { ascending: true });

      if (error) throw error;
      return data as Lore[];
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Fetch gallery with pagination
export function useGaleria(seriesId: string, page: number = 0) {
  return useQuery({
    queryKey: ['galeria', seriesId, page],
    queryFn: async () => {
      const from = page * PAGINATION_LIMIT;
      const to = from + PAGINATION_LIMIT - 1;

      const { data, error, count } = await supabase
        .from('galeria')
        .select('*', { count: 'exact' })
        .eq('series_id', seriesId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data as GaleriaItem[], count: count ?? 0 };
    },
    enabled: !!seriesId,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Admin mutations
export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (series: Omit<Series, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('series')
        .insert(series)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

export function useUpdateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Series> & { id: string }) => {
      const { data, error } = await supabase
        .from('series')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['series', data.slug] });
    },
  });
}

export function useDeleteSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('series')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
  });
}

export function useCreateCapitulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (capitulo: Omit<Capitulo, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('capitulos')
        .insert(capitulo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['capitulos', data.series_id] });
    },
  });
}

export function useUpdateCapitulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Capitulo> & { id: string }) => {
      const { data, error } = await supabase
        .from('capitulos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['capitulos', data.series_id] });
    },
  });
}

export function useDeleteCapitulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, seriesId }: { id: string; seriesId: string }) => {
      const { error } = await supabase
        .from('capitulos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return seriesId;
    },
    onSuccess: (seriesId) => {
      queryClient.invalidateQueries({ queryKey: ['capitulos', seriesId] });
    },
  });
}

export function useCreateLore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lore: Omit<Lore, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('lore')
        .insert(lore)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lore', data.series_id] });
    },
  });
}

export function useUpdateLore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lore> & { id: string }) => {
      const { data, error } = await supabase
        .from('lore')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lore', data.series_id] });
    },
  });
}

export function useDeleteLore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, seriesId }: { id: string; seriesId: string }) => {
      const { error } = await supabase
        .from('lore')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return seriesId;
    },
    onSuccess: (seriesId) => {
      queryClient.invalidateQueries({ queryKey: ['lore', seriesId] });
    },
  });
}

export function useCreateGaleriaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<GaleriaItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('galeria')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['galeria', data.series_id] });
    },
  });
}

export function useDeleteGaleriaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, seriesId }: { id: string; seriesId: string }) => {
      const { error } = await supabase
        .from('galeria')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return seriesId;
    },
    onSuccess: (seriesId) => {
      queryClient.invalidateQueries({ queryKey: ['galeria', seriesId] });
    },
  });
}