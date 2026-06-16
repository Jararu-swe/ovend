'use client';

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import type { AnalyticsSummary } from '@/app/lib/business-analytics';

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
  isLoading?: boolean;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change: {
    value: number;
    change: number;
    direction: 'up' | 'down' | 'neutral';
  };
  comparisonLabel: string;
  icon?: React.ReactNode;
}

function MetricCard({ label, value, change, comparisonLabel, icon }: MetricCardProps) {
  const getTrendIcon = () => {
    if (change.direction === 'up') {
      return <ArrowTrendingUpIcon className="h-4 w-4" />;
    } else if (change.direction === 'down') {
      return <ArrowTrendingDownIcon className="h-4 w-4" />;
    } else {
      return <MinusIcon className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    if (change.direction === 'up') {
      return 'text-emerald-600 bg-emerald-50';
    } else if (change.direction === 'down') {
      return 'text-red-600 bg-red-50';
    } else {
      return 'text-slate-600 bg-slate-50';
    }
  };

  const formatChange = (changeValue: number) => {
    const sign = changeValue >= 0 ? '+' : '';
    return `${sign}${changeValue.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {icon && (
          <div className="text-slate-400">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{formatChange(change.change)}</span>
        </div>
        <span className="text-sm text-slate-500">{comparisonLabel}</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="mb-4">
        <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
        <div className="h-8 w-32 bg-slate-200 rounded"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-20 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
}

export default function AnalyticsSummaryCards({ summary, isLoading = false }: AnalyticsSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toLocaleString('en-NG', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-NG');
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getComparisonLabel = () => {
    // This will be determined based on the date range selected
    // For now, we'll use a generic "vs previous period"
    return 'vs previous period';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Visits"
        value={formatNumber(summary.totalVisits)}
        change={summary.periodChange.visits}
        comparisonLabel={getComparisonLabel()}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      />
      
      <MetricCard
        label="Total Orders"
        value={formatNumber(summary.totalOrders)}
        change={summary.periodChange.orders}
        comparisonLabel={getComparisonLabel()}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
      />
      
      <MetricCard
        label="Total Revenue"
        value={formatCurrency(summary.totalRevenue)}
        change={summary.periodChange.revenue}
        comparisonLabel={getComparisonLabel()}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      
      <MetricCard
        label="Conversion Rate"
        value={formatPercentage(summary.conversionRate)}
        change={summary.periodChange.conversionRate}
        comparisonLabel={getComparisonLabel()}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  );
}
