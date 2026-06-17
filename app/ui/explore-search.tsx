'use client';

import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, FormEvent, useEffect } from 'react';

export default function ExploreSearch({ 
  defaultValue, 
  currentCategory,
  currentLocation
}: { 
  defaultValue: string;
  currentCategory?: string;
  currentLocation?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  // Sync query with defaultValue (when searchParams change)
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (currentCategory && currentCategory !== 'All') params.set('category', currentCategory);
    if (currentLocation && currentLocation !== 'All') params.set('location', currentLocation);
    router.push(`/explore${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto group">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 blur transition duration-500 group-hover:opacity-100 group-focus-within:opacity-100"></div>
      <MagnifyingGlassIcon className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Discover brands, boutiques, and artisans..."
        className="relative w-full rounded-full border border-slate-200 bg-white/80 backdrop-blur-xl py-5 pl-16 pr-36 text-lg text-slate-900 shadow-xl outline-none placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-bold tracking-wide uppercase text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95"
      >
        Search
      </button>
    </form>
  );
}
