'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SubscriptionExpiryModalProps {
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
}

export default function SubscriptionExpiryModal({
  subscriptionStatus,
  subscriptionExpiresAt,
}: SubscriptionExpiryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if subscription is expired or inactive
    const isExpired = subscriptionStatus === 'inactive' || subscriptionStatus === 'past_due';
    const expiresAt = subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null;
    const hasExpired = expiresAt && expiresAt.getTime() < Date.now();

    // Check if user has dismissed the modal in this session
    const dismissed = sessionStorage.getItem('subscription-modal-dismissed');

    if ((isExpired || hasExpired) && !dismissed && !isDismissed) {
      setIsOpen(true);
    }
  }, [subscriptionStatus, subscriptionExpiresAt, isDismissed]);

  const handleDismiss = () => {
    setIsOpen(false);
    setIsDismissed(true);
    // Store dismissal in session storage (will reset on browser close)
    sessionStorage.setItem('subscription-modal-dismissed', 'true');
  };

  const handleRenewClick = () => {
    router.push('/dashboard/billing');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Subscription Expired
            </h2>

            {/* Message */}
            <p className="text-slate-600 text-center mb-6">
              Your subscription has expired. To continue using all features and keep your store active, please renew your subscription.
            </p>

            {/* Features lost */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Without an active subscription:
              </p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span>Your store is no longer visible to customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span>You cannot receive new orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span>Limited access to dashboard features</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRenewClick}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
              >
                Renew Subscription
              </button>
              <button
                onClick={handleDismiss}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
              >
                Remind Me Later
              </button>
            </div>

            {/* Help text */}
            <p className="text-xs text-slate-500 text-center mt-4">
              Need help? Contact support at{' '}
              <a href="mailto:support@vendle.ng" className="text-emerald-600 hover:underline">
                support@vendle.ng
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
