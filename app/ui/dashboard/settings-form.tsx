'use client';

import { User } from '@/app/lib/definitions';
import { updateProfile, State } from '@/app/lib/actions';
import { useActionState, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { NIGERIAN_STATES, STORE_CATEGORIES } from '@/app/lib/utils';

export default function SettingsForm({ user }: { user: User }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(updateProfile as any, initialState);
  const [descriptionLength, setDescriptionLength] = useState(user.store_description?.length || 0);

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800">Store Profile</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="store_name" className="block text-sm font-medium text-slate-700 mb-1">
              Store Name
            </label>
            <input
              id="store_name"
              name="store_name"
              type="text"
              defaultValue={user.store_name}
              placeholder="e.g. Amaka Threads"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
            {state.errors?.store_name && (
              <p className="mt-2 text-sm text-red-500">{state.errors.store_name[0]}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="store_description" className="block text-sm font-medium text-slate-700 mb-1">
              Store Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="store_description"
              name="store_description"
              rows={3}
              maxLength={200}
              defaultValue={user.store_description || ''}
              onChange={(e) => setDescriptionLength(e.target.value.length)}
              placeholder="Tell customers what makes your store special..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 resize-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                This appears on the Explore page and when sharing your store link
              </p>
              <p className={`text-xs ${descriptionLength > 200 ? 'text-red-500' : 'text-slate-400'}`}>
                {descriptionLength}/200
              </p>
            </div>
            {state.errors?.store_description && (
              <p className="mt-2 text-sm text-red-500">{state.errors.store_description[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="whatsapp_number" className="block text-sm font-medium text-slate-700 mb-1">
              WhatsApp Number
            </label>
            <input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              defaultValue={user.whatsapp_number}
              placeholder="+234 801 234 5678"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
              Store Category / Niche
            </label>
            <select
              id="category"
              name="category"
              defaultValue={user.category || 'Other'}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 bg-white"
            >
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="location_state" className="block text-sm font-medium text-slate-700 mb-1">
              Store Location (State)
            </label>
            <select
              id="location_state"
              name="location_state"
              defaultValue={user.location_state || ''}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 bg-white"
            >
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="store_slug" className="block text-sm font-medium text-slate-700 mb-1">
              Store URL Slug
            </label>
            <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20">
              <span className="flex items-center bg-slate-50 px-3 text-sm text-slate-500 border-r border-slate-200">
                vendle.app/s/
              </span>
              <input
                id="store_slug"
                name="store_slug"
                type="text"
                defaultValue={user.store_slug}
                placeholder="your-store"
                className="flex-1 px-3 py-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
            {state.errors?.store_slug && (
              <p className="mt-2 text-sm text-red-500">{state.errors.store_slug[0]}</p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              Your public store link: <span className="font-medium text-emerald-600">vendle.app/s/{user.store_slug}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bank Account Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-slate-800">Bank Account Details</h2>
        <p className="mb-4 text-xs text-slate-500">
          For cash/transfer payments, customers will see these details to make payment
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="bank_name" className="block text-sm font-medium text-slate-700 mb-1">
              Bank Name
            </label>
            <input
              id="bank_name"
              name="bank_name"
              type="text"
              defaultValue={user.bank_name}
              placeholder="e.g. GTBank, Access Bank, First Bank"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
          <div>
            <label htmlFor="account_number" className="block text-sm font-medium text-slate-700 mb-1">
              Account Number
            </label>
            <input
              id="account_number"
              name="account_number"
              type="text"
              defaultValue={user.account_number}
              placeholder="0123456789"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
          <div>
            <label htmlFor="account_name" className="block text-sm font-medium text-slate-700 mb-1">
              Account Name
            </label>
            <input
              id="account_name"
              name="account_name"
              type="text"
              defaultValue={user.account_name}
              placeholder="Name as it appears on your account"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
        </div>

        {state.message && (
          <div className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${state.message.includes('Success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {state.message.includes('Success') ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            <span>{state.message}</span>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
          >
            Save profile
          </button>
        </div>
      </div>
    </form>
  );
}
