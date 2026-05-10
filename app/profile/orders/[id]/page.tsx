import { auth } from '@/auth';
import { sql } from '@/app/lib/db';
import { formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import ProfileOrderMap from '@/app/ui/profile/order-map-wrapper';
import { notFound } from 'next/navigation';

export default async function OrderDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  const session = await auth();
  const customerId = session?.user?.id;

  if (!customerId) return null;

  const [order] = await sql`
    SELECT *
    FROM orders 
    WHERE id = ${id} AND customer_account_id = ${customerId}
    LIMIT 1
  `;

  if (!order) {
    notFound();
  }

  const items = JSON.parse(order.items || '[]');

  return (
    <main className="max-w-3xl">
      <div className="mb-6">
        <Link href="/profile/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition mb-4">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Orders
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          Order #{order.id.slice(0, 8)}
          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
            order.status === 'new' ? 'bg-sky-100 text-sky-700' :
            order.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
            order.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {order.status.replace('_', ' ')}
          </span>
        </h1>
        <p className="mt-1 text-slate-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
      </div>

      <div className="space-y-6">
        {/* Tracker */}
        {order.delivery_type === 'delivery' && order.delivery_latitude && order.delivery_longitude && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-emerald-500" /> Delivery Location
            </h2>
            <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
              <ProfileOrderMap lat={order.delivery_latitude} lng={order.delivery_longitude} />
            </div>
            {order.delivery_address_details && (
              <p className="mt-4 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-bold block text-slate-900 mb-1">Instructions:</span>
                {order.delivery_address_details}
              </p>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-900">Order Summary</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {items.map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                      {item.quantity}x
                    </div>
                    <span className="font-medium text-slate-900">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Payment Method</span>
                <span className="font-medium capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Delivery Type</span>
                <span className="font-medium capitalize">{order.delivery_type}</span>
              </div>
              {order.discount_code && (
                <div className="flex justify-between text-sm text-emerald-600 font-bold">
                  <span>Discount ({order.discount_code})</span>
                  <span>-{formatCurrency(order.discount_amount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-100 mt-4">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
