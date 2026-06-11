import { ShoppingBagIcon, PlusIcon, PencilSquareIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { fetchProductsList } from '@/app/lib/data';
import { auth } from '@/auth';
import { formatCurrency } from '@/app/lib/utils';
import Image from 'next/image';
import DeleteProductButton from '@/app/ui/products/delete-product-button';
import ContextualGuideBanner from '@/app/ui/dashboard/contextual-guide-banner';
import { getProductLimit } from '@/app/lib/subscriptions';

export default async function ProductsPage() {
  const session = await auth();
  const vendorId = session?.user?.id as string;
  const products = await fetchProductsList(vendorId);
  const productLimit = await getProductLimit(vendorId);
  const productCount = products.length;
  const isAtLimit = productCount >= productLimit;

  return (
    <div className="space-y-6">
      {vendorId && (
        <ContextualGuideBanner
          vendorId={vendorId}
          currentPage="/dashboard/products"
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your product catalogue and availability.
          </p>
        </div>
        {isAtLimit ? (
          <span
            className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed"
            title={`You've reached your limit of ${productLimit} products`}
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </span>
        ) : (
          <Link
            href="/dashboard/products/create"
            id="add-product-btn"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Link>
        )}
      </div>

      {/* Product Usage Indicator */}
      <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isAtLimit ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-white'}`}>
        <div className="flex items-center gap-3">
          {isAtLimit && (
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${isAtLimit ? 'text-amber-800' : 'text-slate-700'}`}>
              {productCount} / {productLimit} products used
            </p>
            {isAtLimit && (
              <p className="text-xs text-amber-600 mt-0.5">
                You&apos;ve reached your plan&apos;s product limit.
              </p>
            )}
          </div>
        </div>
        {isAtLimit && (
          <Link
            href="/dashboard/billing"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            Upgrade plan →
          </Link>
        )}
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
          {products.map((product) => {
            const hasStockLimit = product.stock_quantity !== null;
            const isOutOfStock = hasStockLimit && product.stock_quantity! <= 0;
            const isLowStock = hasStockLimit && product.stock_quantity! > 0 && product.stock_quantity! <= 5;
            
            let parsedOptions = [];
            try {
              if (product.options) parsedOptions = JSON.parse(product.options);
            } catch (e) {}

            return (
            <div
              key={product.id}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border ${isOutOfStock ? 'border-red-200 bg-red-50/10' : 'border-slate-100 bg-white'} shadow-sm transition-shadow hover:shadow-md`}
            >
              {/* Product Image Placeholder */}
              <div className="aspect-[4/3] w-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden relative">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                  />
                ) : (
                  <ShoppingBagIcon className="h-12 w-12" />
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      product.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {product.status}
                  </span>
                  {product.category && (
                    <span className="rounded-full bg-slate-800/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex flex-col items-start justify-between">
                  <h3 className={`font-semibold line-clamp-1 ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>{product.name}</h3>
                  <div className="flex items-end gap-2 mt-1">
                    <p className={`font-bold ${isOutOfStock ? 'text-slate-400' : 'text-emerald-600'}`}>{formatCurrency(product.price)}</p>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                       <p className="text-xs text-slate-400 line-through mb-0.5">{formatCurrency(product.compare_at_price)}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1 mb-2">
                  {/* Stock Indicator */}
                  {hasStockLimit ? (
                    isOutOfStock ? (
                      <span className="text-xs font-semibold text-red-500">Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="text-xs font-semibold text-orange-500">Only {product.stock_quantity} left</span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">{product.stock_quantity} in stock</span>
                    )
                  ) : (
                    <span className="text-xs font-medium text-slate-500">Unlimited stock</span>
                  )}
                  
                  {/* Options Indicator */}
                  {parsedOptions.length > 0 && (
                     <span className="text-xs font-medium text-blue-500">{parsedOptions.length} variant{parsedOptions.length !== 1 ? 's' : ''}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-100"
                    title="Edit product"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </Link>
                  <DeleteProductButton id={product.id} name={product.name} />
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
