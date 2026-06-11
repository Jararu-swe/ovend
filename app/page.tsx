import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { lusitana } from "./ui/fonts";
import VendleLogo from "@/app/ui/vendle-logo";

export default async function Page() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-slate-900">
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
              className="inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-slate-900 px-4 md:px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-600"
            >
              <span className="hidden sm:inline">Get started free</span>
              <span className="sm:hidden">Start</span>
              <ArrowRightIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="px-6 pt-16 pb-24 md:px-12 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 mb-6">
              Built for African Commerce
            </p>
            <h1 className={`${lusitana.className} text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl xl:text-7xl mb-6 leading-tight`}>
              Turn your <span className="text-emerald-600">social media</span><br />
              into a global storefront
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Vendle helps online vendors instantly create beautiful online stores, process secure payments, and manage orders from a single mobile dashboard. Setup takes less than 3 minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-xl transition hover:bg-emerald-500 md:text-base"
              >
                <span>Launch Your Store</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-transparent px-8 py-4 text-sm font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white md:text-base"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Explore Vendors</span>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 mt-8">
              <span>✦ Zero coding required</span>
              <span>✦ Mobile-first design</span>
              <span>✦ Unified social links</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-[#FDFBF7] py-12">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              © 2024 Vendle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
