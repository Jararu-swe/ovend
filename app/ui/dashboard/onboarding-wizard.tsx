'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ClipboardDocumentIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { User } from '@/app/lib/definitions';

interface OnboardingWizardProps {
  user: User;
  hasProducts: boolean;
  hasWhatsApp: boolean;
}

export default function OnboardingWizard({ user, hasProducts, hasWhatsApp }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const storeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${user.store_slug}`;
  const totalSteps = 3;

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Link href="/">
          <Image src="/brandname.svg" alt="Vendle" width={120} height={38} priority />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-600">Step {step} of {totalSteps}</span>
          <span className="text-xs text-slate-400">{Math.round((step / totalSteps) * 100)}% complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Step 1: Welcome + Store Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-4 mb-4">
                <BuildingStorefrontIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Welcome to Vendle, {user.name.split(' ')[0]}! 🎉</h2>
              <p className="mt-2 text-sm text-slate-500">
                Let&apos;s get your store ready. First, make sure your details are set up so customers can find and contact you.
              </p>
            </div>

            <div className="space-y-4 rounded-xl bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${user.store_name ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    {user.store_name ? <CheckCircleIcon className="h-5 w-5" /> : '1'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Store Name</p>
                    <p className="text-xs text-slate-500">{user.store_name || 'Not set'}</p>
                  </div>
                </div>
                {!user.store_name && (
                  <Link href="/dashboard/settings" className="text-xs font-bold text-emerald-600 hover:text-emerald-500">
                    Set up →
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${user.store_slug ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    {user.store_slug ? <CheckCircleIcon className="h-5 w-5" /> : '2'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Store Link</p>
                    <p className="text-xs text-slate-500 font-mono">/s/{user.store_slug || '...'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${hasWhatsApp ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {hasWhatsApp ? <CheckCircleIcon className="h-5 w-5" /> : <PhoneIcon className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">WhatsApp Number</p>
                    <p className="text-xs text-slate-500">{user.whatsapp_number || "Not set — customers won't be able to reach you"}</p>
                  </div>
                </div>
                {!hasWhatsApp && (
                  <Link href="/dashboard/settings" className="text-xs font-bold text-emerald-600 hover:text-emerald-500">
                    Add →
                  </Link>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              Next: Add Products
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Add Products */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-sky-100 p-4 mb-4">
                <SparklesIcon className="h-8 w-8 text-sky-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Add Your Products</h2>
              <p className="mt-2 text-sm text-slate-500">
                Your store needs products! Head to the Products page to add your first item.
              </p>
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              {hasProducts ? (
                <div className="space-y-2">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
                  <p className="font-bold text-emerald-700">Products added! ✓</p>
                  <p className="text-xs text-slate-500">Your store is stocked and ready.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl">📦</div>
                  <p className="text-sm font-bold text-slate-700">No products yet</p>
                  <Link
                    href="/dashboard/products/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-400"
                  >
                    Add your first product
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400"
              >
                {hasProducts ? 'Next' : 'Skip for now'}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Share Your Link */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-indigo-100 p-4 mb-4 text-2xl">🚀</div>
              <h2 className="text-xl font-bold text-slate-900">Share Your Store!</h2>
              <p className="mt-2 text-sm text-slate-500">
                Your store is live! Share this link on WhatsApp, Instagram, Twitter — anywhere your customers are.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <input
                type="text"
                value={storeUrl}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono text-slate-700 outline-none truncate"
              />
              <button
                onClick={copyLink}
                className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-400'
                }`}
              >
                <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/?text=Check out my store on Vendle! ${encodeURIComponent(storeUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=Check out my store on Vendle!&url=${encodeURIComponent(storeUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                Twitter / X
              </a>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400"
              >
                Go to Dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Skip link */}
      <p className="mt-6 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs text-slate-400 hover:text-slate-600 transition"
        >
          Skip setup and go to dashboard →
        </button>
      </p>
    </div>
  );
}
