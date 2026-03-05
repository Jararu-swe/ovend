import CardWrapper from '@/app/ui/dashboard/cards';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import { fetchCardData, fetchLatestInvoices, fetchRevenue } from '@/app/lib/data';

export default async function Page() {
  const [cardData, latestInvoices, revenue] = await Promise.all([
    fetchCardData(),
    fetchLatestInvoices(),
    fetchRevenue(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          See how your store is performing this week.
        </p>
      </div>
      <section className="grid gap-6 md:grid-cols-4">
        {/* Simple high-level cards using existing component */}
        <CardWrapper />
      </section>
      <section className="grid gap-6 md:grid-cols-8">
        <RevenueChart revenue={revenue} />
        <LatestInvoices latestInvoices={latestInvoices} />
      </section>
    </div>
  );
}