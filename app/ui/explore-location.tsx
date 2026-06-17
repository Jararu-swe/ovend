'use client';

import { useRouter } from 'next/navigation';
import { MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

export default function ExploreLocation({ 
  currentLocation, 
  availableLocations,
  currentSearch,
  currentCategory
}: { 
  currentLocation: string;
  availableLocations: string[];
  currentSearch?: string;
  currentCategory?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayLocation = currentLocation === 'All' ? 'Everywhere' : currentLocation;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLocationChange(loc: string) {
    const params = new URLSearchParams();
    if (currentSearch) params.set('q', currentSearch);
    if (currentCategory && currentCategory !== 'All') params.set('category', currentCategory);
    if (loc !== 'All') params.set('location', loc);
    
    router.push(`/explore${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-600 transition-all text-xs font-bold uppercase tracking-widest group shadow-sm"
      >
        <MapPinIcon className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        <span>In: <span className="text-slate-900 group-hover:text-emerald-600">{displayLocation}</span></span>
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-3xl bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden z-[60] animate-in fade-in zoom-in duration-200 origin-top-left max-h-[400px] overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => handleLocationChange('All')}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left transition-all ${
                currentLocation === 'All' 
                  ? 'bg-emerald-50 text-emerald-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">All Locations</span>
            </button>
            <div className="h-px bg-slate-100 my-1 mx-4" />
            {availableLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocationChange(loc)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left transition-all ${
                  currentLocation === loc 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-sm">{loc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
