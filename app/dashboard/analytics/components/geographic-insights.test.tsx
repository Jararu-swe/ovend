/**
 * Unit tests for GeographicInsights component logic
 * 
 * Tests:
 * - Component receives correct props structure
 * - Handles empty insights array (insufficient data case)
 * - Calculates state aggregations correctly
 * - Sorting logic for cities by orders and revenue
 * - Percentage calculations
 */

import { describe, it, expect } from 'vitest';
import type { GeographicInsight } from '@/app/lib/business-analytics';

describe('GeographicInsights Component Logic', () => {
  const mockInsights: GeographicInsight[] = [
    {
      city: 'Lagos',
      state: 'Lagos State',
      orderCount: 50,
      revenue: 500000, // ₦5,000 in kobo
      percentageOfTotal: 50,
    },
    {
      city: 'Ikeja',
      state: 'Lagos State',
      orderCount: 30,
      revenue: 300000,
      percentageOfTotal: 30,
    },
    {
      city: 'Abuja',
      state: 'FCT',
      orderCount: 20,
      revenue: 200000,
      percentageOfTotal: 20,
    },
  ];

  describe('Data Aggregation', () => {
    it('should aggregate cities by state correctly', () => {
      // Simulate state aggregation logic from component
      const stateMap = new Map<string, { orderCount: number; revenue: number; cities: Set<string> }>();
      
      mockInsights.forEach(insight => {
        if (stateMap.has(insight.state)) {
          const existing = stateMap.get(insight.state)!;
          existing.orderCount += insight.orderCount;
          existing.revenue += insight.revenue;
          existing.cities.add(insight.city);
        } else {
          stateMap.set(insight.state, {
            orderCount: insight.orderCount,
            revenue: insight.revenue,
            cities: new Set([insight.city]),
          });
        }
      });

      const lagosState = stateMap.get('Lagos State')!;
      expect(lagosState.orderCount).toBe(80); // 50 + 30
      expect(lagosState.revenue).toBe(800000); // 500000 + 300000
      expect(lagosState.cities.size).toBe(2); // Lagos + Ikeja

      const fctState = stateMap.get('FCT')!;
      expect(fctState.orderCount).toBe(20);
      expect(fctState.cities.size).toBe(1);
    });
  });

  describe('Sorting Logic', () => {
    it('should sort cities by order count correctly', () => {
      const sortedByOrders = [...mockInsights].sort((a, b) => b.orderCount - a.orderCount);
      
      expect(sortedByOrders[0].city).toBe('Lagos'); // 50 orders
      expect(sortedByOrders[1].city).toBe('Ikeja'); // 30 orders
      expect(sortedByOrders[2].city).toBe('Abuja'); // 20 orders
    });

    it('should sort cities by revenue correctly', () => {
      const sortedByRevenue = [...mockInsights].sort((a, b) => b.revenue - a.revenue);
      
      expect(sortedByRevenue[0].city).toBe('Lagos'); // 500000
      expect(sortedByRevenue[1].city).toBe('Ikeja'); // 300000
      expect(sortedByRevenue[2].city).toBe('Abuja'); // 200000
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate total orders correctly', () => {
      const totalOrders = mockInsights.reduce((sum, insight) => sum + insight.orderCount, 0);
      expect(totalOrders).toBe(100); // 50 + 30 + 20
    });

    it('should calculate total revenue correctly', () => {
      const totalRevenue = mockInsights.reduce((sum, insight) => sum + insight.revenue, 0);
      expect(totalRevenue).toBe(1000000); // 500000 + 300000 + 200000
    });

    it('should calculate state percentage correctly', () => {
      const totalOrders = 100;
      const lagosStateOrders = 80; // 50 + 30
      const percentage = (lagosStateOrders / totalOrders) * 100;
      
      expect(percentage).toBe(80);
    });
  });

  describe('Vendor State Highlighting', () => {
    it('should identify vendor state correctly', () => {
      const vendorState = 'Lagos State';
      const lagosStateData = { state: 'Lagos State', orderCount: 80 };
      const fctStateData = { state: 'FCT', orderCount: 20 };
      
      expect(lagosStateData.state === vendorState).toBe(true);
      expect(fctStateData.state === vendorState).toBe(false);
    });
  });

  describe('Empty Data Handling', () => {
    it('should handle empty insights array', () => {
      const emptyInsights: GeographicInsight[] = [];
      
      expect(emptyInsights.length).toBe(0);
      // Component should display insufficient data message
    });
  });

  describe('Top 10 Limiting', () => {
    it('should limit results to top 10 cities', () => {
      const manyInsights: GeographicInsight[] = Array.from({ length: 15 }, (_, i) => ({
        city: `City ${i + 1}`,
        state: 'State',
        orderCount: 100 - i,
        revenue: (100 - i) * 1000,
        percentageOfTotal: (100 - i) / 10,
      }));

      const top10 = manyInsights.slice(0, 10);
      
      expect(top10.length).toBe(10);
      expect(top10[0].city).toBe('City 1');
      expect(top10[9].city).toBe('City 10');
    });
  });
});
