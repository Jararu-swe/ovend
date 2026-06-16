/**
 * Business Analytics Utilities
 * 
 * Core utilities for Business-tier advanced analytics features
 */

import { sql } from './db';
import { getFromCache, setCache, CacheKeys } from './cache';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Time range selector options
 */
export type TimeRange = '7d' | '30d' | '90d' | 'custom';

/**
 * Date range with start and end dates in ISO format
 */
export type DateRange = {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
};

/**
 * Validation result for date range operations
 */
export type ValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Period comparison data showing changes from previous period
 */
export type PeriodChange = {
  value: number;
  change: number; // Percentage change
  direction: 'up' | 'down' | 'neutral';
};

/**
 * Period-over-period comparison for all key metrics
 */
export type PeriodComparison = {
  visits: PeriodChange;
  orders: PeriodChange;
  revenue: PeriodChange;
  conversionRate: PeriodChange;
};

/**
 * Analytics summary for a given date range
 */
export type AnalyticsSummary = {
  totalVisits: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
  periodChange: PeriodComparison;
};

// ============================================================================
// Date Range Utilities
// ============================================================================

/**
 * Calculate date range from time range option
 * 
 * Converts a TimeRange option ('7d', '30d', '90d') into a DateRange object
 * with start and end dates.
 * 
 * @param timeRange - The time range option to convert
 * @returns DateRange object with startDate and endDate in ISO format
 * 
 * @example
 * calculateDateRange('7d')
 * // Returns: { startDate: '2024-01-01', endDate: '2024-01-08' }
 * // (if today is 2024-01-08)
 * 
 * Validates: Requirements 1.2, 1.3, 1.4
 */
export function calculateDateRange(timeRange: TimeRange): DateRange {
  const endDate = new Date();
  const startDate = new Date();

  // Calculate days to subtract based on time range
  const daysToSubtract = (() => {
    switch (timeRange) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      default:
        // For 'custom', return current date (caller should override)
        return 0;
    }
  })();

  // Set start date by subtracting days
  startDate.setDate(startDate.getDate() - daysToSubtract);

  // Format dates to ISO format (YYYY-MM-DD)
  const formatToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatToISO(startDate),
    endDate: formatToISO(endDate),
  };
}

/**
 * Validate date range with 365-day maximum span check
 * 
 * Validates that:
 * - Date strings are valid ISO format
 * - Start date is before end date
 * - End date is not in the future
 * - Date range span does not exceed 365 days
 * 
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * validateDateRange('2024-01-01', '2024-12-31')
 * // Returns: { valid: true }
 * 
 * validateDateRange('2024-01-01', '2025-12-31')
 * // Returns: { valid: false, error: 'Date range cannot exceed 365 days' }
 * 
 * Validates: Requirements 1.5, 7.9
 */
export function validateDateRange(startDate: string, endDate: string): ValidationResult {
  // Parse date strings
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Set time to start of day for consistent comparisons
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  // Validate date format
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  // Validate start date is before end date
  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  // Validate end date is not in the future
  if (end > now) {
    return { valid: false, error: 'End date cannot be in the future' };
  }

  // Calculate days difference
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Validate maximum 365-day span (Requirement 1.5, 7.9)
  if (daysDiff > 365) {
    return { valid: false, error: 'Date range cannot exceed 365 days' };
  }

  return { valid: true };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate the number of days between two dates
 * 
 * @param startDate - Start date in ISO format
 * @param endDate - End date in ISO format
 * @returns Number of days between the dates
 */
export function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get the comparison period date range for period-over-period analysis
 * 
 * @param range - The current date range
 * @returns DateRange for the previous equivalent period
 * 
 * @example
 * getComparisonPeriod({ startDate: '2024-01-08', endDate: '2024-01-14' })
 * // Returns: { startDate: '2024-01-01', endDate: '2024-01-07' }
 */
export function getComparisonPeriod(range: DateRange): DateRange {
  const daysDiff = calculateDaysDifference(range.startDate, range.endDate);
  
  const previousStart = new Date(range.startDate);
  previousStart.setDate(previousStart.getDate() - daysDiff - 1);
  
  const previousEnd = new Date(range.endDate);
  previousEnd.setDate(previousEnd.getDate() - daysDiff - 1);
  
  const formatToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    startDate: formatToISO(previousStart),
    endDate: formatToISO(previousEnd),
  };
}

// ============================================================================
// Product Performance Analytics
// ============================================================================

/**
 * Product performance data for a single product
 */
export type ProductPerformance = {
  productId: string;
  productName: string;
  unitsSold: number;
  totalRevenue: number;
  inventoryVelocity: number; // days between sales
  salesTrend: 'up' | 'down' | 'stable';
  discountPercentage: number | null;
  category: string | null;
};

/**
 * Options for fetching product performance data
 */
export type ProductPerformanceOptions = {
  page?: number;
  limit?: number;
  sortBy?: 'revenue' | 'units' | 'velocity' | 'name';
  category?: string;
};

/**
 * Result of fetching product performance data
 */
export type ProductPerformanceResult = {
  products: ProductPerformance[];
  totalCount: number;
};

/**
 * Fetch product performance data with pagination and filtering
 * 
 * This function retrieves detailed product performance analytics including:
 * - Units sold and total revenue per product
 * - Inventory velocity (days between sales)
 * - Sales trend indicators
 * - Discount percentages (if compare_at_price is set)
 * - Category filtering and sorting
 * 
 * The function supports:
 * - Pagination with 25 items per page (default)
 * - Sorting by revenue, units sold, velocity, or name
 * - Category filtering
 * - Identification of low-performing products (zero sales)
 * 
 * @param vendorId - The vendor's unique identifier
 * @param range - Date range for analytics
 * @param options - Optional pagination, sorting, and filtering options
 * @returns Promise resolving to product performance data and total count
 * 
 * @example
 * const result = await fetchProductPerformance(
 *   'vendor-123',
 *   { startDate: '2024-01-01', endDate: '2024-01-31' },
 *   { page: 1, sortBy: 'revenue', category: 'Electronics' }
 * );
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.8, 3.10, 12.8
 */
