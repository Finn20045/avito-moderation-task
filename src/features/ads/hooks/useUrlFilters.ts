import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { FetchAdsParams } from '../types';

/**
 * Хук для двухсторонней синхронизации фильтров с URL браузера.
 * 
 * Зачем это нужно:
 * 1. Пользователь может поделиться ссылкой на отфильтрованный список.
 * 2. При перезагрузке страницы фильтры сохраняются.
 * 3. Работает кнопка "Назад" в браузере.
 */

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. ПАРСИНГ: Превращаем URL параметры (?page=1&search=...) в объект
  const filters: FetchAdsParams = useMemo(() => {
    const params: FetchAdsParams = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10,
    };

    if (searchParams.get('search')) params.search = searchParams.get('search')!;
    
    // Обработка чисел
    if (searchParams.get('categoryId')) params.categoryId = Number(searchParams.get('categoryId'));
    if (searchParams.get('minPrice')) params.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.get('maxPrice')) params.maxPrice = Number(searchParams.get('maxPrice'));
    
    // Обработка сортировки
    if (searchParams.get('sortBy')) params.sortBy = searchParams.get('sortBy') as any;
    if (searchParams.get('sortOrder')) params.sortOrder = searchParams.get('sortOrder') as any;

    // Обработка статусов (массив)
    // URL может быть ?status=approved&status=pending
    const statuses = searchParams.getAll('status');
    if (statuses.length > 0) {
      params.status = statuses;
    }

    return params;
  }, [searchParams]);

  // 2. ЗАПИСЬ: Превращаем объект обратно в URL
  const setFilters = (newFilters: FetchAdsParams | ((prev: FetchAdsParams) => FetchAdsParams)) => {
    
    // Поддержка функционального обновления setFilters(prev => ...)
    const resolvedFilters = typeof newFilters === 'function' 
      ? newFilters(filters) 
      : newFilters;

    const params = new URLSearchParams();

    // Пробегаемся по всем ключам и добавляем их в URL, только если они не пустые
    Object.entries(resolvedFilters).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) return;

      if (key === 'status' && Array.isArray(value)) {
        // Массивы записываем как несколько параметров с одним ключом
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params, { replace: true }); // replace: true чтобы не засорять историю браузера каждым чихом
  };

  return { filters, setFilters };
};