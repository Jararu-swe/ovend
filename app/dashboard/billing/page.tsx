import { auth } from '@/auth';
import { fetchUserById } from '@/app/lib/data';
import SubscriptionPayCard from '@/app/ui/dashboard/subscription-pay-card';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Billing',
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await fetchUserById(session.user.id);
  if (!user) notFound();

  return (
    <>
      <Script 
        src="https://js.paystack.co/v1/inline.js" 
        strategy="lazyOnload"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your store active with a ₦3,000 monthly subscription.
          </p>
        </div>

        <SubscriptionPayCard user={user} />
      </div>
    </>
  );
}

