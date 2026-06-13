export type StoreHoursDayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type StoreHoursSlot = { open: string; close: string };

export type StoreHoursJson = Partial<Record<StoreHoursDayKey, StoreHoursSlot[]>>;

export type StoreAvailability = {
  state: 'open' | 'closed' | 'unknown';
  /** Short line for tooltips or secondary text */
  label: string;
};

const DOW_MAP: Record<string, StoreHoursDayKey> = {
  Sun: 'sun',
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
};

export const STORE_DAY_KEYS: StoreHoursDayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function parseHHMM(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function getZonedParts(date: Date, timeZone: string): { dayKey: StoreHoursDayKey; minutes: number } {
  const safeTz = (() => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone }).format(date);
      return timeZone;
    } catch {
      return 'Africa/Lagos';
    }
  })();

  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const wd = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const dayKey = DOW_MAP[wd] ?? 'mon';
  return { dayKey, minutes: hour * 60 + minute };
}

function hasConfiguredSchedule(hours: StoreHoursJson | null): boolean {
  if (!hours || typeof hours !== 'object') return false;
  for (const key of STORE_DAY_KEYS) {
    const slots = hours[key];
    if (Array.isArray(slots) && slots.length > 0) return true;
  }
  return false;
}

export function normalizeHours(raw: unknown): StoreHoursJson | null {
  if (raw == null || raw === undefined) return null;
  
  let obj = raw;
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw);
    } catch (err) {
      // Log error with truncated raw value for debugging
      const rawPreview = String(raw).substring(0, 100);
      console.error('Failed to parse store_hours JSON:', {
        error: err,
        rawPreview: rawPreview + (raw.length > 100 ? '...' : '')
      });
      return null;
    }
  }
  
  if (typeof obj !== 'object' || obj === null) return null;
  const out: StoreHoursJson = {};
  for (const key of STORE_DAY_KEYS) {
    const slots = (obj as Record<string, unknown>)[key];
    if (!Array.isArray(slots)) continue;
    const normalized: StoreHoursSlot[] = [];
    for (const s of slots) {
      if (!s || typeof s !== 'object') continue;
      const open = String((s as StoreHoursSlot).open ?? '');
      const close = String((s as StoreHoursSlot).close ?? '');
      const o = parseHHMM(open);
      const c = parseHHMM(close);
      if (o == null || c == null) continue;
      if (c <= o) continue;
      normalized.push({ open: formatHHMM(o), close: formatHHMM(c) });
    }
    if (normalized.length) out[key] = normalized;
  }
  return Object.keys(out).length ? out : null;
}

function formatHHMM(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function isWithinSlot(nowMin: number, openMin: number, closeMin: number): boolean {
  return nowMin >= openMin && nowMin < closeMin;
}

export type StoreAvailabilityInput = {
  now?: Date;
  timeZone?: string | null;
  store_hours?: unknown;
  accepting_orders?: boolean | null;
  store_closed_note?: string | null;
};

export function getStoreAvailability(input: StoreAvailabilityInput): StoreAvailability {
  const now = input.now ?? new Date();
  const accepting = input.accepting_orders !== false;

  if (!accepting) {
    const note = input.store_closed_note?.trim();
    return {
      state: 'closed',
      label: note || 'Not accepting orders right now',
    };
  }

  const hours = normalizeHours(input.store_hours);
  if (!hasConfiguredSchedule(hours)) {
    return { state: 'unknown', label: '' };
  }

  const tz = (input.timeZone || 'Africa/Lagos').trim() || 'Africa/Lagos';
  const { dayKey, minutes } = getZonedParts(now, tz);
  const slots = hours![dayKey];
  if (!slots?.length) {
    return { state: 'closed', label: 'Closed today' };
  }

  for (const slot of slots) {
    const o = parseHHMM(slot.open);
    const c = parseHHMM(slot.close);
    if (o == null || c == null || c <= o) continue;
    if (isWithinSlot(minutes, o, c)) {
      return { state: 'open', label: 'Open now' };
    }
  }

  return { state: 'closed', label: 'Closed for now' };
}
