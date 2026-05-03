import { fetchAllPublicStores } from '@/app/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, ArrowRightIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import ExploreSearch from '@/app/ui/explore-search';
import { pacifico, lusitana } from '@/app/ui/fonts';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/app/ui/scroll-animations';
import { MudclothPattern, ArewaSymbol } from '@/app/ui/landing-patterns';

function VendleLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${pacifico.className} ${className}`}>
      <span className="text-3xl text-emerald-600 leading-none">V</span>
      <span className="text-2xl text-emerald-600 leading-none tracking-tight">endle</span>
    </div>
  );
}

function generateStoreDescription(storeName: string, topProducts: { name: string }[], productCount: number) {
  if (topProducts.length >= 2) {
    const remaining = productCount - 2;
    const othersText = remaining > 0 ? `, and ${remaining} other premium items` : ' and other premium selections';
    return `Discover ${storeName}'s exclusive collection. Featuring their signature ${topProducts[0].name.toLowerCase()}, ${topProducts[1].name.toLowerCase()}${othersText}.`;
  } else if (topProducts.length === 1) {
    return `Explore ${storeName}, an independent boutique specializing in ${topProducts[0].name.toLowerCase()} and other carefully curated goods.`;
  }
  return `Welcome to ${storeName}. Browse a curated selection of premium products crafted with quality and elegance in mind.`;
}

