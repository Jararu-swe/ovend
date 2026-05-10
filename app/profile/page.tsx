import { auth } from '@/auth';
import { sql } from '@/app/lib/db';
import { formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';

export default async function ProfileDashboard() {
  const session = await auth();
  const customerId = session?.user?.id;

  if (!customerId) return null;

  // Fetch quick stats
  const result = await sql`
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(total_amount), 0) as total_spent
    FROM orders 
    WHERE customer_account_id = ${customerId}
  `;
  
  const stats = result[0] || { total_orders: 0, total_spent: 0 };

  // Fetch recent orders
  const recentOrders = await sql`
    SELECT id, created_at, total_amount, status 
    FROM orders 
    WHERE customer_account_id = ${customerId}
    ORDER BY created_at DESC
    LIMIT 3
  `;

  return (
    <main className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {session?.user?.name}!</h1>
        <p className="mt-1 text-slate-500">Here's what's happening with your purchases.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Total Orders</h2>
          <p className="mt-2 text-3xl font-black text-slate-900">{stats.total_orders}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Total Spent</h2>
          <p className="mt-2 text-3xl font-black text-slate-900">{formatCurrency(stats.total_spent)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
          <Link href="/profile/orders" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View all →
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-6">
                <div>
                  <p className="font-bold text-slate-900">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                  <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-bold capitalize ${
                    order.status === 'new' ? 'bg-sky-100 text-sky-700' :
                    order.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
