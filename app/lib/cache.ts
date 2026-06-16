/**
 * Analytics Cache Utility Module
 * 
 * Provides caching functionality for analytics data using LRU cache with 5-minute TTL.
 * This module helps reduce database load by caching frequently accessed analytics data.
 * 
 * Cache Key Patterns:
 * - analytics:{vendorId}:{startDate}:{endDate} - Summary analytics data
 * - customers:{vendorId}:{startDate}:{endDate} - Customer metrics
 * - products:{vendorId}:{startDate}:{endDate}:{page}:{sort} - Product performance data
 * - forecast:{vendorId} - Revenue forecast (24-hour TTL)
 * 
 * @module app/lib/cache
 */

import { LRUCache } from 'lru-cache';

/**
 * LRU Cache instance for analytics data
 * - Maximum 500 entries to prevent memory overflow
 * - Default TTL of 5 minutes (300 seconds)
 * - No age update on access to maintain strict TTL
 */
const analyticsCache = new LRUCache<string, any>({
  max: 500, // Maximum 500 entries
  ttl: 1000 * 60 * 5, // 5 minutes TTL in milliseconds
  updateAgeOnGet: false, // Don't reset TTL on access
  updateAgeOnHas: false, // Don't reset TTL on existence check
});

/**
 * Retrieve a value from the cache
 * 
 * @param key - The cache key to retrieve
 * @returns The cached value if found and not expired, undefined otherwise
 * 
 * @example
 * const summary = await getFromCache('analytics:vendor-123:2024-01-01:2024-01-31');
 * if (summary) {
 *   // Use cached data
 * } else {
 *   // Fetch from database
 * }
 */
export async function getFromCache(key: string): Promise<any | undefined> {
  return analyticsCache.get(key);
}

/**
 * Store a value in the cache with optional custom TTL
 * 
 * @param key - The cache key to store under
 * @param value - The value to cache (will be stored in memory)
 * @param ttlSeconds - Optional custom TTL in seconds (overrides default 5 minutes)
 * 
 * @example
 * // Cache with default 5-minute TTL
 * await setCache('analytics:vendor-123:2024-01-01:2024-01-31', summaryData);
 * 
 * // Cache forecast with 24-hour TTL
 * await setCache('forecast:vendor-123', forecastData, 86400);
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<void> {
  const options = ttlSeconds ? { ttl: ttlSeconds * 1000 } : undefined;
  analyticsCache.set(key, value, options);
}

/**
 * Invalidate (delete) cache entries matching a pattern
 * 
 * This function removes all cache keys that contain the specified pattern string.
 * Useful for invalidating related cache entries when data changes.
 * 
 * @param pattern - The pattern to match against cache keys
 * @returns The number of cache entries invalidated
 * 
 * @example
 * // Invalidate all analytics cache for a specific vendor
 * invalidateCache('analytics:vendor-123');
 * 
 * // Invalidate all cache entries for today's date
 * invalidateCache(':2024-03-15');
 * 
 * // Invalidate all product performance cache
 * invalidateCache('products:');
 */
export function invalidateCache(pattern: string): number {
  const keys = Array.from(analyticsCache.keys());
  let invalidatedCount = 0;
  
  keys.forEach(key => {
    if (key.includes(pattern)) {
      analyticsCache.delete(key);
      invalidatedCount++;
    }
  });
  
  return invalidatedCount;
}

/**
 * Clear all entries from the cache
 * 
 * This function removes all cached data. Use with caution.
 * Primarily useful for testing or administrative purposes.
 * 
 * @example
 * clearCache(); // Clear all cached analytics data
 */
export function clearCache(): void {
  analyticsCache.clear();
}

/**
 * Get cache statistics
 * 
 * Returns information about the current cache state.
 * 
 * @returns Object containing cache size and max size
 */
export function getCacheStats() {
  return {
    size: analyticsCache.size,
    max: analyticsCache.max,
  };
}

/**
 * Cache key builder utilities for consistent key generation
 */
export const CacheKeys = {
  /**
   * Generate cache key for analytics summary data
   * Pattern: analytics:{vendorId}:{startDate}:{endDate}
   */
  analytics: (vendorId: string, startDate: string, endDate: string): string => {
    return `analytics:${vendorId}:${startDate}:${endDate}`;
  },

  /**
   * Generate cache key for customer metrics
   * Pattern: customers:{vendorId}:{startDate}:{endDate}
   */
  customers: (vendorId: string, startDate: string, endDate: string): string => {
    return `customers:${vendorId}:${startDate}:${endDate}`;
  },

  /**
   * Generate cache key for product performance data
   * Pattern: products:{vendorId}:{startDate}:{endDate}:{page}:{sort}
   */
  products: (
    vendorId: string,
    startDate: string,
    endDate: string,
    page: number,
    sortBy: string
  ): string => {
    return `products:${vendorId}:${startDate}:${endDate}:${page}:${sortBy}`;
  },

  /**
   * Generate cache key for revenue forecast
   * Pattern: forecast:{vendorId}
   */
  forecast: (vendorId: string): string => {
    return `forecast:${vendorId}`;
  },

  /**
   * Generate cache key for conversion funnel data
   * Pattern: funnel:{vendorId}:{startDate}:{endDate}
   */
  funnel: (vendorId: string, startDate: string, endDate: string): string => {
    return `funnel:${vendorId}:${startDate}:${endDate}`;
  },

  /**
   * Generate cache key for geographic insights
   * Pattern: geographic:{vendorId}:{startDate}:{endDate}
   */
  geographic: (vendorId: string, startDate: string, endDate: string): string => {
    return `geographic:${vendorId}:${startDate}:${endDate}`;
  },

  /**
   * Generate cache key for real-time dashboard data
   * Pattern: realtime:{vendorId}:{date}
   */
  realtime: (vendorId: string, date: string): string => {
    return `realtime:${vendorId}:${date}`;
  },
};
