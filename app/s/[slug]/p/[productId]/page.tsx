import { fetchVendorBySlug, fetchProducts } from '@/app/lib/data';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetail from '@/app/ui/store/product-detail';

type Props = {
  params: Promise<{ slug: string; productId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productId } = await params;
  const vendor = await fetchVendorBySlug(slug);
  
  if (!vendor) {
    return {
      title: 'Product Not Found',
    };
  }

  const products = await fetchProducts(vendor.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const productUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app'}/s/${slug}/p/${productId}`;
  const storeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app'}/s/${slug}`;

  return {
    title: `${product.name} | ${vendor.store_name || vendor.name}`,
    description: product.description || `Buy ${product.name} from ${vendor.store_name || vendor.name}`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} from ${vendor.store_name || vendor.name}`,
      url: productUrl,
      siteName: vendor.store_name || vendor.name,
      images: product.image_url
        ? [
            {
              url: product.image_url,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || `Buy ${product.name} from ${vendor.store_name || vendor.name}`,
      images: product.image_url ? [product.image_url] : [],
    },
    alternates: {
      canonical: productUrl,
    },
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'NGN',
      'og:see_also': storeUrl,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, productId } = await params;
  const vendor = await fetchVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const products = await fetchProducts(vendor.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  const theme = await getOrCreateVendorTheme(vendor.id);

  return <ProductDetail vendor={vendor} product={product} theme={theme} />;
}
