/**
 * Unit tests for Business Analytics Utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateDateRange,
  validateDateRange,
  calculateDaysDifference,
  getComparisonPeriod,
  fetchAnalyticsSummary,
  type TimeRange,
  type DateRange,
} from './business-analytics';

// Mock the dependencies
vi.mock('./db', () => ({
  sql: vi.fn(),
}));

vi.mock('./cache', () => ({
  getFromCache: vi.fn(),
  setCache: vi.fn(),
  CacheKeys: {
    analytics: (vendorId: string, startDate: string, endDate: string) => 
      `analytics:${vendorId}:${startDate}:${endDate}`,
    forecast: (vendorId: string) => 
      `forecast:${vendorId}`,
  },
}));

describe('calculateDateRange', () => {
  beforeEach(() => {
    // Mock current date to 2024-01-15
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate 7-day range correctly', () => {
    const result = calculateDateRange('7d');
    
    expect(result.startDate).toBe('2024-01-08');
    expect(result.endDate).toBe('2024-01-15');
  });

  it('should calculate 30-day range correctly', () => {
    const result = calculateDateRange('30d');
    
    expect(result.startDate).toBe('2023-12-16');
    expect(result.endDate).toBe('2024-01-15');
  });

  it('should calculate 90-day range correctly', () => {
    const result = calculateDateRange('90d');
    
    expect(result.startDate).toBe('2023-10-17');
    expect(result.endDate).toBe('2024-01-15');
  });

  it('should handle custom range by returning current date', () => {
    const result = calculateDateRange('custom');
    
    // Custom should return same date (caller overrides)
    expect(result.startDate).toBe('2024-01-15');
    expect(result.endDate).toBe('2024-01-15');
  });

  it('should return dates in ISO format (YYYY-MM-DD)', () => {
    const result = calculateDateRange('7d');
    
    // Check format matches ISO date string
    expect(result.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should calculate exact day difference based on time range', () => {
    const result7d = calculateDateRange('7d');
    const result30d = calculateDateRange('30d');
    const result90d = calculateDateRange('90d');
    
    const days7 = calculateDaysDifference(result7d.startDate, result7d.endDate);
    const days30 = calculateDaysDifference(result30d.startDate, result30d.endDate);
    const days90 = calculateDaysDifference(result90d.startDate, result90d.endDate);
    
    expect(days7).toBe(7);
    expect(days30).toBe(30);
    expect(days90).toBe(90);
  });
});

describe('validateDateRange', () => {
  beforeEach(() => {
    // Mock current date to 2024-01-15
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should validate valid date range', () => {
    const result = validateDateRange('2024-01-01', '2024-01-15');
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject date range exceeding 365 days', () => {
    const result = validateDateRange('2023-01-01', '2024-01-15');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Date range cannot exceed 365 days');
  });

  it('should accept date range of exactly 365 days', () => {
    const result = validateDateRange('2023-01-15', '2024-01-15');
    
    expect(result.valid).toBe(true);
  });

  it('should reject invalid date format', () => {
    const result = validateDateRange('invalid-date', '2024-01-15');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid date format');
  });

  it('should reject start date after end date', () => {
    const result = validateDateRange('2024-01-15', '2024-01-01');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Start date must be before end date');
  });

  it('should reject end date in the future', () => {
    const result = validateDateRange('2024-01-10', '2024-01-20');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('End date cannot be in the future');
  });

  it('should accept date range ending on current date', () => {
    const result = validateDateRange('2024-01-08', '2024-01-15');
    
    expect(result.valid).toBe(true);
  });

  it('should validate single day range', () => {
    const result = validateDateRange('2024-01-15', '2024-01-15');
    
    expect(result.valid).toBe(true);
  });

  it('should handle malformed ISO date strings', () => {
    const result = validateDateRange('2024-13-01', '2024-01-15');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid date format');
  });
});

describe('calculateDaysDifference', () => {
  it('should calculate days between two dates', () => {
    const days = calculateDaysDifference('2024-01-01', '2024-01-08');
    
    expect(days).toBe(7);
  });

  it('should handle 30-day difference', () => {
    const days = calculateDaysDifference('2024-01-01', '2024-01-31');
    
    expect(days).toBe(30);
  });

  it('should handle same date (0 days)', () => {
    const days = calculateDaysDifference('2024-01-01', '2024-01-01');
    
    expect(days).toBe(0);
  });

  it('should handle month boundaries', () => {
    const days = calculateDaysDifference('2024-01-25', '2024-02-05');
    
    expect(days).toBe(11);
  });

  it('should handle year boundaries', () => {
    const days = calculateDaysDifference('2023-12-25', '2024-01-05');
    
    expect(days).toBe(11);
  });
});

describe('getComparisonPeriod', () => {
  it('should calculate comparison period for 7-day range', () => {
    const range: DateRange = {
      startDate: '2024-01-08',
      endDate: '2024-01-14',
    };
    
    const comparison = getComparisonPeriod(range);
    
    expect(comparison.startDate).toBe('2024-01-01');
    expect(comparison.endDate).toBe('2024-01-07');
  });

  it('should calculate comparison period for 30-day range', () => {
    const range: DateRange = {
      startDate: '2024-01-01',
      endDate: '2024-01-30',
    };
    
    const comparison = getComparisonPeriod(range);
    
    const days = calculateDaysDifference(comparison.startDate, comparison.endDate);
    expect(days).toBe(29); // Same span as original range
  });

  it('should handle month boundaries in comparison', () => {
    const range: DateRange = {
      startDate: '2024-01-25',
      endDate: '2024-02-01',
    };
    
    const comparison = getComparisonPeriod(range);
    
    // Should go back the same span (7 days) plus 1
    expect(comparison.startDate).toBe('2024-01-17');
    expect(comparison.endDate).toBe('2024-01-24');
  });

  it('should maintain same span length in comparison period', () => {
    const range: DateRange = {
      startDate: '2024-01-01',
      endDate: '2024-01-15',
    };
    
    const comparison = getComparisonPeriod(range);
    
    const originalSpan = calculateDaysDifference(range.startDate, range.endDate);
    const comparisonSpan = calculateDaysDifference(comparison.startDate, comparison.endDate);
    
    expect(comparisonSpan).toBe(originalSpan);
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle leap year dates correctly', () => {
    vi.setSystemTime(new Date('2024-03-01T12:00:00Z'));
    
    const result = calculateDateRange('30d');
    
    // Should correctly handle February 2024 (leap year)
    expect(result.startDate).toBe('2024-01-31');
  });

  it('should validate leap year date range', () => {
    const result = validateDateRange('2024-02-01', '2024-02-29');
    
    expect(result.valid).toBe(true);
  });

  it('should handle end of year rollover', () => {
    vi.setSystemTime(new Date('2024-01-05T12:00:00Z'));
    
    const result = calculateDateRange('30d');
    
    expect(result.startDate).toBe('2023-12-06');
    expect(result.endDate).toBe('2024-01-05');
  });
});

describe('fetchAnalyticsSummary', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('should return cached data if available', async () => {
    const { sql } = await import('./db');
    const { getFromCache, setCache } = await import('./cache');

    const mockCachedData = {
      totalVisits: 1500,
      totalOrders: 45,
      totalRevenue: 125000,
      conversionRate: 3.0,
      avgOrderValue: 2778,
      periodChange: {
        visits: { value: 1500, change: 10.5, direction: 'up' as const },
        orders: { value: 45, change: 15.0, direction: 'up' as const },
        revenue: { value: 125000, change: 20.0, direction: 'up' as const },
        conversionRate: { value: 3.0, change: 5.0, direction: 'up' as const },
      },
    };

    vi.mocked(getFromCache).mockResolvedValueOnce(mockCachedData);

    const result = await fetchAnalyticsSummary('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(getFromCache).toHaveBeenCalledWith('analytics:vendor-123:2024-01-01:2024-01-31');
    expect(result).toEqual(mockCachedData);
    expect(sql).not.toHaveBeenCalled();
  });

  it('should query database and cache result when cache miss', async () => {
    const { sql } = await import('./db');
    const { getFromCache, setCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockCurrentPeriod = {
      total_visits: 1500,
      total_orders: 45,
      total_revenue: 125000,
    };

    const mockPreviousPeriod = {
      total_visits: 1350,
      total_orders: 39,
      total_revenue: 104000,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockCurrentPeriod]);
    vi.mocked(sql).mockResolvedValueOnce([mockPreviousPeriod]);

    const result = await fetchAnalyticsSummary('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.totalVisits).toBe(1500);
    expect(result.totalOrders).toBe(45);
    expect(result.totalRevenue).toBe(125000);
    expect(result.conversionRate).toBeCloseTo(3.0, 1); // 45/1500 * 100
    expect(result.avgOrderValue).toBe(2778); // 125000/45, rounded
    expect(setCache).toHaveBeenCalledWith(
      'analytics:vendor-123:2024-01-01:2024-01-31',
      expect.any(Object),
      300
    );
  });

  it('should calculate conversion rate correctly', async () => {
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockCurrentPeriod = {
      total_visits: 2000,
      total_orders: 100,
      total_revenue: 250000,
    };

    const mockPreviousPeriod = {
      total_visits: 1800,
      total_orders: 90,
      total_revenue: 225000,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockCurrentPeriod]);
    vi.mocked(sql).mockResolvedValueOnce([mockPreviousPeriod]);

    const result = await fetchAnalyticsSummary('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Conversion rate should be (100 / 2000) * 100 = 5.0
    expect(result.conversionRate).toBeCloseTo(5.0, 1);
  });

  it('should handle zero visits gracefully', async () => {
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockCurrentPeriod = {
      total_visits: 0,
      total_orders: 0,
      total_revenue: 0,
    };

    const mockPreviousPeriod = {
      total_visits: 0,
      total_orders: 0,
      total_revenue: 0,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockCurrentPeriod]);
    vi.mocked(sql).mockResolvedValueOnce([mockPreviousPeriod]);

    const result = await fetchAnalyticsSummary('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.conversionRate).toBe(0);
    expect(result.avgOrderValue).toBe(0);
  });

  it('should calculate period-over-period changes correctly', async () => {
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockCurrentPeriod = {
      total_visits: 1500,
      total_orders: 60,
      total_revenue: 150000,
    };

    const mockPreviousPeriod = {
      total_visits: 1000,
      total_orders: 40,
      total_revenue: 100000,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockCurrentPeriod]);
    vi.mocked(sql).mockResolvedValueOnce([mockPreviousPeriod]);

    const result = await fetchAnalyticsSummary('vendor-123', {
      startDate: '2024-01-08',
      endDate: '2024-01-14',
    });

    // Visits: (1500 - 1000) / 1000 * 100 = 50% increase
    expect(result.periodChange.visits.change).toBeCloseTo(50, 1);
    expect(result.periodChange.visits.direction).toBe('up');

    // Orders: (60 - 40) / 40 * 100 = 50% increase
    expect(result.periodChange.orders.change).toBeCloseTo(50, 1);
    expect(result.periodChange.orders.direction).toBe('up');

    // Revenue: (150000 - 100000) / 100000 * 100 = 50% increase
    expect(result.periodChange.revenue.change).toBeCloseTo(50, 1);
    expect(result.periodChange.revenue.direction).toBe('up');
  });

  it('should handle negative period changes', async () => {
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockCurrentPeriod = {
      total_visits: 800,
      total_orders: 30,
      total_revenue: 75000,
    };

    const mockPreviousPeriod = {
      total_visits: 1000,
      total_orders: 40,
      total_revenue: 100000,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockCurrentPeriod]);
    vi.mocked(sql).mockResolvedValueOnce([mockPreviousPeriod]);

    const result = await fetchAnalyticsSummary('vendor-123', {
      startDate: '2024-01-08',
      endDate: '2024-01-14',
    });

    // All metrics should show decline
    expect(result.periodChange.visits.direction).toBe('down');
    expect(result.periodChange.orders.direction).toBe('down');
    expect(result.periodChange.revenue.direction).toBe('down');
  });

  it('should round conversion rate to 2 decimal places', async () => {
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockCurrentPeriod = {
      total_visits: 3333,
      total_orders: 100,
      total_revenue: 250000,
    };

    const mockPreviousPeriod = {
      total_visits: 3000,
      total_orders: 90,
      total_revenue: 225000,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockCurrentPeriod]);
    vi.mocked(sql).mockResolvedValueOnce([mockPreviousPeriod]);

    const result = await fetchAnalyticsSummary('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Conversion rate: (100 / 3333) * 100 = 3.00030003...
    // Should be rounded to 2 decimal places
    expect(result.conversionRate.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
  });
});


describe('fetchConversionFunnel', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('should calculate conversion funnel metrics correctly', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Mock visits data
    const mockVisits = { total_visits: 1500 };
    
    // Mock orders data
    const mockOrders = {
      total_orders: 60,
      fulfilled_orders: 45,
      avg_hours_to_fulfillment: 48.5,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.visits).toBe(1500);
    expect(result.ordersInitiated).toBe(60);
    expect(result.ordersCompleted).toBe(45);
    
    // Visit-to-Order Rate: (45 / 1500) × 100 = 3%
    expect(result.visitToOrderRate).toBeCloseTo(3.0, 1);
    
    // Order Completion Rate: (45 / 60) × 100 = 75%
    expect(result.orderCompletionRate).toBeCloseTo(75.0, 1);
    
    // Abandonment Rate: ((60 - 45) / 60) × 100 = 25%
    expect(result.abandonmentRate).toBeCloseTo(25.0, 1);
    
    // Average time to fulfillment
    expect(result.avgTimeToFulfillment).toBeCloseTo(48.5, 1);
  });

  it('should handle zero visits gracefully', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockVisits = { total_visits: 0 };
    const mockOrders = {
      total_orders: 0,
      fulfilled_orders: 0,
      avg_hours_to_fulfillment: null,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.visits).toBe(0);
    expect(result.visitToOrderRate).toBe(0);
    expect(result.orderCompletionRate).toBe(0);
    expect(result.abandonmentRate).toBe(0);
    expect(result.avgTimeToFulfillment).toBe(0);
  });

  it('should handle zero orders gracefully', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockVisits = { total_visits: 1500 };
    const mockOrders = {
      total_orders: 0,
      fulfilled_orders: 0,
      avg_hours_to_fulfillment: null,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.visits).toBe(1500);
    expect(result.ordersInitiated).toBe(0);
    expect(result.ordersCompleted).toBe(0);
    expect(result.visitToOrderRate).toBe(0);
    expect(result.orderCompletionRate).toBe(0);
    expect(result.abandonmentRate).toBe(0);
  });

  it('should calculate 100% order completion rate correctly', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockVisits = { total_visits: 2000 };
    const mockOrders = {
      total_orders: 50,
      fulfilled_orders: 50,
      avg_hours_to_fulfillment: 24.0,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.orderCompletionRate).toBe(100);
    expect(result.abandonmentRate).toBe(0);
  });

  it('should calculate high abandonment rate correctly', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockVisits = { total_visits: 3000 };
    const mockOrders = {
      total_orders: 100,
      fulfilled_orders: 20,
      avg_hours_to_fulfillment: 36.0,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Abandonment Rate: ((100 - 20) / 100) × 100 = 80%
    expect(result.abandonmentRate).toBe(80);
    
    // Order Completion Rate: (20 / 100) × 100 = 20%
    expect(result.orderCompletionRate).toBe(20);
  });

  it('should round all percentages to 2 decimal places', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockVisits = { total_visits: 3333 };
    const mockOrders = {
      total_orders: 99,
      fulfilled_orders: 77,
      avg_hours_to_fulfillment: 48.7777,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Check that all percentages have at most 2 decimal places
    expect(result.visitToOrderRate.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.orderCompletionRate.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.abandonmentRate.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.avgTimeToFulfillment.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
  });

  it('should handle null avg_hours_to_fulfillment', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockVisits = { total_visits: 1000 };
    const mockOrders = {
      total_orders: 50,
      fulfilled_orders: 0, // No fulfilled orders means no fulfillment time
      avg_hours_to_fulfillment: null,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.avgTimeToFulfillment).toBe(0);
  });

  it('should query correct date ranges', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockVisits = { total_visits: 500 };
    const mockOrders = {
      total_orders: 25,
      fulfilled_orders: 20,
      avg_hours_to_fulfillment: 24.0,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    await fetchConversionFunnel('vendor-123', {
      startDate: '2024-02-01',
      endDate: '2024-02-29',
    });

    // Verify first query (visits) uses correct date range
    expect(sql).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('store_analytics'),
      ]),
      'vendor-123',
      '2024-02-01',
      '2024-02-29'
    );

    // Verify second query (orders) uses correct date range
    expect(sql).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('orders'),
      ]),
      'vendor-123',
      '2024-02-01',
      '2024-02-29'
    );
  });

  it('should calculate metrics for different conversion scenarios', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Scenario: High traffic, low conversion
    const mockVisits = { total_visits: 10000 };
    const mockOrders = {
      total_orders: 100,
      fulfilled_orders: 80,
      avg_hours_to_fulfillment: 72.0,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Visit-to-Order Rate: (80 / 10000) × 100 = 0.8%
    expect(result.visitToOrderRate).toBeCloseTo(0.8, 1);
    
    // Order Completion Rate: (80 / 100) × 100 = 80%
    expect(result.orderCompletionRate).toBe(80);
    
    // Abandonment Rate: ((100 - 80) / 100) × 100 = 20%
    expect(result.abandonmentRate).toBe(20);
  });

  it('should validate requirements for all conversion funnel metrics', async () => {
    const { fetchConversionFunnel } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockVisits = { total_visits: 2500 };
    const mockOrders = {
      total_orders: 120,
      fulfilled_orders: 90,
      avg_hours_to_fulfillment: 36.25,
    };

    vi.mocked(sql).mockResolvedValueOnce([mockVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockOrders]);

    const result = await fetchConversionFunnel('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Requirement 4.1: Display visits, orders initiated, orders completed
    expect(result.visits).toBe(2500);
    expect(result.ordersInitiated).toBe(120);
    expect(result.ordersCompleted).toBe(90);

    // Requirement 4.3: Visit-to-order conversion rate
    expect(result.visitToOrderRate).toBeCloseTo(3.6, 1); // (90 / 2500) × 100

    // Requirement 4.4: Order completion rate
    expect(result.orderCompletionRate).toBe(75); // (90 / 120) × 100

    // Requirement 4.5: Abandonment rate
    expect(result.abandonmentRate).toBe(25); // ((120 - 90) / 120) × 100

    // Requirement 4.6: Average time to fulfillment
    expect(result.avgTimeToFulfillment).toBeCloseTo(36.25, 2);
  });
});


describe('extractLocationFromAddress', () => {
  it('should extract city and state from valid Nigerian address format', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('123 Main St, Victoria Island, Lagos, Lagos State');
    
    expect(result).toEqual({
      city: 'Lagos',
      state: 'Lagos State'
    });
  });

  it('should handle FCT address format', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('45 Market Rd, Garki, Abuja, FCT');
    
    expect(result).toEqual({
      city: 'Abuja',
      state: 'FCT'
    });
  });

  it('should return null for null address', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress(null);
    
    expect(result).toBeNull();
  });

  it('should return null for empty string address', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('');
    
    expect(result).toBeNull();
  });

  it('should return null for address with only one part', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('Invalid');
    
    expect(result).toBeNull();
  });

  it('should handle addresses with exactly 2 parts', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('Ikeja, Lagos State');
    
    expect(result).toEqual({
      city: 'Ikeja',
      state: 'Lagos State'
    });
  });

  it('should handle addresses with many parts', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('Plot 123, Block A, Phase 2, Estate Name, Area, City, State');
    
    expect(result).toEqual({
      city: 'City',
      state: 'State'
    });
  });

  it('should trim whitespace from extracted city and state', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('Street ,  Ibadan  ,  Oyo State  ');
    
    expect(result).toEqual({
      city: 'Ibadan',
      state: 'Oyo State'
    });
  });

  it('should handle addresses with special characters', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('123/45 Main St, Port-Harcourt, Rivers State');
    
    expect(result).toEqual({
      city: 'Port-Harcourt',
      state: 'Rivers State'
    });
  });

  it('should gracefully handle malformed addresses', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    // Should not throw error
    expect(() => {
      extractLocationFromAddress('Some random text without proper format');
    }).not.toThrow();
  });

  it('should extract from addresses with 3 parts (Street, City, State)', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('15 Allen Avenue, Ikeja, Lagos');
    
    expect(result).toEqual({
      city: 'Ikeja',
      state: 'Lagos'
    });
  });

  it('should handle addresses with numeric city names', async () => {
    const { extractLocationFromAddress } = await import('./business-analytics');
    
    const result = extractLocationFromAddress('Street, Area 3, Garki, FCT');
    
    expect(result).toEqual({
      city: 'Garki',
      state: 'FCT'
    });
  });
});

describe('fetchGeographicInsights', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('should return insufficient data error when less than 10 orders with location', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Mock 8 orders with valid addresses
    const mockOrders = [
      { id: '1', customer_address: 'Street, Lagos, Lagos State', total_amount: 10000 },
      { id: '2', customer_address: 'Street, Abuja, FCT', total_amount: 15000 },
      { id: '3', customer_address: 'Street, Ibadan, Oyo State', total_amount: 12000 },
      { id: '4', customer_address: 'Street, Lagos, Lagos State', total_amount: 20000 },
      { id: '5', customer_address: 'Street, Abuja, FCT', total_amount: 18000 },
      { id: '6', customer_address: 'Street, Lagos, Lagos State', total_amount: 25000 },
      { id: '7', customer_address: 'Street, Kano, Kano State', total_amount: 14000 },
      { id: '8', customer_address: 'Street, Lagos, Lagos State', total_amount: 22000 },
    ];

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result).toEqual({
      type: 'insufficient_geographic_data',
      message: 'You need at least 10 orders with location data to see geographic insights.',
      suggestion: 'Encourage customers to provide complete delivery addresses!'
    });
  });

  it('should aggregate orders by city and state correctly', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Mock 15 orders across 3 cities
    const mockOrders = [
      { id: '1', customer_address: 'Street, Lagos, Lagos State', total_amount: 10000 },
      { id: '2', customer_address: 'Street, Lagos, Lagos State', total_amount: 15000 },
      { id: '3', customer_address: 'Street, Lagos, Lagos State', total_amount: 12000 },
      { id: '4', customer_address: 'Street, Lagos, Lagos State', total_amount: 20000 },
      { id: '5', customer_address: 'Street, Lagos, Lagos State', total_amount: 18000 },
      { id: '6', customer_address: 'Street, Abuja, FCT', total_amount: 25000 },
      { id: '7', customer_address: 'Street, Abuja, FCT', total_amount: 14000 },
      { id: '8', customer_address: 'Street, Abuja, FCT', total_amount: 22000 },
      { id: '9', customer_address: 'Street, Ibadan, Oyo State', total_amount: 30000 },
      { id: '10', customer_address: 'Street, Ibadan, Oyo State', total_amount: 16000 },
      { id: '11', customer_address: 'Street, Lagos, Lagos State', total_amount: 19000 },
      { id: '12', customer_address: 'Street, Lagos, Lagos State', total_amount: 21000 },
      { id: '13', customer_address: 'Street, Abuja, FCT', total_amount: 17000 },
      { id: '14', customer_address: 'Street, Lagos, Lagos State', total_amount: 23000 },
      { id: '15', customer_address: 'Street, Lagos, Lagos State', total_amount: 24000 },
    ];

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      // Lagos should have 9 orders
      const lagos = result.find(loc => loc.city === 'Lagos');
      expect(lagos?.orderCount).toBe(9);
      expect(lagos?.revenue).toBe(10000 + 15000 + 12000 + 20000 + 18000 + 19000 + 21000 + 23000 + 24000);
      
      // Abuja should have 4 orders
      const abuja = result.find(loc => loc.city === 'Abuja');
      expect(abuja?.orderCount).toBe(4);
      expect(abuja?.revenue).toBe(25000 + 14000 + 22000 + 17000);
      
      // Ibadan should have 2 orders
      const ibadan = result.find(loc => loc.city === 'Ibadan');
      expect(ibadan?.orderCount).toBe(2);
      expect(ibadan?.revenue).toBe(30000 + 16000);
    }
  });

  it('should calculate percentage of total correctly', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Mock 20 orders: 10 Lagos, 6 Abuja, 4 Ibadan
    const mockOrders = [
      ...Array(10).fill(null).map((_, i) => ({ 
        id: `l${i}`, 
        customer_address: 'Street, Lagos, Lagos State', 
        total_amount: 10000 
      })),
      ...Array(6).fill(null).map((_, i) => ({ 
        id: `a${i}`, 
        customer_address: 'Street, Abuja, FCT', 
        total_amount: 10000 
      })),
      ...Array(4).fill(null).map((_, i) => ({ 
        id: `i${i}`, 
        customer_address: 'Street, Ibadan, Oyo State', 
        total_amount: 10000 
      })),
    ];

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      const lagos = result.find(loc => loc.city === 'Lagos');
      const abuja = result.find(loc => loc.city === 'Abuja');
      const ibadan = result.find(loc => loc.city === 'Ibadan');

      // Lagos: 10/20 = 50%
      expect(lagos?.percentageOfTotal).toBe(50);
      
      // Abuja: 6/20 = 30%
      expect(abuja?.percentageOfTotal).toBe(30);
      
      // Ibadan: 4/20 = 20%
      expect(ibadan?.percentageOfTotal).toBe(20);
    }
  });

  it('should return top 10 cities sorted by order count', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Create 15 cities with varying order counts
    const mockOrders: any[] = [];
    const cities = [
      { name: 'Lagos', state: 'Lagos State', count: 20 },
      { name: 'Abuja', state: 'FCT', count: 15 },
      { name: 'Ibadan', state: 'Oyo State', count: 12 },
      { name: 'Kano', state: 'Kano State', count: 10 },
      { name: 'Port Harcourt', state: 'Rivers State', count: 8 },
      { name: 'Enugu', state: 'Enugu State', count: 7 },
      { name: 'Kaduna', state: 'Kaduna State', count: 6 },
      { name: 'Benin', state: 'Edo State', count: 5 },
      { name: 'Warri', state: 'Delta State', count: 4 },
      { name: 'Calabar', state: 'Cross River State', count: 3 },
      { name: 'Owerri', state: 'Imo State', count: 2 },
      { name: 'Jos', state: 'Plateau State', count: 1 },
    ];

    cities.forEach(city => {
      for (let i = 0; i < city.count; i++) {
        mockOrders.push({
          id: `${city.name}-${i}`,
          customer_address: `Street, ${city.name}, ${city.state}`,
          total_amount: 10000
        });
      }
    });

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      // Should return exactly 10 cities
      expect(result.length).toBe(10);
      
      // Should be sorted by order count (descending)
      expect(result[0].city).toBe('Lagos');
      expect(result[0].orderCount).toBe(20);
      
      expect(result[1].city).toBe('Abuja');
      expect(result[1].orderCount).toBe(15);
      
      expect(result[9].city).toBe('Calabar');
      expect(result[9].orderCount).toBe(3);
      
      // Should not include the 11th and 12th cities
      expect(result.find(loc => loc.city === 'Owerri')).toBeUndefined();
      expect(result.find(loc => loc.city === 'Jos')).toBeUndefined();
    }
  });

  it('should ignore orders with null or empty addresses', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    // 15 orders: 10 valid, 5 invalid
    const mockOrders = [
      ...Array(10).fill(null).map((_, i) => ({ 
        id: `v${i}`, 
        customer_address: 'Street, Lagos, Lagos State', 
        total_amount: 10000 
      })),
      { id: 'n1', customer_address: null, total_amount: 10000 },
      { id: 'n2', customer_address: '', total_amount: 10000 },
      { id: 'n3', customer_address: 'Invalid', total_amount: 10000 },
      { id: 'n4', customer_address: 'NoComma', total_amount: 10000 },
      { id: 'n5', customer_address: 'Just One Part', total_amount: 10000 },
    ];

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      // Should only count the 10 valid orders
      const lagos = result.find(loc => loc.city === 'Lagos');
      expect(lagos?.orderCount).toBe(10);
      expect(lagos?.percentageOfTotal).toBe(100); // 10/10 valid orders
    }
  });

  it('should handle orders with exact 10 valid locations (boundary case)', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockOrders = Array(10).fill(null).map((_, i) => ({
      id: `${i}`,
      customer_address: 'Street, Lagos, Lagos State',
      total_amount: 10000
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Should succeed with exactly 10 orders
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result.length).toBe(1);
      expect(result[0].orderCount).toBe(10);
    }
  });

  it('should handle orders with 9 valid locations (insufficient data)', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockOrders = Array(9).fill(null).map((_, i) => ({
      id: `${i}`,
      customer_address: 'Street, Lagos, Lagos State',
      total_amount: 10000
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Should return insufficient data error
    expect(result).toHaveProperty('type', 'insufficient_geographic_data');
  });

  it('should calculate revenue totals correctly', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockOrders = [
      ...Array(5).fill(null).map((_, i) => ({ 
        id: `l${i}`, 
        customer_address: 'Street, Lagos, Lagos State', 
        total_amount: 20000 + (i * 1000)
      })),
      ...Array(5).fill(null).map((_, i) => ({ 
        id: `a${i}`, 
        customer_address: 'Street, Abuja, FCT', 
        total_amount: 30000 + (i * 2000)
      })),
    ];

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      const lagos = result.find(loc => loc.city === 'Lagos');
      const abuja = result.find(loc => loc.city === 'Abuja');

      // Lagos revenue: 20000 + 21000 + 22000 + 23000 + 24000 = 110000
      expect(lagos?.revenue).toBe(110000);
      
      // Abuja revenue: 30000 + 32000 + 34000 + 36000 + 38000 = 170000
      expect(abuja?.revenue).toBe(170000);
    }
  });

  it('should handle same city in different states as separate locations', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockOrders = [
      ...Array(6).fill(null).map((_, i) => ({ 
        id: `ls${i}`, 
        customer_address: 'Street, Lagos, Lagos State', 
        total_amount: 10000 
      })),
      ...Array(4).fill(null).map((_, i) => ({ 
        id: `lo${i}`, 
        customer_address: 'Street, Lagos, Ogun State', 
        total_amount: 10000 
      })),
    ];

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      // Should have two separate entries for Lagos
      const lagosState = result.find(loc => loc.city === 'Lagos' && loc.state === 'Lagos State');
      const ogunState = result.find(loc => loc.city === 'Lagos' && loc.state === 'Ogun State');

      expect(lagosState?.orderCount).toBe(6);
      expect(ogunState?.orderCount).toBe(4);
    }
  });

  it('should round percentages to 2 decimal places', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Create orders that will result in non-round percentages
    const mockOrders = [
      ...Array(7).fill(null).map((_, i) => ({ 
        id: `l${i}`, 
        customer_address: 'Street, Lagos, Lagos State', 
        total_amount: 10000 
      })),
      ...Array(4).fill(null).map((_, i) => ({ 
        id: `a${i}`, 
        customer_address: 'Street, Abuja, FCT', 
        total_amount: 10000 
      })),
      ...Array(3).fill(null).map((_, i) => ({ 
        id: `i${i}`, 
        customer_address: 'Street, Ibadan, Oyo State', 
        total_amount: 10000 
      })),
    ];

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      result.forEach(location => {
        // Check that percentages have at most 2 decimal places
        const decimalPlaces = location.percentageOfTotal.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    }
  });

  it('should query orders with correct date range and filters', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockOrders = Array(10).fill(null).map((_, i) => ({
      id: `${i}`,
      customer_address: 'Street, Lagos, Lagos State',
      total_amount: 10000
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    await fetchGeographicInsights('vendor-456', {
      startDate: '2024-02-01',
      endDate: '2024-02-29',
    });

    // Verify query was called with correct parameters
    expect(sql).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('vendor_id'),
        expect.stringContaining('status'),
        expect.stringContaining('fulfilled'),
        expect.stringContaining('customer_address IS NOT NULL'),
      ]),
      'vendor-456',
      '2024-02-01',
      '2024-02-29'
    );
  });

  it('should validate all geographic insights requirements', async () => {
    const { fetchGeographicInsights } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockOrders = [
      ...Array(10).fill(null).map((_, i) => ({ 
        id: `l${i}`, 
        customer_address: 'Street, Lagos, Lagos State', 
        total_amount: 50000 
      })),
      ...Array(5).fill(null).map((_, i) => ({ 
        id: `a${i}`, 
        customer_address: 'Street, Abuja, FCT', 
        total_amount: 30000 
      })),
    ];

    vi.mocked(sql).mockResolvedValueOnce(mockOrders);

    const result = await fetchGeographicInsights('vendor-123', {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      // Requirement 9.1: Display geographic insight section
      expect(result.length).toBeGreaterThan(0);

      // Requirement 9.2: Top cities by order count
      expect(result[0].orderCount).toBeGreaterThanOrEqual(result[1]?.orderCount || 0);

      // Requirement 9.3: Revenue per location
      result.forEach(location => {
        expect(location.revenue).toBeGreaterThan(0);
      });

      // Requirement 9.5: Order count per location
      result.forEach(location => {
        expect(location.orderCount).toBeGreaterThan(0);
      });

      // Requirement 9.6: Percentage of orders from each location
      result.forEach(location => {
        expect(location.percentageOfTotal).toBeGreaterThan(0);
        expect(location.percentageOfTotal).toBeLessThanOrEqual(100);
      });

      // Requirement 9.7: Sufficient data check (already tested above)
      // This test path has > 10 orders, so it should succeed
    }
  });
});

describe('calculateRevenueForecast', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('should return cached forecast if available', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { getFromCache } = await import('./cache');

    const mockCachedForecast = {
      forecastedRevenue: 500000,
      confidence: 'high' as const,
      historicalDays: 90,
      dailyProjections: [],
      seasonalTrend: null,
    };

    vi.mocked(getFromCache).mockResolvedValueOnce(mockCachedForecast);

    const result = await calculateRevenueForecast('vendor-123');

    expect(getFromCache).toHaveBeenCalledWith('forecast:vendor-123');
    expect(result).toEqual(mockCachedForecast);
  });

  it('should return insufficient data error when less than 30 days of data', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    // Mock only 20 days of historical data
    const mockHistoricalData = Array.from({ length: 20 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      revenue: 1000 + i * 50,
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    expect(result).toEqual({
      type: 'insufficient_forecast_data',
      message: 'You need at least 30 days of historical data for revenue forecasting.',
      suggestion: 'Keep growing your business! Forecasting will be available once you have more sales history.',
      historicalDays: 20,
    });
  });

  it('should calculate forecast with high confidence for 90+ days of data', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache, setCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    // Mock 90 days of historical data with upward trend
    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 10000 + i * 100, // Linear growth
    }));

    // Mock all historical data query (for seasonal detection)
    const mockAllHistoricalData = mockHistoricalData;

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockAllHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    expect(result.confidence).toBe('high');
    expect(result.historicalDays).toBe(90);
    expect(result.dailyProjections).toHaveLength(30);
    expect(result.forecastedRevenue).toBeGreaterThan(0);

    // Verify caching with 24-hour TTL
    expect(setCache).toHaveBeenCalledWith(
      'forecast:vendor-123',
      expect.any(Object),
      86400 // 24 hours in seconds
    );
  });

  it('should calculate forecast with medium confidence for 30-89 days of data', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    // Mock 60 days of historical data
    const mockHistoricalData = Array.from({ length: 60 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 5000 + i * 50,
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    expect(result.confidence).toBe('medium');
    expect(result.historicalDays).toBe(60);
  });

  it('should generate 30 daily projections', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 10000 + i * 100,
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // Requirement 6.2: Generate 30-day forward projections
    expect(result.dailyProjections).toHaveLength(30);

    // Each projection should have date and projected revenue
    result.dailyProjections.forEach(projection => {
      expect(projection).toHaveProperty('date');
      expect(projection).toHaveProperty('projected');
      expect(typeof projection.date).toBe('string');
      expect(typeof projection.projected).toBe('number');
      expect(projection.projected).toBeGreaterThanOrEqual(0);
    });
  });

  it('should sum daily projections to get total forecasted revenue', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 10000,
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // Calculate sum of daily projections
    const sumOfProjections = result.dailyProjections.reduce(
      (sum, proj) => sum + proj.projected,
      0
    );

    // Total forecasted revenue should equal sum of daily projections
    expect(result.forecastedRevenue).toBe(sumOfProjections);
  });

  it('should handle flat revenue (zero slope)', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    // Mock flat revenue data
    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 10000, // Constant revenue
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // With flat historical data, projections should be roughly constant
    const avgProjection = result.forecastedRevenue / 30;
    expect(avgProjection).toBeCloseTo(10000, -2); // Within 100 of expected value
  });

  it('should handle declining revenue trend', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    // Mock declining revenue data
    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: Math.max(1000, 20000 - i * 100), // Declining trend
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // Forecast should reflect declining trend
    expect(result.forecastedRevenue).toBeGreaterThan(0);
    
    // Later projections should be lower than earlier ones (or clamped at 0)
    const firstProjection = result.dailyProjections[0].projected;
    const lastProjection = result.dailyProjections[29].projected;
    
    // Either declining or both at minimum (0)
    expect(lastProjection).toBeLessThanOrEqual(firstProjection);
  });

  it('should never project negative revenue', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    // Mock very steep declining revenue
    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: Math.max(0, 50000 - i * 500), // Very steep decline
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // All projections should be non-negative
    result.dailyProjections.forEach(projection => {
      expect(projection.projected).toBeGreaterThanOrEqual(0);
    });
  });

  it('should return null seasonal trend when less than 365 days of data', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 10000 + i * 100,
    }));

    // Only 90 days of historical data available
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // Requirement 6.6, 6.7: Not enough data for seasonal analysis
    expect(result.seasonalTrend).toBeNull();
  });

  it('should detect above-average seasonal trend', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-12-15T12:00:00Z')); // December

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-10-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 10000,
    }));

    // Mock 2 years of data with December having 30% higher revenue
    const mockAllHistoricalData = [];
    
    // 2023 data
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= 28; day++) {
        const revenue = month === 11 ? 13000 : 10000; // December (month 11) is 30% higher
        mockAllHistoricalData.push({
          date: `2023-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          revenue,
        });
      }
    }
    
    // 2024 data
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= 28; day++) {
        const revenue = month === 11 ? 13000 : 10000; // December is 30% higher
        mockAllHistoricalData.push({
          date: `2024-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          revenue,
        });
      }
    }

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockAllHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // Requirement 6.8: Seasonal trend detected (>20% variance)
    expect(result.seasonalTrend).toBe('above');

    vi.useRealTimers();
  });

  it('should detect below-average seasonal trend', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-15T12:00:00Z')); // February

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2023-11-${String((i % 30) + 1).padStart(2, '0')}`,
      revenue: 10000,
    }));

    // Mock 2 years of data with February having 30% lower revenue
    const mockAllHistoricalData = [];
    
    for (let year = 2023; year <= 2024; year++) {
      for (let month = 0; month < 12; month++) {
        for (let day = 1; day <= 28; day++) {
          const revenue = month === 1 ? 7000 : 10000; // February (month 1) is 30% lower
          mockAllHistoricalData.push({
            date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            revenue,
          });
        }
      }
    }

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockAllHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // Requirement 6.8: Seasonal trend detected (>20% variance below average)
    expect(result.seasonalTrend).toBe('below');

    vi.useRealTimers();
  });

  it('should detect average seasonal trend when variance is within 20%', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache } = await import('./cache');

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z')); // June

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-03-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 10000,
    }));

    // Mock 2 years of consistent data (no seasonal variation)
    const mockAllHistoricalData = [];
    
    for (let year = 2023; year <= 2024; year++) {
      for (let month = 0; month < 12; month++) {
        for (let day = 1; day <= 28; day++) {
          mockAllHistoricalData.push({
            date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            revenue: 10000, // Consistent revenue across all months
          });
        }
      }
    }

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockAllHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // No significant seasonal variation
    expect(result.seasonalTrend).toBe('average');

    vi.useRealTimers();
  });

  it('should validate all forecast requirements', async () => {
    const { calculateRevenueForecast } = await import('./business-analytics');
    const { sql } = await import('./db');
    const { getFromCache, setCache } = await import('./cache');

    vi.mocked(getFromCache).mockResolvedValueOnce(undefined);

    const mockHistoricalData = Array.from({ length: 90 }, (_, i) => ({
      date: `2024-01-${String((i % 31) + 1).padStart(2, '0')}`,
      revenue: 10000 + i * 100,
    }));

    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);
    vi.mocked(sql).mockResolvedValueOnce(mockHistoricalData);

    const result = await calculateRevenueForecast('vendor-123');

    if ('type' in result) {
      throw new Error('Expected forecast result, got error');
    }

    // Requirement 6.1: Display forecast (structure validated)
    expect(result).toHaveProperty('forecastedRevenue');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('historicalDays');
    expect(result).toHaveProperty('dailyProjections');
    expect(result).toHaveProperty('seasonalTrend');

    // Requirement 6.2: Use linear regression on last 90 days
    expect(result.historicalDays).toBe(90);

    // Requirement 6.3: Display forecasted revenue for next 30 days
    expect(result.dailyProjections).toHaveLength(30);
    expect(result.forecastedRevenue).toBeGreaterThan(0);

    // Requirement 6.4: Confidence based on data span
    expect(['high', 'medium', 'low']).toContain(result.confidence);
    expect(result.confidence).toBe('high'); // 90 days = high confidence

    // Requirement 6.1: Cache for 24 hours
    expect(setCache).toHaveBeenCalledWith(
      'forecast:vendor-123',
      expect.any(Object),
      86400
    );
  });
});

describe('fetchTodayPerformance', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock current date to 2024-01-15 at 14:00 (2 PM)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T14:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch today\'s performance with all required metrics', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Mock today's data
    const mockToday = { visits: 150, orders_count: 12, revenue: 25000 };
    
    // Mock yesterday same time data
    const mockYesterdaySameTime = { orders_count: 10, revenue: 20000 };
    const mockYesterdayVisits = { visits: 140 };
    
    // Mock last week data
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    
    // Mock last hour orders
    const mockLastHour = { orders_count: 3 };
    
    // Mock yesterday full day for pace calculation
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]); // Today
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]); // Yesterday same time orders
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]); // Yesterday visits
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]); // Last week
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]); // Last hour
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]); // Yesterday full day for pace

    const result = await fetchTodayPerformance('vendor-123');

    // Requirement 8.1, 8.2: Today's metrics
    expect(result.todayVisits).toBe(150);
    expect(result.todayOrders).toBe(12);
    expect(result.todayRevenue).toBe(25000);

    // Requirement 8.10: Last hour orders
    expect(result.lastHourOrders).toBe(3);

    // Requirement 8.3: Yesterday comparison
    expect(result.comparisonYesterday.visits).toBe(140);
    expect(result.comparisonYesterday.orders).toBe(10);
    expect(result.comparisonYesterday.revenue).toBe(20000);

    // Requirement 8.5: Last week comparison
    expect(result.comparisonLastWeek.visits).toBe(130);
    expect(result.comparisonLastWeek.orders).toBe(11);
    expect(result.comparisonLastWeek.revenue).toBe(22000);

    // Requirement 8.8: Pace indicator
    expect(['ahead', 'behind', 'on-track']).toContain(result.paceIndicator);

    // Requirement 8.6: Last update timestamp
    expect(result.lastUpdate).toBe(new Date('2024-01-15T14:00:00Z').toISOString());
  });

  it('should calculate pace indicator as "ahead" when projected EOD > yesterday', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Current time is 14:00 (hour 14)
    // Today's revenue: 24000 at hour 14 -> projected EOD = (24000 / 15) * 24 = 38400
    // Yesterday's full day: 30000
    // Difference: ((38400 - 30000) / 30000) * 100 = 28%, which is > 5%, so "ahead"

    const mockToday = { visits: 150, orders_count: 12, revenue: 24000 };
    const mockYesterdaySameTime = { orders_count: 10, revenue: 18000 };
    const mockYesterdayVisits = { visits: 140 };
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    const mockLastHour = { orders_count: 3 };
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    expect(result.paceIndicator).toBe('ahead');
  });

  it('should calculate pace indicator as "behind" when projected EOD < yesterday', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Today's revenue: 10000 at hour 14 -> projected EOD = (10000 / 15) * 24 = 16000
    // Yesterday's full day: 30000
    // 16000 < 30000 * 0.95 (28500), so "behind"

    const mockToday = { visits: 80, orders_count: 5, revenue: 10000 };
    const mockYesterdaySameTime = { orders_count: 10, revenue: 18000 };
    const mockYesterdayVisits = { visits: 140 };
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    const mockLastHour = { orders_count: 1 };
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    expect(result.paceIndicator).toBe('behind');
  });

  it('should calculate pace indicator as "on-track" when within 5% of yesterday', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Today's revenue: 19000 at hour 14 -> projected EOD = (19000 / 15) * 24 = 30400
    // Yesterday's full day: 30000
    // Difference: ((30400 - 30000) / 30000) * 100 = 1.33%, within 5%, so "on-track"

    const mockToday = { visits: 150, orders_count: 12, revenue: 19000 };
    const mockYesterdaySameTime = { orders_count: 10, revenue: 15000 };
    const mockYesterdayVisits = { visits: 140 };
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    const mockLastHour = { orders_count: 2 };
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    expect(result.paceIndicator).toBe('on-track');
  });

  it('should handle zero data gracefully', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockZero = { visits: 0, orders_count: 0, revenue: 0 };
    const mockZeroOrders = { orders_count: 0, revenue: 0 };

    vi.mocked(sql).mockResolvedValueOnce([mockZero]); // Today
    vi.mocked(sql).mockResolvedValueOnce([mockZeroOrders]); // Yesterday same time
    vi.mocked(sql).mockResolvedValueOnce([mockZero]); // Yesterday visits
    vi.mocked(sql).mockResolvedValueOnce([mockZero]); // Last week
    vi.mocked(sql).mockResolvedValueOnce([mockZeroOrders]); // Last hour
    vi.mocked(sql).mockResolvedValueOnce([mockZero]); // Yesterday full

    const result = await fetchTodayPerformance('vendor-123');

    expect(result.todayVisits).toBe(0);
    expect(result.todayOrders).toBe(0);
    expect(result.todayRevenue).toBe(0);
    expect(result.lastHourOrders).toBe(0);
    expect(result.paceIndicator).toBe('on-track'); // Default when no comparison data
  });

  it('should handle null/undefined database results gracefully', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Mock undefined/null results
    vi.mocked(sql).mockResolvedValueOnce([{}]); // Today - empty object
    vi.mocked(sql).mockResolvedValueOnce([{}]); // Yesterday same time
    vi.mocked(sql).mockResolvedValueOnce([{}]); // Yesterday visits
    vi.mocked(sql).mockResolvedValueOnce([{}]); // Last week
    vi.mocked(sql).mockResolvedValueOnce([{}]); // Last hour
    vi.mocked(sql).mockResolvedValueOnce([{}]); // Yesterday full

    const result = await fetchTodayPerformance('vendor-123');

    // Should default to 0 for all metrics
    expect(result.todayVisits).toBe(0);
    expect(result.todayOrders).toBe(0);
    expect(result.todayRevenue).toBe(0);
  });

  it('should calculate same-time-yesterday comparison correctly (Requirement 8.4)', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    // At 14:00 today, we should compare with yesterday up to hour 14
    const mockToday = { visits: 150, orders_count: 12, revenue: 25000 };
    const mockYesterdaySameTime = { orders_count: 10, revenue: 20000 };
    const mockYesterdayVisits = { visits: 140 };
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    const mockLastHour = { orders_count: 3 };
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    // Verify the function returns yesterday same-time data correctly
    expect(result.comparisonYesterday.orders).toBe(10);
    expect(result.comparisonYesterday.revenue).toBe(20000);
    
    // Verify sql was called at least twice (once for yesterday orders)
    expect(sql).toHaveBeenCalledTimes(6);
  });

  it('should calculate same-weekday-last-week comparison (Requirement 8.5)', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Today is 2024-01-15 (Monday), last week same day is 2024-01-08 (Monday)
    const mockToday = { visits: 150, orders_count: 12, revenue: 25000 };
    const mockYesterdaySameTime = { orders_count: 10, revenue: 20000 };
    const mockYesterdayVisits = { visits: 140 };
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    const mockLastHour = { orders_count: 3 };
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    // Verify we get last week's data (7 days prior)
    expect(result.comparisonLastWeek.visits).toBe(130);
    expect(result.comparisonLastWeek.orders).toBe(11);
    expect(result.comparisonLastWeek.revenue).toBe(22000);
  });

  it('should count orders in last hour correctly (Requirement 8.10)', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockToday = { visits: 150, orders_count: 12, revenue: 25000 };
    const mockYesterdaySameTime = { orders_count: 10, revenue: 20000 };
    const mockYesterdayVisits = { visits: 140 };
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    const mockLastHour = { orders_count: 5 }; // 5 orders in last hour
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    expect(result.lastHourOrders).toBe(5);
  });

  it('should return ISO timestamp for lastUpdate (Requirement 8.6)', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockToday = { visits: 150, orders_count: 12, revenue: 25000 };
    const mockYesterdaySameTime = { orders_count: 10, revenue: 20000 };
    const mockYesterdayVisits = { visits: 140 };
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    const mockLastHour = { orders_count: 3 };
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    // Should be valid ISO timestamp
    expect(result.lastUpdate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(new Date(result.lastUpdate).toISOString()).toBe(result.lastUpdate);
  });

  it('should handle early morning hours (edge case for pace calculation)', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    // Set time to early morning (2 AM, hour 2)
    vi.setSystemTime(new Date('2024-01-15T02:00:00Z'));

    const mockToday = { visits: 10, orders_count: 1, revenue: 2000 };
    const mockYesterdaySameTime = { orders_count: 0, revenue: 0 };
    const mockYesterdayVisits = { visits: 5 };
    const mockLastWeek = { visits: 8, orders_count: 1, revenue: 1500 };
    const mockLastHour = { orders_count: 1 };
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    // Should not crash with division issues
    expect(result.paceIndicator).toBeDefined();
    expect(['ahead', 'behind', 'on-track']).toContain(result.paceIndicator);
  });

  it('should validate all real-time dashboard requirements', async () => {
    const { fetchTodayPerformance } = await import('./business-analytics');
    const { sql } = await import('./db');

    const mockToday = { visits: 150, orders_count: 12, revenue: 25000 };
    const mockYesterdaySameTime = { orders_count: 10, revenue: 20000 };
    const mockYesterdayVisits = { visits: 140 };
    const mockLastWeek = { visits: 130, orders_count: 11, revenue: 22000 };
    const mockLastHour = { orders_count: 3 };
    const mockYesterdayFull = { visits: 200, orders_count: 15, revenue: 30000 };

    vi.mocked(sql).mockResolvedValueOnce([mockToday]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdaySameTime]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayVisits]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastWeek]);
    vi.mocked(sql).mockResolvedValueOnce([mockLastHour]);
    vi.mocked(sql).mockResolvedValueOnce([mockYesterdayFull]);

    const result = await fetchTodayPerformance('vendor-123');

    // Requirement 8.1: Display current day metrics
    expect(result).toHaveProperty('todayVisits');
    expect(result).toHaveProperty('todayOrders');
    expect(result).toHaveProperty('todayRevenue');

    // Requirement 8.2: Updated in real-time (structure supports polling)
    expect(result.lastUpdate).toBeDefined();

    // Requirement 8.3, 8.4: Same-time-yesterday comparison
    expect(result.comparisonYesterday).toBeDefined();
    expect(result.comparisonYesterday.visits).toBeDefined();
    expect(result.comparisonYesterday.orders).toBeDefined();
    expect(result.comparisonYesterday.revenue).toBeDefined();

    // Requirement 8.5: Same-weekday-last-week comparison
    expect(result.comparisonLastWeek).toBeDefined();

    // Requirement 8.8, 8.9: Pace indicator
    expect(result.paceIndicator).toBeDefined();
    expect(['ahead', 'behind', 'on-track']).toContain(result.paceIndicator);

    // Requirement 8.10: Last hour orders
    expect(result.lastHourOrders).toBeDefined();
    expect(typeof result.lastHourOrders).toBe('number');
  });
});
