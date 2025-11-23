import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, FormControl, InputLabel, Select 
} from '@mui/material';

const REJECTION_REASONS = [
  'Запрещенный товар',
  'Неверная категория',
  'Некорректное описание',
  'Проблемы с фото',
  'Подозрение на мошенничество',
  'Другое'
];

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, comment: string) => void;
  isLoading: boolean;
  title?: string;
}

export const RejectModal = ({ open, onClose, onConfirm, isLoading, title }: RejectModalProps) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    if (reason) {
      onConfirm(reason, comment);
      setReason('');  // Очистка полей
      setComment('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Если title не передан, используем 'Отклонить объявление' */}
      <DialogTitle>{title || 'Отклонить объявление'}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Причина *</InputLabel>
          <Select
            value={reason}
            label="Причина *"
            onChange={(e) => setReason(e.target.value)}
          >
            {REJECTION_REASONS.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={3}
          margin="normal"
          label="Комментарий (необязательно)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Отмена</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary" // Делаем нейтральным синим, так как кнопка универсальная
          disabled={!reason || isLoading}
        >
          {isLoading ? 'Отправка...' : 'Подтвердить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};