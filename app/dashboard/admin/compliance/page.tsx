import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { isAdminUser } from '@/app/lib/kyc-admin';
import ComplianceDashboard from '@/app/ui/dashboard/admin/compliance-dashboard';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Compliance & Fraud Control | Admin',
};

export default async function AdminCompliancePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const isAdmin = await isAdminUser(session.user.id);

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
          <ShieldExclamationIcon className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Compliance Portal Access Restricted</h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          This portal is reserved for Ovend compliance officers and system administrators. Your account (<span className="font-semibold text-slate-700">{session.user.email}</span>) is not listed in authorized administrator emails.
        </p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 max-w-md text-left">
          <p className="font-medium text-slate-800">Admin Setup Note:</p>
          <p className="mt-1">
            To grant access, add this email to the <code className="rounded bg-slate-200 px-1 py-0.5 text-slate-800 font-mono">ADMIN_EMAILS</code> environment variable separated by commas.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <ComplianceDashboard />;
}
