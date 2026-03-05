import { ArrowRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana } from './ui/fonts';

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Top navigation */}
      <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-2">
            <span
              className={`${lusitana.className} text-lg font-semibold tracking-tight`}
            >
              Ovend
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
              for Nigerian vendors
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-slate-200 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="hidden items-center gap-2 rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-medium text-slate-950 shadow-sm transition hover:bg-emerald-300 md:inline-flex"
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

            <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-300/80">
              SIMPLE STOREFRONTS FOR LOCAL SELLERS
            </p>

            <h1
              className={`${lusitana.className} text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl`}
            >
              Turn your{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                WhatsApp and Instagram
              </span>{" "}
              into a modern storefront.
            </h1>

            <p className="max-w-xl text-sm text-slate-300 md:text-base">
              Ovend helps Nigerian vendors create a simple online store, accept
              secure payments, and track orders — all from one clean, mobile‑first
              dashboard that feels as polished as global e‑commerce platforms.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-300 md:text-base"
              >
                <span>Get started free</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-950/60 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900 md:text-base"
              >
                <PlayCircleIcon className="h-5 w-5 text-slate-300" />
                <span>View live dashboard demo</span>
              </Link>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 md:text-xs">
              <span>✓ No coding or designers needed</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-500 md:inline-block" />
              <span>✓ Works beautifully on low‑end Android phones</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-500 md:inline-block" />
              <span>✓ Share one link across all your socials</span>
            </div>
          </div>

          <div className="mt-4 flex flex-1 justify-center md:mt-0">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 -translate-x-6 translate-y-6 rounded-3xl bg-emerald-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-2xl ring-1 ring-slate-800/60 backdrop-blur-lg">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Vendor dashboard snapshot
                </p>

                <div className="space-y-3 text-xs text-slate-200">
                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-400/10 to-sky-400/10 px-4 py-3">
                    <span className="text-[11px] font-medium text-slate-100">
                      Total orders (this week)
                    </span>
                    <span className="text-base font-semibold text-emerald-300">
                      27
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 px-4 py-3">
                    <span className="text-[11px] text-slate-300">
                      Revenue (NGN)
                    </span>
                    <span className="text-sm font-semibold text-sky-300">
                      ₦342,500
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                    <span className="text-[11px] text-slate-300">
                      Best‑selling product
                    </span>
                    <span className="truncate text-right text-xs text-slate-100">
                      Ankara two‑piece set
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-slate-300">
                  <div className="space-y-1 rounded-2xl bg-slate-900/80 px-3 py-3">
                    <p className="font-medium text-slate-100">
                      Share anywhere
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-400">
                      Drop your Ovend link on Status, Reels, and DMs — customers
                      check out without chatting first.
                    </p>
                  </div>
                  <div className="space-y-1 rounded-2xl bg-slate-900/80 px-3 py-3">
                    <p className="font-medium text-slate-100">
                      Stay organised
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-400">
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
    </main>
  );
}
