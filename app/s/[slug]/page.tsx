import { fetchVendorBySlug, fetchProducts } from '@/app/lib/data';
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

  return <Storefront vendor={vendor} products={products} />;
}
