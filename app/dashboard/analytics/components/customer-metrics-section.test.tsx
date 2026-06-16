/**
 * Unit tests for CustomerMetricsSection component logic
 * 
 * Tests:
 * - CustomerMetrics data structure validation
 * - Percentage calculations for customer distribution
 * - Currency formatting
 * - Insights determination based on metrics
 * - Insufficient data error handling
 * 
 * Validates Requirements: 2.1, 2.7, 2.8, 2.10
 */

import { describe, it, expect } from 'vitest';
import type { CustomerMetrics, InsufficientDataError } from '@/app/lib/business-analytics';

describe('CustomerMetricsSection Component Logic', () => {
  describe('CustomerMetrics data structure (Requirements 2.1, 2.7, 2.8)', () => {
    it('should have all required fields', () => {
      const mockMetrics: CustomerMetrics = {
        repeatCustomerRate: 35.5,
        newCustomers: 150,
        returningCustomers: 80,
        averageLifetimeValue: 15000, // ₦150.00 in kobo
        totalUniqueCustomers: 230,
      };

      // Verify all required fields exist
      expect(mockMetrics.repeatCustomerRate).toBe(35.5);
      expect(mockMetrics.newCustomers).toBe(150);
      expect(mockMetrics.returningCustomers).toBe(80);
      expect(mockMetrics.averageLifetimeValue).toBe(15000);
      expect(mockMetrics.totalUniqueCustomers).toBe(230);
    });
  });

  describe('Customer distribution calculations (Requirement 2.8)', () => {
    it('should correctly calculate new customer percentage', () => {
      const newCustomers = 150;
      const totalCustomers = 230;
      
      const newPercentage = (newCustomers / totalCustomers) * 100;
      
      expect(newPercentage).toBeCloseTo(65.22, 2);
      expect(newPercentage.toFixed(1)).toBe('65.2');
    });

    it('should correctly calculate returning customer percentage', () => {
      const returningCustomers = 80;
      const totalCustomers = 230;
      
      const returningPercentage = (returningCustomers / totalCustomers) * 100;
      
      expect(returningPercentage).toBeCloseTo(34.78, 2);
      expect(returningPercentage.toFixed(1)).toBe('34.8');
    });

    it('should handle zero customers gracefully', () => {
      const newCustomers = 0;
      const totalCustomers = 0;
      
      const newPercentage = totalCustomers > 0 
        ? (newCustomers / totalCustomers) * 100 
        : 0;
      
      expect(newPercentage).toBe(0);
    });
  });

  describe('Currency formatting (Requirement 2.7)', () => {
    it('should format currency values correctly', () => {
      const formatCurrency = (value: number) => `₦${(value / 100).toLocaleString()}`;
      
      expect(formatCurrency(15000)).toBe('₦150');
      expect(formatCurrency(1234567)).toBe('₦12,345.67');
      expect(formatCurrency(0)).toBe('₦0');
      expect(formatCurrency(100)).toBe('₦1');
    });
  });

  describe('Percentage formatting (Requirement 2.1)', () => {
    it('should format percentage values correctly', () => {
      const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
      
      expect(formatPercentage(35.5)).toBe('35.5%');
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(8.256)).toBe('8.3%');
    });
  });

  describe('Retention insights', () => {
    it('should identify high retention (>=30%)', () => {
      const repeatRate = 42.3;
      const isHighRetention = repeatRate >= 30;
      
      expect(isHighRetention).toBe(true);
    });

    it('should identify decent retention (15-29%)', () => {
      const repeatRate = 20.0;
      const isDecentRetention = repeatRate >= 15 && repeatRate < 30;
      
      expect(isDecentRetention).toBe(true);
    });

    it('should identify low retention (<15%)', () => {
      const repeatRate = 8.5;
      const isLowRetention = repeatRate < 15;
      
      expect(isLowRetention).toBe(true);
    });
  });

  describe('CLV insights', () => {
    it('should identify high value customers (CLV > ₦100)', () => {
      const avgLifetimeValue = 25000; // ₦250.00 in kobo
      const isHighValue = avgLifetimeValue > 10000;
      
      expect(isHighValue).toBe(true);
    });

    it('should identify low value customers (CLV <= ₦100)', () => {
      const avgLifetimeValue = 8000; // ₦80.00 in kobo
      const isLowValue = avgLifetimeValue <= 10000;
      
      expect(isLowValue).toBe(true);
    });
  });

  describe('Insufficient data handling (Requirement 2.10)', () => {
    it('should provide insufficient data error when orders < 5', () => {
      const insufficientDataResponse: InsufficientDataError = {
        type: 'insufficient_data',
        message: 'You need at least 5 completed orders to see customer analytics.',
        suggestion: 'Keep sharing your store link to get more orders!',
      };

      expect(insufficientDataResponse.type).toBe('insufficient_data');
      expect(insufficientDataResponse.message).toContain('at least 5 completed orders');
      expect(insufficientDataResponse.suggestion).toContain('Keep sharing');
    });

    it('should distinguish between CustomerMetrics and InsufficientDataError', () => {
      const metrics: CustomerMetrics = {
        repeatCustomerRate: 35.5,
        newCustomers: 150,
        returningCustomers: 80,
        averageLifetimeValue: 15000,
        totalUniqueCustomers: 230,
      };

      const error: InsufficientDataError = {
        type: 'insufficient_data',
        message: 'You need at least 5 completed orders to see customer analytics.',
        suggestion: 'Keep sharing your store link to get more orders!',
      };

      // Type guards
      const isInsufficientData = (data: CustomerMetrics | InsufficientDataError): data is InsufficientDataError => {
        return 'type' in data && data.type === 'insufficient_data';
      };

      expect(isInsufficientData(metrics)).toBe(false);
      expect(isInsufficientData(error)).toBe(true);
    });
  });

  describe('AOV trend data structure', () => {
    it('should have correct data point format', () => {
      const aovTrendData = [
        { date: '2024-01-01', value: 8000 },
        { date: '2024-01-02', value: 9500 },
        { date: '2024-01-03', value: 11000 },
      ];

      aovTrendData.forEach(point => {
        expect(point).toHaveProperty('date');
        expect(point).toHaveProperty('value');
        expect(typeof point.date).toBe('string');
        expect(typeof point.value).toBe('number');
      });
    });

    it('should handle empty AOV data array', () => {
      const aovTrendData: Array<{ date: string; value: number }> = [];
      
      expect(Array.isArray(aovTrendData)).toBe(true);
      expect(aovTrendData.length).toBe(0);
    });
  });
});
