import clsx from 'clsx';
import type { StoreAvailability } from '@/app/lib/store-availability';

export function StoreAvailabilityPill({
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
}

export function StoreAvailabilityBanner({
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
      className="border-b px-4 py-2.5 text-center text-sm"
      style={{
        borderColor: borderColor || '#e2e8f0',
        backgroundColor: open ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.14)',
        color: textColor || '#0f172a',
      }}
    >
      <span className="font-semibold">{open ? 'Open now' : 'Closed for customers'}</span>
      {availability.label ? (
        <span className="mt-0.5 block text-xs font-normal opacity-80">{availability.label}</span>
      ) : null}
    </div>
  );
}
