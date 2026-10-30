import { auth } from '@/auth';
import { getVendorKYCProfile } from '@/app/lib/kyc';
import KYCManager from '@/app/ui/dashboard/kyc/kyc-manager';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Identity Verification (KYC)',
};

export default async function KYCPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const profile = await getVendorKYCProfile(session.user.id);
  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification & KYC</h1>
        <p className="mt-1 text-sm text-slate-500">
          Verify your identity to increase payout thresholds, accelerate settlement times, and protect your store.
        </p>
      </div>

      <KYCManager initialProfile={profile} />
    </div>
  );
}
