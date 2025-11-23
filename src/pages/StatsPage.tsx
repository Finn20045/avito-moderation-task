import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Container, Typography, Paper, Box, CircularProgress, Alert, Button, Stack, ToggleButton, ToggleButtonGroup 
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { getStatsSummary, getActivityStats, getDecisionsStats, getCategoryStats } from '../features/stats/api';
import { exportToCSV, generatePDFReport } from '../features/stats/export';
import { StatsPeriod } from '../features/stats/types';

const COLORS = ['#4caf50', '#f44336', '#ff9800'];
const CATEGORY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

const StatsPage = () => {
  // 1. Состояние периода (по умолчанию - неделя)
  const [period, setPeriod] = useState<StatsPeriod>('week');

  const handlePeriodChange = (
    event: React.MouseEvent<HTMLElement>,
    newPeriod: StatsPeriod | null,
  ) => {
    // newPeriod может быть null, если кликнуть на уже активную кнопку. 
    // Запрещаем "отжимать" кнопку, всегда должен быть выбран период.
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  // 2. Передаем period в useQuery
  // Добавляем period в массив ключа queryKey: ['stats', 'summary', period].
  // Это заставит React Query автоматически перезагрузить данные при смене периода.
  const summaryQuery = useQuery({ 
    queryKey: ['stats', 'summary', period], 
    queryFn: () => getStatsSummary(period) 
  });
  
  const activityQuery = useQuery({ 
    queryKey: ['stats', 'activity', period], 
    queryFn: () => getActivityStats(period) 
  });
  
  const decisionsQuery = useQuery({ 
    queryKey: ['stats', 'decisions', period], 
    queryFn: () => getDecisionsStats(period) 
  });
  
  const categoriesQuery = useQuery({ 
    queryKey: ['stats', 'categories', period], 
    queryFn: () => getCategoryStats(period) 
  });

  const isLoading = summaryQuery.isLoading || activityQuery.isLoading || decisionsQuery.isLoading || categoriesQuery.isLoading;
  const isError = summaryQuery.isError || activityQuery.isError || decisionsQuery.isError || categoriesQuery.isError;

  // Данные (если загрузка идет, берем старые или пустые, чтобы не падать)
  const summary = summaryQuery.data;
  const activity = activityQuery.data || [];
  const decisions = decisionsQuery.data;
  const categoriesData = categoriesQuery.data || {};

  const categoriesChartData = Object.entries(categoriesData).map(([key, value]) => ({
    name: key,
    value: value
  })).sort((a, b) => b.value - a.value);

  const pieData = decisions ? [
    { name: 'Одобрено', value: decisions.approved },
    { name: 'Отклонено', value: decisions.rejected },
    { name: 'На доработку', value: decisions.requestChanges },
  ] : [];

  const handleExportCSV = () => {
    exportToCSV(activity, `activity-${period}`);
  };

  const handleExportPDF = () => {
    if (summary) generatePDFReport(summary, activity);
  };

  // Пока первая загрузка - показываем спиннер
  // (При смене фильтров, если данные закэшированы, спиннера не будет - это плюс React Query)
  if (isLoading && !summary) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (isError) return <Container sx={{ mt: 4 }}><Alert severity="error">Не удалось загрузить статистику</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Статистика модерации
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* 3. Переключатель периода */}
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            aria-label="period"
            size="small"
            color="primary"
          >
            <ToggleButton value="today">Сегодня</ToggleButton>
            <ToggleButton value="week">7 дней</ToggleButton>
            <ToggleButton value="month">30 дней</ToggleButton>
          </ToggleButtonGroup>

          {/* Разделитель или просто отступ */}
          <Box sx={{ width: 10 }} />

          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
            CSV
          </Button>
          <Button variant="contained" color="secondary" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
            PDF
          </Button>
        </Stack>
      </Box>

      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="Всего проверено" value={summary.totalReviewed} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="За сегодня" value={summary.totalReviewedToday} color="primary.main" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="За неделю" value={summary.totalReviewedThisWeek} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="За месяц" value={summary.totalReviewedThisMonth} />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="Одобрено" value={`${Number(summary.approvedPercentage).toFixed(1)}%`} color="success.main" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="Отклонено" value={`${Number(summary.rejectedPercentage).toFixed(1)}%`} color="error.main" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
            <StatCard title="Среднее время проверки" value={`${summary.averageReviewTime} мин`} color="info.main" />
            </Grid>
        </Grid>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 12 }}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" gutterBottom>Активность ({period === 'today' ? 'по часам' : 'по дням'})</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" name="Одобрено" fill="#4caf50" />
                <Bar dataKey="rejected" name="Отклонено" fill="#f44336" />
                <Bar dataKey="requestChanges" name="На доработку" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Распределение решений</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ bottom: 30 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Категории объявлений</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={categoriesChartData} 
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" name="Количество" fill="#8884d8" barSize={20}>
                  {categoriesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const StatCard = ({ title, value, color }: { title: string, value: string | number, color?: string }) => (
  <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" fontWeight="bold" sx={{ color: color || 'text.primary' }}>
      {value}
    </Typography>
  </Paper>
);

export default StatsPage;