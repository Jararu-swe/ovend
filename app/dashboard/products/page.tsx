import { ShoppingBagIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { fetchProducts } from '@/app/lib/data';
import { auth } from '@/auth';
import { formatCurrency } from '@/app/lib/utils';
import Image from 'next/image';
import { deleteProduct } from '@/app/lib/actions';

export default async function ProductsPage() {
  const session = await auth();
  const products = await fetchProducts(session?.user?.id as string);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your product catalogue and availability.
          </p>
        </div>
        <Link
          href="/dashboard/products/create"
          id="add-product-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
        >
          <PlusIcon className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <ShoppingBagIcon className="h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-base font-semibold text-slate-700">No products yet</h2>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Add your first product so customers can start browsing your store.
          </p>
          <Link
            href="/dashboard/products/create"
            id="add-first-product-btn"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
          >
            <PlusIcon className="h-4 w-4" />
            Add your first product
          </Link>
        </div>
      ) : (
        /* Product list */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Product Image Placeholder */}
              <div className="aspect-[4/3] w-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden relative">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <ShoppingBagIcon className="h-12 w-12" />
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      product.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
                  <p className="font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                  {product.description}
                </p>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-100"
                    title="Edit product"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </Link>
                  <form action={deleteProduct.bind(null, product.id)}>
                    <button
                      type="submit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-500 hover:border-red-100"
                      title="Delete product"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
