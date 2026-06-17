'use client';

import clsx from 'clsx';
import { memo } from 'react';
import type { StoreAvailability } from '@/app/lib/store-availability';

export const StoreAvailabilityPill = memo(function StoreAvailabilityPill({
  availability,
  className,
}: {
  availability: StoreAvailability;
  className?: string;
}) {
  if (availability.state === 'unknown') return null;
  const open = availability.state === 'open';
  return (
    <span
      title={availability.label}
      className={clsx(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        open ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80' : 'bg-amber-100 text-amber-900 ring-1 ring-amber-200/80',
        className,
      )}
    >
      {open ? 'Open' : 'Closed'}
    </span>
  );
});

export const StoreAvailabilityBanner = memo(function StoreAvailabilityBanner({
  availability,
  borderColor,
  textColor,
}: {
  availability: StoreAvailability;
  borderColor?: string;
  textColor?: string;
}) {
  if (availability.state === 'unknown') return null;
  const open = availability.state === 'open';
  return (
    <div
      className={`border-b px-4 py-3 text-center text-sm z-[101] ${!open ? 'sticky top-0 animate-pulse' : 'relative'}`}
      style={{
        borderColor: borderColor || '#e2e8f0',
        backgroundColor: open ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.15)',
        color: textColor || (open ? '#0f172a' : '#dc2626'),
      }}
    >
      <span className="font-bold text-base">{open ? 'Open now' : 'Store is Closed'}</span>
      {availability.label ? (
        <span className="mt-1 block text-sm font-normal opacity-90">{availability.label}</span>
      ) : null}
    </div>
  );
});
