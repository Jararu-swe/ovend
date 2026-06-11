'use client';

import { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/40 active:translate-y-0 active:scale-95"
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="h-4 w-4 md:h-5 md:w-5 stroke-2" />
    </button>
  );
}
