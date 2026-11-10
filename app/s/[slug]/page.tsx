import { fetchVendorBySlug, fetchProducts } from '@/app/lib/data';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { getStoreAvailability } from '@/app/lib/store-availability';
import { notFound } from 'next/navigation';
import Storefront from '@/app/ui/store/storefront';
import StoreVisitTracker from '@/app/ui/store/store-visit-tracker';
import Script from 'next/script';
import { Metadata } from 'next';

import { auth } from '@/auth';
import { sql } from '@/app/lib/db';
import { hasFeatureAccess } from '@/app/lib/subscriptions';
import type { Product } from '@/app/lib/definitions';

type Props = {
  params: Promise<{ slug: string }>;
};

// ─── SEO Helpers ─────────────────────────────────────────────

/** Build a geo-rich meta description that includes location + product keywords. */
function buildStoreDescription(
  storeName: string,
  storeDescription: string | null | undefined,
  location: string | null | undefined,
  category: string | null | undefined,
  topProductNames: string[],
): string {
  // If the vendor wrote their own description and it already contains the
  // location keyword, use it as-is (truncated to 160 chars).
  if (storeDescription) {
    const hasLocation = location && storeDescription.toLowerCase().includes(location.toLowerCase());
    if (hasLocation) {
      return storeDescription.length > 160 ? storeDescription.slice(0, 157) + '...' : storeDescription;
    }
    // Append location to custom description
    const suffix = location ? ` Based in ${location}, Nigeria.` : '';
    const desc = storeDescription + suffix;
    return desc.length > 160 ? desc.slice(0, 157) + '...' : desc;
  }

  // Auto-generate a keyword-rich description
  const productSnippet =
    topProductNames.length >= 2
      ? topProductNames.slice(0, 3).join(', ')
      : topProductNames.length === 1
        ? topProductNames[0]
        : null;

  const parts: string[] = [];
  if (productSnippet) {
    parts.push(`Shop ${productSnippet.toLowerCase()}`);
  } else if (category) {
    parts.push(`Shop ${category.toLowerCase()}`);
  } else {
    parts.push('Shop');
  }
  parts.push(`at ${storeName}`);
  if (location) parts.push(`in ${location}, Nigeria`);
  parts.push('— order online for delivery or pickup on Vendle.');

  const desc = parts.join(' ');
  return desc.length > 160 ? desc.slice(0, 157) + '...' : desc;
}

/** Build a geo-rich page title. */
function buildStoreTitle(
  storeName: string,
  location: string | null | undefined,
): string {
  if (location) {
    const title = `${storeName} — ${location}`;
    return title.length > 60 ? title.slice(0, 57) + '...' : title;
  }
  return storeName.length > 60 ? storeName.slice(0, 57) + '...' : storeName;
}

/** Build LocalBusiness JSON-LD structured data for Google. */
function buildLocalBusinessJsonLd(
  vendor: NonNullable<Awaited<ReturnType<typeof fetchVendorBySlug>>>,
  storeUrl: string,
  logoUrl: string | null,
  activeProducts: Product[],
) {
  const storeName = vendor.store_name || vendor.name;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: storeName,
    url: storeUrl,
    ...(vendor.store_description && { description: vendor.store_description }),
    ...(logoUrl && { image: logoUrl }),
  };

  // Address with region
  if (vendor.location_state) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      addressRegion: vendor.location_state,
      addressCountry: 'NG',
    };
    jsonLd.areaServed = {
      '@type': 'State',
      name: vendor.location_state,
    };
  }

  // Geo coordinates (prefer delivery location)
  const lat = vendor.delivery_latitude ?? vendor.pickup_latitude;
  const lng = vendor.delivery_longitude ?? vendor.pickup_longitude;
  if (lat != null && lng != null) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    };
  }

  // Category mapping
  if (vendor.category) {
    jsonLd.category = vendor.category;
  }

  // Top products as offers (up to 5)
  const topProducts = activeProducts.slice(0, 5);
  if (topProducts.length > 0) {
    jsonLd.makesOffer = topProducts.map((p) => {
      const offer: Record<string, unknown> = {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: p.name,
          ...(p.description && { description: p.description.slice(0, 200) }),
          ...(p.image_url && { image: p.image_url }),
          offers: {
            '@type': 'Offer',
            price: (p.price / 100).toFixed(2),
            priceCurrency: 'NGN',
            availability:
              p.stock_quantity === null || p.stock_quantity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        },
      };
      return offer;
    });
  }

  return jsonLd;
}

// ─── Page Component ──────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await fetchVendorBySlug(slug);

  if (!vendor) {
    return {
      title: 'Store Not Found',
    };
  }

  // Suspended vendors should not generate metadata
  if (vendor.kyc_status === 'rejected') {
    return {
      title: 'Store Not Found',
    };
  }

  const storeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app'}/s/${slug}`;
  const [theme, products] = await Promise.all([
    getOrCreateVendorTheme(vendor.id),
    fetchProducts(vendor.id),
  ]);

  const storeName = vendor.store_name || vendor.name;
  const activeProducts = products.filter((p) => p.status === 'active');
  const topProductNames = activeProducts.slice(0, 3).map((p) => p.name);

  const title = buildStoreTitle(storeName, vendor.location_state);
  const description = buildStoreDescription(
    storeName,
    vendor.store_description,
    vendor.location_state,
    vendor.category,
    topProductNames,
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: storeUrl,
      siteName: storeName,
      images: theme.logo_url
        ? [
            {
              url: theme.logo_url,
              width: 1200,
              height: 630,
              alt: storeName,
            },
          ]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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

  // Check if vendor account is suspended (kyc_status = 'rejected')
  if (vendor.kyc_status === 'rejected') {
    notFound();
  }

  // Check if vendor's subscription is active
  const subscriptionStatus = vendor.subscription_status;
  const subscriptionExpiresAt = vendor.subscription_expires_at 
    ? new Date(vendor.subscription_expires_at) 
    : null;
  
  // Redirect to not found if subscription is expired or inactive
  const isExpired = subscriptionStatus === 'inactive' || subscriptionStatus === 'past_due';
  const hasExpired = subscriptionExpiresAt && subscriptionExpiresAt.getTime() < Date.now();
  
  if (isExpired || hasExpired) {
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

  // Determine if the visitor is the store owner (don't track owner's own visits)
  const isStoreOwner = session?.user?.id === vendor.id;

  // Use feature gate to check if this vendor's plan allows hiding Vendle branding
  const hideVendleBranding = await hasFeatureAccess(vendor.id, 'hide_branding');

  const availability = getStoreAvailability({
    timeZone: vendor.store_timezone,
    store_hours: vendor.store_hours,
    accepting_orders: vendor.accepting_orders,
    store_closed_note: vendor.store_closed_note,
  });

  // Build structured data for SEO
  const storeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app'}/s/${slug}`;
  const activeProducts = products.filter((p) => p.status === 'active');
  const localBusinessJsonLd = buildLocalBusinessJsonLd(
    vendor,
    storeUrl,
    theme.logo_url,
    activeProducts,
  );

  return (
    <>
      {/* LocalBusiness JSON-LD for geo-targeted search indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      {!isStoreOwner && <StoreVisitTracker vendorId={vendor.id} />}
      <Storefront vendor={vendor} products={products} theme={theme} customer={customer} availability={availability} hideVendleBranding={hideVendleBranding} />
    </>
  );
}
