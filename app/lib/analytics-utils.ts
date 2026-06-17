import type { TimeRange, DateRange } from './business-analytics-types';

export function calculateDateRange(timeRange: TimeRange): DateRange {
  const endDate = new Date();
  const startDate = new Date();

  const daysToSubtract = (() => {
    switch (timeRange) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      default:
        return 7;
    }
  })();

  startDate.setDate(endDate.getDate() - daysToSubtract);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}
