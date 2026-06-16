'use client';

import { useState, useEffect } from 'react';
import {
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/**
 * Real-time performance data type
 */
export type RealTimeData = {
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
  lastUpdate: string;
};

interface RealTimeDashboardProps {
  vendorId: string;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  comparison: number;
  comparisonLabel: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * MetricCard component for displaying individual metrics with comparisons
 */
function MetricCard({ label, value, comparison, comparisonLabel, icon: Icon }: MetricCardProps) {
  const getTrendIcon = () => {
    if (comparison > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4" />;
    } else if (comparison < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4" />;
    } else {
      return <MinusIcon className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    if (comparison > 0) return 'text-emerald-600';
    if (comparison < 0) return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className="h-6 w-6 rounded-md bg-emerald-100 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-emerald-600" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-2">{value}</p>
      <div className={`flex items-center gap-1.5 text-xs font-medium ${getTrendColor()}`}>
        {getTrendIcon()}
        <span>
          {comparison > 0 ? '+' : ''}{comparison.toFixed(1)}% {comparisonLabel}
        </span>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for the real-time dashboard
 */
function SkeletonDashboard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4 h-32"></div>
        <div className="bg-slate-50 rounded-xl p-4 h-32"></div>
        <div className="bg-slate-50 rounded-xl p-4 h-32"></div>
      </div>
      <div className="h-12 bg-slate-50 rounded-lg mb-4"></div>
      <div className="h-16 bg-emerald-50 rounded-lg"></div>
    </div>
  );
}

/**
 * RealTimeDashboard Component
 * 
 * Displays today's performance compared to yesterday and last week:
 * - Today's visits, orders, and revenue
 * - Comparison with yesterday at the same time
 * - Comparison with the same weekday last week
 * - Pace indicator (ahead/behind/on-track)
 * - Last hour order count
 * - Last update timestamp
 * 
 * Polls the /api/analytics/real-time endpoint every 30 seconds.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.8, 8.10
 */
export default function RealTimeDashboard({ vendorId }: RealTimeDashboardProps) {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Requirement 8.2: Poll /api/analytics/real-time endpoint
        const result = await fetch(`/api/analytics/real-time?vendorId=${vendorId}`);
        
        if (!result.ok) {
          throw new Error('Failed to fetch real-time data');
        }
        
        const json = await result.json();
        setData(json);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching real-time dashboard data:', err);
        setError('Unable to load real-time data');
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Requirement 8.10: Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [vendorId]);

  // Show loading skeleton on initial load
  if (isLoading && !data) {
    return <SkeletonDashboard />;
  }

  // Show error state
  if (error && !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center">
            <BoltIcon className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Real-Time Performance</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate percentage changes for comparisons (Requirements 8.3, 8.5)
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const visitsChange = calculateChange(data.todayVisits, data.comparisonYesterday.visits);
  const ordersChange = calculateChange(data.todayOrders, data.comparisonYesterday.orders);
  const revenueChange = calculateChange(data.todayRevenue, data.comparisonYesterday.revenue);

  // Get pace indicator styling (Requirement 8.8)
  const getPaceConfig = () => {
    switch (data.paceIndicator) {
      case 'ahead':
        return {
          icon: <ArrowTrendingUpIcon className="h-5 w-5" />,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Ahead of yesterday',
        };
      case 'behind':
        return {
          icon: <ArrowTrendingDownIcon className="h-5 w-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Behind yesterday',
        };
      default:
        return {
          icon: <MinusIcon className="h-5 w-5" />,
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          label: 'On track with yesterday',
        };
    }
  };

  const paceConfig = getPaceConfig();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header - Requirement 8.1 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <BoltIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Real-Time Performance</h3>
            <p className="text-xs text-slate-500">Today&apos;s live metrics</p>
          </div>
        </div>

        {/* Last update timestamp - Requirement 8.6 */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ClockIcon className="h-4 w-4" />
          <span>Updated: {data.lastUpdate}</span>
        </div>
      </div>

      {/* Metrics Grid - Requirements 8.1, 8.2, 8.3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Visits Today"
          value={data.todayVisits.toLocaleString()}
          comparison={visitsChange}
          comparisonLabel="vs yesterday"
        />
        <MetricCard
          label="Orders Today"
          value={data.todayOrders.toLocaleString()}
          comparison={ordersChange}
          comparisonLabel="vs yesterday"
        />
        <MetricCard
          label="Revenue Today"
          value={`₦${(data.todayRevenue / 100).toLocaleString()}`}
          comparison={revenueChange}
          comparisonLabel="vs yesterday"
        />
      </div>

      {/* Pace Indicator - Requirement 8.8 */}
      <div className={`flex items-center justify-between p-4 ${paceConfig.bgColor} border ${paceConfig.borderColor} rounded-xl mb-4`}>
        <div className="flex items-center gap-3">
          <div className={`${paceConfig.color}`}>
            {paceConfig.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Today&apos;s Pace</p>
            <p className={`text-xs font-medium ${paceConfig.color}`}>
              {paceConfig.label}
            </p>
          </div>
        </div>
      </div>

      {/* Last Hour Orders - Requirement 8.10 */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{data.lastHourOrders}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                {data.lastHourOrders === 1 ? 'Order' : 'Orders'} in the last hour
              </p>
              <p className="text-xs text-emerald-700">
                Live activity indicator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison with Last Week - Requirement 8.5 */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-600 mb-3 uppercase tracking-wider">
          vs Same Day Last Week
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Visits</p>
            <p className={`text-sm font-bold ${
              data.todayVisits >= data.comparisonLastWeek.visits ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {data.todayVisits >= data.comparisonLastWeek.visits ? '+' : ''}
              {calculateChange(data.todayVisits, data.comparisonLastWeek.visits).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Orders</p>
            <p className={`text-sm font-bold ${
              data.todayOrders >= data.comparisonLastWeek.orders ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {data.todayOrders >= data.comparisonLastWeek.orders ? '+' : ''}
              {calculateChange(data.todayOrders, data.comparisonLastWeek.orders).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Revenue</p>
            <p className={`text-sm font-bold ${
              data.todayRevenue >= data.comparisonLastWeek.revenue ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {data.todayRevenue >= data.comparisonLastWeek.revenue ? '+' : ''}
              {calculateChange(data.todayRevenue, data.comparisonLastWeek.revenue).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
