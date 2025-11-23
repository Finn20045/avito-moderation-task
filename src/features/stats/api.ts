import { api } from '../../shared/api/base';
import { StatsSummary, ActivityData, DecisionsData, CategoryStats, StatsPeriod } from './types';

export const getStatsSummary = async (period: StatsPeriod) => {
  const { data } = await api.get<StatsSummary>('/stats/summary', { params: { period } });
  return data;
};

export const getActivityStats = async (period: StatsPeriod) => {
  const { data } = await api.get<ActivityData[]>('/stats/chart/activity', { params: { period } });
  return data;
};

export const getDecisionsStats = async (period: StatsPeriod) => {
  const { data } = await api.get<DecisionsData>('/stats/chart/decisions', { params: { period } });
  return data;
};

export const getCategoryStats = async (period: StatsPeriod) => {
  const { data } = await api.get<CategoryStats>('/stats/chart/categories', { params: { period } });
  return data;
};