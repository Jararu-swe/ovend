import { auth } from '@/auth';
import { fetchUserById } from '@/app/lib/data';
import SettingsForm from '@/app/ui/dashboard/settings-form';
import DeleteStoreCard from '@/app/ui/dashboard/delete-store-card';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null; // Should be handled by middleware, but safer here too
  }

  const user = await fetchUserById(session.user.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your store profile, availability, and audio preferences.
        </p>
      </div>

      <div className="space-y-6 pb-10">
        <SettingsForm user={user}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DeleteStoreCard />

            {/* Account section (Read-only) */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-800">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="account-email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="account-email"
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 outline-none"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Contact support to change your account email address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SettingsForm>
      </div>
    </div>
  );
}
