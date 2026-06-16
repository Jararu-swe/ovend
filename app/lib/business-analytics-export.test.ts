/**
 * Tests for business analytics export functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generatePDFExport,
  type DateRange,
} from './business-analytics-export';

// Mock the dependencies
vi.mock('./business-analytics', () => ({
  validateDateRange: vi.fn((startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 365) {
      return { valid: false, error: 'Date range cannot exceed 365 days' };
    }
    
    return { valid: true };
  }),
  fetchAnalyticsSummary: vi.fn(async () => ({
    totalVisits: 1250,
    totalOrders: 45,
    totalRevenue: 450000, // 4,500 Naira in kobo
    conversionRate: 3.6,
    avgOrderValue: 10000, // 100 Naira in kobo
    periodChange: {
      visits: { value: 1250, change: 15.5, direction: 'up' as const },
      orders: { value: 45, change: 22.3, direction: 'up' as const },
      revenue: { value: 450000, change: 18.7, direction: 'up' as const },
      conversionRate: { value: 3.6, change: 5.8, direction: 'up' as const },
    },
  })),
  fetchProductPerformance: vi.fn(async () => ({
    products: [
      {
        productId: '1',
        productName: 'Test Product 1',
        unitsSold: 25,
        totalRevenue: 250000,
        inventoryVelocity: 1.2,
        salesTrend: 'up' as const,
        discountPercentage: 10,
        category: 'Electronics',
      },
      {
        productId: '2',
        productName: 'Test Product 2',
        unitsSold: 20,
        totalRevenue: 200000,
        inventoryVelocity: 1.5,
        salesTrend: 'stable' as const,
        discountPercentage: null,
        category: 'Accessories',
      },
    ],
    totalCount: 2,
  })),
  fetchCustomerMetrics: vi.fn(async () => ({
    repeatCustomerRate: 35.5,
    newCustomers: 28,
    returningCustomers: 17,
    averageLifetimeValue: 15000, // 150 Naira in kobo
    totalUniqueCustomers: 45,
  })),
  calculateDaysDifference: vi.fn(() => 30),
}));

vi.mock('./db', () => ({
  sql: vi.fn(async () => [
    { date: '2024-01-01', visits: 50, orders: 2, revenue: 20000 },
    { date: '2024-01-02', visits: 45, orders: 1, revenue: 10000 },
    { date: '2024-01-03', visits: 60, orders: 3, revenue: 30000 },
  ]),
}));

describe('generatePDFExport', () => {
  const validRange: DateRange = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  it('should generate a PDF export successfully', async () => {
    const result = await generatePDFExport(
      'vendor-123',
      'Test Store',
      validRange
    );

    // Check that it's not an error
    expect('type' in result).toBe(false);

    if (!('type' in result)) {
      // Verify the result structure
      expect(result.filename).toMatch(/^Ovend-Analytics-Test_Store-\d{8}-\d{8}-\d{8}\.pdf$/);
      expect(result.mimeType).toBe('application/pdf');
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.content.length).toBeGreaterThan(0);

      // Verify PDF starts with PDF header
      const pdfHeader = result.content.toString('utf-8', 0, 5);
      expect(pdfHeader).toBe('%PDF-');
    }
  });

  it('should return validation error for date range > 365 days', async () => {
    const invalidRange: DateRange = {
      startDate: '2023-01-01',
      endDate: '2024-12-31', // More than 365 days
    };

    const result = await generatePDFExport(
      'vendor-123',
      'Test Store',
      invalidRange
    );

    expect('type' in result).toBe(true);
    if ('type' in result) {
      expect(result.type).toBe('validation_error');
      expect(result.message).toBeDefined();
      // The message contains the validation error from validateDateRange
      expect(result.suggestion).toBeDefined();
    }
  });

  it('should include store name in filename', async () => {
    const result = await generatePDFExport(
      'vendor-123',
      'My Amazing Store!',
      validRange
    );

    if (!('type' in result)) {
      // Special characters should be replaced with underscores
      expect(result.filename).toContain('My_Amazing_Store_');
    }
  });

  it('should generate valid PDF with proper sections', async () => {
    const result = await generatePDFExport(
      'vendor-123',
      'Test Store',
      validRange
    );

    if (!('type' in result)) {
      const pdfContent = result.content.toString();
      
      // Check for key sections in PDF (these strings are embedded in the PDF)
      expect(pdfContent).toContain('Ovend Analytics Report');
      expect(pdfContent).toContain('Test Store');
      expect(pdfContent).toContain('Summary');
      expect(pdfContent).toContain('Customer Analytics');
      expect(pdfContent).toContain('Top Products by Revenue');
      expect(pdfContent).toContain('Daily Metrics');
    }
  });

  it('should format dates correctly in filename', async () => {
    const result = await generatePDFExport(
      'vendor-123',
      'Store',
      {
        startDate: '2024-01-15',
        endDate: '2024-02-15',
      }
    );

    if (!('type' in result)) {
      expect(result.filename).toContain('20240115-20240215');
    }
  });

  it('should handle optional logo URL parameter', async () => {
    const resultWithLogo = await generatePDFExport(
      'vendor-123',
      'Test Store',
      validRange,
      'https://example.com/logo.png'
    );

    expect('type' in resultWithLogo).toBe(false);

    const resultWithoutLogo = await generatePDFExport(
      'vendor-123',
      'Test Store',
      validRange
    );

    expect('type' in resultWithoutLogo).toBe(false);
  });
});
