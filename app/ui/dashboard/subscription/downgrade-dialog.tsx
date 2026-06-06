'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionTier } from '@/app/lib/definitions';
import { downgradeSubscription } from '@/app/lib/subscription-actions';
import { getTierDisplayName } from '@/app/lib/subscription-utils';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DowngradeDialogProps {
  targetTier: SubscriptionTier;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function DowngradeDialog({
  targetTier,
  isOpen,
  onClose,
  onConfirm,
}: DowngradeDialogProps) {
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

  const handleConfirmDowngrade = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await downgradeSubscription(targetTier);

      if (!result.ok) {
        throw new Error(result.error || 'Failed to downgrade subscription');
      }

      // Call parent onConfirm if provided
      if (onConfirm) {
        onConfirm();
      }

      // Refresh the page to show updated subscription
      router.refresh();
      onClose();
    } catch (err) {
      console.error('Downgrade error:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="downgrade-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={() => !isProcessing && onClose()}
      />

      {/* Dialog content */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <ExclamationTriangleIcon
                className="w-6 h-6 text-amber-600"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="downgrade-dialog-title"
                className="text-lg font-bold text-slate-900"
              >
                Downgrade to {getTierDisplayName(targetTier)}?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Are you sure you want to downgrade your subscription? This will take effect immediately, and you will lose access to premium features.
              </p>
            </div>
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
              Keep Current Plan
            </button>
            <button
              type="button"
              onClick={handleConfirmDowngrade}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                  <span>Processing...</span>
                </>
              ) : (
                'Confirm Downgrade'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
