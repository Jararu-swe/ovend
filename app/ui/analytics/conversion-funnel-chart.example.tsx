/**
 * ConversionFunnelChart Component Usage Example
 * 
 * This file demonstrates how to use the ConversionFunnelChart component
 * in a Business-tier analytics dashboard.
 */

import { ConversionFunnelChart } from '@/app/ui/analytics';
import { fetchConversionFunnel } from '@/app/lib/business-analytics';

/**
 * Example 1: Basic Usage in a Server Component
 * 
 * Fetch conversion funnel data and render the chart
 */
export async function BasicUsageExample({ vendorId }: { vendorId: string }) {
  // Fetch conversion funnel data from database
  const funnel = await fetchConversionFunnel(vendorId, {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Conversion Analytics</h1>
      <ConversionFunnelChart funnel={funnel} />
    </div>
  );
}

/**
 * Example 2: With Loading State
 * 
 * Show skeleton loader while data is being fetched
 */
export function LoadingStateExample() {
  const isLoading = true;
  
  return (
    <ConversionFunnelChart 
      funnel={{
        visits: 0,
        ordersInitiated: 0,
        ordersCompleted: 0,
        visitToOrderRate: 0,
        orderCompletionRate: 0,
        abandonmentRate: 0,
        avgTimeToFulfillment: 0,
      }}
      isLoading={isLoading}
    />
  );
}

/**
 * Example 3: In a Dashboard with Multiple Analytics Components
 */
export async function DashboardExample({ vendorId }: { vendorId: string }) {
  const dateRange = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  // Fetch funnel data
  const funnel = await fetchConversionFunnel(vendorId, dateRange);

  return (
    <div className="space-y-6">
      {/* Other analytics components could go here */}
      
      {/* Conversion Funnel Section */}
      <section>
        <ConversionFunnelChart funnel={funnel} />
      </section>
      
      {/* More analytics sections... */}
    </div>
  );
}

/**
 * Example 4: Mock Data for Testing/Development
 */
export function MockDataExample() {
  const mockFunnel = {
    visits: 5000,
    ordersInitiated: 250,
    ordersCompleted: 200,
    visitToOrderRate: 4.0,
    orderCompletionRate: 80.0,
    abandonmentRate: 20.0,
    avgTimeToFulfillment: 36.5,
  };

  return <ConversionFunnelChart funnel={mockFunnel} />;
}

/**
 * Example 5: Low Conversion Scenario (shows optimization suggestion)
 */
export function LowConversionExample() {
  const lowConversionFunnel = {
    visits: 10000,
    ordersInitiated: 150,
    ordersCompleted: 120,
    visitToOrderRate: 1.2, // Below 2% threshold
    orderCompletionRate: 80.0,
    abandonmentRate: 20.0,
    avgTimeToFulfillment: 24.0,
  };

  return <ConversionFunnelChart funnel={lowConversionFunnel} />;
}

/**
 * Example 6: No Data State
 */
export function NoDataExample() {
  const emptyFunnel = {
    visits: 0,
    ordersInitiated: 0,
    ordersCompleted: 0,
    visitToOrderRate: 0,
    orderCompletionRate: 0,
    abandonmentRate: 0,
    avgTimeToFulfillment: 0,
  };

  return <ConversionFunnelChart funnel={emptyFunnel} />;
}
