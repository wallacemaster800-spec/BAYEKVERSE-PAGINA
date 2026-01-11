import { QueryClient } from '@tanstack/react-query';

// Crear un custom persister que use localStorage
const localStoragePersister = {
  persistClient: (client: QueryClient) => {
    const cache = client.getQueryCache();
    const persistData = {
      queries: cache.getAll().map((query) => ({
        queryKey: query.queryKey,
        state: query.state,
      })),
    };
    localStorage.setItem('react-query-cache', JSON.stringify(persistData));
  },
  restoreClient: () => {
    try {
      const cached = localStorage.getItem('react-query-cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },
  removeClient: () => {
    localStorage.removeItem('react-query-cache');
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 24 horas de cache para data estática
      staleTime: 1000 * 60 * 60 * 24,
      // No refetch cuando vuelves a la ventana (ya está en cache)
      refetchOnWindowFocus: false,
      // No refetch cuando se remonta el componente
      refetchOnMount: false,
      // 5 minutos para mantener data en garbage collection
      gcTime: 1000 * 60 * 5,
      // Reintentar 2 veces en caso de error
      retry: 2,
      // 1 segundo de delay entre reintentos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
