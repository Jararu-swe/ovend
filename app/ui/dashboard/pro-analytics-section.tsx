'use client';

import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  ShoppingBagIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/app/lib/utils';

type DailyAnalytics = {
  date: string;
  visits: number;
  orders_count: number;
  revenue: number;
};

type TopProduct = {
  name: string;
  totalSold: number;
  totalRevenue: number;
};

type ProAnalyticsProps = {
  weeklyAnalytics: DailyAnalytics[];
  totalWeeklyVisits: number;
  totalWeeklyOrders: number;
  totalWeeklyRevenue: number;
  conversionRate: number;
  topProducts?: TopProduct[];
  isProOrBusiness: boolean;
  subscriptionTier: string;
};

export default function ProAnalyticsSection({
  weeklyAnalytics,
  totalWeeklyVisits,
  totalWeeklyOrders,
  totalWeeklyRevenue,
  conversionRate,
  topProducts = [],
  isProOrBusiness,
  subscriptionTier,
}: ProAnalyticsProps) {
  // If user is on Starter tier, show basic analytics with upgrade prompt
  if (!isProOrBusiness) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
            <ChartBarIcon className="h-5 w-5 text-slate-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Last 7 Days Performance
          </h3>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <LockClosedIcon className="h-3 w-3" />
            Starter
          </span>
        </div>

        {weeklyAnalytics.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 p-4 hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Visits</p>
                <p className="text-3xl font-bold text-blue-900">{totalWeeklyVisits}</p>
                <div className="h-1 w-12 bg-blue-300 rounded-full mt-3" />
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 p-4 hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Orders</p>
                <p className="text-3xl font-bold text-emerald-900">{totalWeeklyOrders}</p>
                <div className="h-1 w-12 bg-emerald-300 rounded-full mt-3" />
              </div>
              <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 p-4 hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Revenue</p>
                <p className="text-3xl font-bold text-amber-900">{formatCurrency(totalWeeklyRevenue)}</p>
                <div className="h-1 w-12 bg-amber-300 rounded-full mt-3" />
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-100 p-4 hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">Conversion</p>
                <p className="text-3xl font-bold text-purple-900">{conversionRate}%</p>
                <div className="h-1 w-12 bg-purple-300 rounded-full mt-3" />
              </div>
            </div>

            {/* Upgrade CTA Banner */}
            <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 border border-emerald-100/50 p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">Unlock Pro Analytics</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Upgrade to Pro tier to see daily breakdowns, trend charts, top products, and more detailed insights.
                  </p>
                  <a
                    href="/pricing"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    View plans →
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/50 p-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center">
                <ChartBarIcon className="h-7 w-7 text-slate-400" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Analytics Yet</h3>
            <p className="mt-2 text-xs text-slate-600 max-w-sm mx-auto">
              Once you start sharing your store link, you'll see your store visits, orders, and revenue here.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Pro / Business Tier: Enhanced Analytics ──

  const maxVisits = Math.max(...weeklyAnalytics.map((d) => d.visits), 1);
  const maxRevenue = Math.max(...weeklyAnalytics.map((d) => d.revenue), 1);
  // Sort by date ascending for chart
  const sortedDays = [...weeklyAnalytics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <ChartBarIcon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Pro Analytics
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
          <SparklesIcon className="h-3 w-3" />
          {subscriptionTier === 'business' ? 'Business' : 'Pro'}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Visits"
          value={totalWeeklyVisits}
          subtitle="Last 7 days"
          color="blue"
        />
        <SummaryCard
          title="Orders"
          value={totalWeeklyOrders}
          subtitle="Last 7 days"
          color="emerald"
        />
        <SummaryCard
          title="Revenue"
          value={formatCurrency(totalWeeklyRevenue)}
          subtitle="Last 7 days"
          color="amber"
        />
        <SummaryCard
          title="Conversion"
          value={`${conversionRate}%`}
          subtitle="Visit to order"
          color="purple"
        />
      </div>

      {/* Daily Trend Chart */}
      {sortedDays.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-5">
            Daily Visit Trend
          </h4>
          <div className="flex items-end gap-2 sm:gap-3 h-32">
            {sortedDays.map((day, i) => {
              const dayOfWeek = new Date(day.date).getDay();
              const heightPct = Math.max((day.visits / maxVisits) * 100, 2);
              const hasOrders = day.orders_count > 0;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className={`w-full rounded-md transition-all duration-300 group-hover:opacity-80 ${
                      hasOrders
                        ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                        : 'bg-gradient-to-t from-blue-500 to-blue-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-medium text-slate-500">
                    {dayLabels[dayOfWeek]}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      <p className="font-bold">{day.visits} visits</p>
                      {day.orders_count > 0 && (
                        <p className="text-emerald-300">{day.orders_count} orders · {formatCurrency(day.revenue)}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revenue Trend */}
      {sortedDays.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-5">
            Daily Revenue
          </h4>
          <div className="flex items-end gap-2 sm:gap-3 h-32">
            {sortedDays.map((day, i) => {
              const heightPct = Math.max((day.revenue / maxRevenue) * 100, 2);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-300 group-hover:opacity-80"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-medium text-slate-500">
                    {dayLabels[new Date(day.date).getDay()]}
                  </span>
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      <p className="font-bold">{formatCurrency(day.revenue)}</p>
                      <p className="text-amber-300">{day.orders_count} orders</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Selling Products */}
      {topProducts.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <StarIcon className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Top Selling Products
            </h4>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sold {product.totalSold} {product.totalSold === 1 ? 'time' : 'times'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(product.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* When there's no data yet */}
      {weeklyAnalytics.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100/50 p-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
              <ChartBarIcon className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-900">No Analytics Yet</h3>
          <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto">
            Once you start receiving orders and visitors, your Pro analytics dashboard will show detailed trends, top products, and revenue insights here.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const variants = {
    blue: {
      card: 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100',
      label: 'text-blue-700',
      value: 'text-blue-900',
      bar: 'bg-blue-300',
    },
    emerald: {
      card: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100',
      label: 'text-emerald-700',
      value: 'text-emerald-900',
      bar: 'bg-emerald-300',
    },
    amber: {
      card: 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-100',
      label: 'text-amber-700',
      value: 'text-amber-900',
      bar: 'bg-amber-300',
    },
    purple: {
      card: 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-100',
      label: 'text-purple-700',
      value: 'text-purple-900',
      bar: 'bg-purple-300',
    },
  };

  const v = variants[color];

  return (
    <div className={`rounded-xl ${v.card} border p-4 hover:shadow-md transition-shadow`}>
      <p className={`text-xs font-semibold ${v.label} uppercase tracking-wider mb-2`}>
        {title}
      </p>
      <p className={`text-3xl font-bold ${v.value}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-1">{subtitle}</p>
      <div className={`h-1 w-12 ${v.bar} rounded-full mt-3`} />
    </div>
  );
}
