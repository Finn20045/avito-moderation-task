export interface StatsSummary {
  totalReviewed: number;
  totalReviewedToday: number;
  totalReviewedThisWeek: number;
  totalReviewedThisMonth: number;
  averageReviewTime: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  requestChangesPercentage: number;
}

export interface ActivityData {
  date: string;
  approved: number;
  rejected: number;
}

export interface DecisionsData {
  approved: number;
  rejected: number;
  requestChanges: number;
}
export type StatsPeriod = 'today' | 'week' | 'month'
// Тип для ответа по категориям (объект "Категория": "Количество")
export type CategoryStats = Record<string, number>;