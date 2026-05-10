import { auth } from '@/auth';
import { sql } from '@/app/lib/db';
import { formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default async function OrderHistory() {
  const session = await auth();
  const customerId = session?.user?.id;

  if (!customerId) return null;

  const orders = await sql`
    SELECT id, created_at, total_amount, status, items
    FROM orders 
    WHERE customer_account_id = ${customerId}
    ORDER BY created_at DESC
  `;

  return (
    <main className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
        <p className="mt-1 text-slate-500">View and track all your past purchases.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-lg font-bold text-slate-900">No orders yet</p>
            <p className="mt-2 text-slate-500">When you buy something, it will appear here.</p>
            <Link href="/" className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700">
              Explore Stores
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => {
              const items = JSON.parse(order.items || '[]');
              const firstItem = items[0]?.name || 'Unknown Item';
              const moreItemsCount = items.length > 1 ? items.length - 1 : 0;

              return (
                <Link key={order.id} href={`/profile/orders/${order.id}`} className="flex items-center justify-between p-6 hover:bg-slate-50 transition group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-slate-900">Order #{order.id.slice(0, 8)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${
                        order.status === 'new' ? 'bg-sky-100 text-sky-700' :
                        order.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()} • {formatCurrency(order.total_amount)}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {firstItem} {moreItemsCount > 0 && <span className="text-slate-400">+{moreItemsCount} more</span>}
                    </p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-emerald-500 transition" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
