'use client';

import { useRouter } from 'next/navigation';
import {
  LockClosedIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarSquareIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

/**
 * Business-tier feature definition
 */
type BusinessFeature = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  mockupType: 'chart' | 'table' | 'card' | 'map';
  color: string;
  bgColor: string;
};

/**
 * BusinessTierGate Component
 * 
 * Displays locked preview cards for Business-tier analytics features to Pro tier users.
 * Each card shows:
 * - Lock icon indicator
 * - Feature title
 * - Brief description
 * - Sample visualization/mockup (blurred)
 * - "Upgrade to Business" call-to-action button
 * 
 * Requirements: 11.2, 11.3, 11.4
 * 
 * Features displayed:
 * - Extended Time Ranges (30-day, 90-day, custom)
 * - Customer Analytics (repeat rate, CLV, AOV)
 * - Product Deep-Dive (inventory velocity, low performers)
 * - Revenue Forecasting (30-day projections)
 * - Export Capabilities (CSV, Excel, PDF)
 * - Geographic Insights (city/state analytics)
 */
interface BusinessTierGateProps {
  /** Current user's subscription tier */
  currentTier?: 'starter' | 'pro' | 'business';
  /** Optional single feature to display (instead of all features) */
  feature?: string;
  /** Optional description for single feature mode */
  description?: string;
}

/**
 * BusinessTierGate Component
 * 
 * Displays locked preview cards for Business-tier analytics features to Pro tier users.
 * Each card shows:
 * - Lock icon indicator
 * - Feature title
 * - Brief description
 * - Sample visualization/mockup (blurred)
 * - "Upgrade to Business" call-to-action button
 * 
 * Requirements: 11.2, 11.3, 11.4
 * 
 * Features displayed:
 * - Extended Time Ranges (30-day, 90-day, custom)
 * - Customer Analytics (repeat rate, CLV, AOV)
 * - Product Deep-Dive (inventory velocity, low performers)
 * - Revenue Forecasting (30-day projections)
 * - Export Capabilities (CSV, Excel, PDF)
 * - Geographic Insights (city/state analytics)
 */
export default function BusinessTierGate({
  currentTier,
  feature,
  description,
}: BusinessTierGateProps) {
  const router = useRouter();

  /**
   * Handle upgrade button click
   * Redirects to billing page with Business tier pre-selected (Requirement 11.4)
   */
  const handleUpgrade = () => {
    router.push('/dashboard/billing?upgrade=business');
  };

  // Business-tier features (Requirement 11.3)
  const businessFeatures: BusinessFeature[] = [
    {
      id: 'extended-time-ranges',
      title: 'Extended Time Ranges',
      description: 'Analyze 30-day, 90-day, and custom date ranges to identify long-term trends and seasonal patterns.',
      icon: CalendarDaysIcon,
      mockupType: 'chart',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'customer-analytics',
      title: 'Customer Analytics',
      description: 'Track repeat customer rate, lifetime value, and AOV trends to optimize retention strategies.',
      icon: UsersIcon,
      mockupType: 'card',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'product-deep-dive',
      title: 'Product Deep-Dive',
      description: 'Discover inventory velocity, low performers, and profit margins to optimize your product mix.',
      icon: ChartBarSquareIcon,
      mockupType: 'table',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'revenue-forecasting',
      title: 'Revenue Forecasting',
      description: 'Get 30-day revenue projections based on historical trends to plan inventory and growth.',
      icon: ArrowTrendingUpIcon,
      mockupType: 'chart',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'export-capabilities',
      title: 'Export Capabilities',
      description: 'Export your analytics as CSV, Excel, or PDF for deeper analysis and stakeholder reports.',
      icon: ArrowDownTrayIcon,
      mockupType: 'card',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'geographic-insights',
      title: 'Geographic Insights',
      description: 'View which cities and states generate the most orders to optimize delivery and marketing.',
      icon: MapPinIcon,
      mockupType: 'map',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  /**
   * Render sample mockup/visualization based on type (Requirement 11.4)
   */
  const renderMockup = (type: BusinessFeature['mockupType']) => {
    switch (type) {
      case 'chart':
        return (
          <div className="space-y-2">
            <div className="flex items-end gap-1 h-24">
              {[40, 60, 55, 70, 65, 80, 75].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-emerald-200 rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="h-px bg-slate-200" />
          </div>
        );

      case 'table':
        return (
          <div className="space-y-2">
            {[100, 85, 70].map((width, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-6 bg-slate-200 rounded w-12" />
                <div className="h-6 bg-slate-200 rounded flex-1" style={{ width: `${width}%` }} />
              </div>
            ))}
          </div>
        );

      case 'card':
        return (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
                <div className="h-6 bg-slate-300 rounded w-12" />
              </div>
            ))}
          </div>
        );

      case 'map':
        return (
          <div className="space-y-2">
            {[90, 75, 60, 45].map((width, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-5 w-5 bg-emerald-200 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded" style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100 p-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 mb-4">
          <SparklesIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Unlock Advanced Analytics
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto mb-6">
          Upgrade to Business tier (₦3,500/month) to access powerful features including extended time ranges,
          customer analytics, revenue forecasting, and more.
        </p>
        <button
          onClick={handleUpgrade}
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg hover:shadow-xl"
        >
          Upgrade to Business
        </button>
      </div>

      {/* Feature Preview Cards Grid (Requirement 11.2, 11.3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessFeatures.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.id}
              className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group"
            >
              {/* Lock Badge (Requirement 11.4) */}
              <div className="absolute top-4 right-4 h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <LockClosedIcon className="h-4 w-4 text-slate-500" />
              </div>

              {/* Feature Icon (Requirement 11.4) */}
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} mb-4`}>
                <Icon className={`h-6 w-6 ${feature.color}`} />
              </div>

              {/* Feature Title and Description (Requirement 11.4) */}
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Sample Mockup/Visualization - Blurred (Requirement 11.4) */}
              <div className="relative mb-4">
                <div className="filter blur-sm opacity-50 pointer-events-none">
                  {renderMockup(feature.mockupType)}
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-200 shadow-sm">
                    <p className="text-xs font-medium text-slate-700">
                      Preview
                    </p>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA Button (Requirement 11.4) */}
              <button
                onClick={handleUpgrade}
                className={`w-full px-4 py-2.5 ${feature.bgColor} ${feature.color} font-bold rounded-lg transition group-hover:shadow-md`}
              >
                Upgrade to Unlock
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Ready to grow your business?
          </h3>
          <p className="text-sm text-slate-600">
            Get all these features and more with Business tier for just ₦3,500/month
          </p>
        </div>
        <button
          onClick={handleUpgrade}
          className="flex-shrink-0 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm hover:shadow-md"
        >
          View Plans
        </button>
      </div>
    </div>
  );
}
