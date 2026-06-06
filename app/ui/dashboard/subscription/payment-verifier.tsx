'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyPayment } from '@/app/lib/subscription-actions';

export default function PaymentVerifier() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    // Only attempt verification if there is a reference and we haven't tried yet
    if (reference) {
      // Check if we already verified this reference in this session
      const verifyKey = `verified_paystack_${reference}`;
      if (sessionStorage.getItem(verifyKey)) {
        return;
      }

      if (hasAttemptedRef.current) return;
      hasAttemptedRef.current = true;
      
      setIsVerifying(true);
      setError(null);

      const verify = async () => {
        try {
          const result = await verifyPayment(reference);
          
          if (!result.ok) {
            setError(result.error || 'Payment verification failed. Please contact support.');
            setIsVerifying(false);
            return;
          }

          // Mark as verified
          sessionStorage.setItem(verifyKey, 'true');
          
          // Clear the URL parameters and refresh the data
          setIsVerifying(false);
          window.location.href = '/dashboard/billing';
        } catch (err) {
          setError('An unexpected error occurred during verification.');
          setIsVerifying(false);
        }
      };

      verify();
    }
  }, [reference]);

  if (!reference) return null;

  if (isVerifying) {
    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
        <svg
          className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-sm font-medium text-blue-800">
          Verifying your payment... Please do not close this page.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <svg
          className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              router.replace('/dashboard/billing');
            }}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return null;
}
