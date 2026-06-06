'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { VendorSubscriptionInfo } from '@/app/lib/definitions';
import { cancelSubscription } from '@/app/lib/subscription-actions';
import {
  formatSubscriptionDate,
  getTierDisplayName,
} from '@/app/lib/subscription-utils';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CancellationDialogProps {
  subscription: VendorSubscriptionInfo;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function CancellationDialog({
  subscription,
  isOpen,
  onClose,
  onConfirm,
}: CancellationDialogProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Trap focus within dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }

      // Trap focus
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus cancel button when dialog opens
    cancelButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isProcessing, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirmCancellation = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await cancelSubscription();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      // Call parent onConfirm if provided
      if (onConfirm) {
        onConfirm();
      }

      // Refresh the page to show updated subscription
      router.refresh();
      onClose();
    } catch (err) {
      console.error('Cancellation error:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Get features that will be lost
  const featuresAtRisk = [];
  if (subscription.plan.features.analytics) {
    featuresAtRisk.push('Analytics dashboard');
  }
  if (subscription.plan.features.advanced_analytics) {
    featuresAtRisk.push('Advanced analytics');
  }
  if (subscription.plan.features.team_members) {
    featuresAtRisk.push('Team member access');
  }
  if (subscription.plan.features.custom_domain) {
    featuresAtRisk.push('Custom domain');
  }
  if (subscription.plan.features.priority_support) {
    featuresAtRisk.push('Priority support');
  }
  if (subscription.plan.features.theme_level === 'premium') {
    featuresAtRisk.push('Premium themes');
  }
  if (subscription.plan.features.theme_level === 'exclusive') {
    featuresAtRisk.push('Exclusive themes');
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={!isProcessing ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancellation-dialog-title"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Warning Icon */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2
              id="cancellation-dialog-title"
              className="text-xl font-bold text-slate-900 mb-1"
            >
              Cancel Subscription?
            </h2>
            <p className="text-sm text-slate-600">
              You&apos;re about to cancel your{' '}
              <strong>{getTierDisplayName(subscription.tier)}</strong>{' '}
              subscription
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            aria-label="Close cancellation dialog"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          {/* Access Until Date */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong className="font-semibold">Good news:</strong> You&apos;ll
              continue to have access to all your current features until{' '}
              {subscription.expires_at ? (
                <strong className="font-bold">
                  {formatSubscriptionDate(subscription.expires_at)}
                </strong>
              ) : (
                'the end of your billing period'
              )}
              .
            </p>
          </div>

          {/* Features Loss Warning */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              After cancellation, you&apos;ll lose access to:
            </h3>
            <ul className="text-sm text-slate-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>
                  <strong>Product limit:</strong> Reduced to 10 products
                  (Starter tier)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>
                  <strong>Transaction fees:</strong> Will increase to 5%
                </span>
              </li>
              {featuresAtRisk.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reactivation Note */}
          <p className="text-xs text-slate-600">
            You can reactivate your subscription at any time before it expires.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Subscription
          </button>
          <button
            type="button"
            onClick={handleConfirmCancellation}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
