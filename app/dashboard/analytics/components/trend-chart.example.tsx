/**
 * TrendChart Component Examples
 * 
 * This file demonstrates various use cases for the TrendChart component
 * in the Business-tier Advanced Analytics feature.
 */

import TrendChart, { DataPoint, MetricConfig } from './trend-chart';

// Sample data for demonstrations
const sampleDailyData: DataPoint[] = [
  { date: '2024-01-01', value: 245 },
  { date: '2024-01-02', value: 312 },
  { date: '2024-01-03', value: 289 },
  { date: '2024-01-04', value: 356 },
  { date: '2024-01-05', value: 401 },
  { date: '2024-01-06', value: 378 },
  { date: '2024-01-07', value: 425 },
];

const sampleRevenueData: DataPoint[] = [
  { date: 'Jan 1', value: 45000 },
  { date: 'Jan 2', value: 52000 },
  { date: 'Jan 3', value: 48000 },
  { date: 'Jan 4', value: 61000 },
  { date: 'Jan 5', value: 58000 },
  { date: 'Jan 6', value: 67000 },
  { date: 'Jan 7', value: 73000 },
];

/**
 * Example 1: Simple Line Chart with Trend Line
 * Use case: Daily visits with trend analysis
 */
export function SimpleLineChartExample() {
  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold mb-4">Daily Visits - Last 7 Days</h3>
      <TrendChart
        data={sampleDailyData}
        chartType="line"
        color="blue"
        showTrendLine={true}
        formatValue={(v) => v.toLocaleString()}
        title="Store Visits"
      />
    </div>
  );
}

/**
 * Example 2: Bar Chart with Custom Formatting
 * Use case: Revenue tracking with currency formatting
 */
export function BarChartExample() {
  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold mb-4">Daily Revenue</h3>
      <TrendChart
        data={sampleRevenueData}
        chartType="bar"
        color="green"
        formatValue={(v) => `₦${(v / 100).toLocaleString()}`}
        title="Revenue"
        height={250}
      />
    </div>
  );
}

/**
 * Example 3: Area Chart
 * Use case: Order volume visualization with filled area
 */
export function AreaChartExample() {
  const orderData: DataPoint[] = [
    { date: 'Mon', value: 45 },
    { date: 'Tue', value: 52 },
    { date: 'Wed', value: 48 },
    { date: 'Thu', value: 61 },
    { date: 'Fri', value: 78 },
    { date: 'Sat', value: 89 },
    { date: 'Sun', value: 72 },
  ];

  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold mb-4">Weekly Orders</h3>
      <TrendChart
        data={orderData}
        chartType="area"
        color="purple"
        showTrendLine={true}
        title="Orders"
      />
    </div>
  );
}

/**
 * Example 4: Multi-Metric Chart with Legend
 * Use case: Compare visits, orders, and revenue together
 * Requirement 10.10: Multiple metrics with legend and toggle controls
 */
export function MultiMetricChartExample() {
  const metrics: MetricConfig[] = [
    {
      key: 'visits',
      label: 'Visits',
      data: [
        { date: 'Jan 1', value: 245 },
        { date: 'Jan 2', value: 312 },
        { date: 'Jan 3', value: 289 },
        { date: 'Jan 4', value: 356 },
        { date: 'Jan 5', value: 401 },
      ],
      color: 'blue',
    },
    {
      key: 'orders',
      label: 'Orders',
      data: [
        { date: 'Jan 1', value: 45 },
        { date: 'Jan 2', value: 52 },
        { date: 'Jan 3', value: 48 },
        { date: 'Jan 4', value: 61 },
        { date: 'Jan 5', value: 58 },
      ],
      color: 'purple',
    },
    {
      key: 'revenue',
      label: 'Revenue (₦)',
      data: [
        { date: 'Jan 1', value: 450 },
        { date: 'Jan 2', value: 520 },
        { date: 'Jan 3', value: 480 },
        { date: 'Jan 4', value: 610 },
        { date: 'Jan 5', value: 580 },
      ],
      color: 'green',
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold mb-4">Combined Performance Metrics</h3>
      <TrendChart
        metrics={metrics}
        chartType="line"
        showLegend={true}
        title="All Metrics"
        height={300}
      />
      <p className="text-xs text-slate-500 mt-2">
        💡 Click legend items to show/hide metrics
      </p>
    </div>
  );
}

/**
 * Example 5: Chart with Type Toggle
 * Use case: Allow users to switch between visualization types
 * Requirement 10.9: Toggle between bar, line, and area charts
 */
export function ChartWithTypeToggleExample() {
  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold mb-4">Flexible Visualization</h3>
      <TrendChart
        data={sampleDailyData}
        chartType="line"
        color="purple"
        allowTypeToggle={true}
        showTrendLine={true}
        title="Daily Metrics"
      />
      <p className="text-xs text-slate-500 mt-2">
        Use the buttons above the chart to switch between chart types
      </p>
    </div>
  );
}

/**
 * Example 6: 30-Day Extended Period Chart
 * Use case: Business tier extended analytics
 * Requirement 1.2: Display analytics for 30-day periods
 */
export function ExtendedPeriodChartExample() {
  // Generate 30 days of sample data
  const thirtyDayData: DataPoint[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2024, 0, i + 1);
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      value: Math.floor(Math.random() * 200) + 300,
    };
  });

  return (
    <div className="p-6 bg-white rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold mb-4">30-Day Performance Trend</h3>
      <TrendChart
        data={thirtyDayData}
        chartType="area"
        color="green"
        showTrendLine={true}
        title="Extended Period Analytics"
        height={280}
      />
    </div>
  );
}

/**
 * Example 7: Real-time Dashboard Integration
 * Use case: Compact chart for real-time dashboard
 */
export function CompactChartExample() {
  const realtimeData: DataPoint[] = [
    { date: '8am', value: 12 },
    { date: '9am', value: 18 },
    { date: '10am', value: 25 },
    { date: '11am', value: 31 },
    { date: '12pm', value: 28 },
    { date: '1pm', value: 22 },
  ];

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <TrendChart
        data={realtimeData}
        chartType="line"
        color="blue"
        height={120}
        title="Today's Hourly Traffic"
      />
    </div>
  );
}

/**
 * Complete Dashboard Example
 * Combining multiple charts in a dashboard layout
 */
export function CompleteDashboardExample() {
  return (
    <div className="space-y-6 p-6 bg-slate-50">
      <h2 className="text-2xl font-bold">Business Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleLineChartExample />
        <BarChartExample />
      </div>

      <MultiMetricChartExample />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartExample />
        <ChartWithTypeToggleExample />
      </div>

      <ExtendedPeriodChartExample />
    </div>
  );
}

export default function TrendChartExamples() {
  return <CompleteDashboardExample />;
}
