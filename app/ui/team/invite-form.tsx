'use client';

import { useActionState, useState, useEffect } from 'react';
import Link from 'next/link';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { inviteTeamMemberAction, State } from '@/app/lib/actions';

export default function InviteTeamForm({ vendorId }: { vendorId: string }) {
  const initialState: State = { message: '', errors: {} };
  const inviteWithVendor = inviteTeamMemberAction.bind(null, vendorId);
  const [state, formAction, isPending] = useActionState(inviteWithVendor, initialState as any);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<'admin' | 'assistant'>('assistant');
  const [permissions, setPermissions] = useState({
    products: true,
    orders: true,
    settings: false,
  });

  // Reset submitting state when action completes (either success or error)
  useEffect(() => {
    if (!isPending) {
      setIsSubmitting(false);
    }
  }, [isPending]);

  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true);
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="teammate@example.com"
                className="peer block w-full rounded-xl border border-slate-200 py-2.5 pl-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              They must have an account already. Ask them to sign up first.
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700">Role</legend>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="admin"
                  name="role"
                  type="radio"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="admin" className="ml-3">
                  <span className="block text-sm font-medium text-slate-900">Admin</span>
                  <span className="block text-xs text-slate-500">Can manage products, orders, and team</span>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="assistant"
                  name="role"
                  type="radio"
                  value="assistant"
                  checked={role === 'assistant'}
                  onChange={() => setRole('assistant')}
                  className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="assistant" className="ml-3">
                  <span className="block text-sm font-medium text-slate-900">Assistant</span>
                  <span className="block text-xs text-slate-500">Limited access based on permissions</span>
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700">Permissions</legend>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="products"
                  name="products"
                  type="checkbox"
                  checked={permissions.products}
                  onChange={(e) => setPermissions({ ...permissions, products: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="products" className="ml-3 text-sm text-slate-700">
                  Manage Products
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="orders"
                  name="orders"
                  type="checkbox"
                  checked={permissions.orders}
                  onChange={(e) => setPermissions({ ...permissions, orders: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="orders" className="ml-3 text-sm text-slate-700">
                  Manage Orders
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="settings"
                  name="settings"
                  type="checkbox"
                  checked={permissions.settings}
                  onChange={(e) => setPermissions({ ...permissions, settings: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="settings" className="ml-3 text-sm text-slate-700">
                  Manage Settings
                </label>
              </div>
            </div>
          </fieldset>

          <input type="hidden" name="permissions" value={JSON.stringify(permissions)} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/team"
          className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
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
              Sending...
            </>
          ) : (
            'Send Invite'
          )}
        </button>
      </div>

      {/* Success Message */}
      {(state as any)?.success && (state as any)?.successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                {(state as any).successMessage}
              </p>
              <Link
                href="/dashboard/team"
                className="inline-block mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Team
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.message && !(state as any)?.success && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-900">{state.message}</p>
        </div>
      )}
    </form>
  );
}
