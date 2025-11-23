import { useQuery } from '@tanstack/react-query';
import { getAds } from '../api';
import { FetchAdsParams } from '../types';

/**
 * Хук для получения списка объявлений с сервера.
 * Использует React Query для кэширования, пагинации и управления состоянием загрузки.
 * 
 * @param params - Параметры фильтрации (страница, лимит, категория, поиск и т.д.)
 * @returns Объект query с данными, статусом загрузки и ошибками.
 */

export const useAds = (params: FetchAdsParams = {}) => {
  return useQuery({
    queryKey: ['ads', params], // Ключ запроса. Если params изменится, запрос выполнится заново
    queryFn: () => getAds(params),
    placeholderData: (previousData) => previousData, // KeepPreviousData: чтобы список не мигал при смене страниц
  });
};