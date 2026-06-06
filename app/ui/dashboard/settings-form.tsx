'use client';

import { User } from '@/app/lib/definitions';
import { updateProfile, State } from '@/app/lib/actions';
import { useActionState, useState, useEffect, useMemo } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  BellIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ClockIcon,
  GlobeAltIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { NIGERIAN_STATES, STORE_CATEGORIES } from '@/app/lib/utils';
import { useSound } from '@/app/lib/sound-manager';
import {
  STORE_DAY_KEYS,
  type StoreHoursDayKey,
  type StoreHoursJson,
  parseHHMM,
} from '@/app/lib/store-availability';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/app/ui/store/location-picker'), {
  ssr: false,
});

const DAY_LABELS: Record<StoreHoursDayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const COMMON_TIMEZONES = [
  'Africa/Lagos',
  'Africa/Abidjan',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Nairobi',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Singapore',
];

type DayRow = { enabled: boolean; open: string; close: string };

function deserializeHours(user: User): Record<StoreHoursDayKey, DayRow> {
  const base = {} as Record<StoreHoursDayKey, DayRow>;
  for (const k of STORE_DAY_KEYS) {
    base[k] = { enabled: false, open: '09:00', close: '17:00' };
  }
  const raw = user.store_hours;
  let obj: StoreHoursJson | null = null;
  if (raw != null && typeof raw === 'string') {
    try {
      obj = JSON.parse(raw) as StoreHoursJson;
    } catch {
      obj = null;
    }
  } else if (raw && typeof raw === 'object') {
    obj = raw as StoreHoursJson;
  }
  if (!obj) return base;
  for (const k of STORE_DAY_KEYS) {
    const arr = obj[k];
    if (Array.isArray(arr) && arr[0]?.open != null && arr[0]?.close != null) {
      const open = String(arr[0].open).slice(0, 5);
      const close = String(arr[0].close).slice(0, 5);
      base[k] = { enabled: true, open, close };
    }
  }
  return base;
}

function serializeHours(state: Record<StoreHoursDayKey, DayRow>): StoreHoursJson | null {
  const out: StoreHoursJson = {};
  for (const k of STORE_DAY_KEYS) {
    const row = state[k];
    if (!row.enabled) continue;
    const o = parseHHMM(row.open);
    const c = parseHHMM(row.close);
    if (o == null || c == null || c <= o) continue;
    out[k] = [{ open: row.open.trim().slice(0, 5), close: row.close.trim().slice(0, 5) }];
  }
  return Object.keys(out).length ? out : null;
}

