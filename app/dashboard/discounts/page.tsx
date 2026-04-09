import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import DiscountList from '@/app/ui/discounts/discount-list';
import { DiscountListSkeleton } from '@/app/ui/skeletons';

export default async function DiscountsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Discount Codes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create promo codes & track their performance.
          </p>
        </div>
        <Link
          href="/dashboard/discounts/create"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Create Discount</span>
        </Link>
      </div>
      <Suspense fallback={<DiscountListSkeleton />}>
        <DiscountList vendorId={session.user.id} />
      </Suspense>
    </div>
  );
}
