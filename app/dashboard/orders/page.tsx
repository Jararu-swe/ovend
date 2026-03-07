import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const statusStyles: Record<string, string> = {
  New: 'bg-sky-100 text-sky-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Fulfilled: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-600',
};

const orders = [
  { id: '#ORD-001', customer: 'Amaka Obi', phone: '08031234567', product: 'Ankara two-piece set', amount: '₦12,500', status: 'New', date: 'Mar 6, 2026' },
  { id: '#ORD-002', customer: 'Tunde Bello', phone: '07098765432', product: 'Leather crossbody bag', amount: '₦8,200', status: 'In Progress', date: 'Mar 6, 2026' },
  { id: '#ORD-003', customer: 'Ngozi Eze', phone: '09011223344', product: 'Beaded bracelet set', amount: '₦3,700', status: 'Fulfilled', date: 'Mar 5, 2026' },
  { id: '#ORD-004', customer: 'Chidi Okafor', phone: '08155667788', product: 'Agbada kaftan (XL)', amount: '₦22,000', status: 'New', date: 'Mar 5, 2026' },
  { id: '#ORD-005', customer: 'Fatima Abubakar', phone: '07066778899', product: 'Handwoven tote', amount: '₦6,500', status: 'Fulfilled', date: 'Mar 4, 2026' },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage and track all incoming customer orders.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'New', 'In Progress', 'Fulfilled', 'Cancelled'].map((f) => (
          <button
            key={f}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              f === 'All'
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Desktop table */}
        <table className="hidden w-full text-sm md:table">
          <thead className="bg-slate-50 text-left">
            <tr>
              {['Order', 'Customer', 'Phone', 'Product', 'Amount', 'Status', 'Date'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                <td className="px-5 py-4 font-mono text-xs text-slate-500">{order.id}</td>
                <td className="px-5 py-4 font-medium text-slate-800">{order.customer}</td>
                <td className="px-5 py-4 text-slate-500">{order.phone}</td>
                <td className="px-5 py-4 text-slate-600">{order.product}</td>
                <td className="px-5 py-4 font-semibold text-slate-900">{order.amount}</td>
                <td className="px-5 py-4">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile list */}
        <ul className="divide-y divide-slate-100 md:hidden">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-slate-800">{order.customer}</p>
                <p className="text-xs text-slate-500">{order.product}</p>
                <p className="text-xs text-slate-400 mt-0.5">{order.date}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-semibold text-slate-900 text-sm">{order.amount}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[order.status]}`}>
                  {order.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
