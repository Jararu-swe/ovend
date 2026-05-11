'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/app/lib/definitions';
import { CreditCardIcon } from '@heroicons/react/24/outline';

const MONTHLY_AMOUNT_NAIRA = 3000;

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString();
}

function isActive(expiresAt: string | Date | null | undefined) {
  if (!expiresAt) return false;
  const d = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return d.getTime() > Date.now();
}

export default function SubscriptionPayCard({ user }: { user: User }) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expiresAt = (user as any).subscription_expires_at as string | null | undefined;
  const status = (user as any).subscription_status as string | null | undefined;

  const active = useMemo(() => isActive(expiresAt), [expiresAt]);
  const prettyExpiry = useMemo(() => formatDateTime(expiresAt), [expiresAt]);
  const isTrial = status === 'trial' && active;

  const handlePay = async () => {
    setError(null);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setError('Paystack public key is missing. Configure NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.');
      return;
    }

    // @ts-ignore - PaystackPop injected via script
    if (!window.PaystackPop || typeof window.PaystackPop.setup !== 'function') {
      setError('Paystack is not available yet. Please refresh and try again.');
      return;
    }

    setIsPaying(true);

    const reference = `OVD-SUB-${user.id.slice(0, 8)}-${Date.now()}`;

    try {
      // @ts-ignore - PaystackPop injected via script
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: user.email,
        amount: MONTHLY_AMOUNT_NAIRA * 100,
        currency: 'NGN',
        ref: reference,
        metadata: {
          vendorId: user.id,
          purpose: 'vendor_subscription',
        },
        onClose: () => {
          setIsPaying(false);
        },
        callback: (response: any) => {
          void (async () => {
            try {
              const resp = await fetch('/api/vendor/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: response?.reference }),
              });

              const body = await resp.json().catch(() => ({}));
              if (!resp.ok) {
                setError(body?.error || 'Subscription activation failed.');
                setIsPaying(false);
                return;
              }

              setIsPaying(false);
              router.refresh();
            } catch (e: any) {
              setError(e?.message || 'Subscription activation failed.');
              setIsPaying(false);
            }
          })();
        },
      });

      if (!handler || typeof handler.openIframe !== 'function') {
        setError('Unable to open Paystack popup. Please disable popup blockers and try again.');
        setIsPaying(false);
        return;
      }

      handler.openIframe();
    } catch (e: any) {
      setError(e?.message || 'Unable to start Paystack payment.');
      setIsPaying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-900">Monthly subscription</h2>
        <p className="text-sm text-slate-500">
          Pay ₦{MONTHLY_AMOUNT_NAIRA.toLocaleString()} to keep access to your vendor dashboard features.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Status: {active ? (isTrial ? 'Trial' : 'Active') : 'Inactive'}
              </p>
              <p className="text-xs text-slate-500">
                {prettyExpiry
                  ? `${isTrial ? 'Trial ends' : 'Expires'}: ${prettyExpiry}`
                  : 'No active subscription on this account yet.'}
              </p>
              {status && (
                <p className="mt-1 text-xs text-slate-400">
                  Record: {status}
                </p>
              )}
            </div>
            <button
              onClick={handlePay}
              disabled={isPaying}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
            >
              <CreditCardIcon className="h-4 w-4" />
              {isPaying ? 'Processing…' : 'Pay ₦3,000'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-400">
          Payments are verified server-side before your subscription is activated.
        </p>
      </div>
    </div>
  );
}

