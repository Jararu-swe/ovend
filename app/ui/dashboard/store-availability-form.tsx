'use client';

import { useEffect, useMemo, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { User } from '@/app/lib/definitions';
import {
  STORE_DAY_KEYS,
  type StoreHoursDayKey,
  type StoreHoursJson,
  parseHHMM,
} from '@/app/lib/store-availability';
import { updateStoreAvailability, type AvailabilityState } from '@/app/lib/actions';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const AVAILABILITY_INITIAL: AvailabilityState = { message: null, status: null };

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

function AvailabilityFormFooter({ state }: { state: AvailabilityState }) {
  const { pending } = useFormStatus();
  const isSuccess = state.status === 'success';
  const isError = state.status === 'error';
  const showMessage = Boolean(state.message && (isSuccess || isError));

  return (
    <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-6 border-t border-slate-200 bg-slate-50/95 px-6 py-4 backdrop-blur-sm rounded-b-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div
          className="min-w-0 flex-1"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {pending ? (
            <p className="text-sm font-medium text-slate-600">Saving your availability…</p>
          ) : showMessage ? (
            <div
              className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${
                isSuccess ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80' : 'bg-red-50 text-red-800 ring-1 ring-red-200/80'
              }`}
            >
              {isSuccess ? (
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
              )}
              <span className="font-medium leading-snug">{state.message}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Click save when you are done — you will see confirmation here.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Saving…' : 'Save availability'}
        </button>
      </div>
    </div>
  );
}

export default function StoreAvailabilityForm({ user }: { user: User }) {
  const router = useRouter();
  const [days, setDays] = useState(() => deserializeHours(user));
  const [state, formAction] = useActionState(updateStoreAvailability, AVAILABILITY_INITIAL);

  const hoursJson = useMemo(() => JSON.stringify(serializeHours(days)), [days]);

  const tzValue = user.store_timezone?.trim() || 'Africa/Lagos';
  const acceptingDefault = user.accepting_orders !== false;
  const tzOptions = Array.from(new Set([tzValue, ...COMMON_TIMEZONES]));

  useEffect(() => {
    if (state.status === 'success') {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <form action={formAction} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Store hours & availability</h2>
        <p className="mt-1 text-xs text-slate-500">
          Customers see Open or Closed on Explore and your storefront. Leave all days off to show no schedule (only
          the &quot;paused&quot; toggle applies).
        </p>
      </div>

      <input type="hidden" name="store_hours_json" value={hoursJson} readOnly />

      <div>
        <label htmlFor="store_timezone" className="block text-sm font-medium text-slate-700 mb-1">
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
        {!COMMON_TIMEZONES.includes(tzValue) && (
          <p className="mt-1 text-xs text-amber-700">
            Using a custom timezone. Pick a preset above to switch to a standard zone.
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="accepting_orders"
          defaultChecked={acceptingDefault}
          value="on"
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

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Weekly hours</p>
        <p className="text-xs text-slate-500">One time range per day. Uncheck a day you are closed.</p>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
          {STORE_DAY_KEYS.map((key) => (
            <div key={key} className="flex flex-wrap items-center gap-3 bg-slate-50/50 px-3 py-2.5">
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
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:opacity-50 bg-white"
                />
                <span className="text-slate-400">to</span>
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
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm disabled:opacity-50 bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AvailabilityFormFooter state={state} />
    </form>
  );
}
