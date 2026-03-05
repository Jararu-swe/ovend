'use client';

import { signOut } from 'next-auth/react';
import { ReactNode } from 'react';

export function SignOutButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
    >
      {children}
    </button>
  );
}

