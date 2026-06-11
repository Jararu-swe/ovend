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
              className="relative z-20 pointer-events-auto text-slate-600 hover:text-emerald-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="relative z-20 pointer-events-auto inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-slate-900 px-4 md:px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-600 hover:-translate-y-0.5"
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
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-sm font-bold tracking-wide text-white shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/40 md:text-base"
                >
                  <span>Launch Your Store</span>
                  <ArrowRightIcon className="h-5 w-5 stroke-2" />
                </Link>
                <Link
                  href="/explore"
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-transparent px-8 py-4 text-sm font-bold tracking-wide text-slate-900 transition-all hover:bg-slate-900 hover:text-white md:text-base"
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

              {/* Scroll indicator */}
              <div className="mt-12 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Scroll to explore
                </span>
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </FadeInUp>
          </div>

          <FadeInUp
            delay={0.5}
            className="flex flex-1 justify-center md:justify-end lg:ml-12 relative"
          >
            {/* Dashboard Screenshot */}
            <div className="relative w-full max-w-[220px] md:max-w-[260px] lg:max-w-[280px]">
              <div className="absolute inset-0 bg-emerald-600 rounded-[2.5rem] rotate-3 scale-105 opacity-10 transition-transform duration-700 hover:rotate-6"></div>
              <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] -rotate-2 scale-105 opacity-10 transition-transform duration-700 hover:-rotate-4"></div>

              <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl ring-1 ring-slate-200 hover:-translate-y-2 transition-transform duration-500">
                <Image
                  src="/images/hero-storefront.png"
                  alt="Vendle Dashboard"
                  width={340}
                  height={510}
                  className="w-full h-auto"
                  priority
                />
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
      <section className="relative bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/50 py-24 md:py-32 lg:py-40 px-6 md:px-12 overflow-hidden">
        {/* Enhanced Decorative background elements */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-900/5 rounded-full blur-3xl"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Mobile Screenshots Stack - Poker Hand Layout */}
            <FadeInUp delay={0.1}>
              <div className="relative h-[400px] md:h-[480px] lg:h-[560px] flex items-end justify-center lg:justify-start group/stack">
                {/* Mobile Screenshot 1 - Left Card */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 lg:left-1/2 lg:-translate-x-1/2 bottom-0 w-full max-w-[140px] md:max-w-[180px] lg:max-w-[220px] origin-bottom transition-all duration-500 group-hover/stack:opacity-40 hover:!opacity-100 hover:!z-50 hover:!scale-105 z-10"
                  style={{
                    transform:
                      "translateX(-50%) translateX(-80px) rotate(-15deg)",
                    transformOrigin: "bottom center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 rounded-[1.5rem] md:rounded-[2rem] scale-105 opacity-15 blur-sm"></div>

                  <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 md:border-[6px] border-white shadow-2xl ring-1 ring-slate-900/10 transition-all duration-500 group hover:rotate-0 hover:shadow-3xl cursor-pointer hover:-translate-y-8">
                    <Image
                      src="/images/platform-mockup-1.png"
                      alt="Vendle Store - Fashion Example"
                      width={340}
                      height={510}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>

                {/* Mobile Screenshot 2 - Center Card */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 lg:left-1/2 lg:-translate-x-1/2 bottom-0 w-full max-w-[140px] md:max-w-[180px] lg:max-w-[220px] origin-bottom transition-all duration-500 group-hover/stack:opacity-40 hover:!opacity-100 hover:!z-50 hover:!scale-105 z-20"
                  style={{
                    transform: "translateX(-50%) rotate(0deg)",
                    transformOrigin: "bottom center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-[1.5rem] md:rounded-[2rem] scale-105 opacity-15 blur-sm"></div>

                  <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 md:border-[6px] border-white shadow-2xl ring-1 ring-emerald-900/10 transition-all duration-500 group hover:shadow-3xl cursor-pointer hover:-translate-y-8">
                    <Image
                      src="/images/platform-mockup-2.png"
                      alt="Vendle Store - Beauty Example"
                      width={340}
                      height={510}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>

                {/* Mobile Screenshot 3 - Right Card */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 lg:left-1/2 lg:-translate-x-1/2 bottom-0 w-full max-w-[140px] md:max-w-[180px] lg:max-w-[220px] origin-bottom transition-all duration-500 group-hover/stack:opacity-40 hover:!opacity-100 hover:!z-50 hover:!scale-105 z-30"
                  style={{
                    transform:
                      "translateX(-50%) translateX(80px) rotate(15deg)",
                    transformOrigin: "bottom center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-500 rounded-[1.5rem] md:rounded-[2rem] scale-105 opacity-15 blur-sm"></div>

                  <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-4 md:border-[6px] border-white shadow-2xl ring-1 ring-amber-900/10 transition-all duration-500 group hover:rotate-0 hover:shadow-3xl cursor-pointer hover:-translate-y-8">
                    <Image
                      src="/images/story/platform-mockup-3.png"
                      alt="Vendle Store - Food Example"
                      width={340}
                      height={510}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Right: Marketing Copy - Enhanced Typography and Spacing */}
            <div className="relative z-10 lg:pl-8">
              <FadeInUp delay={0.15}>
                <div className="inline-flex items-center gap-3 mb-8">
                  <span className="h-[2px] w-10 bg-gradient-to-r from-emerald-600 to-slate-900 rounded-full"></span>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                    One platform, infinite possibilities
                  </p>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.2}>
                <h2
                  className={`${lusitana.className} text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-8 text-slate-900`}
                >
                  Built for Every Type of{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-slate-900">
                      Online Vendor
                    </span>
                    <span className="absolute bottom-2 left-0 -z-10 h-4 w-full bg-emerald-200/40 skew-x-[-12deg]"></span>
                  </span>
                </h2>
              </FadeInUp>

              <FadeInUp delay={0.25}>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                  Fashion boutiques. Food vendors. Beauty brands. Artisans. Tech
                  sellers. Whether you're selling handcrafted items, digital
                  products, or services, Vendle adapts to your business. One
                  flexible platform that grows with you.
                </p>
              </FadeInUp>

              <StaggerContainer>
                <div className="space-y-6 mb-12">
                  <StaggerItem>
                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-base">
                          ✓
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 mb-2 text-lg">
                          Any Product Category
                        </p>
                        <p className="text-base text-slate-600 leading-relaxed">
                          From physical goods to digital downloads, services to
                          subscriptions
                        </p>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-base">
                          ✓
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 mb-2 text-lg">
                          Customizable Themes
                        </p>
                        <p className="text-base text-slate-600 leading-relaxed">
                          Choose designs that match your brand or create your
                          own aesthetic
                        </p>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-amber-900/20 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-base">
                          ✓
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 mb-2 text-lg">
                          Scale as You Grow
                        </p>
                        <p className="text-base text-slate-600 leading-relaxed">
                          Start solo, add team members, manage your business all
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
                  className="pointer-events-auto inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-emerald-600 hover:to-emerald-500 px-10 py-5 text-base font-bold text-white transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 group"
                >
                  <span>Start Your Store Free</span>
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </FadeInUp>

              <FadeInUp delay={0.4}>
                <p className="text-sm text-slate-500 mt-8 font-medium flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span>
                  Join 500+ vendors across 10+ categories already on Vendle
                </p>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Dashboard Showcase Section */}
      <section className="relative bg-slate-900 text-white py-24 md:py-32 lg:py-40 px-6 md:px-12 overflow-hidden">
        {/* Decorative background patterns */}
        <div className="absolute inset-0 opacity-[0.03]">
          <MudclothPattern />
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <FadeInUp>
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="h-[2px] w-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"></span>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                  Powerful Dashboard
                </p>
                <span className="h-[2px] w-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"></span>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <h2
                className={`${lusitana.className} text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 text-white`}
              >
                Manage Everything from{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                    One Dashboard
                  </span>
                  <span className="absolute bottom-2 left-0 -z-10 h-3 w-full bg-emerald-500/20 blur-sm"></span>
                </span>
              </h2>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Track orders, manage inventory, customize your store, and
                monitor sales—all from a beautiful, intuitive dashboard designed
                for speed and simplicity.
              </p>
            </FadeInUp>
          </div>

          {/* Desktop Dashboard Mockup */}
          <FadeInUp delay={0.3}>
            <div className="relative max-w-6xl mx-auto">
              {/* Glow effects behind the dashboard */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-[3rem] blur-3xl opacity-60"></div>

              {/* Browser chrome mockup */}
              <div className="relative rounded-[2rem] overflow-hidden border border-slate-700/50 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm bg-slate-800/50">
                {/* Browser top bar */}
                <div className="bg-slate-800/90 border-b border-slate-700/50 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="bg-slate-700/50 rounded-lg px-4 py-1.5 text-xs text-slate-400 max-w-md flex items-center gap-2">
                      <span className="text-slate-500">🔒</span>
                      <span>vendle.store/dashboard</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard screenshot container */}
                <div className="relative bg-slate-900 aspect-video w-full">
                  <Image
                    src="/images/dashboard.png"
                    alt="Vendle Dashboard - Desktop View"
                    width={1920}
                    height={1080}
                    className="w-full h-full object-cover object-top"
                    priority
                  />

                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Floating feature cards */}
              <div className="absolute -left-4 top-1/4 hidden lg:block">
                <FadeInUp delay={0.5}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-4 w-56 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                        📊
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          Real-time Analytics
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Track sales, orders, and customer insights instantly
                    </p>
                  </div>
                </FadeInUp>
              </div>

              <div className="absolute -right-4 bottom-1/4 hidden lg:block">
                <FadeInUp delay={0.6}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-4 w-56 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        🎨
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          Easy Customization
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Change themes, colors, and layouts with one click
                    </p>
                  </div>
                </FadeInUp>
              </div>
            </div>
          </FadeInUp>

          {/* Large Interactive Mudcloth Pattern */}
          <div className="relative group cursor-pointer mt-20">
            <FadeInUp delay={0.4}>
              <div className="relative py-32 md:py-40 lg:py-48 px-6 rounded-3xl overflow-hidden border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-700">
                {/* Base Mudcloth Pattern - transitions to green on hover */}
                <div className="absolute inset-0 opacity-20 text-slate-600 transition-all duration-700 group-hover:opacity-50 group-hover:text-emerald-500 scale-150">
                  <MudclothPattern />
                </div>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-emerald-500/0 transition-all duration-700 group-hover:bg-emerald-500/10"></div>

                {/* Radial glow that appears on hover */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/25 rounded-full blur-3xl"></div>
                </div>

                {/* Content overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <div className="mb-8 transition-all duration-700 group-hover:scale-110">
                    <ArewaSymbol className="w-32 h-32 md:w-40 md:h-40 mx-auto text-slate-600 transition-all duration-700 group-hover:text-emerald-500" />
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 transition-all duration-700 group-hover:text-emerald-400 max-w-4xl px-4">
                    Crafted with African Heritage
                  </h3>
                  <p className="text-lg md:text-xl lg:text-2xl text-slate-400 transition-all duration-700 group-hover:text-slate-300 max-w-3xl leading-relaxed px-4">
                    Every pixel tells a story of tradition, craftsmanship, and
                    innovation. Hover to illuminate the patterns that inspire
                    our design.
                  </p>
                </div>

                {/* Animated pattern elements on hover */}
                <div className="absolute top-12 left-12 opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:translate-y-[-10px] hidden lg:block">
                  <CowrieSymbol className="w-24 h-24 text-emerald-500/60" />
                </div>
                <div className="absolute top-12 right-12 opacity-0 transition-all duration-700 delay-75 group-hover:opacity-100 group-hover:translate-y-[-10px] hidden lg:block">
                  <MudclothStar className="w-24 h-24 text-emerald-500/60" />
                </div>
                <div className="absolute bottom-12 left-1/4 opacity-0 transition-all duration-700 delay-150 group-hover:opacity-100 group-hover:translate-y-[10px] hidden lg:block">
                  <Tambari className="w-24 h-24 text-emerald-500/60" />
                </div>
                <div className="absolute bottom-12 right-1/4 opacity-0 transition-all duration-700 delay-200 group-hover:opacity-100 group-hover:translate-y-[10px] hidden lg:block">
                  <TribalBand className="w-24 h-24 text-emerald-500/60" />
                </div>
              </div>
            </FadeInUp>
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
              className="pointer-events-auto inline-flex items-center justify-center gap-3 rounded-full bg-emerald-500 px-10 py-5 text-lg font-bold text-slate-900 transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]"
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
              <Link
                href="/privacy"
                className="hover:text-slate-900 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-slate-900 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
