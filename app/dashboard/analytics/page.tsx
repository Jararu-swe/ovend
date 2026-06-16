import { auth } from '@/auth';
import { getVendorSubscription } from '@/app/lib/subscriptions';
import { redirect } from 'next/navigation';
import BusinessAnalyticsDashboard from './business-analytics-dashboard';
import ProAnalyticsView from './pro-analytics-view';
import { sql } from '@/app/lib/db';

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/customer/login');
  }

  const subscription = await getVendorSubscription(session.user.id);
  const tier = subscription?.tier || 'starter';

  // Get unique categories for the vendor
  const categoriesResult = await sql`
    SELECT DISTINCT category
    FROM products
    WHERE vendor_id = ${session.user.id}
      AND status = 'active'
      AND category IS NOT NULL
      AND category != ''
    ORDER BY category
  `;
  const categories = categoriesResult.map((row: any) => row.category);

  // Business tier: Full analytics
  if (tier === 'business') {
    return <BusinessAnalyticsDashboard vendorId={session.user.id} categories={categories} />;
  }

  // Pro tier: Basic analytics with upgrade prompts
  return <ProAnalyticsView vendorId={session.user.id} tier={tier} />;
}
