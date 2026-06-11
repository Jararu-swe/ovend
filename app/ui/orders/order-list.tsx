'use client';

import { useState } from 'react';
import { Order } from '@/app/lib/definitions';
import { formatCurrency } from '@/app/lib/utils';
import { updateOrderStatus } from '@/app/lib/actions';
import { ChevronDownIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PlayCircleIcon, MapPinIcon, ShareIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

const OrderMap = dynamic(() => import('./order-map'), { ssr: false });

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
  const [searchQuery, setSearchQuery] = useState('');

  const getWhatsAppUrl = (order: Order) => {
    try {
      const itemsArray: any[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      // Ensure itemsArray is an array
      if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
        return '#';
      }
      const itemsText = itemsArray.map(i => `${i.quantity}x ${i.name}`).join('\n- ');
      let locationText = '';
      if (order.delivery_type === 'pickup') {
        locationText = `\n\n📍 Pickup Location`;
        if (order.vendor_pickup_latitude && order.vendor_pickup_longitude) {
          locationText += `\nMaps: https://www.google.com/maps/search/?api=1&query=${order.vendor_pickup_latitude},${order.vendor_pickup_longitude}`;
        }
        if (order.vendor_pickup_address_details) {
          locationText += `\nNote: ${order.vendor_pickup_address_details}`;
        }
      } else if (order.delivery_latitude && order.delivery_longitude) {
        locationText = `\n\nDelivery Location: https://www.google.com/maps/search/?api=1&query=${order.delivery_latitude},${order.delivery_longitude}`;
      }
      const message = `Hello ${order.customer_name}!\n\nThank you for your order.\n\n📦 Order ID: ${order.id.slice(0, 8)}\n\nHere is a quick summary:\n- ${itemsText}\n\nTotal: ${formatCurrency(order.total_amount)}${locationText}\n\nWe are processing this right away!`;
      
      // Format Nigerian phone numbers to international format
      const phone = order.customer_phone.replace(/\D/g, '').replace(/^0/, '234');
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    } catch (error) {
      console.error('Error generating WhatsApp URL:', error);
      return '#';
    }
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  const handleShareLocation = (order: Order) => {
    if (!order.delivery_latitude || !order.delivery_longitude) return;
    const url = getGoogleMapsUrl(order.delivery_latitude, order.delivery_longitude);
    const text = `Delivery Location for ${order.customer_name}: ${url}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Order #${order.id.slice(0, 8)} Location`,
        text: text,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Location link copied to clipboard!');
      });
    }
  };

  // Define filter logic
  const getFilteredOrders = () => {
    let result: Order[];
    switch (filter) {
      case 'New':
        result = orders.filter(order => order.status === 'new');
        break;
      case 'In Progress':
        result = orders.filter(order => order.status === 'in_progress');
        break;
      case 'Fulfilled':
        result = orders.filter(order => order.status === 'fulfilled');
        break;
      case 'History':
        result = orders.filter(order => order.status === 'fulfilled');
        break;
      case 'All':
      default:
        result = orders.filter(order => order.status !== 'cancelled');
        break;
    }

    // Apply search query on History tab
    if (filter === 'History' && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(order =>
        order.id.toLowerCase().startsWith(q) ||
        order.customer_name.toLowerCase().includes(q)
      );
    }

    return result;
  };

  const filteredOrders = getFilteredOrders();

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
        {['All', 'New', 'In Progress', 'Fulfilled', 'History'].map((f) => (
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

      {/* Order ID search for History tab */}
      {filter === 'History' && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Order ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      )}

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
              let parsedItems: any[] = [];
              try {
                parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                // Ensure parsedItems is an array
                if (!Array.isArray(parsedItems)) {
                  parsedItems = [];
                }
              } catch (error) {
                console.error('Error parsing order items:', error);
                parsedItems = [];
              }
              
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
                        {parsedItems.length} {parsedItems.length === 1 ? 'item' : 'items'} • {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
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
                        {order.discount_code && order.discount_amount && order.discount_amount > 0 ? (
                          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span className="font-medium">{formatCurrency(parsedItems.reduce((acc, item) => acc + item.price * item.quantity, 0))}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Discount ({order.discount_code})</span>
                              <span>-{formatCurrency(order.discount_amount)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-dashed border-slate-200">
                              <span>Total Paid</span>
                              <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                            <span>Total</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h5 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Customer Details</h5>
                          <p className="text-xs font-mono text-slate-400 mb-1">Order ID: {order.id.slice(0, 8)}</p>
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
                          <p className="text-sm text-slate-500 mt-2">{order.customer_address || 'No general address provided'}</p>
                          {order.delivery_address_details && (
                            <p className="text-xs text-slate-400 mt-1 italic">Note: {order.delivery_address_details}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                              {order.delivery_type}
                            </span>
                            {(order.delivery_type === 'pickup' ? (order.vendor_pickup_latitude) : (order.delivery_latitude)) && (
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-tight flex items-center gap-1">
                                <MapPinIcon className="h-3 w-3" /> Pin Set
                              </span>
                            )}
                          </div>

                          {/* Pickup Location Display */}
                          {order.delivery_type === 'pickup' && order.vendor_pickup_latitude && order.vendor_pickup_longitude && (
                            <div className="mt-4 space-y-3">
                              <h6 className="text-xs font-bold text-slate-700">Pickup Location</h6>
                              <div className="h-40 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
                                <OrderMap lat={Number(order.vendor_pickup_latitude)} lng={Number(order.vendor_pickup_longitude)} />
                                <a  
                                  href={getGoogleMapsUrl(order.vendor_pickup_latitude!, order.vendor_pickup_longitude!)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/0 hover:bg-slate-900/10 transition-colors group/maplink"
                                >
                                  <span className="bg-white/90 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-700 shadow-lg opacity-0 group-hover/maplink:opacity-100 transition-opacity">
                                    Open in Google Maps
                                  </span>
                                </a>
                              </div>
                              {order.vendor_pickup_address_details && (
                                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  {order.vendor_pickup_address_details}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const url = getGoogleMapsUrl(order.vendor_pickup_latitude!, order.vendor_pickup_longitude!);
                                    const text = `📍 Pickup Location for ${order.customer_name}: ${url}`;
                                    if (navigator.share) {
                                      navigator.share({ title: `Order #${order.id.slice(0, 8)} Pickup Location`, text, url }).catch(console.error);
                                    } else {
                                      navigator.clipboard.writeText(text).then(() => alert('Location link copied to clipboard!'));
                                    }
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                                >
                                  <ShareIcon className="h-4 w-4" /> Share with Rider
                                </button>
                                <a
                                  href={getGoogleMapsUrl(order.vendor_pickup_latitude!, order.vendor_pickup_longitude!)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                >
                                  <MapPinIcon className="h-4 w-4 text-emerald-500" /> Google Maps
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Delivery Location Display */}
                          {order.delivery_type === 'delivery' && order.delivery_latitude && order.delivery_longitude && (
                            <div className="mt-4 space-y-3">
                              <h6 className="text-xs font-bold text-slate-700">Delivery Location</h6>
                              
                              {/* Coordinates badge */}
                              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 text-xs font-mono text-slate-600">
                                <MapPinIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span className="font-medium">{Number(order.delivery_latitude).toFixed(4)}, {Number(order.delivery_longitude).toFixed(4)}</span>
                              </div>

                              <div className="h-40 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
                                <OrderMap lat={Number(order.delivery_latitude)} lng={Number(order.delivery_longitude)} />
                                <a  
                                  href={getGoogleMapsUrl(order.delivery_latitude!, order.delivery_longitude!)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/0 hover:bg-slate-900/10 transition-colors group/maplink"
                                >
                                  <span className="bg-white/90 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-700 shadow-lg opacity-0 group-hover/maplink:opacity-100 transition-opacity">
                                    Open in Google Maps
                                  </span>
                                </a>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleShareLocation(order)}
                                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                                >
                                  <ShareIcon className="h-4 w-4" /> Share with Courier
                                </button>
                                <a
                                  href={getGoogleMapsUrl(order.delivery_latitude!, order.delivery_longitude!)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                >
                                  <MapPinIcon className="h-4 w-4 text-emerald-500" /> Google Maps
                                </a>
                              </div>
                            </div>
                          )}
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
