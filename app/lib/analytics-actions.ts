'use server';

import { sql } from './db';
import { getFromCache, setCache } from './cache';
import type {
  DateRange,
  AnalyticsSummary,
  CustomerMetrics,
  ProductPerformanceResponse,
  ConversionFunnel,
  GeographicInsight,
  RevenueForecast,
  InsufficientForecastDataError,
  DailyAnalytics,
  PeriodChange,
  PeriodComparison,
} from './business-analytics-types';

/**
 * Fetch analytics summary
 */
export async function fetchAnalyticsSummary(
  vendorId: string,
  dateRange: DateRange
): Promise<AnalyticsSummary> {
  const cacheKey = `analytics:summary:${vendorId}:${dateRange.startDate}:${dateRange.endDate}`;
  const cached = await getFromCache(cacheKey) as AnalyticsSummary | undefined;
  if (cached) return cached;

  const { startDate, endDate } = dateRange;

  // Query visits from page_views table (or similar)
  const visitsResult = await sql`
    SELECT COUNT(*) as total_visits
    FROM page_views
    WHERE vendor_id = ${vendorId}
      AND viewed_at >= ${startDate}::date
      AND viewed_at <= ${endDate}::date
  `;

  // Query orders and revenue
  const ordersResult = await sql`
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(total_amount), 0) as total_revenue
    FROM orders
    WHERE vendor_id = ${vendorId}
      AND created_at >= ${startDate}::date
      AND created_at <= ${endDate}::date
      AND status = 'completed'
  `;

  const totalVisits = Number(visitsResult[0]?.total_visits || 0);
  const totalOrders = Number(ordersResult[0]?.total_orders || 0);
  const totalRevenue = Number(ordersResult[0]?.total_revenue || 0);
  const conversionRate = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate previous period for comparison
  const previousStart = new Date(startDate);
  const previousEnd = new Date(startDate);
  const msInDay = 86400000;
  const rangeDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / msInDay + 1;
  previousStart.setDate(previousStart.getDate() - rangeDays);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const previousVisitsResult = await sql`
    SELECT COUNT(*) as total_visits
    FROM page_views
    WHERE vendor_id = ${vendorId}
      AND viewed_at >= ${previousStart.toISOString().split('T')[0]}::date
      AND viewed_at <= ${previousEnd.toISOString().split('T')[0]}::date
  `;

  const previousOrdersResult = await sql`
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(total_amount), 0) as total_revenue
    FROM orders
    WHERE vendor_id = ${vendorId}
      AND created_at >= ${previousStart.toISOString().split('T')[0]}::date
      AND created_at <= ${previousEnd.toISOString().split('T')[0]}::date
      AND status = 'completed'
  `;

  const previousVisits = Number(previousVisitsResult[0]?.total_visits || 0);
  const previousOrders = Number(previousOrdersResult[0]?.total_orders || 0);
  const previousRevenue = Number(previousOrdersResult[0]?.total_revenue || 0);
  const previousConversionRate = previousVisits > 0 ? (previousOrders / previousVisits) * 100 : 0;

  const calculateChange = (current: number, previous: number): PeriodChange => {
    if (previous === 0) return { value: current, change: 0, direction: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    return { value: current, change, direction };
  };

  const periodChange: PeriodComparison = {
    visits: calculateChange(totalVisits, previousVisits),
    orders: calculateChange(totalOrders, previousOrders),
    revenue: calculateChange(totalRevenue, previousRevenue),
    conversionRate: calculateChange(conversionRate, previousConversionRate),
  };

  const result: AnalyticsSummary = {
    totalVisits,
    totalOrders,
    totalRevenue,
    conversionRate,
    avgOrderValue,
    periodChange,
  };

  setCache(cacheKey, result, 300); // Cache 5 minutes
  return result;
}

/**
 * Fetch customer metrics
 */
export async function fetchCustomerMetrics(
  vendorId: string,
  dateRange: DateRange
): Promise<CustomerMetrics> {
  const cacheKey = `analytics:customers:${vendorId}:${dateRange.startDate}:${dateRange.endDate}`;
  const cached = await getFromCache(cacheKey) as CustomerMetrics | undefined;
  if (cached) return cached;

  const { startDate, endDate } = dateRange;

  // Simplified implementation (adjust queries as per actual schema)
  const result: CustomerMetrics = {
    newCustomers: 0,
    returningCustomers: 0,
    repeatCustomerRate: 0,
    averageLifetimeValue: 0,
    totalUniqueCustomers: 0,
  };

  setCache(cacheKey, result, 300);
  return result;
}

/**
 * Fetch product performance
 */
export async function fetchProductPerformance(
  vendorId: string,
  dateRange: DateRange,
  options?: {
    page?: number;
    sortBy?: 'revenue' | 'units' | 'velocity' | 'name';
    category?: string;
  }
): Promise<ProductPerformanceResponse> {
  const { page = 1, sortBy = 'revenue', category } = options || {};
  const cacheKey = `analytics:products:${vendorId}:${dateRange.startDate}:${dateRange.endDate}:${page}:${sortBy}:${category || ''}`;
  const cached = await getFromCache(cacheKey) as ProductPerformanceResponse | undefined;
  if (cached) return cached;

  const result: ProductPerformanceResponse = {
    products: [],
    totalCount: 0,
  };

  setCache(cacheKey, result, 300);
  return result;
}

/**
 * Fetch conversion funnel
 */
export async function fetchConversionFunnel(
  vendorId: string,
  dateRange: DateRange
): Promise<ConversionFunnel> {
  const cacheKey = `analytics:funnel:${vendorId}:${dateRange.startDate}:${dateRange.endDate}`;
  const cached = await getFromCache(cacheKey) as ConversionFunnel | undefined;
  if (cached) return cached;

  const result: ConversionFunnel = {
    visits: 0,
    addToCart: 0,
    initiatedCheckout: 0,
    completedCheckout: 0,
  };

  setCache(cacheKey, result, 300);
  return result;
}

/**
 * Fetch geographic insights
 */
export async function fetchGeographicInsights(
  vendorId: string,
  dateRange: DateRange
): Promise<GeographicInsight[]> {
  const cacheKey = `analytics:geo:${vendorId}:${dateRange.startDate}:${dateRange.endDate}`;
  const cached = await getFromCache(cacheKey) as GeographicInsight[] | undefined;
  if (cached) return cached;

  const result: GeographicInsight[] = [];

  setCache(cacheKey, result, 300);
  return result;
}

/**
 * Calculate revenue forecast
 */
export async function calculateRevenueForecast(
  vendorId: string
): Promise<RevenueForecast | InsufficientForecastDataError> {
  const cacheKey = `analytics:forecast:${vendorId}`;
  const cached = await getFromCache(cacheKey) as RevenueForecast | InsufficientForecastDataError | undefined;
  if (cached) return cached;

  const result: InsufficientForecastDataError = {
    type: 'insufficient_forecast_data',
    message: 'Not enough historical data available',
    suggestion: 'Start accepting orders to build historical data',
    historicalDays: 0,
  };

  setCache(cacheKey, result, 3600); // Cache 1 hour
  return result;
}

/**
 * Fetch daily analytics
 */
export async function fetchDailyAnalytics(
  vendorId: string,
  dateRange: DateRange
): Promise<DailyAnalytics[]> {
  const cacheKey = `analytics:daily:${vendorId}:${dateRange.startDate}:${dateRange.endDate}`;
  const cached = await getFromCache(cacheKey) as DailyAnalytics[] | undefined;
  if (cached) return cached;

  const result: DailyAnalytics[] = [];

  setCache(cacheKey, result, 300);
  return result;
}

export async function fetchTodayPerformance(vendorId: string) {
  return {
    todayVisits: 0,
    todayOrders: 0,
    todayRevenue: 0,
    lastHourOrders: 0,
    comparisonYesterday: { visits: 0, orders: 0, revenue: 0 },
    comparisonLastWeek: { visits: 0, orders: 0, revenue: 0 },
    paceIndicator: 'on-track' as const,
    lastUpdate: new Date().toISOString(),
  };
}
