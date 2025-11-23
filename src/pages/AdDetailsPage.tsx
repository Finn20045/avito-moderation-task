import React, { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Container, Typography, Box, Paper, Button, Chip, CircularProgress, Alert, Divider, Stack,
  Avatar, Rating, Table, TableBody, TableCell, TableContainer, TableRow, List, ListItem, ListItemAvatar, ListItemText, IconButton, Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import WhatshotIcon from '@mui/icons-material/Whatshot';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';

import { getAdById } from '../features/ads/api';
import { useAdActions } from '../features/ads/hooks/useAdActions';
import { RejectModal } from '../features/moderation/RejectModal';

const STATUS_MAP: Record<string, string> = {
  pending: 'На модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  draft: 'Черновик',
};

const STATUS_COLOR: Record<string, "warning" | "success" | "error" | "default"> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  draft: 'default',
};

const getActionIcon = (action: string) => {
  switch (action) {
    case 'approved': return <CheckCircleIcon color="success" />;
    case 'rejected': return <CancelIcon color="error" />;
    case 'requestChanges': return <EditIcon color="warning" />;
    default: return <HistoryIcon color="action" />;
  }
};

const getActionText = (action: string) => {
  switch (action) {
    case 'approved': return 'Одобрил(а)';
    case 'rejected': return 'Отклонил(а)';
    case 'requestChanges': return 'Отправил(а) на доработку';
    default: return 'Проверил(а)';
  }
};

const AdDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentId = Number(id);
  
  const [modalAction, setModalAction] = useState<'reject' | 'changes' | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const { data: ad, isLoading, isError } = useQuery({
    queryKey: ['ad', id],
    queryFn: () => getAdById(currentId),
    enabled: !!id,
    retry: false, 
    refetchInterval: 3000,
  });

  const { onApprove, isApproving, onReject, isRejecting, onRequestChanges, isRequestingChanges } = useAdActions(currentId);

  useEffect(() => {
    if (ad && ad.images && ad.images.length > 0) {
      setSelectedImage(ad.images[0]);
    }
  }, [ad]);

  // Функции навигации
  const handlePrev = () => {
    if (currentId > 1) navigate(`/item/${currentId - 1}`);
  };
  const handleNext = () => {
    navigate(`/item/${currentId + 1}`);
  };

  const isBusy = isApproving || isRejecting || isRequestingChanges;

  // A - Одобрить
  useHotkeys('a', () => {
    if (ad?.status === 'pending' && !isBusy) onApprove();
  });

  // D - Отклонить
  useHotkeys('d', () => {
    if (ad?.status === 'pending' && !isBusy) setModalAction('reject');
  });

  // Стрелки - Навигация
  useHotkeys('right', handleNext);
  useHotkeys('left', () => {
     if (currentId > 1) handlePrev();
  });


  // Если идет загрузка, показываем спиннер
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  // Если ошибка (например, ID не существует), показываем навигацию, чтобы можно было уйти
  if (isError || !ad) {
    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/list')}>К списку</Button>
                <Box>
                    <Button startIcon={<ChevronLeftIcon />} onClick={handlePrev} disabled={currentId <= 1}>Пред</Button>
                    <Button endIcon={<ChevronRightIcon />} onClick={handleNext}>След</Button>
                </Box>
            </Box>
            <Alert severity="error">Объявление #{currentId} не найдено или удалено.</Alert>
        </Container>
    );
  }

  const handleModalConfirm = (reason: string, comment: string) => {
    if (modalAction === 'reject') {
        onReject({ reason, comment }, { onSuccess: () => setModalAction(null) });
    } else if (modalAction === 'changes') {
        onRequestChanges({ reason, comment }, { onSuccess: () => setModalAction(null) });
    }
  };

  const isActionLoading = isApproving || isRejecting || isRequestingChanges;

  

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      {/* === ВЕРХНЯЯ ПАНЕЛЬ НАВИГАЦИИ === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/list')}
            variant="outlined"
        >
            Назад к списку
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
             <Tooltip title="Предыдущее объявление">
                <span>
                    <Button 
                        startIcon={<ChevronLeftIcon />} 
                        onClick={handlePrev} 
                        disabled={currentId <= 1}
                        variant="outlined"
                    >
                        Пред
                    </Button>
                </span>
             </Tooltip>
             
             <Tooltip title="Следующее объявление">
                <Button 
                    endIcon={<ChevronRightIcon />} 
                    onClick={handleNext}
                    variant="outlined"
                >
                    След
                </Button>
             </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Box component="img" src={selectedImage || 'https://via.placeholder.com/600x400'} alt={ad.title} sx={{ width: '100%', height: 400, objectFit: 'contain', borderRadius: 1 }} />
          </Paper>
          {ad.images && ad.images.length > 1 && (
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
              {ad.images.map((img, index) => (
                <Box key={index} component="img" src={img} onClick={() => setSelectedImage(img)} sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2, cursor: 'pointer', border: selectedImage === img ? '2px solid #1976d2' : '2px solid transparent' }} />
              ))}
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>{ad.title}</Typography>
              <Stack direction="row" spacing={1}>
                <Chip label={STATUS_MAP[ad.status] || ad.status} color={STATUS_COLOR[ad.status]} />
                {ad.priority === 'urgent' && <Chip icon={<WhatshotIcon />} label="Срочно" color="secondary" variant="filled" />}
              </Stack>
            </Box>

            <Typography variant="h4" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
              {ad.price.toLocaleString('ru-RU')} ₽
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>{ad.seller?.name?.[0]?.toUpperCase() || 'U'}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{ad.seller?.name || 'Неизвестный'}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                     <Rating value={ad.seller?.rating || 0} precision={0.5} readOnly size="small" />
                     <Typography variant="body2" color="text.secondary">({ad.seller?.rating || 0})</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">С нами с {new Date(ad.seller?.registeredAt || Date.now()).toLocaleDateString()}</Typography>
                </Box>
              </Stack>
            </Paper>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Характеристики</Typography>
            {ad.characteristics && Object.keys(ad.characteristics).length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                    <TableBody>
                    {Object.entries(ad.characteristics).map(([key, value]) => (
                        <TableRow key={key}><TableCell component="th" scope="row" sx={{ color: 'text.secondary', width: '40%' }}>{key}</TableCell><TableCell>{value}</TableCell></TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
            ) : <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Нет характеристик</Typography>}
            
            <Typography variant="h6">Описание</Typography>
            <Typography variant="body1" sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>{ad.description}</Typography>

            {ad.status === 'pending' && (
              <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" color="success" size="large" fullWidth onClick={() => onApprove()} disabled={isActionLoading}>Одобрить</Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="warning" fullWidth onClick={() => setModalAction('changes')} disabled={isActionLoading}>На доработку</Button>
                    <Button variant="contained" color="error" fullWidth onClick={() => setModalAction('reject')} disabled={isActionLoading}>Отклонить</Button>
                </Box>
              </Box>
            )}

            {ad.status !== 'pending' && (
                <Alert severity="info" sx={{ mt: 3 }}>Решение принято: {STATUS_MAP[ad.status]}</Alert>
            )}

            <Box sx={{ mt: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon color="action" /> История модерации
                </Typography>
                {!ad.moderationHistory || ad.moderationHistory.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">История пуста</Typography>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        {ad.moderationHistory.map((item, index) => (
                            <React.Fragment key={item.id || index}>
                                <ListItem alignItems="flex-start">
                                    <ListItemAvatar><Avatar>{getActionIcon(item.action)}</Avatar></ListItemAvatar>
                                    <ListItemText
                                        primary={<Typography variant="subtitle2" fontWeight="bold">{item.moderatorName} — {getActionText(item.action)}</Typography>}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="caption" color="text.secondary" display="block">{new Date(item.timestamp).toLocaleString()}</Typography>
                                                {item.reason && <Typography component="span" variant="body2" color="error" display="block">Причина: {item.reason}</Typography>}
                                                {item.comment && <Typography component="span" variant="body2" color="text.primary">"{item.comment}"</Typography>}
                                            </>
                                        }
                                    />
                                </ListItem>
                                {index < ad.moderationHistory.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <RejectModal
        open={!!modalAction}
        onClose={() => setModalAction(null)}
        isLoading={isActionLoading}
        title={modalAction === 'changes' ? 'Вернуть на доработку' : 'Отклонить объявление'}
        onConfirm={handleModalConfirm}
      />
    </Container>
  );
};

export default AdDetailsPage;