export default function SettingsForm({ user, children }: { user: User; children?: React.ReactNode }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(updateProfile as any, initialState);
  const [descriptionLength, setDescriptionLength] = useState(user.store_description?.length || 0);
  const { preferences, updatePreferences } = useSound();
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Availability State
  const [days, setDays] = useState(() => deserializeHours(user));
  const hoursJson = useMemo(() => JSON.stringify(serializeHours(days)), [days]);
  const tzValue = user.store_timezone?.trim() || 'Africa/Lagos';
  const acceptingDefault = user.accepting_orders !== false;
  const tzOptions = Array.from(new Set([tzValue, ...COMMON_TIMEZONES]));

  // Pickup Location State
  const [offersPickup, setOffersPickup] = useState(user.offers_pickup ?? false);
  const [pickupLocation, setPickupLocation] = useState<{lat: number, lng: number} | null>(
    user.pickup_latitude && user.pickup_longitude 
      ? { lat: user.pickup_latitude, lng: user.pickup_longitude }
      : null
  );
  const [pickupAddressDetails, setPickupAddressDetails] = useState(user.pickup_address_details || '');

  useEffect(() => {
    setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BuildingStorefrontIcon className="h-5 w-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-800">Store Profile</h2>
        </div>
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

      {/* Availability Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-5 w-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-800">Store hours & availability</h2>
        </div>
        <p className="-mt-3 text-xs text-slate-500">
          Customers see Open or Closed on Explore and your storefront. Leave all days off to show no schedule.
        </p>

        <input type="hidden" name="store_hours_json" value={hoursJson} readOnly />

        <div>
          <label htmlFor="store_timezone" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <GlobeAltIcon className="h-4 w-4 text-slate-400" />
            Timezone
          </label>
          <select
            id="store_timezone"
            name="store_timezone"
            defaultValue={tzValue}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 bg-white"
          >
            {tzOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-100">
          <input
            type="checkbox"
            name="accepting_orders"
            defaultChecked={acceptingDefault}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>
            <span className="block text-sm font-medium text-slate-800">Accepting orders</span>
            <span className="block text-xs text-slate-500 mt-0.5">
              Turn off for holidays or breaks — your store shows as closed even during listed hours.
            </span>
          </span>
        </label>

        <div>
          <label htmlFor="store_closed_note" className="block text-sm font-medium text-slate-700 mb-1">
            Message when closed (optional)
          </label>
          <textarea
            id="store_closed_note"
            name="store_closed_note"
            rows={2}
            defaultValue={user.store_closed_note ?? ''}
            placeholder="e.g. Back on Monday — orders ship Tuesday."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Weekly hours</p>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
            {STORE_DAY_KEYS.map((key) => (
              <div key={key} className="flex flex-wrap items-center gap-3 bg-white px-3 py-2.5">
                <label className="flex items-center gap-2 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={days[key].enabled}
                    onChange={(e) =>
                      setDays((d) => ({
                        ...d,
                        [key]: { ...d[key], enabled: e.target.checked },
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-800">{DAY_LABELS[key]}</span>
                </label>
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    disabled={!days[key].enabled}
                    value={days[key].open}
                    onChange={(e) =>
                      setDays((d) => ({
                        ...d,
                        [key]: { ...d[key], open: e.target.value },
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:opacity-50 bg-slate-50"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="time"
                    disabled={!days[key].enabled}
                    value={days[key].close}
                    onChange={(e) =>
                      setDays((d) => ({
                        ...d,
                        [key]: { ...d[key], close: e.target.value },
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:opacity-50 bg-slate-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications & Audio Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-slate-400" />
            <h2 className="text-base font-semibold text-slate-800">Notifications & Audio</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              updatePreferences({ enabled: !preferences.enabled });
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              preferences.enabled ? 'bg-emerald-500' : 'bg-slate-200'
            }`}
            aria-label="Toggle sound notifications"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Enable audio feedback for important actions</p>
            {isReducedMotion && (
              <span className="text-[10px] font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">
                Reduced Motion Active
              </span>
            )}
          </div>

          {preferences.enabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="sound-volume" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  {preferences.volume === 0 ? (
                    <SpeakerXMarkIcon className="h-4 w-4 text-slate-400" />
                  ) : (
                    <SpeakerWaveIcon className="h-4 w-4 text-slate-400" />
                  )}
                  Notification Volume
                </label>
                <span className="text-xs font-mono text-slate-400">{preferences.volume}%</span>
              </div>
              <input
                id="sound-volume"
                type="range"
                min="0"
                max="100"
                value={preferences.volume}
                onChange={(e) => updatePreferences({ volume: parseInt(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-emerald-500"
              />
              <div className="flex justify-between px-1">
                <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Mute</span>
                <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Max</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bank Account Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <BanknotesIcon className="h-5 w-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-800">Bank Account Details</h2>
        </div>
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
      </div>

      {/* Delivery Options Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TruckIcon className="h-5 w-5 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-800">Delivery Options</h2>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          Configure how customers can receive their orders
        </p>
        
        <div className="space-y-4">
          {/* Offers Pickup Toggle */}
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-100">
            <input
              type="checkbox"
              checked={offersPickup}
              onChange={(e) => setOffersPickup(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">I offer pickup for my orders</span>
              <span className="block text-xs text-slate-500 mt-0.5">
                Allow customers to collect orders from your location instead of delivery
              </span>
            </span>
          </label>

          {/* Hidden input for offers_pickup */}
          <input type="hidden" name="offers_pickup" value={offersPickup ? 'true' : 'false'} />

          {/* Conditionally render LocationPicker when pickup is enabled */}
          {offersPickup && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pickup Location
                </label>
                <LocationPicker
                  onLocationSelect={(lat, lng, address) => {
                    setPickupLocation({ lat, lng });
                    if (address !== undefined) {
                      setPickupAddressDetails(address);
                    }
                  }}
                  initialLat={pickupLocation?.lat}
                  initialLng={pickupLocation?.lng}
                />
                {state.errors?.pickup_location && (
                  <p className="mt-2 text-sm text-red-500">{state.errors.pickup_location[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="pickup_address_details" className="block text-sm font-medium text-slate-700 mb-1">
                  Pickup Address Details
                </label>
                <textarea
                  id="pickup_address_details"
                  name="pickup_address_details"
                  rows={3}
                  maxLength={500}
                  value={pickupAddressDetails}
                  onChange={(e) => setPickupAddressDetails(e.target.value)}
                  placeholder="e.g. Shop 4, Blue Building, Near Main Gate..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 resize-none"
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Provide clear directions for customers to find your pickup location
                  </p>
                  <p className={`text-xs ${pickupAddressDetails.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                    {pickupAddressDetails.length}/500
                  </p>
                </div>
              </div>

              {/* Hidden inputs for pickup location coordinates */}
              <input type="hidden" name="pickup_latitude" value={pickupLocation?.lat ?? ''} />
              <input type="hidden" name="pickup_longitude" value={pickupLocation?.lng ?? ''} />
            </div>
          )}
        </div>
      </div>

      {children}

      {/* Global Save Button at the Bottom */}
      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            {state.message ? (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${state.message.includes('Success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {state.message.includes('Success') ? (
                  <CheckCircleIcon className="h-5 w-5 shrink-0" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
                )}
                <span className="font-semibold">{state.message}</span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium px-2">
                Make sure to save all your changes before leaving.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-10 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Changes...
              </>
            ) : (
              'Save All Settings'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
