import CardWrapper from "@/app/ui/dashboard/cards";
import {
  fetchVendorStats,
  fetchUserById,
  fetchWeeklyAnalytics,
  fetchTopProducts,
} from "@/app/lib/data";
import {
  getVendorNewGuideNotifications,
  getNewGuideNotificationsCount,
} from "@/app/lib/guide-triggers";
import { getVendorSubscription } from "@/app/lib/subscriptions";
import { auth } from "@/auth";
import CopyLinkButton from "@/app/ui/dashboard/copy-link";
import LearningHubSection from "@/app/ui/dashboard/learning-hub-section";
import ContextualGuideBanner from "@/app/ui/dashboard/contextual-guide-banner";
import ProAnalyticsSection from "@/app/ui/dashboard/pro-analytics-section";
import {
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  LinkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const [stats, user, weeklyAnalytics, recommendedGuides, newGuideCount, subscription, topProducts] =
    await Promise.all([
      fetchVendorStats(userId),
      fetchUserById(userId),
      fetchWeeklyAnalytics(userId),
      getVendorNewGuideNotifications(userId),
      getNewGuideNotificationsCount(userId),
      getVendorSubscription(userId),
      fetchTopProducts(userId),
    ]);

  const totalWeeklyVisits = weeklyAnalytics.reduce(
    (sum, day) => sum + Number(day.visits || 0),
    0,
  );
  const totalWeeklyOrders = weeklyAnalytics.reduce(
    (sum, day) => sum + Number(day.orders_count || 0),
    0,
  );
  const totalWeeklyRevenue = weeklyAnalytics.reduce(
    (sum, day) => sum + Number(day.revenue || 0),
    0,
  );
  const conversionRate =
    totalWeeklyVisits > 0
      ? Math.round((totalWeeklyOrders / totalWeeklyVisits) * 100)
      : 0;

  const subscriptionTier = subscription?.tier || 'starter';
  const isProOrBusiness = subscriptionTier === 'pro' || subscriptionTier === 'business';

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 border border-emerald-100/50 p-8 md:p-12">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-emerald-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-slate-100/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Store Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-base text-slate-600 max-w-2xl">
              Here's how your store is performing. Keep sharing to grow your
              sales! 🚀
            </p>
          </div>
          {user?.store_slug && (
            <div className="md:flex-shrink-0">
              <CopyLinkButton slug={user.store_slug} />
            </div>
          )}
        </div>
      </div>

      <ContextualGuideBanner vendorId={userId} currentPage="/dashboard" />

      {/* Stats Cards */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <CardWrapper stats={stats} />
      </section>

      <LearningHubSection
        guides={recommendedGuides}
        newCount={newGuideCount}
      />

      {/* Quick Actions & Live Store */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Quick Actions
            </h3>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="/dashboard/products"
              className="group rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 text-center hover:border-emerald-200 hover:from-emerald-50/50 hover:to-slate-50 transition-all"
            >
              <div className="h-8 w-8 rounded-lg bg-slate-200 group-hover:bg-emerald-200 flex items-center justify-center mx-auto mb-2 transition-colors">
                <ShoppingBagIcon className="h-4 w-4 text-slate-700 group-hover:text-emerald-700" />
              </div>
              <p className="text-sm font-bold text-slate-900">Add Product</p>
              <p className="text-[10px] text-slate-500 mt-1">Update menu</p>
            </a>
            <a
              href="/dashboard/orders"
              className="group rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 text-center hover:border-emerald-200 hover:from-emerald-50/50 hover:to-slate-50 transition-all"
            >
              <div className="h-8 w-8 rounded-lg bg-slate-200 group-hover:bg-emerald-200 flex items-center justify-center mx-auto mb-2 transition-colors">
                <ClipboardDocumentListIcon className="h-4 w-4 text-slate-700 group-hover:text-emerald-700" />
              </div>
              <p className="text-sm font-bold text-slate-900">View Orders</p>
              <p className="text-[10px] text-slate-500 mt-1">Manage sales</p>
            </a>
          </div>
        </div>

        {/* Store Live Card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg hover:shadow-xl transition-shadow text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <LinkIcon className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-lg font-bold mb-2">Your store is live! 🎉</h4>
            <p className="text-sm text-emerald-50 mb-6">
              Share your store link with customers and start receiving orders
              directly.
            </p>
            <a
              href={`/s/${user?.store_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 bg-white rounded-lg px-4 py-2 hover:bg-emerald-50 transition-colors"
            >
              <span>View Store</span>
              <ArrowTrendingUpIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Analytics Section — Gated by subscription tier */}
      <ProAnalyticsSection
        weeklyAnalytics={weeklyAnalytics}
        totalWeeklyVisits={totalWeeklyVisits}
        totalWeeklyOrders={totalWeeklyOrders}
        totalWeeklyRevenue={totalWeeklyRevenue}
        conversionRate={conversionRate}
        topProducts={topProducts}
        isProOrBusiness={isProOrBusiness}
        subscriptionTier={subscriptionTier}
      />
    </div>
  );
}
