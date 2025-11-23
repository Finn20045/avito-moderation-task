import { 
  Card, CardContent, CardMedia, Typography, 
  Chip, Box, Button, CardActions, Stack, Checkbox 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { Ad } from '../features/ads/types';

interface AdCardProps {
  ad: Ad;
  selected?: boolean;           
  onToggleSelect?: () => void; 
}

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

/**
 * Карточка объявления.
 * Поддерживает два режима:
 * 1. Обычный просмотр.
 * 2. Режим выбора (если переданы selected и onToggleSelect).
 */

export const AdCard = ({ ad, selected, onToggleSelect }: AdCardProps) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* === ЧЕКБОКС ВЫБОРА (Только если передан onToggleSelect) === */}
      {onToggleSelect && (
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}>
            <Checkbox 
                checked={selected}
                onClick={(e) => {
                    e.stopPropagation(); // Чтобы не открылась карточка
                    onToggleSelect();
                }}
                size="small"
            />
        </Box>
      )}

      <CardMedia
        component="img"
        height="160"
        image={ad.images && ad.images[0] ? ad.images[0] : 'https://via.placeholder.com/300'}
        alt={ad.title}
        sx={{ cursor: 'pointer' }}
        onClick={() => navigate(`/item/${ad.id}`)}
      />

      <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(`/item/${ad.id}`)}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-start' }}>
          <Typography 
            gutterBottom 
            variant="h6" 
            component="div" 
            sx={{ 
              lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}
          >
            {ad.title}
          </Typography>
        </Box>
        
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
          {ad.price.toLocaleString('ru-RU')} ₽
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
           Категория ID: {ad.categoryId}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 'auto' }}>
            <Chip label={STATUS_MAP[ad.status] || ad.status} color={STATUS_COLOR[ad.status]} size="small" variant="outlined" />
            {ad.priority === 'urgent' && <Chip icon={<WhatshotIcon />} label="Срочно" color="secondary" size="small" />}
        </Stack>
        
        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.disabled' }}>
          {new Date(ad.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button size="small" fullWidth variant="contained" onClick={() => navigate(`/item/${ad.id}`)}>
          Открыть
        </Button>
      </CardActions>
    </Card>
  );
};