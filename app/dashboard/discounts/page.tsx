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
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Discount Codes</h1>
        <Link
          href="/dashboard/discounts/create"
          className="flex h-10 items-center rounded-xl bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          <span className="hidden md:block">Create Discount</span>
          <PlusIcon className="h-5 md:ml-2" />
        </Link>
      </div>
      <Suspense fallback={<DiscountListSkeleton />}>
        <DiscountList vendorId={session.user.id} />
      </Suspense>
    </div>
  );
}
