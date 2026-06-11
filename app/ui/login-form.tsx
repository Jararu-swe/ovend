'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import VendleLogo from '@/app/ui/vendle-logo';
import GoogleSignInButton from '@/app/ui/google-signin-button';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely read search params on mount to avoid hydration issues
  useEffect(() => {
    const url = searchParams.get('callbackUrl');
    const reg = searchParams.get('registered');
    if (url) setCallbackUrl(url);
    if (reg) setRegistered(true);
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Use NextAuth signin endpoint directly without SessionProvider
      const {signIn} = await import('next-auth/react');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      setIsSubmitting(false);

      if (!result || result.error) {
        setError('Invalid email or password');
        return;
      }

      // Navigate and refresh to update server-side auth state
      window.location.href = result.url ?? callbackUrl;
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
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
        <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to manage your store
        </p>

        {registered && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <span>✓</span>
            <span>Account created! Please sign in.</span>
          </div>
        )}

        <div className="mt-6">
          <GoogleSignInButton role="vendor" callbackUrl={callbackUrl} />
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
                placeholder="Enter your password"
                required
                minLength={6}
                className="peer w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-focus:text-emerald-500" />
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button type="button" className="text-xs text-slate-400 hover:text-emerald-600 transition cursor-not-allowed" title="Coming soon" disabled>
              Forgot password?
            </button>
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
            {isSubmitting ? 'Signing in…' : 'Sign in'}
            {!isSubmitting && <ArrowRightIcon className="h-4 w-4" />}
          </button>
        </form>
      </div>

      {/* Sign-up link */}
      <p className="mt-5 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
          Create one free
        </Link>
      </p>
    </div>
  );
}
