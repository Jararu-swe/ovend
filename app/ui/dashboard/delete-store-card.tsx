'use client';

import { deleteStore } from '@/app/lib/actions';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function DeleteStoreCard() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteStore();
    } catch (error) {
      console.error('Failed to delete store:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete store. Please try again.';
      alert(message);
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/30 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <ExclamationTriangleIcon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-red-900">Danger Zone</h2>
          <p className="mt-1 text-sm text-red-700/70">
            Deleting your store is permanent. This will delete all your products, orders, settings, and images. This action cannot be undone.
          </p>
          
          <div className="mt-6">
            {!isConfirming ? (
              <button
                type="button"
                onClick={() => setIsConfirming(true)}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Delete Store
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <p className="text-sm font-bold text-red-700">Are you absolutely sure?</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-xl bg-red-600 px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
