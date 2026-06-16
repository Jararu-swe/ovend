/**
 * Example usage of RealTimeDashboard component
 * 
 * This file demonstrates how to use the RealTimeDashboard component
 * in different scenarios and with various data states.
 */

import RealTimeDashboard from './real-time-dashboard';

// ============================================================================
// Example 1: Normal Operation - Business Performing Well (Ahead)
// ============================================================================

export function RealTimeDashboardAhead() {
  // In actual usage, vendorId comes from auth session
  const vendorId = 'vendor-123';
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Real-Time Dashboard - Ahead</h1>
      <RealTimeDashboard vendorId={vendorId} />
    </div>
  );
}

// ============================================================================
// Example 2: Business Performing Below Yesterday (Behind)
// ============================================================================

export function RealTimeDashboardBehind() {
  // The component will fetch data showing "behind" pace indicator
  // when today's performance is lower than yesterday
  const vendorId = 'vendor-456';
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Real-Time Dashboard - Behind</h1>
      <RealTimeDashboard vendorId={vendorId} />
    </div>
  );
}

// ============================================================================
// Example 3: Business On Track (Similar Performance)
// ============================================================================

export function RealTimeDashboardOnTrack() {
  // When performance is similar to yesterday (within threshold)
  const vendorId = 'vendor-789';
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Real-Time Dashboard - On Track</h1>
      <RealTimeDashboard vendorId={vendorId} />
    </div>
  );
}

// ============================================================================
// Example 4: Integration in Business Analytics Page
// ============================================================================

