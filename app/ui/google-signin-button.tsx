'use client';

import { useState } from 'react';
import { setGoogleIntendedRole } from '@/app/lib/auth-actions';
import Image from 'next/image';

export default function GoogleSignInButton({
  role,
  callbackUrl,
  text = 'Continue with Google',
}: {
  role: 'vendor' | 'customer';
  callbackUrl: string;
  text?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      await setGoogleIntendedRole(role);
      // Dynamically import signIn to avoid SessionProvider requirement
      const { signIn } = await import('next-auth/react');
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Google sign in error', error);
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:hover:shadow-sm"
    >
      <Image 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="Google Logo" 
        width={20} 
        height={20} 
        className="h-5 w-5" 
        unoptimized
      />
      {isLoading ? 'Connecting...' : text}
    </button>
  );
}
