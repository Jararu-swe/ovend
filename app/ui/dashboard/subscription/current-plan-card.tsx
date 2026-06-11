'use client';

import { VendorSubscriptionInfo } from '@/app/lib/definitions';
import {
  formatSubscriptionDate,
  getTierDisplayName,
} from '@/app/lib/subscription-utils';
import SubscriptionStatusBadge from './subscription-status-badge';
import { CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface CurrentPlanCardProps {
  subscription: VendorSubscriptionInfo;
  productUsage: {
    current: number;
    limit: number;
    percentage: number;
  };
  onCancelSubscription?: () => void;
}

export default function CurrentPlanCard({
  subscription,
  productUsage,
  onCancelSubscription,
}: CurrentPlanCardProps) {
  const tierName = getTierDisplayName(subscription.tier);
  const isNearLimit = productUsage.percentage >= 90;
  const isPaidSubscription =
    subscription.tier !== 'starter' &&
    (subscription.status === 'active' || subscription.status === 'trial');
  const canCancel =
    subscription.tier !== 'starter' && subscription.status === 'active';

  // Determine the date label and value
  let dateLabel = '';
  let dateValue = '';

  if (subscription.status === 'trial') {
    dateLabel = 'Trial ends on';
    dateValue = formatSubscriptionDate(subscription.expires_at);
  } else if (subscription.status === 'active' && isPaidSubscription) {
    dateLabel = 'Next billing date';
    dateValue = formatSubscriptionDate(subscription.expires_at);
  } else if (subscription.status === 'cancelled') {
    dateLabel = 'Access ends on';
    dateValue = formatSubscriptionDate(subscription.expires_at);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">{tierName} Plan</h2>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        {/* Cancel button - desktop */}
        {canCancel && onCancelSubscription && (
          <button
            onClick={onCancelSubscription}
            className="hidden sm:block rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Cancel subscription"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Subscription Details */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Billing Date */}
        {dateLabel && dateValue && (
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <CalendarIcon className="h-5 w-5 text-slate-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-slate-600">{dateLabel}</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {dateValue}
              </p>
            </div>
          </div>
        )}

        {/* Product Usage */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <svg
              className="h-5 w-5 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Product Usage</p>
            <p
              className={`mt-1 text-base font-semibold ${
                isNearLimit ? 'text-orange-600' : 'text-slate-900'
              }`}
            >
              {productUsage.current}/{productUsage.limit} products used
            </p>
            {/* Progress bar */}
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isNearLimit ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(productUsage.percentage, 100)}%` }}
                role="progressbar"
                aria-valuenow={productUsage.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Product usage: ${productUsage.percentage}% of limit`}
              />
            </div>
          </div>
        </div>

        {/* Transaction Fee */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <CreditCardIcon
              className="h-5 w-5 text-slate-600"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-sm text-slate-600">Transaction Fee</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {subscription.plan.transaction_fee_percentage}% per transaction
            </p>
          </div>
        </div>
      </div>

      {/* Warning message for near-limit usage */}
      {isNearLimit && (
        <div className="mt-6 rounded-lg bg-orange-50 border border-orange-200 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                You're approaching your product limit
              </p>
              <p className="mt-1 text-sm text-orange-700">
                Consider upgrading to a higher tier to add more products to your
                store.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancel button - mobile */}
      {canCancel && onCancelSubscription && (
        <button
          onClick={onCancelSubscription}
          className="mt-6 w-full sm:hidden rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Cancel subscription"
        >
          Cancel Subscription
        </button>
      )}
    </div>
  );
}
