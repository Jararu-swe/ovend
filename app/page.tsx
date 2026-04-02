import { ArrowRightIcon, PlayCircleIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana } from './ui/fonts';
import { fetchAllPublicStores } from '@/app/lib/data';
import { formatCurrency } from '@/app/lib/utils';

export default async function Page() {
  // Fetch featured stores for the showcase section
  const allStores = await fetchAllPublicStores();
  const featuredStores = allStores.slice(0, 4);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Top navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brandname.svg"
              alt="Ovend"
              width={120}
              height={40}
              priority
            />
            <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 md:inline">
              for Nigerian vendors
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <Link
              href="/explore"
              className="hidden sm:inline-flex rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium transition"
            >
              Browse Stores
            </Link>
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hidden items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-400 md:inline-flex"
            >
              <span>Get started free</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="px-6 py-10 md:px-12 md:py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 md:flex-row md:items-center">
          <div className="relative flex flex-1 flex-col gap-6">
            <div className={styles.shape} />

            <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-600/80">
              SIMPLE STOREFRONTS FOR LOCAL SELLERS
            </p>

            <h1
              className={`${lusitana.className} text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl`}
            >
              Turn your{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                WhatsApp and Instagram
              </span>{" "}
              into a modern storefront.
            </h1>

            <p className="max-w-xl text-sm text-slate-600 md:text-base">
              Ovend helps Nigerian vendors create a simple online store, accept
              secure payments, and track orders — all from one clean, mobile‑first
              dashboard that feels as polished as global e‑commerce platforms.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 md:text-base"
              >
                <span>Get started free</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 md:text-base"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-500" />
                <span>Browse vendor stores</span>
              </Link>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 md:text-xs">
              <span>✓ No coding or designers needed</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:inline-block" />
              <span>✓ Works beautifully on low‑end Android phones</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:inline-block" />
              <span>✓ Share one link across all your socials</span>
            </div>
          </div>

          <div className="mt-4 flex flex-1 justify-center md:mt-0">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 -translate-x-6 translate-y-6 rounded-3xl bg-emerald-500/5 blur-3xl" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl ring-1 ring-slate-100 backdrop-blur-lg">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Vendor dashboard snapshot
                </p>

                <div className="space-y-3 text-xs text-slate-800">
                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-400/10 to-sky-400/10 px-4 py-3">
                    <span className="text-[11px] font-medium text-slate-900">
                      Total orders (this week)
                    </span>
                    <span className="text-base font-semibold text-emerald-300">
                      27
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-[11px] text-slate-600">
                      Revenue (NGN)
                    </span>
                    <span className="text-sm font-semibold text-sky-600">
                      ₦342,500
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-[11px] text-slate-600">
                      Best‑selling product
                    </span>
                    <span className="truncate text-right text-xs text-slate-900">
                      Ankara two‑piece set
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-slate-600">
                  <div className="space-y-1 rounded-2xl bg-slate-50 px-3 py-3">
                    <p className="font-medium text-slate-900">
                      Share anywhere
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      Drop your Ovend link on Status, Reels, and DMs — customers
                      check out without chatting first.
                    </p>
                  </div>
                  <div className="space-y-1 rounded-2xl bg-slate-50 px-3 py-3">
                    <p className="font-medium text-slate-900">
                      Stay organised
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      Orders, payments, and customer details all live in one
                      simple dashboard.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[10px] leading-relaxed text-slate-500">
                  Join early Ovend vendors who are turning chats into structured
                  orders and more repeat customers — without leaving their phones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores Section */}
      {featuredStores.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 px-6 py-16 md:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-600/80 mb-2">
                  LIVE ON OVEND
                </p>
                <h2 className={`${lusitana.className} text-2xl font-semibold text-slate-900 md:text-3xl`}>
                  Featured Stores
                </h2>
                <p className="mt-2 text-sm text-slate-500">Browse products from verified Nigerian vendors</p>
              </div>
              <Link
                href="/explore"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                View all stores
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredStores.map((store) => (
                <Link
                  key={store.id}
                  href={`/s/${store.store_slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
                >
                  {/* Product thumbnails */}
                  <div className="flex h-28 overflow-hidden bg-slate-100">
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
                              <ShoppingBagIcon className="h-6 w-6 text-slate-200" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50">
                        <ShoppingBagIcon className="h-8 w-8 text-slate-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-4">
                    {store.logo_url ? (
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={store.logo_url} alt="" className="h-full w-full object-contain p-0.5" />
                      </div>
                    ) : (
                      <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-emerald-500 to-sky-500">
                        {store.store_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                        {store.store_name}
                      </h3>
                      <p className="text-[11px] text-slate-500">{store.product_count} products</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400"
              >
                Browse all stores
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <Image src="/brandname.svg" alt="Ovend" width={90} height={30} />
              <p className="mt-2 text-xs text-slate-500 max-w-xs">
                Simple, beautiful storefronts for Nigerian vendors. Sell online, accept payments, and grow your business.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
              <Link href="/explore" className="hover:text-emerald-600 transition">Explore</Link>
              <Link href="/order-status" className="hover:text-emerald-600 transition">Track Order</Link>
              <Link href="/login" className="hover:text-emerald-600 transition">Sign in</Link>
              <Link href="/signup" className="hover:text-emerald-600 transition">Create Store</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Ovend. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
