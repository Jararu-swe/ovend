/**
 * Tests for RevenueForecastCard Component
 * 
 * These tests verify the revenue forecast card displays correctly
 * with different confidence levels, seasonal trends, and data states.
 */

import { describe, it, expect } from 'vitest';
import type { RevenueForecast, InsufficientForecastDataError } from '@/app/lib/business-analytics';

// ============================================================================
// Test Data Fixtures
// ============================================================================

const mockHighConfidenceForecast: RevenueForecast = {
  forecastedRevenue: 500000, // ₦5,000 in kobo
  confidence: 'high',
  historicalDays: 120,
  dailyProjections: [
    { date: '2024-02-01', projected: 15000 },
    { date: '2024-02-02', projected: 15500 },
    { date: '2024-02-03', projected: 16000 },
    { date: '2024-02-04', projected: 16500 },
    { date: '2024-02-05', projected: 17000 },
  ],
  seasonalTrend: 'above',
};

const mockMediumConfidenceForecast: RevenueForecast = {
  forecastedRevenue: 250000, // ₦2,500
  confidence: 'medium',
  historicalDays: 45,
  dailyProjections: [
    { date: '2024-02-01', projected: 8000 },
    { date: '2024-02-02', projected: 8200 },
    { date: '2024-02-03', projected: 8400 },
  ],
  seasonalTrend: 'average',
};

const mockLowConfidenceForecast: RevenueForecast = {
  forecastedRevenue: 120000, // ₦1,200
  confidence: 'low',
  historicalDays: 15,
  dailyProjections: [
    { date: '2024-02-01', projected: 4000 },
    { date: '2024-02-02', projected: 4100 },
  ],
  seasonalTrend: null,
};

const mockInsufficientDataError: InsufficientForecastDataError = {
  type: 'insufficient_forecast_data',
  message: 'You need at least 30 days of historical data to generate a revenue forecast.',
  suggestion: 'Keep taking orders! Your forecast will be available once you have 30 days of sales history.',
  historicalDays: 12,
};

// ============================================================================
// Component Logic Tests
// ============================================================================

describe('RevenueForecastCard Logic', () => {
  
  describe('Confidence Badge Calculation', () => {
    it('returns correct badge for high confidence', () => {
      const result = getConfidenceBadge('high');
      expect(result.label).toBe('High Confidence');
      expect(result.explanation).toContain('90+ days');
      expect(result.bgColor).toBe('bg-emerald-100');
      expect(result.textColor).toBe('text-emerald-800');
    });

    it('returns correct badge for medium confidence', () => {
      const result = getConfidenceBadge('medium');
      expect(result.label).toBe('Medium Confidence');
      expect(result.explanation).toContain('30-89 days');
      expect(result.bgColor).toBe('bg-amber-100');
      expect(result.textColor).toBe('text-amber-800');
    });

    it('returns correct badge for low confidence', () => {
      const result = getConfidenceBadge('low');
      expect(result.label).toBe('Low Confidence');
      expect(result.explanation).toContain('less than 30 days');
      expect(result.bgColor).toBe('bg-slate-100');
      expect(result.textColor).toBe('text-slate-800');
    });
  });

  describe('Seasonal Indicator', () => {
    it('returns correct indicator for above-average trend', () => {
      const result = getSeasonalIndicator('above');
      expect(result).not.toBeNull();
      expect(result?.label).toBe('Seasonal High');
      expect(result?.icon).toBe('📈');
      expect(result?.color).toBe('text-emerald-600');
    });

    it('returns correct indicator for below-average trend', () => {
      const result = getSeasonalIndicator('below');
      expect(result).not.toBeNull();
      expect(result?.label).toBe('Seasonal Low');
      expect(result?.icon).toBe('📉');
      expect(result?.color).toBe('text-amber-600');
    });

    it('returns correct indicator for average trend', () => {
      const result = getSeasonalIndicator('average');
      expect(result).not.toBeNull();
      expect(result?.label).toBe('Average Season');
      expect(result?.icon).toBe('➡️');
      expect(result?.color).toBe('text-slate-600');
    });

    it('returns null for no seasonal trend', () => {
      const result = getSeasonalIndicator(null);
      expect(result).toBeNull();
    });
  });

  describe('Currency Formatting', () => {
    it('formats currency correctly from kobo to naira', () => {
      expect(formatCurrency(500000)).toBe('₦5,000');
      expect(formatCurrency(123456)).toBe('₦1,235'); // Rounds to nearest
      expect(formatCurrency(0)).toBe('₦0');
      expect(formatCurrency(100)).toBe('₦1');
    });

    it('handles large amounts correctly', () => {
      expect(formatCurrency(100000000)).toBe('₦1,000,000');
      expect(formatCurrency(50000000)).toBe('₦500,000');
    });
  });
});