export const metadata = {
  title: 'Explore Stores — Vendle',
  description: 'Browse and discover amazing vendor stores on Vendle. Shop from local Nigerian vendors with beautiful custom storefronts.',
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
    <div className="min-h-screen bg-[#FDFBF7] text-slate-600 relative overflow-hidden">
      
      {/* Cultural Watermark Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 fixed text-slate-900">
        <MudclothPattern />
      </div>

      <div className="absolute -top-[500px] -right-[500px] opacity-[0.02] pointer-events-none z-0 text-slate-900">
        <ArewaSymbol className="w-[1000px] h-[1000px] animate-spin-slow" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-200/80 bg-[#FDFBF7]/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-2 relative z-10">
            <VendleLogo />
          </Link>
          <div className="flex items-center gap-4 text-sm relative z-10">
            <Link href="/login" className="rounded-full px-5 py-2 text-slate-500 hover:text-slate-900 transition-colors font-bold uppercase tracking-wider text-xs">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-200 shadow-sm transition-all hover:bg-emerald-500 hover:text-white hover:shadow-md"
            >
              Get started
              <ArrowRightIcon className="h-3.5 w-3.5 stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-20 md:py-32 relative z-10">
        {/* Hero */}
        <div className="text-center mb-16 md:mb-24">
          <FadeInUp>
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></span>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
                The Marketplace
              </p>
            </div>
          </FadeInUp>
          
          <FadeInUp delay={0.1}>
            <h1 className={`${lusitana.className} text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 tracking-tight mb-8 leading-[1.05]`}>
              Explore our <br className="hidden md:block" />
              <span className="text-emerald-600 italic font-medium">diverse sellers</span>.
            </h1>
          </FadeInUp>
          
          <FadeInUp delay={0.2}>
            <p className="mt-3 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
              Discover amazing brands, boutiques, and artisans powering their business with Vendle's premium digital infrastructure.
            </p>
          </FadeInUp>
        </div>

        {/* Search */}
        <FadeInUp delay={0.3}>
          <ExploreSearch defaultValue={search} />
        </FadeInUp>

        {/* Results count */}
        <FadeInUp delay={0.4}>
          <div className="mt-16 mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              <span className="text-slate-900">{stores.length}</span> {stores.length === 1 ? 'store' : 'stores'} found
              {search && <span> for <span className="text-emerald-600 italic">"{search}"</span></span>}
            </p>
          </div>
        </FadeInUp>

        {/* Store Grid */}
        {stores.length === 0 ? (
          <FadeInUp delay={0.5}>
            <div className="flex flex-col items-center justify-center py-32 text-center rounded-[2rem] border border-slate-200/60 bg-white/50 backdrop-blur-md">
              <div className="rounded-full bg-emerald-50 p-6 mb-6 ring-1 ring-emerald-100">
                <ShoppingBagIcon className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className={`${lusitana.className} text-3xl font-bold text-slate-900 mb-4`}>No stores found</h2>
              <p className="text-lg text-slate-600 max-w-md font-light leading-relaxed">
                {search
                  ? `We couldn't find any stores matching "${search}". Try a different search term.`
                  : 'There are no stores with active products yet. Check back soon!'
                }
              </p>
            </div>
          </FadeInUp>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {stores.map((store) => (
              <StaggerItem key={store.id}>
                <Link
                  href={`/s/${store.store_slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all duration-500 hover:border-emerald-500/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
                  
                  {/* Big Hero Image Area */}
                  <div className="flex h-56 w-full overflow-hidden bg-slate-50 relative">
                    {store.top_products.length >= 3 ? (
                      <>
                        <div className="w-2/3 h-full relative group/img overflow-hidden">
                          {store.top_products[0].image_url ? (
                            <Image src={store.top_products[0].image_url} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-100"><ShoppingBagIcon className="w-8 h-8 text-slate-300"/></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80"></div>
                        </div>
                        <div className="w-1/3 h-full flex flex-col border-l border-white">
                          <div className="h-1/2 relative group/img overflow-hidden border-b border-white">
                            {store.top_products[1].image_url ? (
                              <Image src={store.top_products[1].image_url} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-slate-100"><ShoppingBagIcon className="w-5 h-5 text-slate-300"/></div>
                            )}
                          </div>
                          <div className="h-1/2 relative group/img overflow-hidden">
                            {store.top_products[2].image_url ? (
                              <Image src={store.top_products[2].image_url} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-slate-100"><ShoppingBagIcon className="w-5 h-5 text-slate-300"/></div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : store.top_products.length === 2 ? (
                      <>
                        <div className="w-1/2 h-full relative group/img overflow-hidden border-r border-white">
                          {store.top_products[0].image_url ? (
                            <Image src={store.top_products[0].image_url} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-100"><ShoppingBagIcon className="w-8 h-8 text-slate-300"/></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80"></div>
                        </div>
                        <div className="w-1/2 h-full relative group/img overflow-hidden">
                          {store.top_products[1].image_url ? (
                            <Image src={store.top_products[1].image_url} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-100"><ShoppingBagIcon className="w-8 h-8 text-slate-300"/></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80"></div>
                        </div>
                      </>
                    ) : store.top_products.length === 1 ? (
                      <div className="w-full h-full relative group/img overflow-hidden">
                        {store.top_products[0].image_url ? (
                          <Image src={store.top_products[0].image_url} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-100"><ShoppingBagIcon className="w-10 h-10 text-slate-300"/></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80"></div>
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-100">
                        <ShoppingBagIcon className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Store Info */}
                  <div className="p-6 relative z-20 flex-1 flex flex-col pt-0 bg-white">
                    {/* Floating Logo */}
                    <div className="flex justify-between items-start -mt-8 mb-4">
                      {store.logo_url ? (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white ring-4 ring-white group-hover:ring-emerald-50 transition-colors shadow-lg relative z-20">
                          <img src={store.logo_url} alt="" className="h-full w-full object-contain p-1" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-bold text-white bg-emerald-500 shadow-md group-hover:shadow-lg transition-all ring-4 ring-white relative z-20">
                          {store.store_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      {/* Floating Arrow */}
                      <div className="w-10 h-10 mt-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all shrink-0 group-hover:-rotate-45 relative z-20 shadow-sm">
                        <ArrowRightIcon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors stroke-[2.5]" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className={`${lusitana.className} text-2xl font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors`}>
                        {store.store_name}
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 mt-1">
                        {store.product_count} {store.product_count === 1 ? 'Product' : 'Products'}
                      </p>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-light mt-auto">
                      {generateStoreDescription(store.store_name, store.top_products, store.product_count)}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-24 relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} Vendle. All rights reserved.</p>
          <div className="flex items-center gap-8 text-xs uppercase tracking-widest font-bold">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <Link href="/explore" className="hover:text-emerald-600 transition-colors">Explore</Link>
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-emerald-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
