'use client';

import { TicketIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ToggleDiscountButton from './toggle-discount-button';
import Link from 'next/link';
import { deleteDiscountAction } from '@/app/lib/actions';

interface Discount {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  uses_count: number;
  active: boolean;
  expires_at: string | null;
}

export default function DiscountList({ discounts }: { discounts: Discount[] }) {

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center py-24">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex flex-col items-center justify-center mb-6">
          <TicketIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No discount codes yet</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          Create promo codes to offer sales and attract more customers to your storefront. Share them exclusively on WhatsApp!
        </p>
        <Link
          href="/dashboard/discounts/create"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400"
        >
          <PlusIcon className="h-4 w-4" />
          Create Discount
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {discounts.map((discount) => {
        const isExpired = discount.expires_at && new Date(discount.expires_at) < new Date();
        const isMaxedOut = discount.max_uses && discount.uses_count >= discount.max_uses;
        
        return (
          <div
            key={discount.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <code className="rounded-lg bg-emerald-50 px-3 py-1.5 text-lg font-bold text-emerald-700">
                    {discount.code}
                  </code>
                  {!discount.active && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      Inactive
                    </span>
                  )}
                  {isExpired && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                      Expired
                    </span>
                  )}
                  {isMaxedOut && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                      Max uses
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Discount:</span>
                <span className="font-semibold text-slate-900">
                  {discount.discount_type === 'percentage'
                    ? `${discount.discount_value}% off`
                    : `₦${(discount.discount_value / 100).toFixed(2)} off`}
                </span>
              </div>

              {discount.min_purchase > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Min. purchase:</span>
                  <span className="font-medium text-slate-900">
                    ₦{(discount.min_purchase / 100).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Uses:</span>
                <span className="font-medium text-slate-900">
                  {discount.uses_count}
                  {discount.max_uses ? ` / ${discount.max_uses}` : ' (unlimited)'}
                </span>
              </div>

              {discount.expires_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Expires:</span>
                  <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>
                    {new Date(discount.expires_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100">
                <ToggleDiscountButton
                  discountId={discount.id}
                  currentStatus={discount.active}
                  disabled={Boolean(isExpired || isMaxedOut)}
                />
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href={`/dashboard/discounts/${discount.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium transition-colors hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-100"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </Link>
                  <form action={deleteDiscountAction.bind(null, discount.id)} className="flex-1">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-500 hover:border-red-100"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
