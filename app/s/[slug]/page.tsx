import { fetchVendorBySlug, fetchProducts } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/app/lib/utils';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function StorePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  const vendor = await fetchVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const products = await fetchProducts(vendor.id);
  const activeProducts = products.filter((p) => p.status === 'active');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Store Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white uppercase">
              {vendor.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{vendor.name}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">
                ovend.app/s/{vendor.store_slug}
              </p>
            </div>
          </div>
          <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-500 transition-colors">
            <ShoppingBagIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl relative">
            <div className="relative z-10">
                <h2 className="text-2xl font-bold tracking-tight">Welcome to our store</h2>
                <p className="mt-2 text-slate-300 text-sm max-w-[240px]">
                    Browse our collection and order directly via WhatsApp.
                </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full mr-10 mb-10 blur-xl"></div>
        </div>

        <section id="item-list">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Products</h3>
            <span className="text-xs text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-100 italic">
                {activeProducts.length} items available
            </span>
          </div>

          {activeProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBagIcon className="h-12 w-12 text-slate-200" />
              <p className="mt-4 text-slate-500">No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {activeProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-square relative flex items-center justify-center bg-slate-50 text-slate-200 overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    ) : (
                      <ShoppingBagIcon className="h-16 w-16" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 leading-snug">{product.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
                        <p className="text-lg font-bold text-emerald-600">
                          {formatCurrency(product.price)}
                        </p>
                        <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Cart Summary (Float) - Placeholder */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 z-10">
        <button className="flex w-full items-center justify-between rounded-3xl bg-emerald-600 p-4 font-bold text-white shadow-2xl transition hover:bg-emerald-500 active:scale-95">
          <span>0 items in cart</span>
          <span className="flex items-center gap-2">
            View Cart <ArrowRightIcon className="h-5 w-5" />
          </span>
        </button>
      </footer>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
