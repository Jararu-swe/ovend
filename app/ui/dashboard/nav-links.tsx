'use client'
import {
  HomeIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  UsersIcon,
  PaintBrushIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/dashboard/products', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/dashboard/orders', icon: ClipboardDocumentListIcon },
  { name: 'Discounts', href: '/dashboard/discounts', icon: TicketIcon },
  { name: 'Team', href: '/dashboard/team', icon: UsersIcon },
  { name: 'Customize', href: '/dashboard/customize', icon: PaintBrushIcon },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'group flex h-10 grow items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium transition-all md:flex-none md:justify-start',
              {
                'bg-emerald-50 text-emerald-700 shadow-sm': isActive,
                'text-slate-500 hover:bg-slate-50 hover:text-slate-700': !isActive,
              },
            )}
          >
            <LinkIcon className={clsx('w-[18px] shrink-0 transition-colors', {
              'text-emerald-600': isActive,
              'text-slate-400 group-hover:text-slate-600': !isActive,
            })} />
            <p className="hidden md:block">{link.name}</p>
            {isActive && (
              <div className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-emerald-500 md:block" />
            )}
          </Link>
        );
      })}
    </>
  );
}
