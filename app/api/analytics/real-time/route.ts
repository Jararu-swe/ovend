import { NextRequest, NextResponse } from 'next/server';
import { fetchTodayPerformance } from '@/app/lib/business-analytics';
import { auth } from '@/auth';

/**
 * GET /api/analytics/real-time
 * 
 * Fetches real-time performance data for today with comparisons to yesterday and last week.
 * 
 * Query Parameters:
 * - vendorId: The vendor's unique identifier
 * 
 * Returns:
 * - todayVisits: Current visits today
 * - todayOrders: Current orders today
 * - todayRevenue: Current revenue today (in kobo)
 * - lastHourOrders: Orders in the last hour
 * - comparisonYesterday: Yesterday's same-time metrics
 * - comparisonLastWeek: Same weekday last week metrics
 * - paceIndicator: 'ahead', 'behind', or 'on-track'
 * - lastUpdate: Formatted timestamp of last update
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7, 8.8, 8.10, 12.9
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get vendorId from query parameters
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId is required' },
        { status: 400 }
      );
    }

    // Verify the authenticated user is requesting their own data
    if (session.user.id !== vendorId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only access your own analytics' },
        { status: 403 }
      );
    }

    // Fetch today's performance data
    const performance = await fetchTodayPerformance(vendorId);

    // Format the lastUpdate timestamp for display (Requirement 8.6)
    const formatTimestamp = (isoString: string): string => {
      const date = new Date(isoString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    // Return data in the format expected by RealTimeDashboard component
    return NextResponse.json({
      todayVisits: performance.todayVisits,
      todayOrders: performance.todayOrders,
      todayRevenue: performance.todayRevenue,
      lastHourOrders: performance.lastHourOrders,
      comparisonYesterday: performance.comparisonYesterday,
      comparisonLastWeek: performance.comparisonLastWeek,
      paceIndicator: performance.paceIndicator,
      lastUpdate: formatTimestamp(performance.lastUpdate),
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
