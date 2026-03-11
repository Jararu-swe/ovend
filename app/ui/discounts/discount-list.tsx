import { fetchVendorDiscounts } from '@/app/lib/discounts';
import { TicketIcon } from '@heroicons/react/24/outline';
import ToggleDiscountButton from './toggle-discount-button';

export default async function DiscountList({ vendorId }: { vendorId: string }) {
  const discounts = await fetchVendorDiscounts(vendorId);

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <TicketIcon className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No discount codes yet</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          Create discount codes to offer promotions and attract more customers to your store.
        </p>
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
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
                  disabled={isExpired || isMaxedOut}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
