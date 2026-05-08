'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { TicketIcon, BanknotesIcon, CalendarIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { createDiscountAction, State } from '@/app/lib/actions';

export default function CreateDiscountForm({ vendorId }: { vendorId: string }) {
  const initialState: State = { message: null, errors: {} };
  const createWithVendor = createDiscountAction.bind(null, vendorId);
  const [state, formAction] = useActionState(createWithVendor, initialState);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="code" className="mb-2 block text-sm font-medium text-slate-700">
              Discount Code
            </label>
            <div className="relative">
              <input
                id="code"
                name="code"
                type="text"
                placeholder="e.g. SAVE20"
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <TicketIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700">Discount Type</legend>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="percentage"
                  name="discount_type"
                  type="radio"
                  value="percentage"
                  checked={discountType === 'percentage'}
                  onChange={() => setDiscountType('percentage')}
                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="percentage" className="ml-2 text-sm text-slate-700">
                  Percentage (%)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="fixed"
                  name="discount_type"
                  type="radio"
                  value="fixed"
                  checked={discountType === 'fixed'}
                  onChange={() => setDiscountType('fixed')}
                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="fixed" className="ml-2 text-sm text-slate-700">
                  Fixed Amount (₦)
                </label>
              </div>
            </div>
          </fieldset>

          <div>
            <label htmlFor="discount_value" className="mb-2 block text-sm font-medium text-slate-700">
              {discountType === 'percentage' ? 'Percentage Off' : 'Amount Off (NGN)'}
            </label>
            <div className="relative">
              <input
                id="discount_value"
                name="discount_value"
                type="number"
                step={discountType === 'percentage' ? '1' : '0.01'}
                placeholder={discountType === 'percentage' ? '20' : '500.00'}
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              {discountType === 'percentage' ? (
                <HashtagIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              ) : (
                <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              )}
            </div>
          </div>

          <div>
            <label htmlFor="min_purchase" className="mb-2 block text-sm font-medium text-slate-700">
              Minimum Purchase (NGN) - Optional
            </label>
            <div className="relative">
              <input
                id="min_purchase"
                name="min_purchase"
                type="number"
                step="0.01"
                placeholder="0"
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <BanknotesIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label htmlFor="max_uses" className="mb-2 block text-sm font-medium text-slate-700">
              Maximum Uses - Optional
            </label>
            <div className="relative">
              <input
                id="max_uses"
                name="max_uses"
                type="number"
                placeholder="Unlimited"
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <HashtagIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label htmlFor="expires_at" className="mb-2 block text-sm font-medium text-slate-700">
              Expiry Date - Optional
            </label>
            <div className="relative">
              <input
                id="expires_at"
                name="expires_at"
                type="date"
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/discounts"
          className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
        >
          Create Discount
        </button>
      </div>

      {state.message && (
        <p className="mt-2 text-sm text-red-500 font-medium text-center">{state.message}</p>
      )}
    </form>
  );
}
