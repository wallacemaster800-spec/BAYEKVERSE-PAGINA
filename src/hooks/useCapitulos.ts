import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateCapituloInput {
  series_id: string;
  titulo: string;
  youtube_id: string;
  miniatura_url?: string;
  orden: number;
  temporada: number;
}

interface UpdateCapituloInput {
  id: string;
  titulo: string;
  youtube_id: string;
  miniatura_url?: string;
  orden: number;
  temporada: number;
}

export function useCreateCapitulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCapituloInput) => {
      const { error } = await supabase
        .from("capitulos")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["all-capitulos", variables.series_id],
      });
    },
  });
}

export function useUpdateCapitulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCapituloInput) => {
      const { id, ...payload } = data;

      const { error } = await supabase
        .from("capitulos")
        .update(payload)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-capitulos"] });
    },
  });
}
