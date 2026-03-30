import CardWrapper from '@/app/ui/dashboard/cards';
import { fetchVendorStats, fetchUserById, fetchWeeklyAnalytics } from '@/app/lib/data';
import { auth } from '@/auth';
import CopyLinkButton from '@/app/ui/dashboard/copy-link';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/app/lib/utils';

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return null;
  }

  const [stats, user, weeklyAnalytics] = await Promise.all([
    fetchVendorStats(userId),
    fetchUserById(userId),
    fetchWeeklyAnalytics(userId),
  ]);

  const totalWeeklyVisits = weeklyAnalytics.reduce((sum, day) => sum + Number(day.visits || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user?.name}. Here's how your store is doing.
          </p>
        </div>
        {user?.store_slug && <CopyLinkButton slug={user.store_slug} />}
      </div>

      <section className="grid gap-6 md:grid-cols-4">
        <CardWrapper stats={stats} />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
             <a href="/dashboard/products" className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center hover:bg-slate-100 transition">
                <p className="text-sm font-bold text-slate-900">Add Product</p>
                <p className="text-[10px] text-slate-500 mt-1">Update your menu</p>
             </a>
             <a href="/dashboard/orders" className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center hover:bg-slate-100 transition">
                <p className="text-sm font-bold text-slate-900">View Orders</p>
                <p className="text-[10px] text-slate-500 mt-1">Manage sales</p>
             </a>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <h4 className="text-lg font-bold text-emerald-900">Your store is live!</h4>
            <p className="text-sm text-emerald-700 mt-2 max-w-[240px]">
              Share your store link with customers to start receiving orders directly on WhatsApp.
            </p>
            <div className="mt-6 flex gap-3">
               <a 
                href={`/s/${user?.store_slug}`} 
                target="_blank" 
                className="text-sm font-bold text-emerald-600 hover:text-emerald-500 underline"
               >
                 View Public Store
               </a>
            </div>
        </div>
      </div>

      {weeklyAnalytics.length > 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ChartBarIcon className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Last 7 Days</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{totalWeeklyVisits}</p>
              <p className="text-xs text-slate-500 mt-1">Store Visits</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {weeklyAnalytics.reduce((sum, day) => sum + Number(day.orders_count || 0), 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Orders</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(weeklyAnalytics.reduce((sum, day) => sum + Number(day.revenue || 0), 0))}
              </p>
              <p className="text-xs text-slate-500 mt-1">Revenue</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {totalWeeklyVisits > 0 ? Math.round((weeklyAnalytics.reduce((sum, day) => sum + Number(day.orders_count || 0), 0) / totalWeeklyVisits) * 100) : 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1">Conversion</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Analytics Yet</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Once you start sharing your store link, you'll see your store visits, orders, and revenue here.
          </p>
        </div>
      )}
    </div>
  );
}