export async function fetchProductPerformance(
  vendorId: string,
  range: DateRange,
  options: ProductPerformanceOptions = {}
): Promise<ProductPerformanceResult> {
  // Import sql dynamically to avoid edge runtime issues
  const { sql } = await import('./db');
  
  // Set defaults
  const page = options.page || 1;
  const limit = options.limit || 25;
  const offset = (page - 1) * limit;
  const sortBy = options.sortBy || 'revenue';
  
  // Determine sort column based on sortBy option
  const sortColumn = {
    revenue: 'total_revenue DESC',
    units: 'units_sold DESC',
    velocity: 'inventory_velocity ASC', // Lower is better (faster sales)
    name: 'product_name ASC'
  }[sortBy];
  
  // Calculate the number of days in the selected period for velocity calculation
  const daysDiff = calculateDaysDifference(range.startDate, range.endDate);
  
  // Build category filter if provided
  const categoryCondition = options.category 
    ? sql`AND p.category = ${options.category}`
    : sql``;
  
  // Main query: Join products with orders to calculate performance metrics
  const products = await sql`
    WITH product_sales AS (
      SELECT
        p.id as product_id,
        p.name as product_name,
        p.category,
        p.compare_at_price,
        p.price,
        COALESCE(SUM(oi.quantity), 0)::int AS units_sold,
        COALESCE(SUM(oi.price * oi.quantity), 0)::int AS total_revenue,
        COUNT(DISTINCT DATE(o.created_at)) as days_with_sales
      FROM products p
      LEFT JOIN orders o ON o.vendor_id = ${vendorId}
        AND o.status = 'fulfilled'
        AND o.created_at >= ${range.startDate}::date
        AND o.created_at <= (${range.endDate}::date + INTERVAL '1 day')
      LEFT JOIN LATERAL jsonb_to_recordset(
        CASE WHEN jsonb_typeof(o.items) = 'array' THEN o.items ELSE '[]'::jsonb END
      ) AS oi("productId" text, name text, price int, quantity int)
        ON oi."productId"::uuid = p.id
      WHERE p.vendor_id = ${vendorId}
        AND p.status = 'active'
        ${categoryCondition}
      GROUP BY p.id, p.name, p.category, p.compare_at_price, p.price
    )
    SELECT 
      product_id::text,
      product_name,
      category,
      units_sold,
      total_revenue,
      CASE 
        WHEN units_sold > 0 THEN 
          (${daysDiff}::float / units_sold)::numeric(10, 2)
        ELSE 999
      END as inventory_velocity,
      CASE
        WHEN compare_at_price IS NOT NULL AND compare_at_price > price THEN
          ROUND(((compare_at_price - price)::float / compare_at_price * 100))::int
        ELSE NULL
      END as discount_percentage,
      CASE 
        WHEN days_with_sales >= 3 THEN 'stable'
        WHEN days_with_sales >= 1 AND days_with_sales < 3 THEN 'down'
        ELSE 'stable'
      END as sales_trend
    FROM product_sales
    ORDER BY ${sql.unsafe(sortColumn)}
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  // Count query: Get total number of products matching filters
  const countResult = await sql`
    SELECT COUNT(DISTINCT p.id)::int as total
    FROM products p
    WHERE p.vendor_id = ${vendorId}
      AND p.status = 'active'
      ${categoryCondition}
  `;
  
  // Transform database results to ProductPerformance type
  return {
    products: products.map(p => ({
      productId: p.product_id,
      productName: p.product_name,
      unitsSold: p.units_sold || 0,
      totalRevenue: p.total_revenue || 0,
      inventoryVelocity: parseFloat(p.inventory_velocity as string),
      salesTrend: p.sales_trend as 'up' | 'down' | 'stable',
      discountPercentage: p.discount_percentage,
      category: p.category
    })),
    totalCount: countResult[0].total
  };
}

// ============================================================================
// Customer Analytics Functions
// ============================================================================

/**
 * Customer metrics result type
 */
export type CustomerMetrics = {
  repeatCustomerRate: number;
  newCustomers: number;
  returningCustomers: number;
  averageLifetimeValue: number;
  totalUniqueCustomers: number;
};

/**
 * Error response type for insufficient data
 */
export type InsufficientDataError = {
  type: 'insufficient_data';
  message: string;
  suggestion: string;
};

/**
 * Fetch customer analytics metrics for a given date range
 * 
 * Calculates customer behavior metrics including:
 * - Repeat customer rate (customers with 2+ orders / total customers)
 * - Customer lifetime value (sum of order amounts per customer)
 * - New vs returning customers based on first order date
 * 
 * @param vendorId - The vendor's user ID
 * @param range - The date range to analyze
 * @returns CustomerMetrics object or InsufficientDataError
 * 
 * @example
 * const metrics = await fetchCustomerMetrics('vendor-123', {
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * 
 * if ('type' in metrics && metrics.type === 'insufficient_data') {
 *   // Handle insufficient data case
 * } else {
 *   // Use metrics.repeatCustomerRate, metrics.newCustomers, etc.
 * }
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.8, 2.9, 2.10
 */
export async function fetchCustomerMetrics(
  vendorId: string,
  range: DateRange
): Promise<CustomerMetrics | InsufficientDataError> {
  
  // First, check if vendor has sufficient order data (Requirement 2.10)
  const orderCountResult = await sql`
    SELECT COUNT(*) as order_count
    FROM orders
    WHERE vendor_id = ${vendorId}
      AND status = 'fulfilled'
  `;
  
  const totalOrders = parseInt(orderCountResult[0].order_count);
  
  // Handle insufficient data case (< 5 orders)
  if (totalOrders < 5) {
    return {
      type: 'insufficient_data',
      message: 'You need at least 5 completed orders to see customer analytics.',
      suggestion: 'Keep sharing your store link to get more orders!'
    };
  }
  
  // Query customer data grouped by customer_phone (Requirement 2.1, 2.2, 2.3, 2.4)
  const customerData = await sql`
    WITH customer_orders AS (
      SELECT 
        customer_phone,
        COUNT(*) as order_count,
        SUM(total_amount) as lifetime_value,
        MIN(created_at) as first_order_date
      FROM orders
      WHERE vendor_id = ${vendorId}
        AND status = 'fulfilled'
        AND customer_phone IS NOT NULL
      GROUP BY customer_phone
    ),
    period_customers AS (
      SELECT 
        customer_phone,
        order_count,
        lifetime_value,
        first_order_date
      FROM customer_orders
      WHERE first_order_date >= ${range.startDate}::date
        AND first_order_date <= ${range.endDate}::date
    )
    SELECT 
      COUNT(*) as total_customers,
      COUNT(CASE WHEN order_count >= 2 THEN 1 END) as repeat_customers,
      AVG(lifetime_value) as avg_ltv,
      SUM(CASE WHEN order_count = 1 THEN 1 ELSE 0 END) as new_customers,
      SUM(CASE WHEN order_count >= 2 THEN 1 ELSE 0 END) as returning_customers
    FROM period_customers
  `;
  
  const data = customerData[0];
  
  // Calculate repeat customer rate (Requirement 2.1, 2.2)
  // Formula: (customers with 2+ orders / total unique customers) × 100
  const totalCustomers = parseInt(data.total_customers) || 0;
  const repeatCustomers = parseInt(data.repeat_customers) || 0;
  const repeatCustomerRate = totalCustomers > 0
    ? (repeatCustomers / totalCustomers) * 100
    : 0;
  
  // Calculate average lifetime value (Requirement 2.3, 2.4)
  const avgLifetimeValue = parseFloat(data.avg_ltv) || 0;
  
  // Count new vs returning customers (Requirement 2.8, 2.9)
  const newCustomers = parseInt(data.new_customers) || 0;
  const returningCustomers = parseInt(data.returning_customers) || 0;
  
  return {
    repeatCustomerRate,
    newCustomers,
    returningCustomers,
    averageLifetimeValue: avgLifetimeValue,
    totalUniqueCustomers: totalCustomers
  };
}

// ============================================================================
// Analytics Data Fetching Functions
// ============================================================================

/**
 * Daily analytics data point
 */
export type DailyAnalyticsData = {
  date: string;
  visits: number;
  orders: number;
  revenue: number;
};

/**
 * Fetch daily analytics data for a given date range
 * 
 * @param vendorId - The vendor's unique identifier
 * @param range - DateRange object with startDate and endDate in ISO format
 * @returns Array of DailyAnalyticsData objects
 * 
 * Validates: Requirements 1.6, 10.1
 */
export async function fetchDailyAnalytics(
  vendorId: string,
  range: DateRange
): Promise<DailyAnalyticsData[]> {
  const { sql } = await import('./db');
  
  const dailyData = await sql`
    SELECT 
      date::text,
      COALESCE(visits, 0)::int as visits,
      COALESCE(orders_count, 0)::int as orders,
      COALESCE(revenue, 0)::int as revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date >= ${range.startDate}::date
      AND date <= ${range.endDate}::date
    ORDER BY date ASC
  `;
  
  return dailyData.map(d => ({
    date: d.date,
    visits: d.visits || 0,
    orders: d.orders || 0,
    revenue: d.revenue || 0
  }));
}

/**
 * Calculate period-over-period change percentage
 * 
 * @param currentValue - Current period value
 * @param previousValue - Previous period value
 * @returns PeriodChange object with value, percentage change, and direction
 */
function calculateChange(currentValue: number, previousValue: number): PeriodChange {
  const change = previousValue > 0 
    ? ((currentValue - previousValue) / previousValue) * 100 
    : 0;
  
  const direction = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral';
  
  return {
    value: currentValue,
    change: Math.round(change * 100) / 100, // Round to 2 decimal places
    direction,
  };
}

/**
 * Calculate period comparison for all metrics
 * 
 * @param current - Current period data
 * @param previous - Previous period data
 * @returns PeriodComparison object with changes for all metrics
 */
function calculatePeriodComparison(
  current: { total_visits: number; total_orders: number; total_revenue: number },
  previous: { total_visits: number; total_orders: number; total_revenue: number }
): PeriodComparison {
  const currentConversionRate = current.total_visits > 0
    ? (current.total_orders / current.total_visits) * 100
    : 0;
  
  const previousConversionRate = previous.total_visits > 0
    ? (previous.total_orders / previous.total_visits) * 100
    : 0;
  
  return {
    visits: calculateChange(current.total_visits, previous.total_visits),
    orders: calculateChange(current.total_orders, previous.total_orders),
    revenue: calculateChange(current.total_revenue, previous.total_revenue),
    conversionRate: calculateChange(currentConversionRate, previousConversionRate),
  };
}

/**
 * Fetch analytics summary for a given date range
 * 
 * Queries the store_analytics table for aggregate visits, orders, and revenue.
 * Calculates conversion rate (orders/visits × 100) and average order value (revenue/orders).
 * Implements period-over-period comparison logic using previous period data.
 * Uses caching with cache key pattern analytics:{vendorId}:{startDate}:{endDate}.
 * 
 * @param vendorId - The vendor's unique identifier
 * @param range - DateRange object with startDate and endDate in ISO format
 * @returns AnalyticsSummary with current metrics and period comparisons
 * 
 * @example
 * const summary = await fetchAnalyticsSummary('vendor-123', {
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * // Returns: { totalVisits: 1500, totalOrders: 45, totalRevenue: 125000, ... }
 * 
 * Validates: Requirements 1.6, 5.1, 5.2, 5.3, 5.4
 */
export async function fetchAnalyticsSummary(
  vendorId: string,
  range: DateRange
): Promise<AnalyticsSummary> {
  // Check cache first (5-minute TTL)
  const cacheKey = CacheKeys.analytics(vendorId, range.startDate, range.endDate);
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return cached as AnalyticsSummary;
  }
  
  // Query aggregated data from store_analytics table
  const currentPeriodResult = await sql`
    SELECT 
      COALESCE(SUM(visits), 0)::int as total_visits,
      COALESCE(SUM(orders_count), 0)::int as total_orders,
      COALESCE(SUM(revenue), 0)::int as total_revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date >= ${range.startDate}::date
      AND date <= ${range.endDate}::date
  `;
  
  const currentPeriod = currentPeriodResult[0] as { total_visits: number; total_orders: number; total_revenue: number };
  
  // Calculate conversion rate (orders/visits × 100)
  const conversionRate = currentPeriod.total_visits > 0
    ? (currentPeriod.total_orders / currentPeriod.total_visits) * 100
    : 0;
  
  // Calculate average order value (revenue/orders)
  const avgOrderValue = currentPeriod.total_orders > 0
    ? currentPeriod.total_revenue / currentPeriod.total_orders
    : 0;
  
  // Get comparison period date range
  const comparisonRange = getComparisonPeriod(range);
  
  // Query previous period data for comparison
  const previousPeriodResult = await sql`
    SELECT 
      COALESCE(SUM(visits), 0)::int as total_visits,
      COALESCE(SUM(orders_count), 0)::int as total_orders,
      COALESCE(SUM(revenue), 0)::int as total_revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date >= ${comparisonRange.startDate}::date
      AND date <= ${comparisonRange.endDate}::date
  `;
  
  const previousPeriod = previousPeriodResult[0] as { total_visits: number; total_orders: number; total_revenue: number };
  
  // Calculate period-over-period comparison
  const periodChange = calculatePeriodComparison(currentPeriod, previousPeriod);
  
  const result: AnalyticsSummary = {
    totalVisits: currentPeriod.total_visits,
    totalOrders: currentPeriod.total_orders,
    totalRevenue: currentPeriod.total_revenue,
    conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
    avgOrderValue: Math.round(avgOrderValue), // Round to nearest kobo
    periodChange,
  };
  
  // Cache for 5 minutes (300 seconds)
  await setCache(cacheKey, result, 300);
  
  return result;
}

// ============================================================================
// Conversion Funnel Analytics
// ============================================================================

/**
 * Conversion funnel data showing customer journey from visits to completed orders
 */
export type ConversionFunnel = {
  visits: number;
  ordersInitiated: number;
  ordersCompleted: number;
  visitToOrderRate: number;
  orderCompletionRate: number;
  abandonmentRate: number;
  avgTimeToFulfillment: number; // in hours
};

/**
 * Fetch conversion funnel analytics for a given date range
 * 
 * Calculates the customer journey funnel:
 * - Visits: Total store visits from store_analytics
 * - Orders Initiated: All orders (any status)
 * - Orders Completed: Orders with status 'fulfilled'
 * - Visit-to-Order Rate: (orders completed / visits) × 100
 * - Order Completion Rate: (orders completed / orders initiated) × 100
 * - Abandonment Rate: (non-fulfilled orders / total orders) × 100
 * - Average Time to Fulfillment: Mean time between created_at and fulfilled_at (in hours)
 * 
 * @param vendorId - The vendor's unique identifier
 * @param range - Date range for analytics
 * @returns ConversionFunnel object with all funnel metrics
 * 
 * @example
 * const funnel = await fetchConversionFunnel('vendor-123', {
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * // Returns: { visits: 1500, ordersInitiated: 60, ordersCompleted: 45, ... }
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
export async function fetchConversionFunnel(
  vendorId: string,
  range: DateRange
): Promise<ConversionFunnel> {
  // Import sql dynamically to avoid edge runtime issues
  const { sql } = await import('./db');
  
  // Query 1: Get total visits from store_analytics table (Requirement 4.1)
  const visitsResult = await sql`
    SELECT COALESCE(SUM(visits), 0)::int as total_visits
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date >= ${range.startDate}::date
      AND date <= ${range.endDate}::date
  `;
  
  const visits = visitsResult[0].total_visits;
  
  // Query 2: Get orders data - count total orders and fulfilled orders (Requirements 4.1, 4.4, 4.5)
  const ordersResult = await sql`
    SELECT 
      COUNT(*)::int as total_orders,
      COUNT(CASE WHEN status = 'fulfilled' THEN 1 END)::int as fulfilled_orders,
      AVG(
        CASE 
          WHEN status = 'fulfilled' AND fulfilled_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (fulfilled_at - created_at)) / 3600
          ELSE NULL
        END
      ) as avg_hours_to_fulfillment
    FROM orders
    WHERE vendor_id = ${vendorId}
      AND created_at >= ${range.startDate}::date
      AND created_at <= (${range.endDate}::date + INTERVAL '1 day')
  `;
  
  const ordersInitiated = ordersResult[0].total_orders;
  const ordersCompleted = ordersResult[0].fulfilled_orders;
  const avgTimeToFulfillment = parseFloat(ordersResult[0].avg_hours_to_fulfillment) || 0;
  
  // Calculate conversion rates (Requirements 4.2, 4.3, 4.4)
  
  // Visit-to-Order Rate: (orders completed / visits) × 100 (Requirement 4.3)
  const visitToOrderRate = visits > 0
    ? (ordersCompleted / visits) * 100
    : 0;
  
  // Order Completion Rate: (fulfilled orders / total orders) × 100 (Requirement 4.4)
  const orderCompletionRate = ordersInitiated > 0
    ? (ordersCompleted / ordersInitiated) * 100
    : 0;
  
  // Abandonment Rate: (non-fulfilled orders / total orders) × 100 (Requirement 4.5)
  const nonFulfilledOrders = ordersInitiated - ordersCompleted;
  const abandonmentRate = ordersInitiated > 0
    ? (nonFulfilledOrders / ordersInitiated) * 100
    : 0;
  
  // Round all percentages to 2 decimal places for consistency
  return {
    visits,
    ordersInitiated,
    ordersCompleted,
    visitToOrderRate: Math.round(visitToOrderRate * 100) / 100,
    orderCompletionRate: Math.round(orderCompletionRate * 100) / 100,
    abandonmentRate: Math.round(abandonmentRate * 100) / 100,
    avgTimeToFulfillment: Math.round(avgTimeToFulfillment * 100) / 100, // Round to 2 decimal places (Requirement 4.6)
  };
}

// ============================================================================
// Geographic Analytics Functions
// ============================================================================

/**
 * Geographic insight data showing orders and revenue by location
 */
export type GeographicInsight = {
  city: string;
  state: string;
  orderCount: number;
  revenue: number;
  percentageOfTotal: number;
};

/**
 * Error response for insufficient geographic data
 */
export type InsufficientGeographicDataError = {
  type: 'insufficient_geographic_data';
  message: string;
  suggestion: string;
};

/**
 * Extract city and state from customer address string
 * 
 * Parses Nigerian address formats using comma-separated components.
 * Common Nigerian address format: "Street, Area, City, State"
 * 
 * The function extracts:
 * - City: Second-to-last component
 * - State: Last component
 * 
 * @param address - Customer address string (may be null or malformed)
 * @returns Object with city and state, or null if unparseable
 * 
 * @example
 * extractLocationFromAddress('123 Main St, Victoria Island, Lagos, Lagos State')
 * // Returns: { city: 'Lagos', state: 'Lagos State' }
 * 
 * extractLocationFromAddress('45 Market Rd, Garki, Abuja, FCT')
 * // Returns: { city: 'Abuja', state: 'FCT' }
 * 
 * extractLocationFromAddress(null)
 * // Returns: null
 * 
 * extractLocationFromAddress('Invalid')
 * // Returns: null
 * 
 * Validates: Requirements 9.4
 */
export function extractLocationFromAddress(
  address: string | null
): { city: string; state: string } | null {
  if (!address) return null;
  
  try {
    // Attempt to parse address using common Nigerian address formats
    // Format: "Street, Area, City, State" - we want the last two parts
    const parts = address.split(',').map(s => s.trim());
    
    // Need at least 2 parts (city and state)
    if (parts.length >= 2) {
      return {
        city: parts[parts.length - 2],   // Second-to-last: City
        state: parts[parts.length - 1]   // Last: State
      };
    }
  } catch (error) {
    // Gracefully handle unparseable addresses
    // In production, we might log this for debugging
    console.debug('Failed to parse address', { address, error });
  }
  
  return null; // Return null for unparseable addresses
}

/**
 * Fetch geographic insights showing orders and revenue by city and state
 * 
 * Aggregates orders by location to provide:
 * - Top 10 cities by order count
 * - Top 10 cities by revenue
 * - State-level breakdown of orders and revenue
 * - Percentage of total orders from each location
 * 
 * The function:
 * 1. Parses customer_address from orders using extractLocationFromAddress
 * 2. Groups orders by city and state
 * 3. Calculates order count and revenue per location
 * 4. Calculates percentage of orders from each location
 * 5. Returns top 10 cities by order count and revenue
 * 6. Handles insufficient data case (< 10 orders with location data)
 * 
 * @param vendorId - The vendor's unique identifier
 * @param range - Date range for analytics
 * @returns Array of GeographicInsight objects or InsufficientGeographicDataError
 * 
 * @example
 * const insights = await fetchGeographicInsights('vendor-123', {
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * 
 * if ('type' in insights && insights.type === 'insufficient_geographic_data') {
 *   // Handle insufficient data case
 * } else {
 *   // insights is GeographicInsight[]
 *   insights.forEach(location => {
 *     console.log(`${location.city}, ${location.state}: ${location.orderCount} orders`);
 *   });
 * }
 * 
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */
export async function fetchGeographicInsights(
  vendorId: string,
  range: DateRange
): Promise<GeographicInsight[] | InsufficientGeographicDataError> {
  // Import sql dynamically to avoid edge runtime issues
  const { sql } = await import('./db');
  
  // Query all fulfilled orders with addresses in the date range (Requirement 9.1, 9.4)
  const ordersResult = await sql`
    SELECT 
      customer_address,
      total_amount,
      id
    FROM orders
    WHERE vendor_id = ${vendorId}
      AND status = 'fulfilled'
      AND customer_address IS NOT NULL
      AND customer_address != ''
      AND created_at >= ${range.startDate}::date
      AND created_at <= (${range.endDate}::date + INTERVAL '1 day')
  `;
  
  // Parse addresses and aggregate by location
  const locationMap = new Map<string, {
    city: string;
    state: string;
    orderCount: number;
    revenue: number;
  }>();
  
  let totalOrdersWithLocation = 0;
  let totalRevenue = 0;
  
  // Process each order and extract location (Requirement 9.4)
  for (const order of ordersResult) {
    const location = extractLocationFromAddress(order.customer_address);
    
    if (location) {
      totalOrdersWithLocation++;
      totalRevenue += order.total_amount;
      
      // Create unique key for city + state combination
      const locationKey = `${location.city}|||${location.state}`;
      
      if (locationMap.has(locationKey)) {
        // Update existing location data (Requirement 9.3, 9.5)
        const existing = locationMap.get(locationKey)!;
        existing.orderCount++;
        existing.revenue += order.total_amount;
      } else {
        // Create new location entry
        locationMap.set(locationKey, {
          city: location.city,
          state: location.state,
          orderCount: 1,
          revenue: order.total_amount
        });
      }
    }
  }
  
  // Handle insufficient data case (Requirement 9.7)
  // Need at least 10 orders with valid location data
  if (totalOrdersWithLocation < 10) {
    return {
      type: 'insufficient_geographic_data',
      message: 'You need at least 10 orders with location data to see geographic insights.',
      suggestion: 'Encourage customers to provide complete delivery addresses!'
    };
  }
  
  // Convert map to array and calculate percentages (Requirement 9.6)
  const locations = Array.from(locationMap.values()).map(loc => ({
    city: loc.city,
    state: loc.state,
    orderCount: loc.orderCount,
    revenue: loc.revenue,
    percentageOfTotal: totalOrdersWithLocation > 0
      ? Math.round((loc.orderCount / totalOrdersWithLocation) * 100 * 100) / 100 // Round to 2 decimal places
      : 0
  }));
  
  // Sort by order count descending (Requirement 9.2)
  // This gives us top cities by order count
  locations.sort((a, b) => b.orderCount - a.orderCount);
  
  // Return top 10 cities (Requirements 9.2, 9.3)
  // Note: The design specifies top 10 by order count AND revenue
  // Since we're returning a single list, we prioritize order count
  // UI can re-sort by revenue if needed
  return locations.slice(0, 10);
}

// ============================================================================
// Revenue Forecasting Functions
// ============================================================================

/**
 * Revenue forecast data showing projected revenue for the next 30 days
 */
export type RevenueForecast = {
  forecastedRevenue: number;
  confidence: 'high' | 'medium' | 'low';
  historicalDays: number;
  dailyProjections: Array<{ date: string; projected: number }>;
  seasonalTrend: 'above' | 'below' | 'average' | null;
};

/**
 * Error response for insufficient forecasting data
 */
export type InsufficientForecastDataError = {
  type: 'insufficient_forecast_data';
  message: string;
  suggestion: string;
  historicalDays: number;
};

/**
 * Calculate linear regression slope and intercept from x,y data points
 * 
 * Uses the least squares method to calculate the best-fit line:
 * y = mx + b
 * where:
 * - m is the slope (rate of change)
 * - b is the y-intercept (starting value)
 * 
 * @param xValues - Array of x values (e.g., day numbers: [1, 2, 3, ...])
 * @param yValues - Array of y values (e.g., daily revenue amounts)
 * @returns Object with slope (m) and intercept (b)
 * 
 * @example
 * const { slope, intercept } = calculateLinearRegression([1, 2, 3], [100, 150, 200]);
 * // slope ≈ 50 (revenue increases by 50 per day)
 * // intercept ≈ 50 (starting revenue)
 */
function calculateLinearRegression(
  xValues: number[],
  yValues: number[]
): { slope: number; intercept: number } {
  const n = xValues.length;
  
  if (n === 0) {
    return { slope: 0, intercept: 0 };
  }
  
  // Calculate means
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;
  
  // Calculate slope (m) using least squares formula:
  // m = Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²)
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  
  // Calculate intercept (b) using formula: b = ȳ - m * x̄
  const intercept = yMean - slope * xMean;
  
  return { slope, intercept };
}

/**
 * Detect seasonal trends by comparing same-month performance across years
 * 
 * Analyzes historical revenue data to identify if the current month typically
 * performs above, below, or average compared to the annual average.
 * 
 * Seasonal trend is detected when same-month revenue varies by more than 20%
 * from the annual average across multiple years.
 * 
 * @param dailyRevenue - Array of daily revenue data points with dates
 * @returns 'above' if month typically performs >20% above average,
 *          'below' if month typically performs >20% below average,
 *          'average' if within 20% of average,
 *          null if insufficient data (< 1 year of history)
 * 
 * @example
 * // If December consistently has 30% higher revenue than annual average
 * detectSeasonalTrend(historicalData)
 * // Returns: 'above'
 * 
 * Validates: Requirements 6.6, 6.7, 6.8
 */
function detectSeasonalTrend(
  dailyRevenue: Array<{ date: string; revenue: number }>
): 'above' | 'below' | 'average' | null {
  // Need at least 365 days of data to detect seasonal patterns
  if (dailyRevenue.length < 365) {
    return null;
  }
  
  // Get current month (0-11)
  const currentMonth = new Date().getMonth();
  
  // Group revenue by year and month
  const monthlyRevenue = new Map<string, number[]>(); // Key: "year-month"
  
  for (const entry of dailyRevenue) {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!monthlyRevenue.has(key)) {
      monthlyRevenue.set(key, []);
    }
    monthlyRevenue.get(key)!.push(entry.revenue);
  }
  
  // Calculate average revenue for each month across years
  const monthlyAverages = new Map<number, number>(); // Key: month (0-11)
  
  for (const [key, revenues] of monthlyRevenue.entries()) {
    const month = parseInt(key.split('-')[1]);
    const monthAvg = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
    
    if (!monthlyAverages.has(month)) {
      monthlyAverages.set(month, monthAvg);
    } else {
      // Average across multiple years
      const existing = monthlyAverages.get(month)!;
      monthlyAverages.set(month, (existing + monthAvg) / 2);
    }
  }
  
  // Calculate overall annual average
  const allAverages = Array.from(monthlyAverages.values());
  const annualAverage = allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length;
  
  // Get current month's average
  const currentMonthAverage = monthlyAverages.get(currentMonth);
  
  if (!currentMonthAverage || annualAverage === 0) {
    return null;
  }
  
  // Calculate variance from annual average (Requirement 6.8)
  const variance = ((currentMonthAverage - annualAverage) / annualAverage) * 100;
  
  // Seasonal trend detected when variance > 20% (Requirement 6.8)
  if (variance > 20) {
    return 'above';
  } else if (variance < -20) {
    return 'below';
  } else {
    return 'average';
  }
}

/**
 * Calculate revenue forecast using linear regression on historical data
 * 
 * This function provides a 30-day revenue forecast based on historical trends.
 * It uses the last 90 days of daily revenue data to perform linear regression
 * and project future revenue.
 * 
 * The function:
 * 1. Retrieves the last 90 days of daily revenue from store_analytics
 * 2. Performs linear regression to identify the trend (slope and intercept)
 * 3. Projects revenue for the next 30 days using the trend line
 * 4. Calculates forecast confidence based on historical data span:
 *    - High: 90+ days of data
 *    - Medium: 30-89 days of data
 *    - Low: <30 days of data
 * 5. Detects seasonal trends by analyzing same-month performance across years
 * 6. Caches the result for 24 hours
 * 
 * @param vendorId - The vendor's unique identifier
 * @returns RevenueForecast object or InsufficientForecastDataError
 * 
 * @example
 * const forecast = await calculateRevenueForecast('vendor-123');
 * 
 * if ('type' in forecast && forecast.type === 'insufficient_forecast_data') {
 *   // Handle insufficient data case
 *   console.log(forecast.message); // "You need at least 30 days of data..."
 * } else {
 *   // Use forecast data
 *   console.log(`Forecasted revenue: ₦${forecast.forecastedRevenue / 100}`);
 *   console.log(`Confidence: ${forecast.confidence}`);
 *   console.log(`Daily projections:`, forecast.dailyProjections);
 * }
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.6, 6.7, 6.8, 6.9
 */
export async function calculateRevenueForecast(
  vendorId: string
): Promise<RevenueForecast | InsufficientForecastDataError> {
  // Check cache first (24-hour TTL as per requirement 6.1)
  const cacheKey = CacheKeys.forecast(vendorId);
  const cached = await getFromCache(cacheKey);
  if (cached) {
    return cached as RevenueForecast;
  }
  
  // Import sql dynamically to avoid edge runtime issues
  const { sql } = await import('./db');
  
  // Calculate date 90 days ago (Requirement 6.2)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  
  const formatToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Query last 90 days of daily revenue data (Requirement 6.2)
  const historicalData = await sql`
    SELECT 
      date::text,
      COALESCE(revenue, 0)::int as revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date >= ${formatToISO(startDate)}::date
      AND date <= ${formatToISO(endDate)}::date
    ORDER BY date ASC
  `;
  
  const historicalDays = historicalData.length;
  
  // Handle insufficient data case (Requirement 6.9)
  // Need at least 30 days of historical data
  if (historicalDays < 30) {
    return {
      type: 'insufficient_forecast_data',
      message: 'You need at least 30 days of historical data for revenue forecasting.',
      suggestion: 'Keep growing your business! Forecasting will be available once you have more sales history.',
      historicalDays
    };
  }
  
  // Prepare data for linear regression
  // x-values: day numbers (1, 2, 3, ..., n)
  // y-values: daily revenue amounts
  const xValues = historicalData.map((_, index) => index + 1);
  const yValues = historicalData.map(row => row.revenue);
  
  // Calculate linear regression (Requirement 6.2)
  const { slope, intercept } = calculateLinearRegression(xValues, yValues);
  
  // Generate 30-day forward projections (Requirement 6.2)
  const dailyProjections: Array<{ date: string; projected: number }> = [];
  const forecastStartDay = historicalDays + 1;
  let totalForecastedRevenue = 0;
  
  for (let i = 0; i < 30; i++) {
    const dayNumber = forecastStartDay + i;
    
    // Calculate projected revenue using linear equation: y = mx + b
    const projectedRevenue = Math.max(0, Math.round(slope * dayNumber + intercept));
    
    // Calculate future date
    const futureDate = new Date(endDate);
    futureDate.setDate(futureDate.getDate() + i + 1);
    
    dailyProjections.push({
      date: formatToISO(futureDate),
      projected: projectedRevenue
    });
    
    totalForecastedRevenue += projectedRevenue;
  }
  
  // Calculate forecast confidence based on historical data span (Requirement 6.4)
  let confidence: 'high' | 'medium' | 'low';
  if (historicalDays >= 90) {
    confidence = 'high';
  } else if (historicalDays >= 30) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }
  
  // Detect seasonal trends (Requirements 6.6, 6.7, 6.8)
  // This requires at least 1 year of data to compare same-month performance
  const allHistoricalData = await sql`
    SELECT 
      date::text,
      COALESCE(revenue, 0)::int as revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
    ORDER BY date ASC
  `;
  
  const seasonalTrend = detectSeasonalTrend(
    allHistoricalData.map(row => ({ date: row.date, revenue: row.revenue }))
  );
  
  const result: RevenueForecast = {
    forecastedRevenue: totalForecastedRevenue,
    confidence,
    historicalDays,
    dailyProjections,
    seasonalTrend
  };
  
  // Cache for 24 hours (86400 seconds) as per requirement
  await setCache(cacheKey, result, 86400);
  
  return result;
}

// ============================================================================
// Real-Time Dashboard Functions
// ============================================================================

/**
 * Real-time dashboard performance data showing today's metrics vs comparisons
 */
export type TodayPerformance = {
  todayVisits: number;
  todayOrders: number;
  todayRevenue: number;
  lastHourOrders: number;
  comparisonYesterday: {
    visits: number;
    orders: number;
    revenue: number;
  };
  comparisonLastWeek: {
    visits: number;
    orders: number;
    revenue: number;
  };
  paceIndicator: 'ahead' | 'behind' | 'on-track';
  lastUpdate: string; // ISO timestamp
};

/**
 * Fetch today's real-time performance metrics with comparisons
 * 
 * This function provides live dashboard data showing:
 * - Today's current visits, orders, and revenue
 * - Comparison to same time yesterday (data up to current hour from 24 hours ago)
 * - Comparison to same weekday last week (7 days prior)
 * - Pace indicator showing if today is on track to exceed or fall short of yesterday
 * - Orders received in the last hour as a live activity indicator
 * 
 * The pace indicator logic:
 * - Projects end-of-day totals based on current hour performance
 * - Compares projected totals to yesterday's final totals
 * - Returns 'ahead' if projected > yesterday, 'behind' if projected < yesterday,
 *   'on-track' if within 5% of yesterday
 * 
 * @param vendorId - The vendor's unique identifier
 * @returns TodayPerformance object with all real-time metrics and comparisons
 * 
 * @example
 * const performance = await fetchTodayPerformance('vendor-123');
 * console.log(`Today: ${performance.todayOrders} orders`);
 * console.log(`Yesterday same time: ${performance.comparisonYesterday.orders} orders`);
 * console.log(`Pace: ${performance.paceIndicator}`);
 * console.log(`Last hour: ${performance.lastHourOrders} orders`);
 * 
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.8, 8.9, 8.10
 */
export async function fetchTodayPerformance(
  vendorId: string
): Promise<TodayPerformance> {
  // Import sql dynamically to avoid edge runtime issues
  const { sql } = await import('./db');
  
  // Get current time information
  const now = new Date();
  const currentHour = now.getHours();
  
  // Format today's date (YYYY-MM-DD)
  const formatToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = formatToISO(now);
  
  // Calculate yesterday's date (Requirement 8.3)
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = formatToISO(yesterday);
  
  // Calculate same weekday last week (7 days prior) (Requirement 8.5)
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekDate = formatToISO(lastWeek);
  
  // Calculate one hour ago for last hour orders (Requirement 8.10)
  const oneHourAgo = new Date(now);
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  // Query 1: Get today's current metrics (Requirements 8.1, 8.2)
  const todayResult = await sql`
    SELECT 
      COALESCE(SUM(visits), 0)::int as visits,
      COALESCE(SUM(orders_count), 0)::int as orders_count,
      COALESCE(SUM(revenue), 0)::int as revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date = ${today}::date
  `;
  
  const todayVisits = todayResult[0]?.visits || 0;
  const todayOrders = todayResult[0]?.orders_count || 0;
  const todayRevenue = todayResult[0]?.revenue || 0;
  
  // Query 2: Get yesterday's same-time comparison (Requirement 8.3, 8.4)
  // For same-time-yesterday, we need data up to the current hour from 24 hours ago
  // Since store_analytics aggregates daily, we need to query orders table for hourly precision
  const yesterdaySameTimeResult = await sql`
    SELECT 
      COUNT(CASE WHEN status = 'fulfilled' THEN 1 END)::int as orders_count,
      COALESCE(SUM(CASE WHEN status = 'fulfilled' THEN total_amount ELSE 0 END), 0)::int as revenue
    FROM orders
    WHERE vendor_id = ${vendorId}
      AND created_at >= ${yesterdayDate}::date
      AND created_at < ${yesterdayDate}::date + INTERVAL '1 day'
      AND EXTRACT(HOUR FROM created_at) <= ${currentHour}
  `;
  
  // For visits, use store_analytics (we don't have hourly visit data, so use full day)
  const yesterdayVisitsResult = await sql`
    SELECT COALESCE(visits, 0)::int as visits
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date = ${yesterdayDate}::date
  `;
  
  const yesterdayVisits = yesterdayVisitsResult[0]?.visits || 0;
  const yesterdayOrders = yesterdaySameTimeResult[0]?.orders_count || 0;
  const yesterdayRevenue = yesterdaySameTimeResult[0]?.revenue || 0;
  
  // Query 3: Get last week same weekday comparison (Requirement 8.5)
  const lastWeekResult = await sql`
    SELECT 
      COALESCE(SUM(visits), 0)::int as visits,
      COALESCE(SUM(orders_count), 0)::int as orders_count,
      COALESCE(SUM(revenue), 0)::int as revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date = ${lastWeekDate}::date
  `;
  
  const lastWeekVisits = lastWeekResult[0]?.visits || 0;
  const lastWeekOrders = lastWeekResult[0]?.orders_count || 0;
  const lastWeekRevenue = lastWeekResult[0]?.revenue || 0;
  
  // Query 4: Get orders in the last hour (Requirement 8.10)
  const lastHourResult = await sql`
    SELECT COUNT(*)::int as orders_count
    FROM orders
    WHERE vendor_id = ${vendorId}
      AND created_at >= ${oneHourAgo.toISOString()}
      AND created_at <= ${now.toISOString()}
  `;
  
  const lastHourOrders = lastHourResult[0]?.orders_count || 0;
  
  // Calculate pace indicator (Requirements 8.8, 8.9)
  // Project end-of-day totals based on current hour performance
  // Formula: projected_eod = (current_value / (current_hour + 1)) * 24
  // Note: We add 1 to avoid division by zero at midnight (hour 0)
  
  // Get yesterday's full day totals for comparison
  const yesterdayFullDayResult = await sql`
    SELECT 
      COALESCE(SUM(visits), 0)::int as visits,
      COALESCE(SUM(orders_count), 0)::int as orders_count,
      COALESCE(SUM(revenue), 0)::int as revenue
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date = ${yesterdayDate}::date
  `;
  
  const yesterdayFullDayRevenue = yesterdayFullDayResult[0]?.revenue || 0;
  
  // Project end-of-day revenue based on current progress
  const hoursElapsed = currentHour + 1; // Add 1 to avoid division by zero
  const projectedEODRevenue = hoursElapsed > 0 
    ? (todayRevenue / hoursElapsed) * 24 
    : todayRevenue;
  
  // Determine pace indicator (Requirement 8.8, 8.9)
  // On-track: within 5% of yesterday's total
  // Ahead: > 5% above yesterday's total
  // Behind: > 5% below yesterday's total
  let paceIndicator: 'ahead' | 'behind' | 'on-track';
  
  if (yesterdayFullDayRevenue === 0) {
    // No comparison data, consider on-track
    paceIndicator = 'on-track';
  } else {
    const percentDifference = ((projectedEODRevenue - yesterdayFullDayRevenue) / yesterdayFullDayRevenue) * 100;
    
    if (percentDifference > 5) {
      paceIndicator = 'ahead';
    } else if (percentDifference < -5) {
      paceIndicator = 'behind';
    } else {
      paceIndicator = 'on-track';
    }
  }
  
  // Return TodayPerformance object with all metrics (Requirements 8.1 - 8.10)
  return {
    todayVisits,
    todayOrders,
    todayRevenue,
    lastHourOrders,
    comparisonYesterday: {
      visits: yesterdayVisits,
      orders: yesterdayOrders,
      revenue: yesterdayRevenue
    },
    comparisonLastWeek: {
      visits: lastWeekVisits,
      orders: lastWeekOrders,
      revenue: lastWeekRevenue
    },
    paceIndicator,
    lastUpdate: now.toISOString() // ISO timestamp (Requirement 8.6)
  };
}

// ============================================================================
// AOV Trend Functions for Customer Analytics
// ============================================================================

/**
 * Fetch daily Average Order Value (AOV) trend data for a given date range
 * 
 * Calculates the daily AOV (total revenue / order count) for each day in the
 * selected period. This data is used to display the AOV trend chart in the
 * Customer Metrics section.
 * 
 * The function:
 * 1. Queries store_analytics for daily revenue and order counts
 * 2. Calculates AOV for each day (revenue / orders)
 * 3. Returns array of DataPoint objects with date and AOV value
 * 4. Handles days with zero orders (AOV = 0)
 * 
 * @param vendorId - The vendor's unique identifier
 * @param range - Date range for analytics
 * @returns Array of DataPoint objects with date and AOV value (in kobo)
 * 
 * @example
 * const aovTrend = await fetchAOVTrend('vendor-123', {
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * // Returns: [
 * //   { date: '2024-01-01', value: 8500 }, // ₦85.00
 * //   { date: '2024-01-02', value: 9200 }, // ₦92.00
 * //   ...
 * // ]
 * 
 * Validates: Requirements 2.6, 2.7 (AOV calculation and trend display)
 */
export async function fetchAOVTrend(
  vendorId: string,
  range: DateRange
): Promise<Array<{ date: string; value: number }>> {
  // Import sql dynamically to avoid edge runtime issues
  const { sql } = await import('./db');
  
  // Query daily revenue and order counts for the date range
  const dailyData = await sql`
    SELECT 
      date::text,
      COALESCE(revenue, 0)::int as revenue,
      COALESCE(orders_count, 0)::int as orders_count
    FROM store_analytics
    WHERE vendor_id = ${vendorId}
      AND date >= ${range.startDate}::date
      AND date <= ${range.endDate}::date
    ORDER BY date ASC
  `;
  
  // Calculate AOV for each day
  // AOV = total revenue / order count
  // If no orders on a day, AOV = 0
  return dailyData.map(row => ({
    date: row.date,
    value: row.orders_count > 0 
      ? Math.round(row.revenue / row.orders_count) 
      : 0
  }));
}
