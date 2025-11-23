import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/base';

export const useManageAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string, status: string, reason?: string }) => 
      api.patch(`/ads/${id}`, { status, rejectionReason: reason }),
    
    onSuccess: () => {
      // Инвалидируем кэш, чтобы списки обновились
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
};