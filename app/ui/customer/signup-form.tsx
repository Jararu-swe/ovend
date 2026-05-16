'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  UserIcon,
  PhoneIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import VendleLogo from '@/app/ui/vendle-logo';
import { createCustomerAccount } from '@/app/lib/customer-actions';
import GoogleSignInButton from '@/app/ui/google-signin-button';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await createCustomerAccount(formData);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push(`/customer/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Link href="/">
          <VendleLogo />
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Join Vendle to track your orders and checkout faster.
        </p>

        <div className="mt-6">
          <GoogleSignInButton role="customer" callbackUrl={callbackUrl} />
        </div>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs font-medium uppercase tracking-wider text-slate-400">Or continue with email</span>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Amaka Obi"
                required
                className="peer w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-focus:text-emerald-500" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                className="peer w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-focus:text-emerald-500" />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="whatsapp_number">
              WhatsApp Number (Optional)
            </label>
            <div className="relative">
              <input
                id="whatsapp_number"
                type="tel"
                name="whatsapp_number"
                placeholder="+234 800 000 0000"
                className="peer w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-focus:text-emerald-500" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                required
                minLength={6}
                className="peer w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-focus:text-emerald-500" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Sign up'}
            {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
          </button>
        </form>
      </div>

      {/* Sign-in link */}
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href={`/customer/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-medium text-emerald-600 hover:text-emerald-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
