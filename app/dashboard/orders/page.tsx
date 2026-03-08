import { auth } from '@/auth';
import { fetchOrdersList } from '@/app/lib/data';
import OrderList from '@/app/ui/orders/order-list';

export default async function OrdersPage() {
  const session = await auth();
  const orders = await fetchOrdersList(session?.user?.id!);

  return (
    <div className="space-y-6">
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
