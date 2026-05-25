import { auth } from "@/auth";
import { fetchUserById, fetchVendorStats } from "@/app/lib/data";
import SubscriptionPayCard from "@/app/ui/dashboard/subscription-pay-card";
import PayoutCard from "@/app/ui/dashboard/payout-card";
import PayoutHistory from "@/app/ui/dashboard/payout-history";
import { fetchVendorPayouts } from "@/app/lib/payouts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user, stats, payouts] = await Promise.all([
    fetchUserById(session.user.id),
    fetchVendorStats(session.user.id),
    fetchVendorPayouts(session.user.id),
  ]);

  if (!user) notFound();

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Billing & Payouts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your subscription and request earnings payouts.
          </p>
        </div>

        <PayoutCard user={user} balance={stats.totalRevenue} />

        {payouts.length > 0 && <PayoutHistory payouts={payouts} />}

        <SubscriptionPayCard user={user} />
      </div>
    </>
  );
}
