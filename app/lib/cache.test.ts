/**
 * Tests for Analytics Cache Utility Module
 * 
 * Validates caching functionality including:
 * - Basic get/set operations
 * - TTL expiration
 * - Pattern-based invalidation
 * - Cache key builders
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFromCache,
  setCache,
  invalidateCache,
  clearCache,
  getCacheStats,
  CacheKeys,
} from './cache';

describe('Analytics Cache Module', () => {
  beforeEach(() => {
    // Clear cache before each test to ensure isolation
    clearCache();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve values from cache', async () => {
      const key = 'test:key:1';
      const value = { data: 'test', count: 42 };

      await setCache(key, value);
      const cached = await getFromCache(key);

      expect(cached).toEqual(value);
    });

    it('should return undefined for non-existent keys', async () => {
      const cached = await getFromCache('non-existent-key');
      expect(cached).toBeUndefined();
    });

    it('should overwrite existing values with same key', async () => {
      const key = 'test:key:2';
      await setCache(key, { value: 'first' });
      await setCache(key, { value: 'second' });

      const cached = await getFromCache(key);
      expect(cached).toEqual({ value: 'second' });
    });

    it('should handle different data types', async () => {
      await setCache('string', 'hello');
      await setCache('number', 123);
      await setCache('boolean', true);
      await setCache('array', [1, 2, 3]);
      await setCache('object', { nested: { data: 'value' } });

      expect(await getFromCache('string')).toBe('hello');
      expect(await getFromCache('number')).toBe(123);
      expect(await getFromCache('boolean')).toBe(true);
      expect(await getFromCache('array')).toEqual([1, 2, 3]);
      expect(await getFromCache('object')).toEqual({ nested: { data: 'value' } });
    });
  });

  describe('Custom TTL', () => {
    it('should accept custom TTL in seconds', async () => {
      const key = 'test:ttl';
      const value = { data: 'expires-fast' };

      // Set with 1 second TTL
      await setCache(key, value, 1);
      
      // Should be available immediately
      let cached = await getFromCache(key);
      expect(cached).toEqual(value);

      // Wait for expiration (1.1 seconds)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be expired now
      cached = await getFromCache(key);
      expect(cached).toBeUndefined();
    });

    it('should use default 5-minute TTL when not specified', async () => {
      const key = 'test:default-ttl';
      const value = { data: 'default-expiry' };

      await setCache(key, value);
      
      // Should still be available after 1 second (well within 5 minutes)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const cached = await getFromCache(key);
      expect(cached).toEqual(value);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache entries matching pattern', async () => {
      await setCache('analytics:vendor-123:2024-01-01:2024-01-31', { data: 1 });
      await setCache('analytics:vendor-123:2024-02-01:2024-02-28', { data: 2 });
      await setCache('analytics:vendor-456:2024-01-01:2024-01-31', { data: 3 });
      await setCache('customers:vendor-123:2024-01-01:2024-01-31', { data: 4 });

      // Invalidate all analytics for vendor-123
      const count = invalidateCache('analytics:vendor-123');

      expect(count).toBe(2);
      expect(await getFromCache('analytics:vendor-123:2024-01-01:2024-01-31')).toBeUndefined();
      expect(await getFromCache('analytics:vendor-123:2024-02-01:2024-02-28')).toBeUndefined();
      expect(await getFromCache('analytics:vendor-456:2024-01-01:2024-01-31')).toEqual({ data: 3 });
      expect(await getFromCache('customers:vendor-123:2024-01-01:2024-01-31')).toEqual({ data: 4 });
    });

    it('should invalidate all entries for a date', async () => {
      await setCache('analytics:vendor-123:2024-03-15:2024-03-15', { data: 1 });
      await setCache('customers:vendor-456:2024-03-15:2024-03-15', { data: 2 });
      await setCache('analytics:vendor-789:2024-03-16:2024-03-16', { data: 3 });

      const count = invalidateCache(':2024-03-15');

      expect(count).toBe(2);
      expect(await getFromCache('analytics:vendor-123:2024-03-15:2024-03-15')).toBeUndefined();
      expect(await getFromCache('customers:vendor-456:2024-03-15:2024-03-15')).toBeUndefined();
      expect(await getFromCache('analytics:vendor-789:2024-03-16:2024-03-16')).toEqual({ data: 3 });
    });

    it('should return 0 when no entries match pattern', async () => {
      await setCache('analytics:vendor-123:2024-01-01:2024-01-31', { data: 1 });
      
      const count = invalidateCache('nonexistent-pattern');
      
      expect(count).toBe(0);
      expect(await getFromCache('analytics:vendor-123:2024-01-01:2024-01-31')).toEqual({ data: 1 });
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache entries', async () => {
      await setCache('key1', { data: 1 });
      await setCache('key2', { data: 2 });
      await setCache('key3', { data: 3 });

      clearCache();

      expect(await getFromCache('key1')).toBeUndefined();
      expect(await getFromCache('key2')).toBeUndefined();
      expect(await getFromCache('key3')).toBeUndefined();
    });

    it('should return cache statistics', async () => {
      clearCache();
      
      let stats = getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.max).toBe(500);

      await setCache('key1', { data: 1 });
      await setCache('key2', { data: 2 });

      stats = getCacheStats();
      expect(stats.size).toBe(2);
    });
  });

  describe('Cache Key Builders', () => {
    it('should generate correct analytics cache key', () => {
      const key = CacheKeys.analytics('vendor-123', '2024-01-01', '2024-01-31');
      expect(key).toBe('analytics:vendor-123:2024-01-01:2024-01-31');
    });

    it('should generate correct customers cache key', () => {
      const key = CacheKeys.customers('vendor-456', '2024-02-01', '2024-02-28');
      expect(key).toBe('customers:vendor-456:2024-02-01:2024-02-28');
    });

    it('should generate correct products cache key', () => {
      const key = CacheKeys.products('vendor-789', '2024-03-01', '2024-03-31', 2, 'revenue');
      expect(key).toBe('products:vendor-789:2024-03-01:2024-03-31:2:revenue');
    });

    it('should generate correct forecast cache key', () => {
      const key = CacheKeys.forecast('vendor-999');
      expect(key).toBe('forecast:vendor-999');
    });

    it('should generate correct funnel cache key', () => {
      const key = CacheKeys.funnel('vendor-111', '2024-01-01', '2024-01-31');
      expect(key).toBe('funnel:vendor-111:2024-01-01:2024-01-31');
    });

    it('should generate correct geographic cache key', () => {
      const key = CacheKeys.geographic('vendor-222', '2024-01-01', '2024-01-31');
      expect(key).toBe('geographic:vendor-222:2024-01-01:2024-01-31');
    });

    it('should generate correct realtime cache key', () => {
      const key = CacheKeys.realtime('vendor-333', '2024-03-15');
      expect(key).toBe('realtime:vendor-333:2024-03-15');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle typical analytics workflow', async () => {
      const vendorId = 'vendor-123';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      // First request - cache miss, set data
      const key = CacheKeys.analytics(vendorId, startDate, endDate);
      let cached = await getFromCache(key);
      expect(cached).toBeUndefined();

      const analyticsData = {
        totalVisits: 1000,
        totalOrders: 50,
        totalRevenue: 50000,
        conversionRate: 5.0,
      };
      await setCache(key, analyticsData);

      // Second request - cache hit
      cached = await getFromCache(key);
      expect(cached).toEqual(analyticsData);

      // Order created, invalidate cache
      invalidateCache(`analytics:${vendorId}`);

      // Third request - cache miss after invalidation
      cached = await getFromCache(key);
      expect(cached).toBeUndefined();
    });

    it('should handle forecast with 24-hour TTL', async () => {
      const vendorId = 'vendor-456';
      const key = CacheKeys.forecast(vendorId);

      const forecastData = {
        forecastedRevenue: 100000,
        confidence: 'high',
        historicalDays: 90,
      };

      // Cache forecast with 24-hour TTL (86400 seconds)
      await setCache(key, forecastData, 86400);

      const cached = await getFromCache(key);
      expect(cached).toEqual(forecastData);
    });

    it('should handle multiple vendors independently', async () => {
      const dateRange = { start: '2024-01-01', end: '2024-01-31' };

      await setCache(
        CacheKeys.analytics('vendor-1', dateRange.start, dateRange.end),
        { revenue: 10000 }
      );
      await setCache(
        CacheKeys.analytics('vendor-2', dateRange.start, dateRange.end),
        { revenue: 20000 }
      );

      // Invalidate vendor-1 only
      invalidateCache('analytics:vendor-1');

      expect(await getFromCache(CacheKeys.analytics('vendor-1', dateRange.start, dateRange.end))).toBeUndefined();
      expect(await getFromCache(CacheKeys.analytics('vendor-2', dateRange.start, dateRange.end))).toEqual({ revenue: 20000 });
    });
  });
});
