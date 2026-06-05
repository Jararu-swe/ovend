'use client';

import { VendorSubscriptionInfo } from '@/app/lib/definitions';
import { calculateDaysRemaining } from '@/app/lib/subscription-utils';
import { ClockIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface TrialBannerProps {
  subscription: VendorSubscriptionInfo;
  onAddPaymentMethod?: () => void;
}

export default function TrialBanner({
  subscription,
  onAddPaymentMethod,
}: TrialBannerProps) {
  // Don't render if not on trial
  if (subscription.status !== 'trial') {
    return null;
  }

  const daysRemaining = calculateDaysRemaining(subscription.expires_at);
  const isUrgent = daysRemaining <= 3;

  // Choose styling based on urgency
  const containerClasses = isUrgent
    ? 'bg-orange-50 border-orange-200 text-orange-900'
    : 'bg-blue-50 border-blue-200 text-blue-900';

  const iconColorClasses = isUrgent ? 'text-orange-600' : 'text-blue-600';
  const buttonClasses = isUrgent
    ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white'
    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white';

  return (
    <div
      className={`rounded-lg border p-6 ${containerClasses}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: Icon and message */}
        <div className="flex items-start gap-4">
          <div className={`rounded-lg bg-white p-2 flex-shrink-0`}>
            <ClockIcon className={`h-6 w-6 ${iconColorClasses}`} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {daysRemaining === 1
                ? '1 day remaining in your trial'
                : `${daysRemaining} days remaining in your trial`}
            </h3>
            <p className="mt-1 text-sm opacity-90">
              {isUrgent
                ? 'Your trial is ending soon. Add a payment method to continue accessing premium features.'
                : 'Add a payment method to continue accessing premium features after your trial ends.'}
            </p>
          </div>
        </div>

        {/* Right side: CTA button */}
        {onAddPaymentMethod && (
          <button
            onClick={onAddPaymentMethod}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonClasses}`}
            aria-label="Add payment method to continue subscription after trial"
          >
            <CreditCardIcon className="h-5 w-5" aria-hidden="true" />
            <span>Add Payment Method</span>
          </button>
        )}
      </div>

      {/* Trial expiry countdown for mobile */}
      <div className="mt-4 sm:hidden">
        <div className="flex items-center justify-between rounded-lg bg-white/50 px-4 py-3">
          <span className="text-sm font-medium">Trial ends in:</span>
          <span className="text-lg font-bold">
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
    </div>
  );
}
