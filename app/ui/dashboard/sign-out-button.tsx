'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex h-10 grow items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 md:flex-none md:justify-start md:grow-0"
    >
      <svg className="w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
      </svg>
      <span className="hidden md:block">Sign Out</span>
    </button>
  );
}
