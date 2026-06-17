'use client';

import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { ConversionFunnel } from '@/app/lib/business-analytics-types';

interface ConversionFunnelChartProps {
  funnel: ConversionFunnel;
  isLoading?: boolean;
}

interface FunnelStageProps {
  label: string;
  value: number;
  percentage: number;
  color: string;
  conversionRate?: number;
  conversionLabel?: string;
}

function FunnelStage({ 
  label, 
  value, 
  percentage, 
  color, 
  conversionRate, 
  conversionLabel 
}: FunnelStageProps) {
  return (
    <div className="relative">
      {/* Funnel stage bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative h-16 bg-slate-100 rounded-lg overflow-hidden">
            <div
              className={`h-full ${color} transition-all duration-500 ease-out flex items-center justify-between px-6`}
              style={{ width: `${percentage}%` }}
            >
              <span className="font-bold text-white text-lg">{label}</span>
              <span className="font-bold text-white text-xl">
                {value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="w-24 text-right">
          <div className="text-2xl font-bold text-slate-900">{percentage}%</div>
        </div>
      </div>
      
      {/* Conversion rate between stages */}
      {conversionRate !== undefined && conversionLabel && (
        <div className="flex items-center gap-2 mt-2 ml-4">
          <div className="flex-1 border-l-2 border-slate-300 pl-4">
            <div className="text-sm text-slate-600">
              {conversionLabel}:{' '}
              <span className={`font-semibold ${
                conversionRate >= 50 ? 'text-emerald-600' :
                conversionRate >= 20 ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {conversionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonFunnelChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
      <div className="space-y-8">
        <div className="h-16 bg-slate-200 rounded-lg"></div>
        <div className="h-16 bg-slate-200 rounded-lg"></div>
        <div className="h-16 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="h-20 bg-slate-200 rounded-lg"></div>
        <div className="h-20 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function ConversionFunnelChart({ 
  funnel, 
  isLoading = false 
}: ConversionFunnelChartProps) {
  if (isLoading) {
    return <SkeletonFunnelChart />;
  }

  // Calculate percentages relative to visits (top of funnel)
  const maxValue = funnel.visits || 1; // Prevent division by zero
  const visitsPercentage = 100;
  const ordersInitiatedPercentage = (funnel.ordersInitiated / maxValue) * 100;
  const ordersCompletedPercentage = (funnel.ordersCompleted / maxValue) * 100;

  // Check if conversion rate is below 2% threshold for optimization suggestion
  const showOptimizationSuggestion = funnel.visitToOrderRate < 2 && funnel.visitToOrderRate > 0;

  // Format average fulfillment time
  const formatFulfillmentTime = (hours: number): string => {
    if (hours === 0) return 'N/A';
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Conversion Funnel</h3>
        <p className="text-sm text-slate-600">
          Customer journey from visit to completed order
        </p>
      </div>

      {/* Funnel visualization */}
      <div className="space-y-6 mb-6">
        <FunnelStage
          label="Store Visits"
          value={funnel.visits}
          percentage={visitsPercentage}
          color="bg-blue-500"
          conversionRate={funnel.visitToOrderRate}
          conversionLabel="Visit → Order Conversion"
        />
        
        <FunnelStage
          label="Orders Initiated"
          value={funnel.ordersInitiated}
          percentage={ordersInitiatedPercentage}
          color="bg-purple-500"
          conversionRate={funnel.orderCompletionRate}
          conversionLabel="Order Completion Rate"
        />
        
        <FunnelStage
          label="Orders Completed"
          value={funnel.ordersCompleted}
          percentage={ordersCompletedPercentage}
          color="bg-emerald-500"
        />
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Abandonment Rate */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Abandonment Rate
              </p>
              <p className={`text-2xl font-bold ${
                funnel.abandonmentRate > 50 ? 'text-red-600' :
                funnel.abandonmentRate > 30 ? 'text-amber-600' :
                'text-emerald-600'
              }`}>
                {funnel.abandonmentRate.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {funnel.ordersInitiated - funnel.ordersCompleted} orders not completed
              </p>
            </div>
            <div className={`p-2 rounded-lg ${
              funnel.abandonmentRate > 50 ? 'bg-red-100' :
              funnel.abandonmentRate > 30 ? 'bg-amber-100' :
              'bg-emerald-100'
            }`}>
              <svg className={`h-5 w-5 ${
                funnel.abandonmentRate > 50 ? 'text-red-600' :
                funnel.abandonmentRate > 30 ? 'text-amber-600' :
                'text-emerald-600'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Fulfillment Time */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Avg. Fulfillment Time
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {formatFulfillmentTime(funnel.avgTimeToFulfillment)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Time to complete orders
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Optimization suggestion when conversion < 2% */}
      {showOptimizationSuggestion && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">
                Low Conversion Rate Detected
              </h4>
              <p className="text-sm text-amber-800 mb-2">
                Your visit-to-order conversion rate is below 2%. Consider these optimization strategies:
              </p>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Review product pricing and ensure it's competitive</li>
                <li>Improve product images and descriptions</li>
                <li>Simplify the ordering process</li>
                <li>Add customer testimonials or reviews</li>
                <li>Ensure fast response times to customer inquiries</li>
                <li>Consider offering limited-time promotions or discounts</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* No data state */}
      {funnel.visits === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-1">No Conversion Data Yet</p>
          <p className="text-sm text-slate-500">
            Share your store link to start getting visits and orders
          </p>
        </div>
      )}
    </div>
  );
}
