import { fetchVendorBySlug, fetchProductById } from '@/app/lib/data';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetail from '@/app/ui/store/product-detail';

type Props = {
  params: Promise<{ slug: string; productId: string }>;
};

// UUID validation regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates if productId is a valid UUID format
 */
function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Validates vendor subscription status
 */
function isSubscriptionValid(vendor: any): boolean {
  // Check subscription status is not 'inactive' or 'past_due'
  if (vendor.subscription_status === 'inactive' || vendor.subscription_status === 'past_due') {
    return false;
  }

  // Check subscription expiry date
  if (vendor.subscription_expires_at) {
    const expiryDate = new Date(vendor.subscription_expires_at);
    const now = new Date();
    if (expiryDate < now) {
      return false;
    }
  }

  return true;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productId } = await params;
  
  // Validate UUID format
  if (!isValidUUID(productId)) {
    return {
      title: 'Product Not Found',
    };
  }

  // Parallel data fetching
  const [vendor, product] = await Promise.all([
    fetchVendorBySlug(slug),
    fetchProductById(productId),
  ]);
  
  if (!vendor) {
    return {
      title: 'Product Not Found',
    };
  }

  // Validate product exists and belongs to vendor
  if (!product || product.vendor_id !== vendor.id) {
    return {
      title: 'Product Not Found',
    };
  }

  // Validate subscription status
  if (!isSubscriptionValid(vendor)) {
    return {
      title: 'Product Not Found',
    };
  }

  // Validate product is active
  if (product.status !== 'active') {
    return {
      title: 'Product Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app';
  const productUrl = `${baseUrl}/s/${slug}/p/${productId}`;
  const storeName = vendor.store_name || vendor.name;
  
  // Truncation helper
  const truncate = (text: string, maxLength: number) => 
    text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
  
  // Generate descriptions with fallbacks
  const ogDescription = product.description 
    ? truncate(product.description, 200)
    : `View this product from ${storeName}`;
  
  const metaDescription = product.description
    ? truncate(product.description, 160)
    : `View ${product.name} from ${storeName}. Shop now!`;
  
  const twitterDescription = product.description
    ? truncate(product.description, 200)
    : `View this product from ${storeName}`;

  // Format price for metadata
  const priceAmount = (product.price / 100).toFixed(2);
  const availability = (product.stock_quantity !== null && product.stock_quantity > 0) 
    ? 'in stock' 
    : 'out of stock';

  return {
    title: truncate(`${product.name} | ${storeName}`, 60),
    description: metaDescription,
    
    robots: product.status === 'active' 
      ? 'index, follow' 
      : 'noindex, nofollow',
    
    openGraph: {
      type: 'website',
      title: truncate(product.name, 60),
      description: ogDescription,
      url: productUrl,
      siteName: storeName,
      images: product.image_url ? [{
        url: product.image_url,
        width: 1200,
        height: 630,
        alt: product.name,
      }] : [],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: truncate(product.name, 70),
      description: twitterDescription,
      images: product.image_url ? [product.image_url] : [],
    },
    
    alternates: {
      canonical: productUrl,
    },
    
    other: {
      'og:type': 'product',
      'product:price:amount': priceAmount,
      'product:price:currency': 'NGN',
      'product:availability': availability,
      'twitter:label1': 'Price',
      'twitter:data1': `₦${priceAmount}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, productId } = await params;
  
  // Validate UUID format
  if (!isValidUUID(productId)) {
    notFound();
  }

  // Fetch vendor first to get vendor.id for theme fetching
  const vendor = await fetchVendorBySlug(slug);

  // Validate vendor exists
  if (!vendor) {
    notFound();
  }

  // Validate subscription status (not 'inactive' or 'past_due')
  if (!isSubscriptionValid(vendor)) {
    notFound();
  }

  // Parallel data fetching for product and theme (now that we have vendor.id)
  const [product, theme] = await Promise.all([
    fetchProductById(productId),
    getOrCreateVendorTheme(vendor.id),
  ]);

  // Validate product exists
  if (!product) {
    notFound();
  }

  // Validate vendor-product relationship (product.vendor_id === vendor.id)
  if (product.vendor_id !== vendor.id) {
    notFound();
  }

  // Validate product active status (status === 'active')
  if (product.status !== 'active') {
    notFound();
  }

  return <ProductDetail vendor={vendor} product={product} theme={theme} />;
}
