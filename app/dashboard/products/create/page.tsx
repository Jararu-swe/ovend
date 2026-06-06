import Form from '@/app/ui/products/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { auth } from '@/auth';
import { getProductLimit } from '@/app/lib/subscriptions';
import { fetchProductsList } from '@/app/lib/data';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default async function Page() {
  const session = await auth();
  const vendorId = session?.user?.id as string;
  const products = await fetchProductsList(vendorId);
  const productLimit = await getProductLimit(vendorId);
  const isAtLimit = products.length >= productLimit;

  if (isAtLimit) {
    return (
      <main className="max-w-3xl mx-auto space-y-8">
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Products', href: '/dashboard/products' },
            {
              label: 'Create Product',
              href: '/dashboard/products/create',
              active: true,
            },
          ]}
        />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 py-16 px-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-amber-400" />
          <h2 className="mt-4 text-lg font-semibold text-amber-900">
            Product limit reached
          </h2>
          <p className="mt-2 max-w-sm text-sm text-amber-700">
            You&apos;ve used all {productLimit} products available on your current plan.
            Upgrade to add more products to your store.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/dashboard/products"
              className="rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Back to Products
            </Link>
            <Link
              href="/dashboard/billing"
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto space-y-8">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Products', href: '/dashboard/products' },
          {
            label: 'Create Product',
            href: '/dashboard/products/create',
            active: true,
          },
        ]}
      />
      
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Add a new product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell your customers what you&apos;re selling today.
        </p>
      </div>

      <Form/>
    </main>
  );
}
