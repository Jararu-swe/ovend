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
      <Card title="Active Products" value={stats.numberOfProducts} type="products" />
      <Card title="Pending Orders" value={stats.numberOfPendingOrders} type="bestSelling" />
    </>
  );
}

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

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
