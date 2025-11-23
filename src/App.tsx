import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { AnimatePresence } from 'framer-motion'; // Для анимации смены страниц

// Компоненты страниц
import AdsListPage from './pages/AdsListPage';
import AdDetailsPage from './pages/AdDetailsPage';
import StatsPage from './pages/StatsPage';

// Хуки и UI
import { useColorMode } from './app/theme/ThemeContext';
import { GlobalLoader } from './components/ui/GlobalLoader';
import { PageTransition } from './components/layout/PageTransition';

function App() {
  const { mode, toggleColorMode } = useColorMode();
  const location = useLocation(); // Нужно для отслеживания смены страниц

  return (
    <>
      {/* Полоска загрузки сверху */}
      <GlobalLoader />

      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Avito Moderation
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button color="inherit" component={Link} to="/list">
              Объявления
            </Button>
            <Button color="inherit" component={Link} to="/stats">
              Статистика
            </Button>

            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        {/* AnimatePresence позволяет анимировать исчезновение старой страницы */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/list" replace />} />
            
            <Route path="/list" element={
              <PageTransition>
                <AdsListPage />
              </PageTransition>
            } />
            
            <Route path="/item/:id" element={
              <PageTransition>
                <AdDetailsPage />
              </PageTransition>
            } />
            
            <Route path="/stats" element={
              <PageTransition>
                <StatsPage />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </Container>
    </>
  );
}

export default App;