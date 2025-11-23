import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StatsSummary, ActivityData } from './types';

/**
 * Экспортирует массив данных в CSV файл.
 * 
 * Особенности реализации для Excel:
 * 1. Используется разделитель ";" (стандарт для русской локали).
 * 2. Добавляется BOM (\uFEFF) для корректного отображения кириллицы.
 * 
 * @param data - Массив данных для экспорта
 * @param filename - Имя файла без расширения
 */

// === 1. ЭКСПОРТ В CSV ===
export const exportToCSV = (data: ActivityData[], filename: string) => {
  const headers = ['Дата', 'Одобрено', 'Отклонено', 'На доработку'];
  
  const rows = data.map(item => [
    item.date,
    item.approved ?? 0,
    item.rejected ?? 0,
    (item as any).requestChanges ?? 0 
  ]);

  const csvContent = [
    headers.join(';'), 
    ...rows.map(e => e.join(';'))
  ].join('\n');

  // Добавляем ТОЛЬКО BOM (\uFEFF)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

/**
 * Генерируем отчет в PDF
 * 
 * Для тестового задания использовался транслит или английский, так как для кириллицы в jsPDF нужно подключать .ttf шрифт
 */

// === 2. ГЕНЕРАЦИЯ PDF ===
export const generatePDFReport = (summary: StatsSummary, activity: ActivityData[]) => {
  const doc = new jsPDF();

  
  doc.setFontSize(20);
  doc.text('Avito Moderation Report', 14, 22);

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  // --- Блок 1: Общая статистика (Summary) ---
  doc.setFontSize(16);
  doc.text('Summary Statistics', 14, 45);

  const summaryData = [
    ['Total Reviewed', summary.totalReviewed],
    ['Reviewed Today', summary.totalReviewedToday],
    ['Approval Rate', `${summary.approvedPercentage}%`],
    ['Rejection Rate', `${summary.rejectedPercentage}%`],
    ['Avg Review Time', `${summary.averageReviewTime} min`],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [25, 118, 210] }, // Синий цвет MUI
  });

  // --- Блок 2: Таблица активности ---
  // Получаем Y координату после предыдущей таблицы
  const finalY = (doc as any).lastAutoTable.finalY || 60;
  
  doc.setFontSize(16);
  doc.text('Activity Log (Last 7 Days)', 14, finalY + 15);

  const activityRows = activity.map(item => [
    item.date,
    item.approved,
    item.rejected,
    (item as any).requestChanges || 0
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Date', 'Approved', 'Rejected', 'Changes Requested']],
    body: activityRows,
    theme: 'striped',
    headStyles: { fillColor: [46, 125, 50] }, // Зеленый цвет
  });

  // Сохраняем файл
  doc.save('moderation-report.pdf');
};