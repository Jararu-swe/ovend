import { fetchVendorBySlug, fetchProducts, trackStoreVisit } from '@/app/lib/data';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { notFound } from 'next/navigation';
import Storefront from '@/app/ui/store/storefront';

export default async function StorePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;
  const vendor = await fetchVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const products = await fetchProducts(vendor.id);
  const theme = await getOrCreateVendorTheme(vendor.id);
  
  // Track store visit (non-blocking)
  trackStoreVisit(vendor.id).catch(() => {});

  return <Storefront vendor={vendor} products={products} theme={theme} />;
}
