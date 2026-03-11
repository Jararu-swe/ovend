import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CreateDiscountForm from '@/app/ui/discounts/create-form';

export default async function CreateDiscountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Discount Code</h1>
      <CreateDiscountForm vendorId={session.user.id} />
    </div>
  );
}
