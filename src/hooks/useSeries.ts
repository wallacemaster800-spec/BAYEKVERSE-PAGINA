import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PAGINATION_LIMIT } from '@/lib/constants';

/* ======================
   TYPES
====================== */

export interface Series {
  id: string;
  titulo: string;
  descripcion: string | null;
  portada_url: string | null;
  estado: 'En emisión' | 'Finalizada';
  slug: string;
  created_at: string;
  updated_at: string;
  es_pago?: boolean;
  lemon_url?: string | null;
  precio?: number | null;
}

export interface Capitulo {
  id: string;
  series_id: string;
  titulo: string;
  video_url?: string | null;
  youtube_id: string;
  miniatura_url: string | null;
  orden: number;
  temporada: number;
  created_at: string;
  es_pago?: boolean;
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

/* ======================
   QUERIES
====================== */

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
    staleTime: 1000 * 60 * 60 * 24,
  });
}

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
  });
}

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
  });
}

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
  });
}

export function useGaleria(seriesId: string) {
  return useQuery({
    queryKey: ['galeria', seriesId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galeria')
        .select('*')
        .eq('series_id', seriesId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GaleriaItem[];
    },
    enabled: !!seriesId,
  });
}

/* ======================
   MUTATIONS
====================== */

function assertId(id?: string | null) {
  if (!id || id.trim() === '') {
    throw new Error('ID inválido para operación crítica');
  }
}

export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Series>) => {
      const { data, error } = await supabase
        .from('series')
        .insert([payload])
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

export function useDeleteSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      assertId(id);
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
    mutationFn: async (payload: Partial<Capitulo>) => {
      const { data, error } = await supabase
        .from('capitulos')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data as Capitulo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['capitulos', data.series_id],
      });
    },
  });
}

export function useDeleteCapitulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, seriesId }: { id: string; seriesId: string }) => {
      assertId(id);
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
    mutationFn: async (payload: Partial<Lore>) => {
      const { data, error } = await supabase
        .from('lore')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data as Lore;
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
      assertId(id);
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
    mutationFn: async (payload: Partial<GaleriaItem>) => {
      const { data, error } = await supabase
        .from('galeria')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data as GaleriaItem;
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
      assertId(id);
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
