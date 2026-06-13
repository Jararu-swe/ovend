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
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { TeamMemberPermissions } from '@/app/lib/definitions';

const links: {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Permission required for team members to see this link. Omit for always-visible. */
  teamPermission?: keyof TeamMemberPermissions;
}[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/dashboard/products', icon: ShoppingBagIcon, teamPermission: 'products' },
  { name: 'Orders', href: '/dashboard/orders', icon: ClipboardDocumentListIcon, teamPermission: 'orders' },
  { name: 'Discounts', href: '/dashboard/discounts', icon: TicketIcon, teamPermission: 'orders' },
  { name: 'Team', href: '/dashboard/team', icon: UsersIcon },
  { name: 'Storefront', href: '/dashboard/customize', icon: BuildingStorefrontIcon },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, teamPermission: 'settings' },
];

export default function NavLinks({
  newOrdersCount = 0,
  teamPermissions,
}: {
  newOrdersCount?: number;
  teamPermissions?: TeamMemberPermissions | null;
}) {
  const pathname = usePathname();

  // Filter links based on team member permissions
  const visibleLinks = links.filter((link) => {
    if (!teamPermissions) return true;
    if (!link.teamPermission) return true;
    return teamPermissions[link.teamPermission] === true;
  });

  return (
    <>
      {visibleLinks.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
        const isOrders = link.name === 'Orders';
        const showBadge = isOrders && newOrdersCount > 0;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'group flex h-10 grow items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium transition-all md:flex-none md:justify-start relative',
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
            {showBadge && (
              <span className="ml-auto hidden md:flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {newOrdersCount > 99 ? '99+' : newOrdersCount}
              </span>
            )}
            {showBadge && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white md:hidden">
                {newOrdersCount > 9 ? '9+' : newOrdersCount}
              </span>
            )}
            {isActive && !showBadge && (
              <div className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-emerald-500 md:block" />
            )}
          </Link>
        );
      })}
    </>
  );
}
