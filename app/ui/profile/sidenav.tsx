import Link from 'next/link';
import ProfileNavLinks from '@/app/ui/profile/nav-links';
import VendleLogo from '@/app/ui/vendle-logo';
import { SignOutButton } from '@/app/ui/dashboard/sign-out-button';

export default function ProfileSideNav() {
  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200/80">
      {/* Logo area */}
      <Link
        className="flex h-16 items-center gap-3 px-5 border-b border-slate-100 md:h-[72px] shrink-0"
        href="/"
      >
        <VendleLogo />
        <div className="hidden md:block ml-1">
          <p className="text-[10px] text-slate-400 font-medium -mt-0.5">User Profile</p>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex grow flex-row justify-between space-x-2 overflow-y-auto px-3 py-3 md:flex-col md:space-x-0 md:space-y-1">
        <ProfileNavLinks />
        <div className="hidden h-auto w-full grow md:block" />
        <SignOutButton />
      </div>
    </div>
  );
}
