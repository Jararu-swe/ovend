'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionTier } from '@/app/lib/definitions';
import { upgradeSubscription, verifyPayment } from '@/app/lib/subscription-actions';
import { formatPrice, getTierDisplayName } from '@/app/lib/subscription-utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
  tier: SubscriptionTier;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
}



export default function PaymentModal({
  tier,
  amount,
  isOpen,
  onClose,
}: PaymentModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paystackReady, setPaystackReady] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Check if Paystack is loaded
  useEffect(() => {
    const checkPaystack = () => {
      if (typeof window !== 'undefined' && typeof window.PaystackPop !== 'undefined') {
        setPaystackReady(true);
      }
    };

    // Check immediately
    checkPaystack();

    // Listen for Paystack load event
    const handlePaystackLoaded = () => {
      setPaystackReady(true);
    };

    window.addEventListener('paystack-loaded', handlePaystackLoaded);

    // Fallback: Check periodically for 10 seconds
    const interval = setInterval(checkPaystack, 500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!paystackReady) {
        console.warn('Paystack script did not load within timeout');
      }
    }, 10000);

    return () => {
      window.removeEventListener('paystack-loaded', handlePaystackLoaded);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paystackReady]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Trap focus
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
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

    // Focus close button when modal opens
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Check if Paystack is loaded
      if (!paystackReady || typeof window.PaystackPop === 'undefined') {
        throw new Error(
          'Payment system is still loading. Please wait a moment and try again.'
        );
      }

      // Get public key from environment variable
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error('Payment configuration error. Please contact support.');
      }

      // Initialize payment on backend first
      const callbackUrl = `${window.location.origin}/dashboard/billing`;
      const result = await upgradeSubscription(tier, callbackUrl);

      if (!result.ok) {
        throw new Error(result.error || 'Failed to initialize payment');
      }

      const { authorization_url, reference, email: userEmail } = result.data;

      if (!authorization_url || !reference || !userEmail) {
        throw new Error('Invalid payment initialization response');
      }

      // Initialize Paystack popup with all required fields
      const handler = window.PaystackPop!.setup({
        key: publicKey,
        email: userEmail,
        amount: amount, // Amount in kobo
        ref: reference,
        currency: 'NGN',
        onClose: () => {
          setIsProcessing(false);
        },
        callback: (response: any) => {
          void (async () => {
            try {
              // Verify payment
              const verifyResult = await verifyPayment(response.reference);

              if (!verifyResult.ok) {
                setError(
                  verifyResult.error || 'Payment verification failed. Please contact support.'
                );
                setIsProcessing(false);
                return;
              }

              // Success - refresh the page
              router.refresh();
              onClose();
            } catch (err) {
              console.error('Verification error:', err);
              setError('Payment verification failed. Please contact support.');
              setIsProcessing(false);
            }
          })();
        },
      });

      // Open Paystack iframe
      handler.openIframe();
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="payment-modal-title"
            className="text-2xl font-bold text-slate-900"
          >
            Complete Payment
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            aria-label="Close payment modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Subscription Plan</span>
              <span className="text-lg font-bold text-slate-900">
                {getTierDisplayName(tier)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Amount</span>
              <span className="text-2xl font-bold text-emerald-600">
                {formatPrice(amount)}
                <span className="text-sm text-slate-600 font-normal">/month</span>
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <p>• Payment is processed securely by Paystack</p>
            <p>• Your subscription starts immediately after payment</p>
            <p>• Subscription renews automatically each month</p>
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

        {/* Paystack Loading Indicator */}
        {!paystackReady && (
          <div
            className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            role="status"
          >
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-blue-600"
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
              <p className="text-sm text-blue-800">Loading payment system...</p>
            </div>
          </div>
        )}

        {/* Actions - Wrapped in form for Paystack */}
        <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !paystackReady}
              className="flex-1 px-4 py-3 text-white bg-emerald-500 hover:bg-emerald-400 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
