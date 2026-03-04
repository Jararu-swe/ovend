import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana } from './ui/fonts';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 px-6 py-10 text-slate-50 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-center">
        <div className="relative flex flex-1 flex-col gap-6">
          <div className={styles.shape} />
          <p
            className={`${lusitana.className} text-3xl font-semibold leading-snug md:text-4xl`}
          >
            Give your business a{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
              modern storefront
            </span>{" "}
            in minutes.
          </p>
          <p className="max-w-xl text-sm text-slate-300 md:text-base">
            Ovend helps Nigerian vendors create a simple online store, accept
            secure payments, and track orders — all from one clean, mobile‑first
            dashboard that works perfectly with WhatsApp and Instagram.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-full bg-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-400 md:text-base"
            >
              <span>Sign in as vendor</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <span className="text-xs text-slate-400 md:text-sm">
              No coding. No website stress. Just your link and your products.
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-1 justify-center md:mt-0">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl ring-1 ring-slate-800/60 backdrop-blur">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">
              Vendor dashboard preview
            </p>
            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex items-center justify-between rounded-lg bg-slate-800/80 px-4 py-3">
                <span>Total orders (this week)</span>
                <span className="font-semibold text-emerald-300">27</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-3">
                <span>Revenue (NGN)</span>
                <span className="font-semibold text-sky-300">₦342,500</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-800/40 px-4 py-3">
                <span>Best‑selling product</span>
                <span className="truncate text-right text-slate-200">
                  Ankara two‑piece set
                </span>
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
              Share your Ovend link on WhatsApp Status, Instagram bio, or DMs
              and let customers browse, add to cart, and place orders while you
              stay organised.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
