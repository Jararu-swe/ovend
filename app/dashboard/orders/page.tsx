import { auth } from '@/auth';
import { fetchOrdersList } from '@/app/lib/data';
import OrderList from '@/app/ui/orders/order-list';
import ContextualGuideBanner from '@/app/ui/dashboard/contextual-guide-banner';

export default async function OrdersPage() {
  const session = await auth();
  const vendorId = session?.user?.id!;
  const orders = await fetchOrdersList(vendorId);

  return (
    <div className="space-y-6">
      {vendorId && (
        <ContextualGuideBanner
          vendorId={vendorId}
          currentPage="/dashboard/orders"
        />
      )}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track all incoming customer orders.
        </p>
      </div>

      <OrderList orders={orders} />
    </div>
  );
}
