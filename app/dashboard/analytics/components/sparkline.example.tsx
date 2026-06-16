/**
 * Sparkline Component Examples
 * 
 * Demonstrates how to use sparkline mini-charts next to key metrics
 * as specified in Requirement 10.5
 */

import Sparkline, { SparklineDataPoint } from './sparkline';

// Sample data sets
const upwardTrend: SparklineDataPoint[] = [
  { value: 100 },
  { value: 120 },
  { value: 135 },
  { value: 145 },
  { value: 160 },
  { value: 175 },
  { value: 190 },
];

const downwardTrend: SparklineDataPoint[] = [
  { value: 190 },
  { value: 175 },
  { value: 160 },
  { value: 145 },
  { value: 135 },
  { value: 120 },
  { value: 100 },
];

const volatileTrend: SparklineDataPoint[] = [
  { value: 100 },
  { value: 150 },
  { value: 120 },
  { value: 180 },
  { value: 140 },
  { value: 190 },
  { value: 160 },
];

const stableTrend: SparklineDataPoint[] = [
  { value: 150 },
  { value: 152 },
  { value: 148 },
  { value: 151 },
  { value: 149 },
  { value: 150 },
  { value: 151 },
];

/**
 * Example 1: Metric Card with Sparkline
 * Use case: Display key metric with quick visual trend
 * Requirement 10.5: Sparkline mini-charts next to key metrics
 */
export function MetricCardWithSparkline() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
          Total Visits
        </span>
        <Sparkline data={upwardTrend} color="blue" showTrend={true} />
      </div>
      <p className="text-3xl font-bold text-slate-900">12,456</p>
      <p className="text-xs text-emerald-600 font-medium mt-1">
        +15.3% vs last week
      </p>
    </div>
  );
}

/**
 * Example 2: Revenue Metric with Green Sparkline
 * Use case: Revenue tracking with visual trend
 * Requirement 10.4: Green color for revenue metrics
 */
export function RevenueMetricWithSparkline() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
          Revenue
        </span>
        <Sparkline data={upwardTrend} color="green" showTrend={true} />
      </div>
      <p className="text-3xl font-bold text-slate-900">₦3.2M</p>
      <p className="text-xs text-emerald-600 font-medium mt-1">
        +22.7% vs last month
      </p>
    </div>
  );
}

/**
 * Example 3: Orders Metric with Purple Sparkline
 * Use case: Order volume tracking
 * Requirement 10.4: Purple color for orders metrics
 */
export function OrdersMetricWithSparkline() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
          Orders
        </span>
        <Sparkline data={upwardTrend} color="purple" showTrend={true} />
      </div>
      <p className="text-3xl font-bold text-slate-900">847</p>
      <p className="text-xs text-emerald-600 font-medium mt-1">
        +8.4% vs yesterday
      </p>
    </div>
  );
}

/**
 * Example 4: Declining Metric
 * Use case: Show metrics that are trending down
 */
export function DecliningMetricWithSparkline() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
          Bounce Rate
        </span>
        <Sparkline data={downwardTrend} color="red" showTrend={true} />
      </div>
      <p className="text-3xl font-bold text-slate-900">23.4%</p>
      <p className="text-xs text-red-600 font-medium mt-1">
        -5.2% improvement
      </p>
    </div>
  );
}

/**
 * Example 5: Volatile Metric
 * Use case: Show metrics with high variability
 */
export function VolatileMetricWithSparkline() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
          Conversion Rate
        </span>
        <Sparkline data={volatileTrend} color="orange" showTrend={true} />
      </div>
      <p className="text-3xl font-bold text-slate-900">3.8%</p>
      <p className="text-xs text-slate-600 font-medium mt-1">
        Variable this week
      </p>
    </div>
  );
}

/**
 * Example 6: Stable Metric
 * Use case: Show metrics with consistent performance
 */
export function StableMetricWithSparkline() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
          Avg Order Value
        </span>
        <Sparkline data={stableTrend} color="green" showTrend={true} />
      </div>
      <p className="text-3xl font-bold text-slate-900">₦3,750</p>
      <p className="text-xs text-slate-600 font-medium mt-1">
        Stable performance
      </p>
    </div>
  );
}

/**
 * Example 7: Compact Sparkline in Table
 * Use case: Show trends in product performance table
 */
