'use client';

import { toggleDiscountAction } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function ToggleDiscountButton({
  discountId,
  currentStatus,
  disabled,
}: {
  discountId: string;
  currentStatus: boolean;
  disabled?: boolean;
}) {
  const toggleWithId = toggleDiscountAction.bind(null, discountId, currentStatus);
  const [state, formAction] = useActionState(toggleWithId, { message: null, errors: {} });

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={disabled}
        className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
          currentStatus
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            : 'bg-emerald-500 text-white hover:bg-emerald-400'
        }`}
      >
        {currentStatus ? 'Deactivate' : 'Activate'}
      </button>
      {state?.message && (
        <p className="mt-2 text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