export function BusinessAnalyticsPageExample() {
  const vendorId = 'vendor-abc';
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Business Analytics</h1>
        <p className="text-slate-600 mb-8">
          Monitor your store&apos;s performance in real-time
        </p>
        
        {/* Real-Time Dashboard at the top */}
        <div className="mb-8">
          <RealTimeDashboard vendorId={vendorId} />
        </div>
        
        {/* Other analytics sections would go below */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64">
            <h3 className="font-bold mb-4">Other Analytics Section 1</h3>
            <p className="text-slate-500">Additional analytics components...</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64">
            <h3 className="font-bold mb-4">Other Analytics Section 2</h3>
            <p className="text-slate-500">Additional analytics components...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: With Loading State (Initial Page Load)
// ============================================================================

export function RealTimeDashboardWithLoadingState() {
  // On initial load, the component shows a skeleton loader
  // while fetching data from the API
  const vendorId = 'vendor-new';
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Real-Time Dashboard - Loading</h1>
      <RealTimeDashboard vendorId={vendorId} />
      <p className="mt-4 text-sm text-slate-500">
        The component shows a loading skeleton on initial load
      </p>
    </div>
  );
}

// ============================================================================
// Example 6: Server Component Integration (Recommended Pattern)
// ============================================================================

/**
 * Recommended usage in a Next.js app directory page.tsx (Server Component)
 * 
 * The RealTimeDashboard is a client component ('use client') that can be
 * rendered from a server component. The vendorId should come from the
 * authenticated session.
 */

// File: app/dashboard/analytics/page.tsx
/*
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RealTimeDashboard from './components/real-time-dashboard';

export default async function AnalyticsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/customer/login');
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Business Analytics</h1>
      
      <div className="space-y-6">
        <RealTimeDashboard vendorId={session.user.id} />
        
        // Other analytics components...
      </div>
    </div>
  );
}
*/

// ============================================================================
// Mock Data Examples (for demonstration)
// ============================================================================

/**
 * Example 1: Strong Performance Data
 */
export const mockStrongPerformance = {
  todayVisits: 250,
  todayOrders: 25,
  todayRevenue: 125000, // ₦1,250
  lastHourOrders: 5,
  comparisonYesterday: {
    visits: 180,
    orders: 18,
    revenue: 90000,
  },
  comparisonLastWeek: {
    visits: 150,
    orders: 15,
    revenue: 75000,
  },
  paceIndicator: 'ahead' as const,
  lastUpdate: '3:45 PM',
};

/**
 * Example 2: Slow Day Data
 */
export const mockSlowPerformance = {
  todayVisits: 80,
  todayOrders: 5,
  todayRevenue: 25000, // ₦250
  lastHourOrders: 0,
  comparisonYesterday: {
    visits: 150,
    orders: 15,
    revenue: 75000,
  },
  comparisonLastWeek: {
    visits: 180,
    orders: 18,
    revenue: 90000,
  },
  paceIndicator: 'behind' as const,
  lastUpdate: '11:30 AM',
};

/**
 * Example 3: Consistent Performance Data
 */
export const mockConsistentPerformance = {
  todayVisits: 150,
  todayOrders: 15,
  todayRevenue: 75000, // ₦750
  lastHourOrders: 2,
  comparisonYesterday: {
    visits: 148,
    orders: 14,
    revenue: 73000,
  },
  comparisonLastWeek: {
    visits: 152,
    orders: 16,
    revenue: 78000,
  },
  paceIndicator: 'on-track' as const,
  lastUpdate: '2:15 PM',
};

/**
 * Example 4: Early Morning Data (Low Activity)
 */
export const mockEarlyMorning = {
  todayVisits: 12,
  todayOrders: 1,
  todayRevenue: 5000, // ₦50
  lastHourOrders: 1,
  comparisonYesterday: {
    visits: 10,
    orders: 1,
    revenue: 4500,
  },
  comparisonLastWeek: {
    visits: 15,
    orders: 2,
    revenue: 8000,
  },
  paceIndicator: 'ahead' as const,
  lastUpdate: '8:00 AM',
};

/**
 * Example 5: Peak Hours Data (High Activity)
 */
export const mockPeakHours = {
  todayVisits: 450,
  todayOrders: 45,
  todayRevenue: 225000, // ₦2,250
  lastHourOrders: 8,
  comparisonYesterday: {
    visits: 380,
    orders: 38,
    revenue: 190000,
  },
  comparisonLastWeek: {
    visits: 420,
    orders: 42,
    revenue: 210000,
  },
  paceIndicator: 'ahead' as const,
  lastUpdate: '6:30 PM',
};

// ============================================================================
// API Response Type Reference
// ============================================================================

/**
 * The RealTimeDashboard component expects the API endpoint
 * /api/analytics/real-time to return data in this format:
 * 
 * GET /api/analytics/real-time?vendorId={vendorId}
 * 
 * Response body:
 * {
 *   todayVisits: number,
 *   todayOrders: number,
 *   todayRevenue: number, // in kobo
 *   lastHourOrders: number,
 *   comparisonYesterday: {
 *     visits: number,
 *     orders: number,
 *     revenue: number // in kobo
 *   },
 *   comparisonLastWeek: {
 *     visits: number,
 *     orders: number,
 *     revenue: number // in kobo
 *   },
 *   paceIndicator: 'ahead' | 'behind' | 'on-track',
 *   lastUpdate: string // formatted time like "2:30 PM"
 * }
 */

// ============================================================================
// Notes for Implementation
// ============================================================================

/**
 * IMPORTANT NOTES:
 * 
 * 1. API Endpoint Required:
 *    - The component polls /api/analytics/real-time every 30 seconds
 *    - Task 9.5 will implement this endpoint
 *    - Until then, the component will show a loading state or error
 * 
 * 2. Authentication:
 *    - The vendorId should come from the authenticated session
 *    - Do not hardcode vendor IDs in production
 * 
 * 3. Polling Behavior:
 *    - Component polls every 30 seconds while mounted
 *    - Cleanup occurs when component unmounts
 *    - No manual refresh needed
 * 
 * 4. Error Handling:
 *    - Shows error state if API fails
 *    - Provides retry button
 *    - Continues polling even after errors (recovers automatically)
 * 
 * 5. Performance:
 *    - API should be fast (< 500ms response time)
 *    - Uses cached data on server side
 *    - Minimal re-renders on client
 * 
 * 6. Responsive Design:
 *    - Works on mobile, tablet, and desktop
 *    - Grid layout adapts to screen size
 *    - Touch-friendly on mobile devices
 */
