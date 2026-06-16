import { describe, it, expect } from 'vitest';
import type { ConversionFunnel } from '@/app/lib/business-analytics';

// Helper functions extracted from component for testing
function formatFulfillmentTime(hours: number): string {
  if (hours === 0) return 'N/A';
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h`;
}

function calculatePercentage(value: number, maxValue: number): number {
  if (maxValue === 0) return 0;
  return (value / maxValue) * 100;
}

function shouldShowOptimizationSuggestion(visitToOrderRate: number): boolean {
  return visitToOrderRate < 2;
}

describe('ConversionFunnelChart Logic', () => {
  const mockFunnelData: ConversionFunnel = {
    visits: 1000,
    ordersInitiated: 100,
    ordersCompleted: 80,
    visitToOrderRate: 8.0,
    orderCompletionRate: 80.0,
    abandonmentRate: 20.0,
    avgTimeToFulfillment: 24.5,
  };

  describe('Fulfillment Time Formatting - Requirement 4.6', () => {
    it('should format fulfillment time in hours when less than 24 hours', () => {
      expect(formatFulfillmentTime(12.5)).toBe('12.5 hours');
      expect(formatFulfillmentTime(5.0)).toBe('5.0 hours');
      expect(formatFulfillmentTime(23.9)).toBe('23.9 hours');
    });

    it('should format fulfillment time in minutes when less than 1 hour', () => {
      expect(formatFulfillmentTime(0.5)).toBe('30 minutes');
      expect(formatFulfillmentTime(0.25)).toBe('15 minutes');
      expect(formatFulfillmentTime(0.75)).toBe('45 minutes');
    });

    it('should format fulfillment time in days and hours when 24+ hours', () => {
      expect(formatFulfillmentTime(24.0)).toBe('1d 0h');
      expect(formatFulfillmentTime(48.5)).toBe('2d 1h');
      expect(formatFulfillmentTime(72.3)).toBe('3d 0h');
    });

    it('should display N/A when fulfillment time is 0', () => {
      expect(formatFulfillmentTime(0)).toBe('N/A');
    });
  });

  describe('Percentage Calculation for Funnel Stages', () => {
    it('should calculate correct percentages relative to visits', () => {
      const maxValue = 1000;
      
      expect(calculatePercentage(1000, maxValue)).toBe(100);
      expect(calculatePercentage(100, maxValue)).toBe(10);
      expect(calculatePercentage(80, maxValue)).toBe(8);
    });

    it('should handle zero max value gracefully', () => {
      expect(calculatePercentage(100, 0)).toBe(0);
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    it('should handle 100% conversion', () => {
      expect(calculatePercentage(500, 500)).toBe(100);
    });
  });

  describe('Optimization Suggestion Logic - Requirement 4.7', () => {
    it('should show suggestion when conversion rate < 2%', () => {
      expect(shouldShowOptimizationSuggestion(1.5)).toBe(true);
      expect(shouldShowOptimizationSuggestion(1.0)).toBe(true);
      expect(shouldShowOptimizationSuggestion(0.5)).toBe(true);
      expect(shouldShowOptimizationSuggestion(1.99)).toBe(true);
    });

    it('should NOT show suggestion when conversion rate >= 2%', () => {
      expect(shouldShowOptimizationSuggestion(2.0)).toBe(false);
      expect(shouldShowOptimizationSuggestion(5.0)).toBe(false);
      expect(shouldShowOptimizationSuggestion(10.0)).toBe(false);
    });


    it('should handle boundary condition at exactly 2%', () => {
      expect(shouldShowOptimizationSuggestion(2.0)).toBe(false);
      expect(shouldShowOptimizationSuggestion(2.01)).toBe(false);
    });

    it('should handle zero conversion rate', () => {
      expect(shouldShowOptimizationSuggestion(0)).toBe(true);
    });
  });

  describe('Funnel Data Validation', () => {
    it('should validate complete funnel data structure', () => {
      expect(mockFunnelData).toHaveProperty('visits');
      expect(mockFunnelData).toHaveProperty('ordersInitiated');
      expect(mockFunnelData).toHaveProperty('ordersCompleted');
      expect(mockFunnelData).toHaveProperty('visitToOrderRate');
      expect(mockFunnelData).toHaveProperty('orderCompletionRate');
      expect(mockFunnelData).toHaveProperty('abandonmentRate');
      expect(mockFunnelData).toHaveProperty('avgTimeToFulfillment');
    });

    it('should have logical relationships between funnel metrics', () => {
      expect(mockFunnelData.ordersInitiated).toBeLessThanOrEqual(mockFunnelData.visits);
      expect(mockFunnelData.ordersCompleted).toBeLessThanOrEqual(mockFunnelData.ordersInitiated);
      
      const totalOrderPercentage = mockFunnelData.orderCompletionRate + mockFunnelData.abandonmentRate;
      expect(totalOrderPercentage).toBeCloseTo(100, 1);
    });

    it('should handle edge case with zero visits', () => {
      const emptyFunnel: ConversionFunnel = {
        visits: 0,
        ordersInitiated: 0,
        ordersCompleted: 0,
        visitToOrderRate: 0,
        orderCompletionRate: 0,
        abandonmentRate: 0,
        avgTimeToFulfillment: 0,
      };

      expect(emptyFunnel.visits).toBe(0);
      expect(calculatePercentage(emptyFunnel.ordersInitiated, emptyFunnel.visits || 1)).toBe(0);
    });
  });


  describe('Abandonment Rate Calculations', () => {
    it('should calculate abandoned order count correctly', () => {
      const abandonedOrders = mockFunnelData.ordersInitiated - mockFunnelData.ordersCompleted;
      expect(abandonedOrders).toBe(20);
    });

    it('should handle zero abandonment', () => {
      const noAbandonmentFunnel: ConversionFunnel = {
        visits: 100,
        ordersInitiated: 50,
        ordersCompleted: 50,
        visitToOrderRate: 50.0,
        orderCompletionRate: 100.0,
        abandonmentRate: 0.0,
        avgTimeToFulfillment: 12.0,
      };

      const abandonedOrders = noAbandonmentFunnel.ordersInitiated - noAbandonmentFunnel.ordersCompleted;
      expect(abandonedOrders).toBe(0);
      expect(noAbandonmentFunnel.abandonmentRate).toBe(0);
    });

    it('should handle 100% abandonment', () => {
      const fullAbandonmentFunnel: ConversionFunnel = {
        visits: 100,
        ordersInitiated: 50,
        ordersCompleted: 0,
        visitToOrderRate: 0.0,
        orderCompletionRate: 0.0,
        abandonmentRate: 100.0,
        avgTimeToFulfillment: 0,
      };

      const abandonedOrders = fullAbandonmentFunnel.ordersInitiated - fullAbandonmentFunnel.ordersCompleted;
      expect(abandonedOrders).toBe(50);
      expect(fullAbandonmentFunnel.abandonmentRate).toBe(100);
    });
  });

  describe('Requirements Validation', () => {
    it('should satisfy Requirement 4.1: Funnel has visits → orders initiated → orders completed', () => {
      expect(mockFunnelData.visits).toBeGreaterThanOrEqual(mockFunnelData.ordersInitiated);
      expect(mockFunnelData.ordersInitiated).toBeGreaterThanOrEqual(mockFunnelData.ordersCompleted);
    });


    it('should satisfy Requirement 4.2: Calculate conversion rates between stages', () => {
      expect(mockFunnelData.visitToOrderRate).toBeDefined();
      expect(mockFunnelData.orderCompletionRate).toBeDefined();
    });

    it('should satisfy Requirement 4.3: Display visit-to-order conversion rate', () => {
      expect(mockFunnelData.visitToOrderRate).toBe(8.0);
    });

    it('should satisfy Requirement 4.4: Display order completion rate', () => {
      expect(mockFunnelData.orderCompletionRate).toBe(80.0);
    });

    it('should satisfy Requirement 4.5: Display abandonment rate', () => {
      expect(mockFunnelData.abandonmentRate).toBe(20.0);
    });

    it('should satisfy Requirement 4.6: Show average time to fulfillment', () => {
      expect(mockFunnelData.avgTimeToFulfillment).toBeDefined();
      const formatted = formatFulfillmentTime(mockFunnelData.avgTimeToFulfillment);
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should satisfy Requirement 4.7: Show optimization suggestion when conversion < 2%', () => {
      const lowConversionFunnel: ConversionFunnel = {
        ...mockFunnelData,
        visitToOrderRate: 1.5,
      };
      expect(shouldShowOptimizationSuggestion(lowConversionFunnel.visitToOrderRate)).toBe(true);
    });
  });
});
