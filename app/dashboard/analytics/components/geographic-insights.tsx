'use client';

import { useState } from 'react';
import {
  MapPinIcon,
  MapIcon,
  FunnelIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { GeographicInsight } from '@/app/lib/business-analytics-types';

interface GeographicInsightsProps {
  insights: GeographicInsight[];
  vendorState: string | null;
  onFilterChange?: (filter: { city?: string; state?: string } | null) => void;
}

type ViewMode = 'orders' | 'revenue';

/**
 * GeographicInsights Component
 * 
 * Displays geographic analytics showing:
 * - Top 10 cities by orders and revenue
 * - State-level breakdown with percentages
 * - Filter controls to apply city/state filters
 * - Highlights vendor's primary location state
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.5, 9.7, 9.8, 9.10
 */
export default function GeographicInsights({
  insights,
  vendorState,
  onFilterChange,
}: GeographicInsightsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('orders');
  const [activeFilter, setActiveFilter] = useState<{ city?: string; state?: string } | null>(null);

  // Handle insufficient data case (Requirement 9.7)
  if (insights.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <MapPinIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Geographic Insights</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <MapIcon className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-2">
            Not enough location data yet
          </p>
          <p className="text-sm text-slate-500 text-center max-w-md">
            You need at least 10 orders with location data to see geographic insights. 
            Encourage customers to provide complete delivery addresses!
          </p>
        </div>
      </div>
    );
  }

  // Aggregate data by state (Requirement 9.5)
  const stateMap = new Map<string, { orderCount: number; revenue: number; cities: Set<string> }>();
  
  insights.forEach(insight => {
    if (stateMap.has(insight.state)) {
      const existing = stateMap.get(insight.state)!;
      existing.orderCount += insight.orderCount;
      existing.revenue += insight.revenue;
      existing.cities.add(insight.city);
    } else {
      stateMap.set(insight.state, {
        orderCount: insight.orderCount,
        revenue: insight.revenue,
        cities: new Set([insight.city]),
      });
    }
  });

  const stateData = Array.from(stateMap.entries()).map(([state, data]) => ({
    state,
    orderCount: data.orderCount,
    revenue: data.revenue,
    cityCount: data.cities.size,
    isVendorState: state === vendorState, // Requirement 9.10
  }));

  // Sort states by order count descending
  stateData.sort((a, b) => b.orderCount - a.orderCount);

  // Sort insights based on view mode (Requirements 9.2, 9.3)
  const sortedInsights = [...insights].sort((a, b) => {
    if (viewMode === 'orders') {
      return b.orderCount - a.orderCount; // Top cities by orders (Requirement 9.2)
    } else {
      return b.revenue - a.revenue; // Top cities by revenue (Requirement 9.3)
    }
  });

  // Calculate total for percentages (Requirement 9.6)
  const totalOrders = insights.reduce((sum, insight) => sum + insight.orderCount, 0);
  const totalRevenue = insights.reduce((sum, insight) => sum + insight.revenue, 0);

  // Handle filter application (Requirement 9.8, 9.9)
  const handleApplyFilter = (city: string, state: string) => {
    const newFilter = { city, state };
    setActiveFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  const handleApplyStateFilter = (state: string) => {
    const newFilter = { state };
    setActiveFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    onFilterChange?.(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <MapPinIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Geographic Insights</h3>
            <p className="text-xs text-slate-500">Top locations by performance</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('orders')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'orders'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ChartBarIcon className="h-3.5 w-3.5" />
              <span>Orders</span>
            </div>
          </button>
          <button
            onClick={() => setViewMode('revenue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'revenue'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <CurrencyDollarIcon className="h-3.5 w-3.5" />
              <span>Revenue</span>
            </div>
          </button>
        </div>
      </div>

      {/* Active Filter Banner (Requirement 9.8) */}
      {activeFilter && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">
              {activeFilter.city ? (
                <>Filter: {activeFilter.city}, {activeFilter.state}</>
              ) : (
                <>Filter: {activeFilter.state}</>
              )}
            </span>
          </div>
          <button
            onClick={handleClearFilter}
            className="text-emerald-600 hover:text-emerald-700 transition"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities Section (Requirements 9.2, 9.3) */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
            Top 10 Cities
          </h4>
          <div className="space-y-2">
            {sortedInsights.slice(0, 10).map((insight, index) => (
              <div
                key={`${insight.city}-${insight.state}`}
                className="group relative flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                onClick={() => handleApplyFilter(insight.city, insight.state)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 group-hover:bg-emerald-200 text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {insight.city}
                    </p>
                    <p className="text-xs text-slate-500">{insight.state}</p>
                  </div>
                </div>
                <div className="text-right">
                  {viewMode === 'orders' ? (
                    <>
                      <p className="text-sm font-bold text-slate-900">
                        {insight.orderCount} orders
                      </p>
                      <p className="text-xs text-slate-500">
                        {insight.percentageOfTotal.toFixed(1)}% of total
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-900">
                        ₦{(insight.revenue / 100).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {((insight.revenue / totalRevenue) * 100).toFixed(1)}% of total
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State-Level Breakdown (Requirement 9.5) */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
            State Breakdown
          </h4>
          <div className="space-y-2">
            {stateData.map((state) => {
              const percentage = (state.orderCount / totalOrders) * 100;
              
              return (
                <div
                  key={state.state}
                  className={`group relative p-3 rounded-lg transition cursor-pointer ${
                    state.isVendorState
                      ? 'bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300'
                      : 'bg-slate-50 hover:bg-emerald-50'
                  }`}
                  onClick={() => handleApplyStateFilter(state.state)}
                >
                  {/* Requirement 9.10: Highlight vendor's primary location state */}
                  {state.isVendorState && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        YOUR STATE
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className={`text-sm font-bold ${
                        state.isVendorState ? 'text-emerald-900' : 'text-slate-900'
                      }`}>
                        {state.state}
                      </p>
                      <p className="text-xs text-slate-500">
                        {state.cityCount} {state.cityCount === 1 ? 'city' : 'cities'}
                      </p>
                    </div>
                    <div className="text-right">
                      {viewMode === 'orders' ? (
                        <p className={`text-sm font-bold ${
                          state.isVendorState ? 'text-emerald-900' : 'text-slate-900'
                        }`}>
                          {state.orderCount} orders
                        </p>
                      ) : (
                        <p className={`text-sm font-bold ${
                          state.isVendorState ? 'text-emerald-900' : 'text-slate-900'
                        }`}>
                          ₦{(state.revenue / 100).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Percentage Bar (Requirement 9.6) */}
                  <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                        state.isVendorState ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {percentage.toFixed(1)}% of total orders
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 text-center">
          💡 Click on any location to filter all analytics by that location
        </p>
      </div>
    </div>
  );
}
