'use client';

import { useState } from 'react';
import {
  UsersIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { CustomerMetrics } from '@/app/lib/business-analytics';
import TrendChart, { type DataPoint } from './trend-chart';

interface CustomerMetricsSectionProps {
  metrics: CustomerMetrics | { type: 'insufficient_data'; message: string; suggestion: string };
  aovTrendData?: DataPoint[];
}

/**
 * MetricCard component for displaying individual customer metrics
 */
function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = 'emerald',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'orange';
}) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

/**
 * Skeleton loader for customer metrics
 */
function SkeletonMetrics() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-56 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-5 h-32"></div>
        <div className="bg-slate-50 rounded-xl p-5 h-32"></div>
        <div className="bg-slate-50 rounded-xl p-5 h-32"></div>
        <div className="bg-slate-50 rounded-xl p-5 h-32"></div>
      </div>
      <div className="h-64 bg-slate-50 rounded-lg"></div>
    </div>
  );
}

/**
 * CustomerMetricsSection Component
 * 
 * Displays customer analytics metrics:
 * - Repeat customer rate (% of customers with 2+ orders)
 * - Customer lifetime value (average total spent per customer)
 * - Average order value (mean transaction value)
 * - New vs returning customer split
 * - AOV trend chart over selected time period
 * 
 * Handles insufficient data case (< 5 orders) with appropriate messaging.
 * 
 * Requirements: 2.1, 2.7, 2.8, 2.10
 */
export default function CustomerMetricsSection({
  metrics,
  aovTrendData = [],
}: CustomerMetricsSectionProps) {
  const [showChart, setShowChart] = useState(true);

  // Handle insufficient data case (Requirement 2.10)
  if ('type' in metrics && metrics.type === 'insufficient_data') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <UsersIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Customer Analytics</h3>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <UsersIcon className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-2">{metrics.message}</p>
          <p className="text-sm text-slate-500 text-center max-w-md">{metrics.suggestion}</p>
        </div>
      </div>
    );
  }

  // Format values for display
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (value: number) => `₦${(value / 100).toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <UsersIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer Analytics</h3>
            <p className="text-xs text-slate-500">Customer behavior and lifetime value</p>
          </div>
        </div>

        {/* Chart toggle */}
        {aovTrendData.length > 0 && (
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>{showChart ? 'Hide Chart' : 'Show Chart'}</span>
          </button>
        )}
      </div>

      {/* Metrics Grid - Requirements 2.1, 2.7, 2.8 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Repeat Customer Rate (Requirements 2.1) */}
        <MetricCard
          icon={ArrowPathIcon}
          label="Repeat Customer Rate"
          value={formatPercentage(metrics.repeatCustomerRate)}
          subtitle="Customers with 2+ orders"
          color="emerald"
        />

        {/* Average Lifetime Value (Requirements 2.7) */}
        <MetricCard
          icon={CurrencyDollarIcon}
          label="Avg Lifetime Value"
          value={formatCurrency(metrics.averageLifetimeValue)}
          subtitle="Per customer total spent"
          color="blue"
        />

        {/* Total Unique Customers */}
        <MetricCard
          icon={UsersIcon}
          label="Total Customers"
          value={formatNumber(metrics.totalUniqueCustomers)}
          subtitle="Unique customer phones"
          color="purple"
        />

        {/* New vs Returning Split (Requirements 2.8) */}
        <MetricCard
          icon={UserPlusIcon}
          label="New Customers"
          value={formatNumber(metrics.newCustomers)}
          subtitle={`${metrics.returningCustomers} returning`}
          color="orange"
        />
      </div>

      {/* New vs Returning Customer Breakdown (Requirement 2.8) */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl">
        <p className="text-xs font-medium text-slate-600 mb-3 uppercase tracking-wider">
          Customer Distribution
        </p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">New Customers</span>
              <span className="font-bold text-orange-600">
                {metrics.totalUniqueCustomers > 0
                  ? ((metrics.newCustomers / metrics.totalUniqueCustomers) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{
                  width: `${
                    metrics.totalUniqueCustomers > 0
                      ? (metrics.newCustomers / metrics.totalUniqueCustomers) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">Returning Customers</span>
              <span className="font-bold text-emerald-600">
                {metrics.totalUniqueCustomers > 0
                  ? ((metrics.returningCustomers / metrics.totalUniqueCustomers) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${
                    metrics.totalUniqueCustomers > 0
                      ? (metrics.returningCustomers / metrics.totalUniqueCustomers) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AOV Trend Chart (Requirement 2.7) */}
      {showChart && aovTrendData.length > 0 && (
        <div className="border-t border-slate-100 pt-6">
          <TrendChart
            data={aovTrendData}
            title="Average Order Value Trend"
            chartType="line"
            height={250}
            showTrendLine={true}
            color="blue"
            formatValue={(value) => `₦${(value / 100).toLocaleString()}`}
            allowTypeToggle={true}
          />
        </div>
      )}

      {/* Insights Section */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Repeat Rate Insight */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-xs font-medium text-emerald-900 mb-1">💡 Retention Insight</p>
            <p className="text-xs text-emerald-700">
              {metrics.repeatCustomerRate >= 30 ? (
                <>
                  Great retention! {formatPercentage(metrics.repeatCustomerRate)} of customers
                  return for more purchases.
                </>
              ) : metrics.repeatCustomerRate >= 15 ? (
                <>
                  Decent retention at {formatPercentage(metrics.repeatCustomerRate)}. Consider
                  loyalty programs to boost repeat purchases.
                </>
              ) : (
                <>
                  Low repeat rate at {formatPercentage(metrics.repeatCustomerRate)}. Focus on
                  post-purchase engagement and customer satisfaction.
                </>
              )}
            </p>
          </div>

          {/* CLV Insight */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-1">💰 Value Insight</p>
            <p className="text-xs text-blue-700">
              Average customer value is {formatCurrency(metrics.averageLifetimeValue)}.{' '}
              {metrics.averageLifetimeValue > 10000 ? (
                <>Strong customer loyalty and high-value transactions!</>
              ) : (
                <>Focus on upselling and cross-selling to increase customer lifetime value.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
