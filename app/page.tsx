import {
  ArrowRightIcon,
  PlayCircleIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { lusitana } from "./ui/fonts";
import { fetchAllPublicStores } from "@/app/lib/data";
import { formatCurrency } from "@/app/lib/utils";
import {
  MudclothPattern,
  ArewaSymbol,
  TribalBand,
  CowrieSymbol,
  MudclothStar,
  Tambari,
} from "@/app/ui/landing-patterns";
import { AnimatedBackground } from "@/app/ui/animated-background";
import {
  FadeInUp,
  StaggerContainer,
  StaggerItem,
  ParallaxScroll,
} from "@/app/ui/scroll-animations";
import { HorizontalScrollStory } from "@/app/ui/horizontal-scroll-story";
import { MouseTrailer } from "@/app/ui/mouse-trailer";
import VendleLogo from "@/app/ui/vendle-logo";
import FAQ from "@/app/ui/faq";

export default async function Page() {
  // Fetch featured stores for the showcase section
  const allStores = await fetchAllPublicStores();
  const featuredStores = allStores.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-emerald-200">
      <MouseTrailer />
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#FDFBF7]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-2">
            <VendleLogo />
            <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-800 md:inline">
              NIGERIA
            </span>
          </Link>
          <div className="flex items-center gap-6 text-xs md:text-sm font-medium">
            <Link
              href="/login"
              className="text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hidden items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-600 md:inline-flex hover:-translate-y-0.5"
            >
              <span>Get started free</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 md:px-12 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
        {/* Background Patterns with Parallax */}
        <ParallaxScroll offset={80} className="absolute inset-0 z-0">
          <MudclothPattern className="text-slate-900" opacity={0.03} />
          <AnimatedBackground />
        </ParallaxScroll>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 md:flex-row md:items-center z-10">
          <div className="flex flex-1 flex-col gap-8">
            <FadeInUp delay={0.1}>
              <div className="inline-flex items-center gap-3">
                <span className="h-[2px] w-8 bg-emerald-500 rounded-full"></span>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                  Built for African Commerce
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <h1
                className={`${lusitana.className} text-4xl font-bold leading-[1.15] text-slate-900 md:text-5xl lg:text-6xl xl:text-7xl tracking-tight`}
              >
                Turn your <br className="hidden md:block" />
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10 text-emerald-600">
                    social media
                  </span>
                  <span className="absolute bottom-1 left-0 -z-10 h-3 w-full bg-emerald-200/60 skew-x-[-15deg]"></span>
                </span>{" "}
                <br className="hidden md:block" />
                into a global storefront.
              </h1>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                Vendle helps Nigerian vendors instantly create beautiful online
                stores, process secure payments, and manage orders from a single
                mobile dashboard. Setup takes less than 3 minutes.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.4}>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-sm font-bold tracking-wide text-white shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/40 md:text-base"
                >
                  <span>Launch Your Store</span>
                  <ArrowRightIcon className="h-5 w-5 stroke-2" />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-transparent px-8 py-4 text-sm font-bold tracking-wide text-slate-900 transition-all hover:bg-slate-900 hover:text-white md:text-base"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 stroke-2" />
                  <span>Explore Vendors</span>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-medium text-slate-500 mt-6">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✦</span> Zero coding
                  required
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✦</span> Mobile-first
                  design
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✦</span> Unified social
                  links
                </span>
              </div>
            </FadeInUp>
          </div>

          <FadeInUp
            delay={0.5}
            className="flex flex-1 justify-center md:justify-end lg:ml-12 relative"
          >
            {/* Actual Dashboard Preview */}
            <div className="relative w-full max-w-[420px]">
              <div className="absolute inset-0 bg-emerald-600 rounded-[2.5rem] rotate-3 scale-105 opacity-10 transition-transform duration-700 hover:rotate-6"></div>
              <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] -rotate-2 scale-105 opacity-10 transition-transform duration-700 hover:-rotate-4"></div>

              <div className="relative rounded-[2.5rem] border-8 border-white bg-gradient-to-b from-slate-50 to-slate-100 p-5 shadow-2xl ring-1 ring-slate-200 hover:-translate-y-2 transition-transform duration-500">
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <p className="text-[9px] font-bold text-slate-600">9:41</p>
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-slate-600"></div>
                    <div className="h-1 w-1 rounded-full bg-slate-600"></div>
                    <div className="h-1 w-2 rounded-full bg-slate-600"></div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="space-y-3">
                  {/* Hero Section */}
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-100 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                          Store Dashboard
                        </p>
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          Welcome back!
                        </p>
                      </div>
                      <div className="h-6 w-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-600">
                      Store is live & performing well
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                      <p className="text-[7px] font-bold uppercase text-slate-500 mb-1">
                        Visits
                      </p>
                      <p className="text-sm font-bold text-blue-900">284</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                      <p className="text-[7px] font-bold uppercase text-slate-500 mb-1">
                        Orders
                      </p>
                      <p className="text-sm font-bold text-emerald-900">42</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                      <p className="text-[7px] font-bold uppercase text-slate-500 mb-1">
                        Revenue
                      </p>
                      <p className="text-sm font-bold text-amber-900">₦125k</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 p-2.5 transition text-left">
                      <p className="text-[8px] font-bold text-emerald-700">
                        + Add Product
                      </p>
                    </button>
                    <button className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 p-2.5 transition text-left">
                      <p className="text-[8px] font-bold text-slate-700">
                        📦 Orders
                      </p>
                    </button>
                  </div>

                  {/* Store Status */}
                  <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 text-white">
                    <p className="text-[8px] font-bold uppercase mb-1">
                      Your store is live!
                    </p>
                    <p className="text-[7px] text-emerald-50 mb-2">
                      Share link with customers
                    </p>
                    <button className="w-full rounded-lg bg-white text-emerald-600 py-1.5 text-[8px] font-bold hover:bg-emerald-50 transition">
                      View Store
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="relative bg-[#0A1110] text-white overflow-hidden py-32 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <FadeInUp>
            <div className="flex flex-col md:flex-row gap-8 items-end justify-between mb-20">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-3 mb-6">
                  <span className="h-[2px] w-8 bg-emerald-500 rounded-full"></span>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                    Joy from Africa
                  </p>
                </div>
                <h2
                  className={`${lusitana.className} text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6`}
                >
                  Empowering African <br className="hidden md:block" /> Craft &
                  Commerce
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Vendle is an investment in independent artisans, local
                  craftsmanship, and visionary small businesses across Nigeria.
                  We provide the digital tools to share their joy with the
                  world.
                </p>
              </div>
              <div className="hidden md:block">
                <ArewaSymbol className="w-24 h-24 text-emerald-500 opacity-20" />
              </div>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
            {/* Image 1: large left */}
            <div className="md:col-span-7 h-[400px] md:h-[600px] relative rounded-[2rem] overflow-hidden group">
              <ParallaxScroll
                offset={40}
                className="h-[120%] w-[120%] -top-[10%] -left-[10%] absolute"
              >
                <Image
                  src="/images/story/artisan-1.jpg"
                  alt="Artisan making products"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </ParallaxScroll>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1110]/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-white z-10">
                <p className="font-bold text-xl mb-1">Handcrafted Beauty</p>
                <p className="text-sm font-medium text-emerald-300">
                  Sustainable local ingredients
                </p>
              </div>
            </div>

            {/* Images 2 & 3: stacked right */}
            <div className="md:col-span-5 flex flex-col gap-6 md:gap-8 lg:gap-12">
              <div className="h-[250px] md:h-[280px] relative rounded-[2rem] overflow-hidden group">
                <ParallaxScroll
                  offset={20}
                  className="h-[120%] w-[120%] -top-[10%] -left-[10%] absolute"
                >
                  <Image
                    src="/images/story/artisan-2.jpg"
                    alt="Knowledge and heritage"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                </ParallaxScroll>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1110]/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white z-10">
                  <p className="font-bold text-lg mb-1">Heritage & Culture</p>
                  <p className="text-xs font-medium text-emerald-300">
                    Sharing local wisdom
                  </p>
                </div>
              </div>
              <div className="h-[250px] md:h-[280px] relative rounded-[2rem] overflow-hidden group bg-slate-800">
                <ParallaxScroll
                  offset={20}
                  className="h-[120%] w-[120%] -top-[10%] -left-[10%] absolute"
                >
                  <Image
                    src="/images/story/artisan-3.jpg"
                    alt="Local cuisine and treats"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                </ParallaxScroll>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1110]/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white z-10">
                  <p className="font-bold text-lg mb-1">Culinary Arts</p>
                  <p className="text-xs font-medium text-emerald-300">
                    Authentic regional flavors
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HorizontalScrollStory />

      <FAQ />

      {/* Marketing / Social Proof CTA */}
      <section className="relative bg-[#0A1110] text-white py-32 md:py-48 px-6 md:px-12 overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 opacity-[0.03]">
          <MudclothPattern />
        </div>

        <div className="mx-auto max-w-5xl relative z-10 text-center flex flex-col items-center">
          <FadeInUp>
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                Join the movement
              </p>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <h2
              className={`${lusitana.className} text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8 text-white`}
            >
              Sell anything, <br />
              <span className="text-emerald-400 italic font-medium">
                to anyone,
              </span>{" "}
              anywhere.
            </h2>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              Take control of your business with a premium digital storefront
              that converts your followers into loyal customers.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-emerald-500 px-10 py-5 text-lg font-bold text-slate-900 transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]"
            >
              <span>Create your store free</span>
              <ArrowRightIcon className="h-5 w-5 stroke-[2.5]" />
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-[#FDFBF7] relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/3 opacity-5 pointer-events-none">
          <ArewaSymbol className="w-96 h-96" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div>
              <VendleLogo className="mb-4" />
              <p className="mt-4 text-sm leading-relaxed text-slate-500 max-w-sm font-medium">
                Simple, beautiful storefronts for Nigerian vendors. Turn your
                social media into a powerful e-commerce business.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm font-bold text-slate-700">
              <Link
                href="/explore"
                className="hover:text-emerald-600 transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/order-status"
                className="hover:text-emerald-600 transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/profile"
                className="hover:text-emerald-600 transition-colors"
              >
                User Profile
              </Link>
              <Link
                href="/login"
                className="hover:text-emerald-600 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hover:text-emerald-600 transition-colors"
              >
                Create Store
              </Link>
            </div>
          </div>
          <div className="mt-16 border-t border-slate-200/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Vendle. Built in Nigeria.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
