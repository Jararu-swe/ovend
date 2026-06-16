/**
 * Tests for /api/analytics/export route
 * 
 * Basic validation tests for the analytics export API
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/app/lib/subscriptions', () => ({
  getVendorSubscription: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  sql: vi.fn(),
}));

vi.mock('@/app/lib/business-analytics-export', () => ({
  generateCSVExport: vi.fn(),
  generateExcelExport: vi.fn(),
  generatePDFExport: vi.fn(),
}));

import { auth } from '@/auth';
import { getVendorSubscription } from '@/app/lib/subscriptions';
import { sql } from '@/app/lib/db';
import {
  generateCSVExport,
  generateExcelExport,
  generatePDFExport,
} from '@/app/lib/business-analytics-export';

describe('POST /api/analytics/export', () => {
  const mockVendorId = 'vendor-123';
  const mockStoreName = 'Test Store';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return 401 if user is not authenticated', async () => {
    (auth as any).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'csv', startDate: '2024-01-01', endDate: '2024-01-31' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  test('should return 403 if user is not Business tier', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'pro' });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'csv', startDate: '2024-01-01', endDate: '2024-01-31' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Business tier subscription required');
  });

  test('should return 400 if format is invalid', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'business' });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'invalid', startDate: '2024-01-01', endDate: '2024-01-31' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid format parameter');
  });

  test('should return 400 if date parameters are missing', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'business' });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'csv' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing date parameters');
  });

  test('should return 400 if start date is after end date', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'business' });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'csv', startDate: '2024-01-31', endDate: '2024-01-01' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid date range');
  });

  test('should call CSV export generator for csv format', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'business' });
    (sql as any).mockResolvedValue([{ store_name: mockStoreName, store_slug: 'test-store' }]);
    (generateCSVExport as any).mockResolvedValue({
      filename: 'test.csv',
      content: 'csv,content',
      mimeType: 'text/csv',
    });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'csv', startDate: '2024-01-01', endDate: '2024-01-31' }),
    });

    const response = await POST(request);

    expect(generateCSVExport).toHaveBeenCalledWith(
      mockVendorId,
      mockStoreName,
      { startDate: '2024-01-01', endDate: '2024-01-31' }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
  });

  test('should call Excel export generator for excel format', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'business' });
    (sql as any).mockResolvedValue([{ store_name: mockStoreName, store_slug: 'test-store' }]);
    (generateExcelExport as any).mockResolvedValue({
      filename: 'test.xlsx',
      content: Buffer.from('excel'),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'excel', startDate: '2024-01-01', endDate: '2024-01-31' }),
    });

    const response = await POST(request);

    expect(generateExcelExport).toHaveBeenCalledWith(
      mockVendorId,
      mockStoreName,
      { startDate: '2024-01-01', endDate: '2024-01-31' }
    );
    expect(response.status).toBe(200);
  });

  test('should call PDF export generator for pdf format', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'business' });
    (sql as any).mockResolvedValue([{ store_name: mockStoreName, store_slug: 'test-store' }]);
    (generatePDFExport as any).mockResolvedValue({
      filename: 'test.pdf',
      content: Buffer.from('pdf'),
      mimeType: 'application/pdf',
    });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'pdf', startDate: '2024-01-01', endDate: '2024-01-31' }),
    });

    const response = await POST(request);

    expect(generatePDFExport).toHaveBeenCalledWith(
      mockVendorId,
      mockStoreName,
      { startDate: '2024-01-01', endDate: '2024-01-31' }
    );
    expect(response.status).toBe(200);
  });

  test('should handle export generation errors gracefully', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'business' });
    (sql as any).mockResolvedValue([{ store_name: mockStoreName, store_slug: 'test-store' }]);
    (generateCSVExport as any).mockResolvedValue({
      type: 'validation_error',
      message: 'Date range too large',
      suggestion: 'Try a smaller date range',
    });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'csv', startDate: '2024-01-01', endDate: '2024-12-31' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('validation_error');
    expect(data.message).toBe('Date range too large');
  });

  test('should set correct Content-Disposition header', async () => {
    (auth as any).mockResolvedValue({ user: { id: mockVendorId } });
    (getVendorSubscription as any).mockResolvedValue({ tier: 'business' });
    (sql as any).mockResolvedValue([{ store_name: mockStoreName, store_slug: 'test-store' }]);
    (generateCSVExport as any).mockResolvedValue({
      filename: 'Ovend-Analytics-Test-Store-20240101-20240131-20240215.csv',
      content: 'csv,content',
      mimeType: 'text/csv',
    });

    const request = new NextRequest('http://localhost/api/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format: 'csv', startDate: '2024-01-01', endDate: '2024-01-31' }),
    });

    const response = await POST(request);

    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(response.headers.get('Content-Disposition')).toContain('filename=');
  });
});
