import {
  BanknotesIcon,
  ClockIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

const iconMap = {
  revenue: BanknotesIcon,
  products: ShoppingBagIcon,
  orders: ClipboardDocumentListIcon,
  bestSelling: StarIcon,
};

import { formatCurrency } from '@/app/lib/utils';

export default async function CardWrapper({ 
  stats 
}: { 
  stats: {
    numberOfOrders: number;
    totalRevenue: number;
    numberOfProducts: number;
    numberOfPendingOrders: number;
  }
}) {
  return (
    <>
      <Card title="Total Revenue" value={formatCurrency(stats.totalRevenue)} type="revenue" />
      <Card title="Total Orders" value={stats.numberOfOrders} type="orders" />
      <Card title="Pending Orders" value={stats.numberOfPendingOrders} type="bestSelling" />
      <Card title="Active Products" value={stats.numberOfProducts} type="products" />
    </>
  );
}

const colorMap = {
  revenue: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  orders: 'bg-blue-50 text-blue-600 border-blue-100',
  products: 'bg-purple-50 text-purple-600 border-purple-100',
  bestSelling: 'bg-amber-50 text-amber-600 border-amber-100',
};

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'revenue' | 'products' | 'orders' | 'bestSelling';
}) {
  const Icon = iconMap[type];
  const colorClass = colorMap[type];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorClass}`}>
          {Icon ? <Icon className="h-6 w-6" /> : null}
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
