import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StockSheet } from '../types/stockSheet';
import { getDefaultSheetState } from '../utils/defaultSheetState';

export function useStockSheet() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const query = useQuery<StockSheet | null>({
    queryKey: ['stockSheet'],
    queryFn: async () => {
      if (!actor) return null;
      
      // Since backend doesn't have stock sheet methods yet,
      // we'll use localStorage as a temporary solution
      const stored = localStorage.getItem('stockSheet');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    },
    enabled: !!actor && !actorFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async (sheet: StockSheet) => {
      if (!actor) throw new Error('Actor not available');
      
      // Temporary: save to localStorage until backend is updated
      localStorage.setItem('stockSheet', JSON.stringify(sheet));
      return sheet;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['stockSheet'], data);
    },
  });

  return {
    data: query.data,
    isLoading: actorFetching || query.isLoading,
    saveSheet: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error?.message,
  };
}
