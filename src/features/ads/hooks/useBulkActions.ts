import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveAd, rejectAd } from '../api';

/**
 * Хук для выполнения массовых операций над объявлениями.
 * 
 * API не предоставляет endpoints для bulk-операций, поэтому
 * мы используем Promise.all для параллельной отправки запросов.
 */

export const useBulkActions = () => {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    // Обновляем список после завершения операций
    queryClient.invalidateQueries({ queryKey: ['ads'] });
  };

  // Массовое одобрение
  const { mutateAsync: approveMany, isPending: isApprovingMany } = useMutation({
    mutationFn: async (ids: number[]) => {
      // Запускаем все запросы параллельно
      await Promise.all(ids.map((id) => approveAd(id)));
    },
    onSuccess,
  });

  // Массовое отклонение
  const { mutateAsync: rejectMany, isPending: isRejectingMany } = useMutation({
    mutationFn: async ({ ids, reason, comment }: { ids: number[], reason: string, comment: string }) => {
      // Применяем одну причину ко всем выбранным
      await Promise.all(ids.map((id) => rejectAd(id, { reason, comment })));
    },
    onSuccess,
  });

  return {
    approveMany,
    isApprovingMany,
    rejectMany,
    isRejectingMany,
  };
};