import { auth } from '@/auth';
import { fetchUserById, fetchVendorStats } from '@/app/lib/data';
import { getVendorSubscription, getSubscriptionPlans } from '@/app/lib/subscriptions';
import { sql } from '@/app/lib/db';
import PayoutCard from '@/app/ui/dashboard/payout-card';
import PayoutHistory from '@/app/ui/dashboard/payout-history';
import { fetchVendorPayouts, fetchVendorAvailableBalance } from '@/app/lib/payouts';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SubscriptionPayment } from '@/app/lib/definitions';

// New subscription components
import TrialBanner from '@/app/ui/dashboard/subscription/trial-banner';
import GracePeriodWarning from '@/app/ui/dashboard/subscription/grace-period-warning';
import CurrentPlanCard from '@/app/ui/dashboard/subscription/current-plan-card';
import TierComparison from '@/app/ui/dashboard/subscription/tier-comparison';
import PaymentHistorySection from '@/app/ui/dashboard/subscription/payment-history-section';
import PaymentVerifier from '@/app/ui/dashboard/subscription/payment-verifier';
import PaystackScript from '@/app/ui/dashboard/subscription/paystack-script';

export const metadata: Metadata = {
  title: 'Billing',
};

/**
 * Fetch subscription payment history for a vendor
 */
async function fetchSubscriptionPayments(
  vendorId: string
): Promise<SubscriptionPayment[]> {
  try {
    const payments = await sql<SubscriptionPayment[]>`
      SELECT 
        id,
        vendor_id,
        amount_kobo,
        reference,
        tier,
        status,
        billing_period_start,
        billing_period_end,
        paid_at,
        created_at
      FROM vendor_subscription_payments
      WHERE vendor_id = ${vendorId}
        AND status = 'paid'
      ORDER BY paid_at DESC
      LIMIT 50
    `;

    return payments;
  } catch (error) {
    console.error('Error fetching subscription payments:', error);
    return [];
  }
}

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await fetchUserById(session.user.id);
  if (!user) notFound();

  try {
    // Fetch subscription data
    const [subscription, plans, stats, payouts, subscriptionPayments, productCount, availableBalance] =
      await Promise.all([
        getVendorSubscription(session.user.id),
        getSubscriptionPlans(),
        fetchVendorStats(session.user.id).catch(() => ({
          numberOfOrders: 0,
          totalRevenue: 0,
          numberOfProducts: 0,
          numberOfPendingOrders: 0,
        })),
        fetchVendorPayouts(session.user.id).catch(() => []),
        fetchSubscriptionPayments(session.user.id),
        sql`SELECT COUNT(*) as count FROM products WHERE vendor_id = ${session.user.id} AND status = 'active'`.then(
          (result) => Number(result[0]?.count || 0)
        ),
        fetchVendorAvailableBalance(session.user.id).catch(() => 0),
      ]);

    if (!subscription) {
      // Fallback if subscription data not found
      return (
        <>
          <PaystackScript />
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Billing & Subscription
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your subscription and billing information.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Unable to load subscription information. Please refresh the page or
                contact support.
              </p>
            </div>
          </div>
        </>
      );
    }

    // Calculate product usage
    const productUsage = {
      current: productCount,
      limit: subscription.plan.product_limit,
      percentage: (productCount / subscription.plan.product_limit) * 100,
    };

    // Determine if user can start trial (never had paid subscription)
    const canStartTrial = subscriptionPayments.length === 0;

    return (
      <>
        <PaystackScript />
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Billing & Payouts
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your subscription and request earnings payouts.
            </p>
          </div>

          {/* Payment Verifier - Handles redirect from Paystack */}
          <Suspense fallback={null}>
            <PaymentVerifier />
          </Suspense>

          {/* Trial Banner - Only show if status is 'trial' */}
          {subscription.status === 'trial' && (
            <TrialBanner subscription={subscription} />
          )}

          {/* Grace Period Warning - Only show if status is 'past_due' */}
          {subscription.status === 'past_due' && (
            <GracePeriodWarning subscription={subscription} />
          )}

          {/* Payouts Section - Keep existing payout components */}
          <PayoutCard 
            user={user} 
            balance={availableBalance}
            transactionFeePercentage={subscription.plan.transaction_fee_percentage}
          />

          {payouts.length > 0 && <PayoutHistory payouts={payouts} />}

          {/* Subscription Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Subscription Management
            </h2>

            {/* Current Plan Card */}
            <CurrentPlanCard
              subscription={subscription}
              productUsage={productUsage}
            />

            {/* Tier Comparison */}
            <div className="mt-6">
              <TierComparison
                plans={plans}
                currentTier={subscription.tier}
                currentStatus={subscription.status}
                canStartTrial={canStartTrial}
                subscription={subscription}
              />
            </div>

            {/* Payment History */}
            {subscriptionPayments.length > 0 && (
              <PaymentHistorySection payments={subscriptionPayments} />
            )}
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Billing page error:', error);
    // Fallback error page
    return (
      <>
        <PaystackScript />
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Billing & Payouts
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your subscription and request earnings payouts.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              An error occurred while loading the billing page. Please try again
              later.
            </p>
          </div>
        </div>
      </>
    );
  }
}