export function TableRowWithSparkline() {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 px-4 text-sm font-medium text-slate-900">
        Premium Coffee Beans
      </td>
      <td className="py-3 px-4 text-sm text-slate-600">
        124 units
      </td>
      <td className="py-3 px-4 text-sm text-slate-600">
        ₦186,000
      </td>
      <td className="py-3 px-4">
        <Sparkline 
          data={upwardTrend} 
          color="green" 
          width={60} 
          height={20}
          showArea={true}
        />
      </td>
    </tr>
  );
}

/**
 * Example 8: Inline Sparkline in Text
 * Use case: Embed sparkline within prose
 */
export function InlineSparklineExample() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <p className="text-sm text-slate-700">
        Your revenue{' '}
        <Sparkline 
          data={upwardTrend} 
          color="green" 
          width={50} 
          height={16}
          showArea={false}
        />{' '}
        has increased by <span className="font-bold text-emerald-600">32%</span> this month
        compared to last month.
      </p>
    </div>
  );
}

/**
 * Example 9: Larger Sparkline for Emphasis
 * Use case: Bigger sparklines in hero metrics
 */
export function LargeSparklineExample() {
  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium opacity-90 uppercase tracking-wider">
          Monthly Revenue
        </span>
      </div>
      <p className="text-4xl font-bold mb-4">₦8.4M</p>
      <Sparkline 
        data={upwardTrend} 
        color="green" 
        width={200} 
        height={50}
        showArea={true}
        showTrend={false}
      />
      <p className="text-sm opacity-90 mt-3">
        Strong growth trajectory this quarter
      </p>
    </div>
  );
}

/**
 * Example 10: Dashboard Grid with Multiple Sparklines
 * Use case: Overview dashboard with multiple metrics
 * Requirement 10.5: Multiple sparklines in summary view
 */
export function SparklineDashboardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      <MetricCardWithSparkline />
      <RevenueMetricWithSparkline />
      <OrdersMetricWithSparkline />
      <StableMetricWithSparkline />
    </div>
  );
}

/**
 * Example 11: Product Performance Table
 * Use case: Show trends for multiple products
 */
export function ProductTableWithSparklinesExample() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold mb-4">Top Products</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-2 px-4 text-left text-xs font-medium text-slate-600 uppercase">
              Product
            </th>
            <th className="py-2 px-4 text-left text-xs font-medium text-slate-600 uppercase">
              Units Sold
            </th>
            <th className="py-2 px-4 text-left text-xs font-medium text-slate-600 uppercase">
              Revenue
            </th>
            <th className="py-2 px-4 text-left text-xs font-medium text-slate-600 uppercase">
              7-Day Trend
            </th>
          </tr>
        </thead>
        <tbody>
          <TableRowWithSparkline />
          <tr className="border-b border-slate-100">
            <td className="py-3 px-4 text-sm font-medium text-slate-900">
              Organic Tea Collection
            </td>
            <td className="py-3 px-4 text-sm text-slate-600">
              89 units
            </td>
            <td className="py-3 px-4 text-sm text-slate-600">
              ₦133,500
            </td>
            <td className="py-3 px-4">
              <Sparkline 
                data={volatileTrend} 
                color="orange" 
                width={60} 
                height={20}
              />
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-3 px-4 text-sm font-medium text-slate-900">
              Artisan Chocolate
            </td>
            <td className="py-3 px-4 text-sm text-slate-600">
              156 units
            </td>
            <td className="py-3 px-4 text-sm text-slate-600">
              ₦234,000
            </td>
            <td className="py-3 px-4">
              <Sparkline 
                data={stableTrend} 
                color="green" 
                width={60} 
                height={20}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Complete Examples Showcase
 */
export default function SparklineExamples() {
  return (
    <div className="space-y-8 p-6 bg-slate-50">
      <div>
        <h2 className="text-2xl font-bold mb-2">Sparkline Component Examples</h2>
        <p className="text-sm text-slate-600">
          Mini-charts for displaying quick visual trends (Requirement 10.5)
        </p>
      </div>

      <SparklineDashboardExample />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DecliningMetricWithSparkline />
        <VolatileMetricWithSparkline />
      </div>

      <LargeSparklineExample />

      <ProductTableWithSparklinesExample />

      <InlineSparklineExample />
    </div>
  );
}
