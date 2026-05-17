import { fetchVendorBySlug, fetchProducts, trackStoreVisit } from '@/app/lib/data';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { getStoreAvailability } from '@/app/lib/store-availability';
import { notFound } from 'next/navigation';
import Storefront from '@/app/ui/store/storefront';
import Script from 'next/script';

import { auth } from '@/auth';
import { sql } from '@/app/lib/db';

export default async function StorePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  const vendor = await fetchVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const products = await fetchProducts(vendor.id);
  const theme = await getOrCreateVendorTheme(vendor.id);
  
  // Fetch customer session if available
  const session = await auth();
  let customer = null;
  if (session?.user?.id && (session?.user as any).role === 'customer') {
    const [dbCustomer] = await sql`
      SELECT id, name, email, whatsapp_number, delivery_address, delivery_latitude, delivery_longitude, delivery_address_details
      FROM users WHERE id = ${session.user.id} LIMIT 1
    `;
    if (dbCustomer) {
      customer = dbCustomer;
    }
  }

  // Track store visit (non-blocking)
  trackStoreVisit(vendor.id).catch(() => {});

  const availability = getStoreAvailability({
    timeZone: vendor.store_timezone,
    store_hours: vendor.store_hours,
    accepting_orders: vendor.accepting_orders,
    store_closed_note: vendor.store_closed_note,
  });

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <Storefront vendor={vendor} products={products} theme={theme} customer={customer} availability={availability} />
    </>
  );
}
