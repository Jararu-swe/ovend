'use client';

import { useState, useEffect } from 'react';
import TimeRangeSelector from './components/time-range-selector';
import AnalyticsSummaryCards from '@/app/ui/analytics/analytics-summary-cards';
import BusinessTierGate from './components/business-tier-gate';
import TrendChart from './components/trend-chart';
import {
  calculateDateRange,
  fetchAnalyticsSummary,
  fetchDailyAnalytics,
  type TimeRange,
  type DateRange,
} from '@/app/lib/business-analytics';

interface ProAnalyticsViewProps {
  vendorId: string;
  tier: string;
}

export default function ProAnalyticsView({ 
  vendorId, 
  tier 
}: ProAnalyticsViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [dateRange, setDateRange] = useState<DateRange>(calculateDateRange('7d'));
  
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDateRange(calculateDateRange(timeRange));
  }, [timeRange]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summary, daily] = await Promise.all([
          fetchAnalyticsSummary(vendorId, dateRange),
          fetchDailyAnalytics(vendorId, dateRange)
        ]);
        setAnalyticsSummary(summary);
        setDailyData(daily);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId, dateRange]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
      );
    }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <TimeRangeSelector
          value={timeRange}
          onChange={handleTimeRangeChange}
          isProTier
        />
      </div>

      {/* Analytics Summary Cards */}
      {analyticsSummary && (
        <AnalyticsSummaryCards
          totalVisits={analyticsSummary.totalVisits}
          totalOrders={analyticsSummary.totalOrders}
          totalRevenue={analyticsSummary.totalRevenue}
          conversionRate={analyticsSummary.conversionRate}
          avgOrderValue={analyticsSummary.avgOrderValue}
          periodChange={analyticsSummary.periodChange}
        />
      )}

      {/* Daily Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <TrendChart
          metrics={[
            {
              key: 'visits',
              label: 'Visits',
              data: dailyData.map(d => ({ date: d.date, value: d.visits })),
              color: 'blue'
            },
            {
              key: 'orders',
              label: 'Orders',
              data: dailyData.map(d => ({ date: d.date, value: d.orders })),
              color: 'purple'
            },
            {
              key: 'revenue',
              label: 'Revenue',
              data: dailyData.map(d => ({ date: d.date, value: d.revenue / 100 })),
              color: 'green'
            }
          ]}
          height={350}
          title="Daily Performance"
          formatValue={(v) => v.toLocaleString()}
          allowTypeToggle
          showLegend
        />
      </div>

      {/* Business Tier Upgrade Gate */}
      <BusinessTierGate currentTier={tier} />
    </div>
  );
}
