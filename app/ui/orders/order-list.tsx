'use client';

import { useState } from 'react';
import { Order } from '@/app/lib/definitions';
import { formatCurrency } from '@/app/lib/utils';
import { updateOrderStatus } from '@/app/lib/actions';
import { ChevronDownIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

const statusStyles: Record<string, string> = {
  new: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-amber-100 text-amber-700',
  fulfilled: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export default function OrderList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = filter === 'All' 
    ? orders 
    : orders.filter(order => statusLabels[order.status] === filter);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'New', 'In Progress', 'Fulfilled', 'Cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
              filter === f
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClockIcon className="h-12 w-12 text-slate-200" />
            <p className="mt-4 text-slate-500">No {filter === 'All' ? '' : filter.toLowerCase() + ' '}orders found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => (
              <div key={order.id} className="group">
                <div 
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-2.5 w-2.5 rounded-full ${order.status === 'new' ? 'bg-sky-500 animate-pulse' : 'bg-slate-200'}`} />
                    <div>
                      <h4 className="font-bold text-slate-900">{order.customer_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="bg-slate-50/50 px-6 py-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Order Items</h5>
                        <ul className="space-y-3">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-slate-700">
                                <span className="font-bold text-slate-900">{item.quantity}x</span> {item.name}
                              </span>
                              <span className="font-medium text-slate-600">{formatCurrency(item.price * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                          <span>Total</span>
                          <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Customer Details</h5>
                          <p className="text-sm text-slate-900 font-medium">{order.customer_name}</p>
                          <p className="text-sm text-slate-600">{order.customer_phone}</p>
                          <p className="text-sm text-slate-500 mt-1">{order.customer_address || 'No address provided'}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                            {order.delivery_type}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Update Order Status</h5>
                          <div className="flex gap-2 flex-wrap text-xs">
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition"
                            >
                              <PlayCircleIcon className="h-4 w-4" /> Start
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'fulfilled')}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition"
                            >
                              <CheckCircleIcon className="h-4 w-4" /> Fulfilled
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition"
                            >
                              <XCircleIcon className="h-4 w-4" /> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
