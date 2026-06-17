/**
 * Shared types for Business Analytics
 */

// Time range selector options
export type TimeRange = '7d' | '30d' | '90d' | 'custom';

// Date range with start and end dates in ISO format
export type DateRange = {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
};

// Validation result for date range operations
export type ValidationResult = {
  valid: boolean;
  error?: string;
};

// Period comparison data showing changes from previous period
export type PeriodChange = {
  value: number;
  change: number; // Percentage change
  direction: 'up' | 'down' | 'neutral';
};

// Period-over-period comparison for all key metrics
export type PeriodComparison = {
  visits: PeriodChange;
  orders: PeriodChange;
  revenue: PeriodChange;
  conversionRate: PeriodChange;
};

// Analytics summary for a given date range
export type AnalyticsSummary = {
  totalVisits: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
  periodChange: PeriodComparison;
};

// Customer metrics
export interface CustomerMetrics {
  newCustomers: number;
  returningCustomers: number;
  repeatCustomerRate: number;
  averageLifetimeValue: number;
  totalUniqueCustomers: number;
}


// Product performance data
export interface ProductPerformance {
  productId: string;
  productName: string;
  category?: string;
  unitsSold: number;
  totalRevenue: number;
  inventoryVelocity: number;
  salesTrend: 'up' | 'down' | 'stable';
  discountPercentage?: number;
}


// Conversion funnel data
export interface ConversionFunnel {
  visits: number;
  ordersInitiated: number;
  ordersCompleted: number;
  visitToOrderRate: number;
  orderCompletionRate: number;
  abandonmentRate: number;
  avgTimeToFulfillment: number;
}

// Geographic insight
export interface GeographicInsight {
  state: string;
  city: string;
  orderCount: number;
  revenue: number;
  percentageOfTotal: number;
}


// Revenue forecast types
export interface RevenueForecast {
  forecastedRevenue: number;
  confidence: 'high' | 'medium' | 'low';
  historicalDays: number;
  seasonalTrend: 'above' | 'below' | 'average' | null;
  dailyProjections: Array<{
    date: string;
    projected: number;
  }>;
}

export interface InsufficientForecastDataError {
  type: 'insufficient_forecast_data';
  message: string;
  suggestion: string;
  historicalDays: number;
}

// Daily analytics data
export interface DailyAnalytics {
  date: string;
  visits: number;
  orders: number;
  revenue: number;
}
