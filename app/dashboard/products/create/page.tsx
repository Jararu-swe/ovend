import Form from '@/app/ui/products/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

export default function Page() {
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

      <Form />
    </main>
  );
}
