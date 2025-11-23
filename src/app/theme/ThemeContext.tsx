import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { ruRU } from '@mui/material/locale'; // Русификация компонентов MUI

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
}

// Создаем контекст
const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

// Хук для использования контекста в компонентах
export const useColorMode = () => useContext(ColorModeContext);

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. Инициализация: читаем из localStorage или берем 'light' по умолчанию
  const [mode, setMode] = useState<ColorMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
  });

  // 2. Функция переключения
  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode); // Сохраняем выбор
          return newMode;
        });
      },
    }),
    [mode],
  );

  // 3. Создание самой темы MUI
  const theme = useMemo(
    () =>
      createTheme(
        {
          palette: {
            mode, // 'light' или 'dark'
            // Можно кастомизировать цвета здесь
            primary: {
              main: mode === 'light' ? '#1976d2' : '#90caf9',
            },
            background: {
              default: mode === 'light' ? '#f5f5f5' : '#121212',
              paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
            },
          },
        },
        ruRU, // Применяем локализацию
      ),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline /> {/* Сброс CSS и установка фона */}
        {children}
      </MUIThemeProvider>
    </ColorModeContext.Provider>
  );
};