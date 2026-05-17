import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { fetchDiscountById } from '@/app/lib/discounts';
import EditDiscountForm from '@/app/ui/discounts/edit-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function EditDiscountPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const discount = await fetchDiscountById(params.id, session.user.id);
  
  if (!discount) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/discounts"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Edit Discount Code</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update your discount code details.
          </p>
        </div>
      </div>
      <EditDiscountForm discount={discount} />
    </div>
  );
}
