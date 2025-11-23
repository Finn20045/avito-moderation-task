import React, { useRef, useEffect } from 'react'; 
import { 
  Paper, TextField, MenuItem, Button, IconButton, 
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText 
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CloseIcon from '@mui/icons-material/Close';
import { FetchAdsParams } from '../types';

interface AdsFiltersProps {
  filters: FetchAdsParams;
  onChange: (newFilters: FetchAdsParams) => void;
}

const CATEGORY_OPTIONS = [
  { id: 0, name: 'Электроника' },
  { id: 1, name: 'Недвижимость' },
  { id: 2, name: 'Транспорт' },
  { id: 3, name: 'Работа' },
  { id: 4, name: 'Услуги' },
  { id: 5, name: 'Животные' },
  { id: 6, name: 'Мода'},
  { id: 7, name: 'Детское' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'На модерации' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
  { value: 'draft', label: 'Черновик' },
];

const SORT_OPTIONS = [
  { label: 'Сначала новые', value: 'createdAt_desc' },
  { label: 'Сначала старые', value: 'createdAt_asc' },
  { label: 'Дешевле', value: 'price_asc' },
  { label: 'Дороже', value: 'price_desc' },
  { label: 'Сначала срочные', value: 'priority_desc' },
];

export const AdsFilters = ({ filters, onChange }: AdsFiltersProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Используем нативный лиснер, так как библиотека hotkeys иногда
  // конфликтует с русской раскладкой или перехватом браузера (Firefox).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Проверяем, не печатаем ли мы уже в каком-то поле ввода
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return; // Если печатаем, ничего не делаем
      }

      // 2. Проверяем код клавиши. 'Slash' - это физическая кнопка "/", где бы она ни была
      if (e.code === 'Slash' || e.key === '/') {
        e.preventDefault(); // Отменяем стандартное поведение браузера
        searchInputRef.current?.focus(); // Ставим фокус
      }
    };

    // Подписываемся на событие
    window.addEventListener('keydown', handleKeyDown);
    
    // Удаляем подписку, когда компонент исчезает
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  // =================================

  const handleChange = (field: keyof FetchAdsParams, value: any) => {
    onChange({ ...filters, [field]: value, page: 1 });
  };

  const handleStatusChange = (event: any) => {
    const { target: { value } } = event;
    handleChange('status', typeof value === 'string' ? value.split(',') : value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const [sortBy, sortOrder] = value.split('_');
    onChange({ 
      ...filters, 
      sortBy: sortBy as any, 
      sortOrder: sortOrder as any,
      page: 1 
    });
  };

  const currentStatus = Array.isArray(filters.status) ? filters.status : (filters.status ? [filters.status] : []);
  const currentSortValue = `${filters.sortBy || 'createdAt'}_${filters.sortOrder || 'desc'}`;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        
        {/* 1. Поиск */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            inputRef={searchInputRef}
            fullWidth
            size="small"
            label="Поиск (Нажми /)" 
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            InputProps={{
              endAdornment: filters.search && (
                <IconButton size="small" onClick={() => handleChange('search', '')}>
                  <CloseIcon />
                </IconButton>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              multiple
              value={currentStatus}
              onChange={handleStatusChange}
              input={<OutlinedInput label="Статус" />}
              renderValue={(selected) => (selected as string[])
                  .map(val => STATUS_OPTIONS.find(opt => opt.value === val)?.label)
                  .join(', ')
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={currentStatus.indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Категория"
            value={filters.categoryId ?? ''}
            onChange={(e) => {
                const val = e.target.value;
                handleChange('categoryId', val === '' ? undefined : Number(val));
            }}
          >
            <MenuItem value="">Все</MenuItem>
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Сортировка"
            value={currentSortValue}
            onChange={handleSortChange}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Цена от"
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Grid>
        
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Цена до"
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Grid>
        
         <Grid size={{ xs: 12, md: 2 }}>
            <Button 
                variant="outlined" 
                size="small" 
                fullWidth
                color="secondary"
                onClick={() => onChange({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })}
            >
                Сброс
            </Button>
         </Grid>
      </Grid>
    </Paper>
  );
};