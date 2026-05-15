'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

const SORT_OPTIONS = [
  { id: 'popular', label: 'Popularity', description: 'Most active products' },
  { id: 'name', label: 'Name', description: 'Alphabetical (A-Z)' },
];

export default function ExploreSort({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find(opt => opt.id === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSortChange(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'popular') {
      params.delete('sort');
    } else {
      params.set('sort', id);
    }
    router.push(`/explore?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-600 transition-all text-xs font-bold uppercase tracking-widest group shadow-sm"
      >
        <ArrowsUpDownIcon className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        <span>Sort: <span className="text-slate-900 group-hover:text-emerald-600">{selectedOption.label}</span></span>
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden z-[60] animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="p-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSortChange(option.id)}
                className={`w-full flex flex-col items-start gap-0.5 px-5 py-3.5 rounded-2xl text-left transition-all ${
                  currentSort === option.id 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-sm font-bold">{option.label}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
