import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveAd, rejectAd, requestChangesAd } from '../api';

export const useAdActions = (adId: number) => {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ad', String(adId)] });
    queryClient.invalidateQueries({ queryKey: ['ads'] });
  };

  const { mutate: onApprove, isPending: isApproving } = useMutation({
    mutationFn: () => approveAd(adId),
    onSuccess,
  });

  const { mutate: onReject, isPending: isRejecting } = useMutation({
    mutationFn: (data: { reason: string; comment?: string }) => rejectAd(adId, data),
    onSuccess,
  });

  const { mutate: onRequestChanges, isPending: isRequestingChanges } = useMutation({
    mutationFn: (data: { reason: string; comment?: string }) => requestChangesAd(adId, data),
    onSuccess,
  });

  return {
    onApprove,
    isApproving,
    onReject,
    isRejecting,
    onRequestChanges,      // Экспортируем функцию
    isRequestingChanges,   // Экспортируем статус загрузки
  };
};