import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import OvendLogo from '@/app/ui/ovend-logo';
import { SignOutButton } from '@/app/ui/dashboard/sign-out-button';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200/80">
      {/* Logo area */}
      <Link
        className="flex h-16 items-center gap-3 px-5 border-b border-slate-100 md:h-[72px] shrink-0"
        href="/"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </div>
        <div className="hidden md:block">
          <span className="text-base font-bold text-slate-900 tracking-tight">Ovend</span>
          <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Vendor Dashboard</p>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex grow flex-row justify-between space-x-2 overflow-y-auto px-3 py-3 md:flex-col md:space-x-0 md:space-y-1">
        <NavLinks />
        <div className="hidden h-auto w-full grow md:block" />
        <SignOutButton />
      </div>
    </div>
  );
}
