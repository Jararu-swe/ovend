'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  PhoneIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/app/lib/utils';

type TrackedOrder = {
  id: string;
  store_name: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  total_amount: number;
  status: string;
  items: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  discount_code?: string;
  discount_amount?: number;
};

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) return;

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/track-order?id=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (data.order) {
        setOrder(data.order);
      } else {
        setError('No order found. Double-check your Order ID and phone number.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
    new: { label: 'Order Received', color: 'text-blue-700', icon: <ClipboardDocumentIcon className="h-5 w-5" />, bg: 'bg-blue-50 border-blue-200' },
    in_progress: { label: 'Being Prepared', color: 'text-amber-700', icon: <ArrowPathIcon className="h-5 w-5" />, bg: 'bg-amber-50 border-amber-200' },
    fulfilled: { label: 'Fulfilled', color: 'text-emerald-700', icon: <CheckCircleIcon className="h-5 w-5" />, bg: 'bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'Cancelled', color: 'text-red-700', icon: <XCircleIcon className="h-5 w-5" />, bg: 'bg-red-50 border-red-200' },
  };

  let parsedItems: any[] = [];
  if (order) {
    try {
      parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    } catch { parsedItems = []; }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Image src="/brandname.svg" alt="Vendle" width={100} height={32} priority />
          </Link>
          <Link href="/explore" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition">
            Browse Stores
          </Link>
          <Link href="/profile" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition">
            My Profile
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-4 mb-5">
            <TruckIcon className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Track Your Order</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Enter your Order ID and phone number to check your order status.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Order ID</label>
            <div className="relative">
              <ClipboardDocumentIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. abc12345"
                required
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">The first 8 characters of your order ID (shown after checkout)</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                required
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 border border-red-100">
              <XCircleIcon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-4 w-4" />
                Track Order
              </>
            )}
          </button>
        </form>

        {/* Order Result */}
        {order && (
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Status banner */}
            <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${statusConfig[order.status]?.bg || 'bg-slate-50 border-slate-200'}`}>
              <div className={statusConfig[order.status]?.color || 'text-slate-600'}>
                {statusConfig[order.status]?.icon || <ClockIcon className="h-5 w-5" />}
              </div>
              <div>
                <p className={`font-bold ${statusConfig[order.status]?.color || 'text-slate-700'}`}>
                  {statusConfig[order.status]?.label || order.status}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Order details */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Order from {order.store_name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{order.id.slice(0, 8)}</span>
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {parsedItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">
                      <span className="font-semibold">{item.quantity}×</span> {item.name}
                    </span>
                    <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {order.discount_code && order.discount_amount && order.discount_amount > 0 && (
                <div className="px-5 py-2 border-t border-dashed border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-emerald-600 font-semibold">Discount ({order.discount_code})</span>
                  <span className="text-emerald-600 font-bold">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}

              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-lg font-black text-slate-900">{formatCurrency(order.total_amount)}</span>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Payment</span>
                  <p className="text-slate-700 font-bold mt-0.5 capitalize">{order.payment_method} · {order.payment_status}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Delivery</span>
                  <p className="text-slate-700 font-bold mt-0.5 capitalize">{order.delivery_type}</p>
                </div>
              </div>
            </div>

            {/* Profile CTA */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-emerald-900 text-sm">Have an account?</p>
                <p className="text-xs text-emerald-700 mt-0.5">Sign in to see your full order history and track all deliveries in one place.</p>
              </div>
              <Link
                href="/profile"
                className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition"
              >
                My Profile
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
