import { useEffect } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './nprogress-custom.css';

// Настройка NProgress (убираем крутящийся спиннер справа, оставляем только полоску)
NProgress.configure({ showSpinner: false });

export const GlobalLoader = () => {
  // Хуки React Query: следят, есть ли активные загрузки или мутации
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  useEffect(() => {
    if (isFetching > 0 || isMutating > 0) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isFetching, isMutating]);

  return null; // Этот компонент ничего не рендерит в DOM, он просто управляет NProgress
};