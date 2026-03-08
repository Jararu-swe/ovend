import CardWrapper from '@/app/ui/dashboard/cards';
import { fetchVendorStats, fetchUserById } from '@/app/lib/data';
import { auth } from '@/auth';
import CopyLinkButton from '@/app/ui/dashboard/copy-link';

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return null;
  }

  const [stats, user] = await Promise.all([
    fetchVendorStats(userId),
    fetchUserById(userId),
  ]);

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
    </div>
  );
}