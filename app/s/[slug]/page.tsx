import { fetchVendorBySlug, fetchProducts, trackStoreVisit } from '@/app/lib/data';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { getStoreAvailability } from '@/app/lib/store-availability';
import { notFound } from 'next/navigation';
import Storefront from '@/app/ui/store/storefront';
import Script from 'next/script';
import { Metadata } from 'next';

import { auth } from '@/auth';
import { sql } from '@/app/lib/db';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await fetchVendorBySlug(slug);

  if (!vendor) {
    return {
      title: 'Store Not Found',
    };
  }

  const storeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app'}/s/${slug}`;
  const theme = await getOrCreateVendorTheme(vendor.id);

  return {
    title: vendor.store_name || vendor.name,
    description: vendor.store_description || `Shop at ${vendor.store_name || vendor.name}`,
    openGraph: {
      title: vendor.store_name || vendor.name,
      description: vendor.store_description || `Shop at ${vendor.store_name || vendor.name}`,
      url: storeUrl,
      siteName: vendor.store_name || vendor.name,
      images: theme.logo_url
        ? [
            {
              url: theme.logo_url,
              width: 1200,
              height: 630,
              alt: vendor.store_name || vendor.name,
            },
          ]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: vendor.store_name || vendor.name,
      description: vendor.store_description || `Shop at ${vendor.store_name || vendor.name}`,
      images: theme.logo_url ? [theme.logo_url] : [],
    },
    alternates: {
      canonical: storeUrl,
    },
  };
}

export default async function StorePage(props: Props) {
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
