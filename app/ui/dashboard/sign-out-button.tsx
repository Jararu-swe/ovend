'use client';

import { signOut } from 'next-auth/react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex h-10 grow items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 md:flex-none md:justify-start md:grow-0"
    >
      <ArrowRightOnRectangleIcon className="w-[18px] shrink-0" />
      <span className="hidden md:block">Sign Out</span>
    </button>
  );
}
