'use client';

import { useActionState, useState } from 'react';
import { XMarkIcon, CheckIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { updateTeamMemberRoleAndPermissionsAction } from '@/app/lib/actions';
import type { TeamMemberPermissions } from '@/app/lib/definitions';

export default function PermissionEditor({
  memberId,
  memberName,
  currentRole,
  currentPermissions,
}: {
  memberId: string;
  memberName: string;
  currentRole: 'owner' | 'admin' | 'assistant';
  currentPermissions: TeamMemberPermissions;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<'admin' | 'assistant'>(currentRole === 'admin' ? 'admin' : 'assistant');
  const [permissions, setPermissions] = useState<TeamMemberPermissions>({
    products: currentPermissions.products,
    orders: currentPermissions.orders,
    settings: currentPermissions.settings,
  });

  const updateWithMember = updateTeamMemberRoleAndPermissionsAction.bind(null, memberId);
  const [state, formAction, isPending] = useActionState(updateWithMember, {
    message: null,
    errors: {},
  });

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => {
          setPermissions(currentPermissions);
          setIsOpen(true);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-100"
        title={`Edit ${memberName}'s permissions`}
      >
        <PencilSquareIcon className="h-4 w-4" />
      </button>

      {/* Modal backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Edit Permissions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update access permissions for <span className="font-medium text-slate-700">{memberName}</span>
              </p>
            </div>

            {/* Form */}
            <form action={formAction} className="space-y-5">
              {/* Role selector */}
              {currentRole !== 'owner' && (
                <fieldset>
                  <legend className="mb-2 block text-sm font-medium text-slate-700">Role</legend>
                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={role === 'admin'}
                        onChange={() => setRole('admin')}
                        className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-900">Admin</span>
                        <p className="text-xs text-slate-500">Full access to products, orders, and team</p>
                      </div>
                    </label>
                    <div className="border-t border-slate-200" />
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="assistant"
                        checked={role === 'assistant'}
                        onChange={() => setRole('assistant')}
                        className="h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-900">Assistant</span>
                        <p className="text-xs text-slate-500">Limited access based on permissions below</p>
                      </div>
                    </label>
                  </div>
                </fieldset>
              )}

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={permissions.products}
                    onChange={(e) =>
                      setPermissions({ ...permissions, products: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Manage Products
                    </span>
                    <p className="text-xs text-slate-500">
                      Add, edit, and remove products
                    </p>
                  </div>
                  {permissions.products && (
                    <CheckIcon className="h-4 w-4 text-emerald-500" />
                  )}
                </label>

                <div className="border-t border-slate-200" />

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={permissions.orders}
                    onChange={(e) =>
                      setPermissions({ ...permissions, orders: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Manage Orders
                    </span>
                    <p className="text-xs text-slate-500">
                      View, fulfill, and cancel orders
                    </p>
                  </div>
                  {permissions.orders && (
                    <CheckIcon className="h-4 w-4 text-emerald-500" />
                  )}
                </label>

                <div className="border-t border-slate-200" />

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={permissions.settings}
                    onChange={(e) =>
                      setPermissions({ ...permissions, settings: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Manage Settings
                    </span>
                    <p className="text-xs text-slate-500">
                      Update store profile and preferences
                    </p>
                  </div>
                  {permissions.settings && (
                    <CheckIcon className="h-4 w-4 text-emerald-500" />
                  )}
                </label>
              </div>

              {/* Synced hidden input */}
              <input
                type="hidden"
                name="permissions"
                value={JSON.stringify(permissions)}
              />

              {/* Error message */}
              {state?.message && (
                <p className="text-sm text-red-500 font-medium text-center">
                  {state.message}
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
