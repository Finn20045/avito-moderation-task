import React, { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  Container, Typography, CircularProgress, Alert, Box, Pagination, Chip, Paper, Button, Checkbox, FormControlLabel, Fade 
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';

// Хуки и API
import { useAds } from '../features/ads/hooks/useAds';
import { useBulkActions } from '../features/ads/hooks/useBulkActions';
import { useUrlFilters } from '../features/ads/hooks/useUrlFilters';
import { getAds } from '../features/ads/api';

// Компоненты
import { AdCard } from '../components/AdCard';
import { AdsFilters } from '../features/ads/components/AdsFilters';
import { RejectModal } from '../features/moderation/RejectModal';

// Настройки анимации для списка
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const AdsListPage = () => {
  const queryClient = useQueryClient();
  const { filters, setFilters } = useUrlFilters();

  // Состояние для массового выбора
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  
  // Основные данные
  const { data, isLoading, isError } = useAds(filters);
  const { approveMany, rejectMany, isApprovingMany, isRejectingMany } = useBulkActions();

  const adsList = data?.ads || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const currentTotal = data?.pagination?.totalItems || 0;
  
  // === REAL-TIME проверка новых объявлений ===
  const isCheckEnabled = Number(filters.page) === 1 && !filters.search && !filters.categoryId;

  const { data: checkData } = useQuery({
    queryKey: ['ads-check-new'],
    queryFn: () => getAds({ page: 1, limit: 1 }),
    refetchInterval: 5000,
    enabled: isCheckEnabled, 
  });

  const serverTotal = checkData?.pagination?.totalItems || 0;
  const newAdsCount = serverTotal - currentTotal;
  const hasNewAds = newAdsCount > 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['ads'] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // ==========================================

  const isActionLoading = isApprovingMany || isRejectingMany;

  // Логика выбора карточек
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (adsList.length === 0) return;
    const allIds = adsList.map(ad => ad.id);
    const isAllSelected = allIds.every(id => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      const newIds = [...selectedIds];
      allIds.forEach(id => { if (!newIds.includes(id)) newIds.push(id); });
      setSelectedIds(newIds);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBulkApprove = async () => {
    await approveMany(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkRejectConfirm = async (reason: string, comment: string) => {
    await rejectMany({ ids: selectedIds, reason, comment });
    setSelectedIds([]);
    setIsRejectModalOpen(false);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (isError) return <Alert severity="error" sx={{ mt: 4 }}>Ошибка загрузки данных</Alert>;

  const allPageIds = adsList.map(ad => ad.id);
  const isAllPageSelected = adsList.length > 0 && allPageIds.every(id => selectedIds.includes(id));

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
      
      {/* Кнопка новых объявлений */}
      <Fade in={hasNewAds}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="info" startIcon={<RefreshIcon />} onClick={handleRefresh} sx={{ borderRadius: 20 }}>
                Показать новые объявления: {newAdsCount}
            </Button>
        </Box>
      </Fade>

      {/* Шапка списка */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" component="h1">Объявления</Typography>
            <Chip label={currentTotal} color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
        </Box>
        <FormControlLabel
            control={<Checkbox checked={isAllPageSelected} onChange={handleSelectAll} />}
            label="Выбрать все на странице"
        />
      </Box>

      {/* Фильтры */}
      <AdsFilters filters={filters} onChange={setFilters} />

      {/* Анимированная сетка */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Grid container spacing={3}>
          {adsList.map((ad) => (
            <Grid key={ad.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div variants={itemVariants} style={{ height: '100%' }}>
                <AdCard 
                    ad={ad} 
                    selected={selectedIds.includes(ad.id)}
                    onToggleSelect={() => handleToggleSelect(ad.id)}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {adsList.length === 0 && (
        <Typography variant="h6" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
          По вашему запросу ничего не найдено
        </Typography>
      )}

      {/* Пагинация */}
      {currentTotal > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={Number(filters.page) || 1} onChange={handlePageChange} color="primary" size="large" />
        </Box>
      )}

      {/* Панель массовых действий */}
      {selectedIds.length > 0 && (
        <Paper 
            elevation={4} 
            sx={{ 
                position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', 
                zIndex: 1000, p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3,
                border: '1px solid #1976d2', bgcolor: 'background.paper'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DoneAllIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">Выбрано: {selectedIds.length}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="success" onClick={handleBulkApprove} disabled={isActionLoading}>
                   Одобрить
                </Button>
                <Button variant="contained" color="error" onClick={() => setIsRejectModalOpen(true)} disabled={isActionLoading}>
                   Отклонить
                </Button>
                <Button variant="text" color="inherit" onClick={() => setSelectedIds([])}><RemoveDoneIcon /></Button>
            </Box>
        </Paper>
      )}

      <RejectModal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        isLoading={isActionLoading}
        title={`Отклонить ${selectedIds.length} объявлений`}
        onConfirm={handleBulkRejectConfirm}
      />
    </Container>
  );
};

export default AdsListPage;