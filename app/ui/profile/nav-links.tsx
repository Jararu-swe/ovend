'use client';

import {
  HomeIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Dashboard', href: '/profile', icon: HomeIcon },
  { name: 'Order History', href: '/profile/orders', icon: ShoppingBagIcon },
  { name: 'Settings', href: '/profile/settings', icon: Cog6ToothIcon },
];

export default function ProfileNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-xl p-3 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 md:flex-none md:justify-start md:p-2 md:px-3 transition-colors',
              {
                'bg-emerald-50 text-emerald-600': pathname === link.href || (pathname.startsWith('/profile/orders') && link.href === '/profile/orders'),
                'text-slate-600': pathname !== link.href && !(pathname.startsWith('/profile/orders') && link.href === '/profile/orders'),
              },
            )}
          >
            <LinkIcon className="w-5 h-5" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
