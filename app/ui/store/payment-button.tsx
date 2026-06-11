'use client';

import { useState } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface PaymentButtonProps {
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

export default function PaymentButton({ amount, email, onSuccess, onClose }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = () => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!publicKey) {
      alert('Payment system not configured. Please contact support.');
      return;
    }

    setIsLoading(true);

    // @ts-ignore - PaystackPop is loaded via script
    const handler = window.PaystackPop?.setup({
      key: publicKey,
      email: email,
      amount: amount * 100, // Convert to kobo
      currency: 'NGN',
      ref: `OVD-${Date.now()}`,
      onClose: () => {
        setIsLoading(false);
        onClose?.();
      },
      callback: (response: any) => {
        setIsLoading(false);
        onSuccess(response.reference);
      },
    });

    handler?.openIframe();
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 p-4 font-bold text-white shadow-sm transition hover:bg-emerald-400 active:scale-95 disabled:opacity-60"
    >
      <CreditCardIcon className="h-5 w-5" />
      {isLoading ? 'Processing...' : 'Pay with Card'}
    </button>
  );
}
