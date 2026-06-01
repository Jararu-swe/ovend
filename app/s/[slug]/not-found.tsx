import Link from 'next/link';
import { MagnifyingGlassIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
            <MagnifyingGlassIcon className="h-10 w-10 text-slate-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          Store Not Found
        </h1>

        {/* Message */}
        <p className="text-slate-600 mb-2">
          This store is currently unavailable or doesn't exist.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          The store may have been moved, deleted, or is temporarily closed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-500 hover:-translate-y-0.5"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            Explore Other Stores
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200"
          >
            <HomeIcon className="h-5 w-5" />
            Go Home
          </Link>
        </div>

        {/* Help text */}
        <p className="text-xs text-slate-500 mt-8">
          Are you the store owner?{' '}
          <Link href="/login" className="text-emerald-600 hover:underline font-semibold">
            Sign in to your dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
