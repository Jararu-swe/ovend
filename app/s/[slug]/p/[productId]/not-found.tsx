import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
            <ShoppingBagIcon className="h-10 w-10 text-slate-400" />
          </div>
        </div>

        {/* 404 Heading */}
        <h1 className="text-6xl font-black text-slate-900 mb-4">404</h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-700 mb-3">
          Product Not Found
        </h2>

        {/* Message */}
        <p className="text-slate-600 mb-8">
          This product doesn't exist or has been removed.
        </p>

        {/* Action Button */}
        <Link
          href="/explore"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-500 hover:-translate-y-0.5"
        >
          Explore Stores
        </Link>
      </div>
    </div>
  );
}
