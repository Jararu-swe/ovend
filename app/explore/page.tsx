import { fetchAllPublicStores } from '@/app/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, ArrowRightIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import ExploreSearch from '@/app/ui/explore-search';

export const metadata = {
  title: 'Explore Stores — Ovend',
  description: 'Browse and discover amazing vendor stores on Ovend. Shop from local Nigerian vendors with beautiful custom storefronts.',
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const search = params.q || '';
  const stores = await fetchAllPublicStores(search || undefined);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/brandname.svg" alt="Ovend" width={100} height={32} priority />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-full px-4 py-2 text-slate-600 hover:text-slate-900 transition font-medium">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
            >
              Get started
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Explore Stores
          </h1>
          <p className="mt-3 text-base text-slate-500 max-w-lg mx-auto">
            Discover amazing vendors on Ovend. Browse products, find deals, and shop directly from local Nigerian businesses.
          </p>
        </div>

        {/* Search */}
        <ExploreSearch defaultValue={search} />

        {/* Results count */}
        <div className="mt-8 mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            {stores.length} {stores.length === 1 ? 'store' : 'stores'} found
            {search && <span> for &ldquo;{search}&rdquo;</span>}
          </p>
        </div>

        {/* Store Grid */}
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-slate-100 p-6 mb-6">
              <ShoppingBagIcon className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">No stores found</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              {search
                ? `We couldn't find any stores matching "${search}". Try a different search term.`
                : 'There are no stores with active products yet. Check back soon!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/s/${store.store_slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
              >
                {/* Top product thumbnails */}
                <div className="flex h-36 overflow-hidden bg-slate-100">
                  {store.top_products.length > 0 ? (
                    store.top_products.map((product, i) => (
                      <div key={i} className="relative flex-1 overflow-hidden border-r last:border-r-0 border-slate-200/50">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                            <ShoppingBagIcon className="h-8 w-8 text-slate-200" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50">
                      <ShoppingBagIcon className="h-10 w-10 text-slate-200" />
                    </div>
                  )}
                </div>

                {/* Store info */}
                <div className="flex items-center gap-3 p-5">
                  {/* Logo / Avatar */}
                  {store.logo_url ? (
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-slate-100">
                      <img src={store.logo_url} alt="" className="h-full w-full object-contain p-0.5" />
                    </div>
                  ) : (
                    <div
                      className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-base font-bold text-white bg-gradient-to-br from-emerald-500 to-sky-500"
                    >
                      {store.store_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                      {store.store_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {store.product_count} {store.product_count === 1 ? 'product' : 'products'}
                    </p>
                  </div>

                  <ArrowRightIcon className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Ovend. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-700 transition">Home</Link>
            <Link href="/explore" className="hover:text-slate-700 transition">Explore</Link>
            <Link href="/login" className="hover:text-slate-700 transition">Sign in</Link>
            <Link href="/signup" className="hover:text-slate-700 transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
