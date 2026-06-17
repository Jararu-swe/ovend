'use client';

import { useState, useEffect } from 'react';
import TimeRangeSelector from './components/time-range-selector';
import AnalyticsSummaryCards from '@/app/ui/analytics/analytics-summary-cards';
import CustomerMetricsSection from './components/customer-metrics-section';
import ProductPerformanceTable from './components/product-performance-table';
import ConversionFunnelChart from '@/app/ui/analytics/conversion-funnel-chart';
import RevenueForecastCard from '@/app/ui/analytics/revenue-forecast-card';
import GeographicInsights from './components/geographic-insights';
import RealTimeDashboard from './components/real-time-dashboard';
import ExportMenu from './components/export-menu';
import TrendChart from './components/trend-chart';
import { calculateDateRange } from '@/app/lib/analytics-utils';
import {
  fetchAnalyticsSummary,
  fetchCustomerMetrics,
  fetchProductPerformance,
  fetchConversionFunnel,
  fetchGeographicInsights,
  calculateRevenueForecast,
  fetchDailyAnalytics,
} from '@/app/lib/analytics-actions';
import type {
  TimeRange,
  DateRange,
} from '@/app/lib/business-analytics-types';

interface BusinessAnalyticsDashboardProps {
  vendorId: string;
  categories: string[];
}

export default function BusinessAnalyticsDashboard({ 
  vendorId, 
  categories 
}: BusinessAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [customDateRange, setCustomDateRange] = useState<{ startDate: Date; endDate: Date } | undefined>();
  const [dateRange, setDateRange] = useState<DateRange>(calculateDateRange('7d'));
  
  // State for fetched data
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [customerMetrics, setCustomerMetrics] = useState<any>(null);
  const [productPerformance, setProductPerformance] = useState<any>(null);
  const [conversionFunnel, setConversionFunnel] = useState<any>(null);
  const [geographicInsights, setGeographicInsights] = useState<any>(null);
  const [revenueForecast, setRevenueForecast] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [productPage, setProductPage] = useState(1);
  const [productSort, setProductSort] = useState<'revenue' | 'units' | 'velocity' | 'name'>('revenue');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  // Update date range when time range or custom dates change
  useEffect(() => {
    let range: DateRange;
    if (timeRange === 'custom' && customDateRange) {
      const formatISO = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      range = {
        startDate: formatISO(customDateRange.startDate),
        endDate: formatISO(customDateRange.endDate),
      };
    } else {
      range = calculateDateRange(timeRange);
    }
    setDateRange(range);
  }, [timeRange, customDateRange]);

  // Fetch all analytics data when date range changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          summary, 
          customer, 
          product, 
          funnel, 
          geo, 
          forecast, 
          daily
        ] = await Promise.all([
          fetchAnalyticsSummary(vendorId, dateRange),
          fetchCustomerMetrics(vendorId, dateRange),
          fetchProductPerformance(vendorId, dateRange, {
            page: productPage,
            sortBy: productSort,
            category: selectedCategory,
          }),
          fetchConversionFunnel(vendorId, dateRange),
          fetchGeographicInsights(vendorId, dateRange),
          calculateRevenueForecast(vendorId),
          fetchDailyAnalytics(vendorId, dateRange),
        ]);

        setAnalyticsSummary(summary);
        setCustomerMetrics(customer);
        setProductPerformance(product);
        setConversionFunnel(funnel);
        setGeographicInsights(geo);
        setRevenueForecast(forecast);
        setDailyData(daily);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId, dateRange, productPage, productSort, selectedCategory]);

  const handleTimeRangeChange = (range: TimeRange, customRange?: { startDate: Date; endDate: Date }) => {
    setTimeRange(range);
    setCustomDateRange(customRange);
  };

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Business Analytics</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <TimeRangeSelector
            value={timeRange}
            customRange={customDateRange}
            onChange={handleTimeRangeChange}
          />
          <ExportMenu dateRange={dateRange} />
        </div>
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

      {/* Real Time Dashboard */}
      <RealTimeDashboard vendorId={vendorId} />

      {/* Trends and Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
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

        {/* Conversion Funnel */}
        {conversionFunnel && (
          <ConversionFunnelChart funnel={conversionFunnel} />
        )}
      </div>

      {/* Customer Metrics */}
      {customerMetrics && (
        <CustomerMetricsSection
          metrics={customerMetrics}
          dateRange={dateRange}
        />
      )}

      {/* Revenue Forecast */}
      {revenueForecast && (
        <RevenueForecastCard forecast={revenueForecast} />
      )}

      {/* Geographic Insights */}
      {geographicInsights && (
        <GeographicInsights
          insights={geographicInsights}
          onLocationSelect={(loc) => console.log('Selected location:', loc)}
        />
      )}

      {/* Product Performance */}
      {productPerformance && (
        <ProductPerformanceTable
          products={productPerformance.products}
          totalCount={productPerformance.totalCount}
          currentPage={productPage}
          pageSize={25}
          onPageChange={setProductPage}
          onSortChange={setProductSort}
          currentSort={productSort}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      )}
    </div>
  );
}
