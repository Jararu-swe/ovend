import { describe, it, expect } from 'vitest';

// Formatting helper functions extracted from component for testing
function formatCurrency(amount: number): string {
  return `₦${(amount / 100).toLocaleString('en-NG', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-NG');
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatChange(changeValue: number): string {
  const sign = changeValue >= 0 ? '+' : '';
  return `${sign}${changeValue.toFixed(1)}%`;
}

function getTrendColor(direction: 'up' | 'down' | 'neutral'): string {
  if (direction === 'up') {
    return 'text-emerald-600 bg-emerald-50';
  } else if (direction === 'down') {
    return 'text-red-600 bg-red-50';
  } else {
    return 'text-slate-600 bg-slate-50';
  }
}

describe('AnalyticsSummaryCards formatting functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly from kobo to naira', () => {
      expect(formatCurrency(225000)).toBe('₦2,250');
    });

    it('formats large amounts with proper thousand separators', () => {
      expect(formatCurrency(123456789)).toBe('₦1,234,568'); // Rounded
    });

    it('handles zero amount', () => {
      expect(formatCurrency(0)).toBe('₦0');
    });

    it('formats small amounts correctly', () => {
      expect(formatCurrency(5000)).toBe('₦50');
    });

    it('does not show decimal places', () => {
      const result = formatCurrency(12345);
      expect(result).not.toContain('.');
      expect(result).toBe('₦123');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1500)).toBe('1,500');
    });

    it('formats large numbers correctly', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('handles single digit numbers', () => {
      expect(formatNumber(5)).toBe('5');
    });

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('formats four-digit numbers correctly', () => {
      expect(formatNumber(9876)).toBe('9,876');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage with one decimal place', () => {
      expect(formatPercentage(3.0)).toBe('3.0%');
    });

    it('formats decimal percentages correctly', () => {
      expect(formatPercentage(15.5)).toBe('15.5%');
    });

    it('handles zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('handles small percentages', () => {
      expect(formatPercentage(0.8)).toBe('0.8%');
    });

    it('rounds to one decimal place', () => {
      expect(formatPercentage(3.14159)).toBe('3.1%');
    });
  });

  describe('formatChange', () => {
    it('adds plus sign for positive changes', () => {
      expect(formatChange(15.5)).toBe('+15.5%');
    });

    it('displays negative changes with minus sign', () => {
      expect(formatChange(-2.1)).toBe('-2.1%');
    });

    it('adds plus sign for zero change', () => {
      expect(formatChange(0)).toBe('+0.0%');
    });

    it('formats decimal changes correctly', () => {
      expect(formatChange(8.2)).toBe('+8.2%');
    });

    it('rounds to one decimal place', () => {
      expect(formatChange(22.34)).toBe('+22.3%');
    });
  });

  describe('getTrendColor', () => {
    it('returns green color classes for up direction', () => {
      const color = getTrendColor('up');
      expect(color).toContain('emerald');
      expect(color).toContain('text-emerald-600');
      expect(color).toContain('bg-emerald-50');
    });

    it('returns red color classes for down direction', () => {
      const color = getTrendColor('down');
      expect(color).toContain('red');
      expect(color).toContain('text-red-600');
      expect(color).toContain('bg-red-50');
    });

    it('returns gray color classes for neutral direction', () => {
      const color = getTrendColor('neutral');
      expect(color).toContain('slate');
      expect(color).toContain('text-slate-600');
      expect(color).toContain('bg-slate-50');
    });
  });

  describe('Integration scenarios', () => {
    it('formats complete metric card data correctly', () => {
      const visits = 1500;
      const orders = 45;
      const revenue = 225000;
      const conversionRate = 3.0;
      const changePercent = 15.5;

      expect(formatNumber(visits)).toBe('1,500');
      expect(formatNumber(orders)).toBe('45');
      expect(formatCurrency(revenue)).toBe('₦2,250');
      expect(formatPercentage(conversionRate)).toBe('3.0%');
      expect(formatChange(changePercent)).toBe('+15.5%');
    });

    it('handles all zero values correctly', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatCurrency(0)).toBe('₦0');
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatChange(0)).toBe('+0.0%');
    });

    it('handles large scale metrics', () => {
      const largeVisits = 1234567;
      const largeOrders = 9876;
      const largeRevenue = 123456789;

      expect(formatNumber(largeVisits)).toBe('1,234,567');
      expect(formatNumber(largeOrders)).toBe('9,876');
      expect(formatCurrency(largeRevenue)).toBe('₦1,234,568');
    });
  });
});
