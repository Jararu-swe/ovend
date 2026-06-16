# Analytics Cache Module

## Overview

The analytics cache module provides a high-performance LRU (Least Recently Used) caching system for analytics data. It helps reduce database load by caching frequently accessed analytics queries with a default 5-minute TTL.

## Key Features

- **LRU Cache**: Maximum 500 entries with automatic eviction
- **Default 5-minute TTL**: Configurable per-cache-entry
- **Pattern-based invalidation**: Easily invalidate related cache entries
- **Type-safe cache key builders**: Consistent key generation patterns
- **Zero external dependencies**: Uses built-in `lru-cache` library

## Basic Usage

### Storing and Retrieving Data

```typescript
import { getFromCache, setCache, CacheKeys } from '@/app/lib/cache';

// Generate cache key
const key = CacheKeys.analytics(vendorId, startDate, endDate);

// Check cache first
const cached = await getFromCache(key);
if (cached) {
  return cached; // Use cached data
}

// Fetch from database
const data = await fetchFromDatabase(vendorId, startDate, endDate);

// Store in cache with default 5-minute TTL
await setCache(key, data);

return data;
```

### Custom TTL

```typescript
import { setCache, CacheKeys } from '@/app/lib/cache';

// Cache forecast with 24-hour TTL (86400 seconds)
const forecastKey = CacheKeys.forecast(vendorId);
await setCache(forecastKey, forecastData, 86400);
```

### Cache Invalidation

```typescript
import { invalidateCache } from '@/app/lib/cache';

// When an order is created, invalidate all analytics cache for that vendor
invalidateCache(`analytics:${vendorId}`);

// Invalidate all cache for a specific date
invalidateCache(`:2024-03-15`);

// Invalidate all product cache
invalidateCache('products:');
```

## Cache Key Patterns

The module provides standardized key builders to ensure consistency:

### Analytics Summary
```typescript
CacheKeys.analytics(vendorId, startDate, endDate)
// Result: "analytics:vendor-123:2024-01-01:2024-01-31"
```

### Customer Metrics
```typescript
CacheKeys.customers(vendorId, startDate, endDate)
// Result: "customers:vendor-123:2024-01-01:2024-01-31"
```

### Product Performance
```typescript
CacheKeys.products(vendorId, startDate, endDate, page, sortBy)
// Result: "products:vendor-123:2024-01-01:2024-01-31:1:revenue"
```

### Revenue Forecast
```typescript
CacheKeys.forecast(vendorId)
// Result: "forecast:vendor-123"
```

### Conversion Funnel
```typescript
CacheKeys.funnel(vendorId, startDate, endDate)
// Result: "funnel:vendor-123:2024-01-01:2024-01-31"
```

### Geographic Insights
```typescript
CacheKeys.geographic(vendorId, startDate, endDate)
// Result: "geographic:vendor-123:2024-01-01:2024-01-31"
```

### Real-time Dashboard
```typescript
CacheKeys.realtime(vendorId, date)
// Result: "realtime:vendor-123:2024-03-15"
```

## Integration with Analytics Functions

### Example: Fetch Analytics Summary with Caching

```typescript
import { sql } from '@/app/lib/db';
import { getFromCache, setCache, CacheKeys } from '@/app/lib/cache';

export async function fetchAnalyticsSummary(
  vendorId: string,
  startDate: string,
  endDate: string
) {
  // Generate cache key
  const cacheKey = CacheKeys.analytics(vendorId, startDate, endDate);
  
  // Check cache
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Query database
  const result = await sql`
    SELECT 
      SUM(visits) as total_visits,
      SUM(orders_count) as total_orders,
      SUM(revenue) as total_revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date >= ${startDate}::date
      AND date <= ${endDate}::date
  `;
  
  const data = {
    totalVisits: result[0].total_visits,
    totalOrders: result[0].total_orders,
    totalRevenue: result[0].total_revenue,
  };
  
  // Cache for 5 minutes (default)
  await setCache(cacheKey, data);
  
  return data;
}
```

### Example: Invalidate Cache on Order Creation

```typescript
import { invalidateCache } from '@/app/lib/cache';

export async function createOrder(orderData: OrderData) {
  // Create order in database
  const order = await sql`
    INSERT INTO orders (vendor_id, customer_phone, total_amount, ...)
    VALUES (${orderData.vendorId}, ...)
    RETURNING *
  `;
  
  // Invalidate all analytics cache for this vendor
  invalidateCache(`analytics:${orderData.vendorId}`);
  invalidateCache(`customers:${orderData.vendorId}`);
  invalidateCache(`realtime:${orderData.vendorId}`);
  
  return order;
}
```

## Cache Statistics

Monitor cache usage:

```typescript
import { getCacheStats } from '@/app/lib/cache';

const stats = getCacheStats();
console.log(`Cache size: ${stats.size} / ${stats.max}`);
```

## Cache Management

Clear all cache (use with caution):

```typescript
import { clearCache } from '@/app/lib/cache';

// Clear all cached data
clearCache();
```

## Performance Characteristics

- **Cache Hit**: < 1ms retrieval time
- **Cache Miss**: Falls through to database query
- **Memory Usage**: ~500 entries × average entry size
- **TTL**: 5 minutes default, 24 hours for forecasts
- **Eviction**: Automatic LRU eviction when max entries reached

## Best Practices

1. **Always use CacheKeys builders** for consistent key generation
2. **Invalidate proactively** when data changes (orders, products, etc.)
3. **Use appropriate TTL** - shorter for real-time data, longer for forecasts
4. **Monitor cache size** - 500 entries should be sufficient for most use cases
5. **Handle cache failures gracefully** - always have database fallback

## Requirements Coverage

This cache module satisfies:
- **Requirement 12.6**: Cache frequently accessed analytics data for 5 minutes
- **Requirement 12.7**: Serve cached data instead of querying database when cache is valid

## Related Modules

- `app/lib/business-analytics.ts` - Analytics data functions using this cache
- `app/lib/data.ts` - Core data functions that may use caching
