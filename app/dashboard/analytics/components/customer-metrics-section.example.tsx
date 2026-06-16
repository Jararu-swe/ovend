import CustomerMetricsSection from './customer-metrics-section';
import type { CustomerMetrics } from '@/app/lib/business-analytics';

/**
 * Example usage of CustomerMetricsSection component
 * 
 * This file demonstrates the different states and configurations
 * of the CustomerMetricsSection component.
 */

// Example 1: High-performing store with good retention
const highPerformingMetrics: CustomerMetrics = {
  repeatCustomerRate: 42.3,
  newCustomers: 185,
  returningCustomers: 135,
  averageLifetimeValue: 28500, // ₦285.00
  totalUniqueCustomers: 320,
};

const aovTrendDataUpward = [
  { date: 'Jan 1', value: 8000 },
  { date: 'Jan 2', value: 8500 },
  { date: 'Jan 3', value: 9200 },
  { date: 'Jan 4', value: 9800 },
  { date: 'Jan 5', value: 10500 },
  { date: 'Jan 6', value: 11000 },
  { date: 'Jan 7', value: 11800 },
];

export function HighPerformingExample() {
  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">High-Performing Store Example</h2>
      <CustomerMetricsSection
        metrics={highPerformingMetrics}
        aovTrendData={aovTrendDataUpward}
      />
    </div>
  );
}

// Example 2: Growing store with decent retention
const growingStoreMetrics: CustomerMetrics = {
  repeatCustomerRate: 22.5,
  newCustomers: 210,
  returningCustomers: 60,
  averageLifetimeValue: 12000, // ₦120.00
  totalUniqueCustomers: 270,
};

const aovTrendDataVolatile = [
  { date: 'Jan 1', value: 9000 },
  { date: 'Jan 2', value: 11000 },
  { date: 'Jan 3', value: 8500 },
  { date: 'Jan 4', value: 13000 },
  { date: 'Jan 5', value: 10000 },
  { date: 'Jan 6', value: 12500 },
  { date: 'Jan 7', value: 11500 },
];

export function GrowingStoreExample() {
  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Growing Store Example</h2>
      <CustomerMetricsSection
        metrics={growingStoreMetrics}
        aovTrendData={aovTrendDataVolatile}
      />
    </div>
  );
}

// Example 3: New store with low retention
const newStoreMetrics: CustomerMetrics = {
  repeatCustomerRate: 8.2,
  newCustomers: 112,
  returningCustomers: 10,
  averageLifetimeValue: 7500, // ₦75.00
  totalUniqueCustomers: 122,
};

const aovTrendDataFlat = [
  { date: 'Jan 1', value: 7000 },
  { date: 'Jan 2', value: 7200 },
  { date: 'Jan 3', value: 7100 },
  { date: 'Jan 4', value: 7400 },
  { date: 'Jan 5', value: 7300 },
  { date: 'Jan 6', value: 7500 },
  { date: 'Jan 7', value: 7400 },
];

export function NewStoreExample() {
  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">New Store Example</h2>
      <CustomerMetricsSection metrics={newStoreMetrics} aovTrendData={aovTrendDataFlat} />
    </div>
  );
}

// Example 4: Insufficient data case
const insufficientDataResponse = {
  type: 'insufficient_data' as const,
  message: 'You need at least 5 completed orders to see customer analytics.',
  suggestion: 'Keep sharing your store link to get more orders!',
};

export function InsufficientDataExample() {
  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Insufficient Data Example</h2>
      <CustomerMetricsSection metrics={insufficientDataResponse} aovTrendData={[]} />
    </div>
  );
}

// Example 5: No AOV trend data
export function NoChartDataExample() {
  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">No Chart Data Example</h2>
      <CustomerMetricsSection metrics={highPerformingMetrics} aovTrendData={[]} />
    </div>
  );
}

// Example 6: Extended time period (30 days)
const extendedPeriodMetrics: CustomerMetrics = {
  repeatCustomerRate: 35.8,
  newCustomers: 450,
  returningCustomers: 250,
  averageLifetimeValue: 18900, // ₦189.00
  totalUniqueCustomers: 700,
};

const aovTrendData30Days = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  value: 8000 + Math.random() * 5000 + (i * 100), // Upward trend with noise
}));

export function ExtendedPeriodExample() {
  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">30-Day Period Example</h2>
      <CustomerMetricsSection
        metrics={extendedPeriodMetrics}
        aovTrendData={aovTrendData30Days}
      />
    </div>
  );
}

// Default export showing all examples
export default function CustomerMetricsSectionExamples() {
  return (
    <div className="space-y-8">
      <HighPerformingExample />
      <GrowingStoreExample />
      <NewStoreExample />
      <InsufficientDataExample />
      <NoChartDataExample />
      <ExtendedPeriodExample />
    </div>
  );
}
