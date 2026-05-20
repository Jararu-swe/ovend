'use client';

import Link from 'next/link';
import VendleLogo from '@/app/ui/vendle-logo';
import GoogleSignInButton from '@/app/ui/google-signin-button';
import {
  AtSymbolIcon,
  KeyIcon,
  UserIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Auto-sign-in after successful registration
      const { signIn } = await import('next-auth/react');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Registration succeeded but auto-login failed — fall back to login page
        router.push('/login?registered=1');
        return;
      }

      router.push('/dashboard/onboarding');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <VendleLogo />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BuildingStorefrontIcon className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Create your free store</h1>
          </div>
          <p className="text-sm text-slate-500">
            Get started in seconds — no card required.
          </p>

          <div className="mt-6">
            <GoogleSignInButton role="vendor" callbackUrl="/dashboard/onboarding" />
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
                Full name
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
                  placeholder="At least 6 characters"
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
              id="signup-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
              {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Sign-in link */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
