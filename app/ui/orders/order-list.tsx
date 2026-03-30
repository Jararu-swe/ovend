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

  const getWhatsAppUrl = (order: Order) => {
    const itemsArray: any[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const itemsText = itemsArray.map(i => `${i.quantity}x ${i.name}`).join('%0A- ');
    const message = `Hello ${order.customer_name}!%0A%0AThank you for your order.%0AHere is a quick summary:%0A- ${itemsText}%0A%0ATotal: ${formatCurrency(order.total_amount)}%0A%0AWe are processing this right away!`;
    
    // Naively format Nigerian phone numbers for MVP
    let phone = order.customer_phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '234' + phone.substring(1);
    }
    return `https://wa.me/${phone}?text=${message}`;
  };

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
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex flex-col items-center justify-center mb-4">
               <ClockIcon className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Orders Yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              Your orders will appear here once customers start checking out from your public storefront.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClockIcon className="h-12 w-12 text-slate-200" />
            <p className="mt-4 text-slate-500">No {filter.toLowerCase()} orders found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((order) => {
              const parsedItems: any[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              return (
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
                        {parsedItems.length} {parsedItems.length === 1 ? 'item' : 'items'} • {new Date(order.created_at).toLocaleDateString()}
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
                          {parsedItems.map((item, idx) => (
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
                          <p className="text-sm text-slate-900 font-bold">{order.customer_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-slate-600">{order.customer_phone}</p>
                            <a 
                              href={getWhatsAppUrl(order)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-[#25D366] px-2 py-1 text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-105"
                            >
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                              Chat on WhatsApp
                            </a>
                          </div>
                          <p className="text-sm text-slate-500 mt-2">{order.customer_address || 'No address provided'}</p>
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
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
