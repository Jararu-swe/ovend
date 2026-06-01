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
  FacebookLogo,
  InstagramLogo,
  TikTokLogo,
  WhatsAppLogo,
  YouTubeLogo,
} from "@/app/ui/social-icons";
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
import ScrollToTop from "@/app/ui/scroll-to-top";

export default async function Page() {
  // Fetch featured stores for the showcase section
  const allStores = await fetchAllPublicStores();
  const featuredStores = allStores.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-slate-900 selection:bg-emerald-200">
      <MouseTrailer />
      <ScrollToTop />
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#FDFBF7]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-2">
            <VendleLogo />
            <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-800 md:inline">
              NIGERIA
            </span>
          </Link>
          <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm font-medium">
            <Link
              href="/login"
              className="text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-slate-900 px-4 md:px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-600 hover:-translate-y-0.5"
            >
              <span className="hidden sm:inline">Get started free</span>
              <span className="sm:hidden">Start</span>
              <ArrowRightIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                Vendle helps online vendors instantly create beautiful online
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

      {/* Flexible Multi-Vendor Platform Showcase - Mobile Mockup */}
      <section className="relative bg-gradient-to-br from-[#f0fdf4] via-white to-[#fef3c7] py-32 px-6 md:px-12 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#16a34a]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#eab308]/5 rounded-full blur-3xl"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left: Mobile Phone Mockup - Multi Vendor */}
            <FadeInUp delay={0.1}>
              <div className="flex justify-center md:justify-start">
                <ParallaxScroll
                  offset={30}
                  className="relative w-full max-w-sm"
                >
                  {/* Phone Frame */}
                  <div
                    className="relative bg-black rounded-[3rem] p-3 shadow-2xl"
                    style={{ aspectRatio: "9/16" }}
                  >
                    {/* Screen notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20"></div>

                    {/* Phone Screen - Dynamic Vendor Showcase */}
                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-white">
                      {/* Status Bar */}
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-white text-xs font-semibold">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <span>📶</span>
                          <span>📡</span>
                          <span>🔋</span>
                        </div>
                      </div>

                      {/* Header - Dynamic */}
                      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🏪</span>
                          <span className="font-bold text-sm">
                            Vendle Store
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Your business, beautifully online
                        </p>
                      </div>

                      {/* Vendor Category Tabs */}
                      <div className="flex overflow-x-auto px-3 py-2 border-b border-slate-200 gap-2 text-xs font-bold">
                        <button className="px-3 py-1 bg-slate-900 text-white rounded-full whitespace-nowrap">
                          Fashion 👗
                        </button>
                        <button className="px-3 py-1 text-slate-600 whitespace-nowrap">
                          Food 🍜
                        </button>
                        <button className="px-3 py-1 text-slate-600 whitespace-nowrap">
                          Beauty 💄
                        </button>
                        <button className="px-3 py-1 text-slate-600 whitespace-nowrap">
                          Crafts 🎨
                        </button>
                      </div>

                      {/* Featured Products Grid - Fashion Example */}
                      <div className="px-4 pb-20 space-y-3 pt-3">
                        {/* Product 1 - Fashion */}
                        <div className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow">
                          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-md h-24 flex items-center justify-center text-3xl mb-2">
                            👗
                          </div>
                          <p className="font-bold text-xs text-slate-900">
                            Designer Dress
                          </p>
                          <p className="text-xs text-slate-600 mb-2">₦8,500</p>
                          <button className="w-full bg-slate-900 text-white text-xs font-bold py-1 rounded-md hover:bg-slate-800 transition-colors">
                            Add to Cart
                          </button>
                        </div>

                        {/* Product 2 - Food */}
                        <div className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow">
                          <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-md h-24 flex items-center justify-center text-3xl mb-2">
                            🍜
                          </div>
                          <p className="font-bold text-xs text-slate-900">
                            Jollof Rice Meal
                          </p>
                          <p className="text-xs text-slate-600 mb-2">₦2,000</p>
                          <button className="w-full bg-slate-900 text-white text-xs font-bold py-1 rounded-md hover:bg-slate-800 transition-colors">
                            Add to Cart
                          </button>
                        </div>

                        {/* Product 3 - Beauty */}
                        <div className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow">
                          <div className="bg-gradient-to-br from-rose-100 to-yellow-100 rounded-md h-24 flex items-center justify-center text-3xl mb-2">
                            💄
                          </div>
                          <p className="font-bold text-xs text-slate-900">
                            Lip Gloss Set
                          </p>
                          <p className="text-xs text-slate-600 mb-2">₦3,200</p>
                          <button className="w-full bg-slate-900 text-white text-xs font-bold py-1 rounded-md hover:bg-slate-800 transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>

                      {/* Bottom Navigation */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-around items-center px-4 py-3 bg-white border-t border-slate-200 text-2xl">
                        <span>🏠</span>
                        <span>🔍</span>
                        <span>❤️</span>
                        <span>👤</span>
                      </div>
                    </div>
                  </div>

                  {/* Shadow Effect */}
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </ParallaxScroll>
              </div>
            </FadeInUp>

            {/* Right: Marketing Copy - Versatility Focus */}
            <div className="relative z-10">
              <FadeInUp delay={0.15}>
                <div className="inline-flex items-center gap-3 mb-6">
                  <span className="h-[2px] w-8 bg-slate-900 rounded-full"></span>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-700">
                    One platform, infinite possibilities
                  </p>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <h2
                  className={`${lusitana.className} text-4xl md:text-5xl font-bold leading-tight mb-6 text-slate-900`}
                >
                  Built for Every Type of{" "}
                  <span className="text-slate-700">Online Vendor</span>
                </h2>
              </FadeInUp>

              <FadeInUp delay={0.25}>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Fashion boutiques. Food vendors. Beauty brands. Artisans. Tech
                  sellers. Whether you're selling handcrafted items, digital
                  products, or services, Vendle adapts to your business. One
                  flexible platform that grows with you.
                </p>
              </FadeInUp>

              <StaggerContainer>
                <div className="space-y-4 mb-10">
                  <StaggerItem>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 mb-1">
                          Any Product Category
                        </p>
                        <p className="text-sm text-slate-600">
                          From physical goods to digital downloads, services to
                          subscriptions
                        </p>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 mb-1">
                          Customizable Themes
                        </p>
                        <p className="text-sm text-slate-600">
                          Choose designs that match your brand or create your
                          own aesthetic
                        </p>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 mb-1">
                          Scale as You Grow
                        </p>
                        <p className="text-sm text-slate-600">
                          Start solo, add team members, manage your bussines all
                          in one place
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                </div>
              </StaggerContainer>

              <FadeInUp delay={0.35}>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-slate-900 hover:bg-slate-800 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-105 group"
                >
                  <span>Start Your Store Free</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </FadeInUp>

              <FadeInUp delay={0.4}>
                <p className="text-xs text-slate-500 mt-6 font-medium">
                  Join 500+ vendors across 10+ categories already on Vendle
                </p>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      <HorizontalScrollStory />

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-12 md:py-14">
        <FadeInUp>
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 p-6 md:p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
            <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-emerald-100/80 blur-3xl"></div>
            <div className="absolute -left-12 bottom-6 h-28 w-28 rounded-full bg-slate-900/5 blur-3xl"></div>
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 font-semibold">
                  Social storefront
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Built for the social apps your customers already use.
                </h2>
                <p className="text-sm leading-7 text-slate-600">
                  Vendle links your store to Facebook, Instagram, TikTok,
                  WhatsApp and YouTube with a clean shareable experience.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-3 md:gap-4">
                {[
                  {
                    label: "Facebook",
                    classes: "bg-blue-600 text-white",
                    icon: <FacebookLogo />,
                  },
                  {
                    label: "Instagram",
                    classes:
                      "bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-300 text-white",
                    icon: <InstagramLogo />,
                  },
                  {
                    label: "TikTok",
                    classes: "bg-slate-900 text-white",
                    icon: <TikTokLogo />,
                  },
                  {
                    label: "WhatsApp",
                    classes: "bg-emerald-600 text-white",
                    icon: <WhatsAppLogo />,
                  },
                  {
                    label: "YouTube",
                    classes: "bg-red-600 text-white",
                    icon: <YouTubeLogo />,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex h-14 w-14 items-center justify-center rounded-3xl ${item.classes} shadow-lg shadow-slate-900/10 transition duration-500 ease-out hover:-translate-y-1 hover:scale-105`}
                    aria-label={item.label}
                  >
                    {item.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeInUp>
      </section>

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
        {/* Mudcloth Pattern Watermark */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none text-slate-900">
          <MudclothPattern />
        </div>
        
        {/* Subtle background element */}
        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/3 opacity-[0.03] pointer-events-none text-slate-900">
          <ArewaSymbol className="w-96 h-96" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div>
              <VendleLogo className="mb-4" />
              <p className="mt-4 text-sm leading-relaxed text-slate-500 max-w-sm font-medium">
               Sell online with a beautiful storefront.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-bold text-slate-700">
              <Link
                href="/explore"
                className="hover:text-emerald-600 transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/pricing"
                className="hover:text-emerald-600 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/help"
                className="hover:text-emerald-600 transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
          <div className="mt-16 border-t border-slate-200/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Vendle. Built in Nigeria.
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
