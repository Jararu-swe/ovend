import Form from '@/app/ui/products/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchProductById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto space-y-8">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Products', href: '/dashboard/products' },
          {
            label: 'Edit Product',
            href: `/dashboard/products/${id}/edit`,
            active: true,
          },
        ]}
      />
      
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your product details and availability.
        </p>
      </div>

      <Form product={product} />
    </main>
  );
}
