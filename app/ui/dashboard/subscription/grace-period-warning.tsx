'use client';

import { VendorSubscriptionInfo } from '@/app/lib/definitions';
import { calculateDaysRemaining, formatSubscriptionDate } from '@/app/lib/subscription-utils';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface GracePeriodWarningProps {
  subscription: VendorSubscriptionInfo;
}

export default function GracePeriodWarning({
  subscription,
}: GracePeriodWarningProps) {
  // Calculate grace period end date (7 days after expiry)
  const gracePeriodEndDate = subscription.expires_at
    ? new Date(
        new Date(subscription.expires_at).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString()
    : null;

  const daysRemaining = subscription.grace_days_remaining ?? 0;

  // Don't show if not in grace period
  if (subscription.status !== 'past_due' || daysRemaining <= 0) {
    return null;
  }

  return (
    <div
      className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        {/* Warning Icon */}
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-8 w-8 text-red-600"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">
            Payment Failed - Grace Period Active
          </h3>

          <p className="text-sm text-red-800 mb-3">
            Your payment failed and your subscription is in a grace period.
            {daysRemaining === 1 ? (
              <strong className="font-bold"> You have 1 day remaining</strong>
            ) : (
              <strong className="font-bold">
                {' '}
                You have {daysRemaining} days remaining
              </strong>
            )}{' '}
            to update your payment method before losing access to paid features.
          </p>

          {/* Features at Risk */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-red-900 mb-2">
              Features you&apos;ll lose:
            </p>
            <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
              <li>
                Product limit will be reduced to 10 products (Starter tier)
              </li>
              <li>Transaction fees will increase to 5%</li>
              {subscription.plan.features.analytics && (
                <li>Access to analytics dashboard</li>
              )}
              {subscription.plan.features.advanced_analytics && (
                <li>Advanced analytics features</li>
              )}
              {subscription.plan.features.team_members && (
                <li>Team member access</li>
              )}
              {subscription.plan.features.custom_domain && (
                <li>Custom domain capability</li>
              )}
              {subscription.plan.features.priority_support && (
                <li>Priority customer support</li>
              )}
            </ul>
          </div>

          {/* Grace Period End Date */}
          {gracePeriodEndDate && (
            <p className="text-xs text-red-700 mb-4">
              Grace period ends on{' '}
              <span className="font-semibold">
                {formatSubscriptionDate(gracePeriodEndDate)}
              </span>
            </p>
          )}

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                // This will be handled by the parent component or redirect to billing settings
                window.location.href = '/dashboard/billing';
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Update payment method to restore subscription"
            >
              Update Payment Method
            </button>

            <a
              href="/dashboard/settings"
              className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-red-50 text-red-700 text-sm font-medium border border-red-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Go to Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