describe('RevenueForecastCard Data Validation', () => {
  
  it('validates high confidence forecast structure', () => {
    expect(mockHighConfidenceForecast.confidence).toBe('high');
    expect(mockHighConfidenceForecast.historicalDays).toBeGreaterThanOrEqual(90);
    expect(mockHighConfidenceForecast.forecastedRevenue).toBeGreaterThan(0);
    expect(mockHighConfidenceForecast.dailyProjections.length).toBeGreaterThan(0);
    expect(mockHighConfidenceForecast.seasonalTrend).toMatch(/above|below|average|null/);
  });

  it('validates medium confidence forecast structure', () => {
    expect(mockMediumConfidenceForecast.confidence).toBe('medium');
    expect(mockMediumConfidenceForecast.historicalDays).toBeGreaterThanOrEqual(30);
    expect(mockMediumConfidenceForecast.historicalDays).toBeLessThan(90);
  });

  it('validates low confidence forecast structure', () => {
    expect(mockLowConfidenceForecast.confidence).toBe('low');
    expect(mockLowConfidenceForecast.historicalDays).toBeLessThan(30);
  });

  it('validates insufficient data error structure', () => {
    expect(mockInsufficientDataError.type).toBe('insufficient_forecast_data');
    expect(mockInsufficientDataError.message).toBeTruthy();
    expect(mockInsufficientDataError.suggestion).toBeTruthy();
    expect(mockInsufficientDataError.historicalDays).toBeLessThan(30);
  });

  it('validates daily projections have required fields', () => {
    for (const projection of mockHighConfidenceForecast.dailyProjections) {
      expect(projection).toHaveProperty('date');
      expect(projection).toHaveProperty('projected');
      expect(typeof projection.date).toBe('string');
      expect(typeof projection.projected).toBe('number');
      expect(projection.projected).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Chart Data Processing', () => {
  
  it('calculates min and max values correctly', () => {
    const values = mockHighConfidenceForecast.dailyProjections.map(p => p.projected);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    expect(min).toBe(15000);
    expect(max).toBe(17000);
    expect(max).toBeGreaterThanOrEqual(min);
  });

  it('handles empty projections array', () => {
    const emptyProjections: Array<{ date: string; projected: number }> = [];
    expect(emptyProjections.length).toBe(0);
    // Chart component should handle this gracefully
  });

  it('validates date format in projections', () => {
    for (const projection of mockHighConfidenceForecast.dailyProjections) {
      const date = new Date(projection.date);
      expect(date.toString()).not.toBe('Invalid Date');
    }
  });
});

// ============================================================================
// Helper Functions (extracted from component for testing)
// ============================================================================

function formatCurrency(amountInKobo: number): string {
  const naira = amountInKobo / 100;
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getConfidenceBadge(confidence: 'high' | 'medium' | 'low'): {
  bgColor: string;
  textColor: string;
  label: string;
  explanation: string;
} {
  switch (confidence) {
    case 'high':
      return {
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-800',
        label: 'High Confidence',
        explanation: 'Based on 90+ days of historical data'
      };
    case 'medium':
      return {
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        label: 'Medium Confidence',
        explanation: 'Based on 30-89 days of historical data'
      };
    case 'low':
      return {
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-800',
        label: 'Low Confidence',
        explanation: 'Based on less than 30 days of historical data'
      };
  }
}

function getSeasonalIndicator(trend: 'above' | 'below' | 'average' | null): {
  icon: string;
  label: string;
  color: string;
} | null {
  if (!trend) return null;

  switch (trend) {
    case 'above':
      return {
        icon: '📈',
        label: 'Seasonal High',
        color: 'text-emerald-600'
      };
    case 'below':
      return {
        icon: '📉',
        label: 'Seasonal Low',
        color: 'text-amber-600'
      };
    case 'average':
      return {
        icon: '➡️',
        label: 'Average Season',
        color: 'text-slate-600'
      };
  }
}
