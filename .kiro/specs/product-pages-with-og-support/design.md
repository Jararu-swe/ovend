# Design Document

## Overview

This design establishes dedicated product pages with comprehensive Open Graph metadata for the Vendle MVP application. The implementation extends the existing Next.js App Router architecture by adding a nested dynamic route at `/s/[storeSlug]/p/[productId]` that renders individual products with full theme consistency, cart integration, and social media optimization.

### Key Design Decisions

1. **Server Components for Metadata**: Leverage Next.js 14's `generateMetadata` API to generate Open Graph and Twitter Card tags at build/request time for optimal social media crawler compatibility
2. **Shared Component Architecture**: Reuse existing Storefront components (checkout modal, cart state, location picker) to maintain consistency and reduce code duplication
3. **Theme-First Rendering**: Apply the vendor's complete theme configuration (colors, fonts, spacing, animations) to product pages for seamless brand experience
4. **Cloudinary Integration**: Utilize existing CldImage component for optimized image delivery with automatic format and quality selection
5. **Progressive Enhancement**: Build on existing cart state management and checkout flow without requiring architectural changes

### Architecture Goals

- **Performance**: Optimize for Core Web Vitals with image preloading, lazy loading gallery images, and efficient data fetching
- **SEO**: Generate complete metadata for search engines and social platforms with canonical URLs and structured product information
- **Maintainability**: Leverage existing utilities and components to minimize new code and reduce maintenance burden
- **Accessibility**: Ensure WCAG 2.1 AA compliance with semantic HTML, ARIA labels, and keyboard navigation support

## Architecture

### Route Structure

```
app/
  s/
    [slug]/
      page.tsx           # Store listing page (existing)
      not-found.tsx      # Store 404 page (existing)
      p/
        [productId]/
          page.tsx       # Product detail page (NEW - enhanced)
          not-found.tsx  # Product 404 page (NEW)
```

### Data Flow

```
User Request → Next.js Route Handler → Server Component
                                          ↓
                      Parallel Data Fetching (Promise.all)
                      ├── fetchVendorBySlug(slug)
                      ├── fetchProductById(productId)
                      └── getOrCreateVendorTheme(vendorId)
                                          ↓
                      Validation & Business Rules
                      ├── Validate UUID format
                      ├── Check vendor/product match
                      ├── Verify subscription status
                      └── Confirm product active status
                                          ↓
                      Metadata Generation (generateMetadata)
                      ├── Open Graph tags
                      ├── Twitter Card tags
                      ├── SEO meta tags
                      └── Canonical URLs
                                          ↓
                      Client Component Rendering
                      └── ProductDetail component with theme
```

### Component Hierarchy

```
ProductPage (Server Component)
  ├── generateMetadata() → Meta tags in <head>
  └── ProductDetail (Client Component)
      ├── Header (back button, store name)
      ├── ProductGallery
      │   ├── MainImage (priority loaded)
      │   └── ThumbnailGrid (lazy loaded)
      ├── ProductInfo
      │   ├── Name, Category, Price
      │   ├── Stock Status
      │   └── Description
      ├── ActionButtons
      │   ├── AddToCartButton
      │   └── ShareButton
      └── VendorInfo
          └── Contact Links
```

## Components and Interfaces

### Server Component: ProductPage

**Location**: `app/s/[slug]/p/[productId]/page.tsx`

**Responsibilities**:
- Route parameter extraction and validation
- Parallel data fetching for vendor, product, and theme
- Business rule validation (subscription status, product-vendor match, active status)
- Metadata generation for SEO and social media
- Error handling with appropriate 404 responses

**Key Functions**:

```typescript
// Main page component
export default async function ProductPage(props: {
  params: Promise<{ slug: string; productId: string }>;
}): Promise<JSX.Element>

// Metadata generation for <head>
export async function generateMetadata({ params }: Props): Promise<Metadata>
```

**Validation Logic**:
1. UUID format validation for productId using regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
2. Vendor existence check via `fetchVendorBySlug`
3. Product existence check via `fetchProductById`
4. Vendor-product relationship validation: `product.vendor_id === vendor.id`
5. Subscription status validation: `subscription_status NOT IN ('inactive', 'past_due')`
6. Subscription expiry validation: `subscription_expires_at === null OR subscription_expires_at > NOW()`
7. Product active status validation: `product.status === 'active'`

### Client Component: ProductDetail

**Location**: `app/ui/store/product-detail.tsx` (existing, to be enhanced)

**Props Interface**:
```typescript
interface ProductDetailProps {
  vendor: User;
  product: Product;
  theme: StoreTheme;
}
```

**Enhancements**:
1. **Add to Cart functionality**: Integrate with existing cart state management
2. **State selection modal**: Show state picker when vendor has `location_state` restriction
3. **Checkout integration**: Connect to existing checkout modal from Storefront component
4. **Related products section**: Display other products from the same vendor (optional enhancement)

**State Management**:
```typescript
// Local component state
const [selectedImage, setSelectedImage] = useState<string>(product.image_url);
const [quantity, setQuantity] = useState<number>(1);
const [showShareMenu, setShowShareMenu] = useState<boolean>(false);

// Cart state (from React Context or localStorage)
const { cart, addToCart, openCheckout } = useCart();
```

### Utility Functions

**Location**: `app/lib/data.ts`

**New Function**:
```typescript
export async function fetchProductById(id: string): Promise<Product | null> {
  await ensureProductColumns();
  
  try {
    const [product] = await sql<Product[]>`
      SELECT * FROM products
      WHERE id = ${id}
      LIMIT 1
    `;
    return product || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch product.');
  }
}
```

**Enhancement to existing function**:
```typescript
// Add vendor-product validation helper
export async function validateProductOwnership(
  productId: string,
  vendorId: string
): Promise<boolean> {
  const [result] = await sql<{ vendor_id: string }[]>`
    SELECT vendor_id FROM products
    WHERE id = ${productId}
    LIMIT 1
  `;
  return result?.vendor_id === vendorId;
}
```

### Metadata Generation Functions

**Location**: `app/s/[slug]/p/[productId]/page.tsx`

**Implementation**:
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productId } = await params;
  
  // Fetch data
  const vendor = await fetchVendorBySlug(slug);
  if (!vendor) return { title: 'Product Not Found' };
  
  const product = await fetchProductById(productId);
  if (!product || product.vendor_id !== vendor.id) {
    return { title: 'Product Not Found' };
  }
  
  // Generate URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vendle.app';
  const productUrl = `${baseUrl}/s/${slug}/p/${productId}`;
  const storeName = vendor.store_name || vendor.name;
  
  // Truncation helpers
  const truncate = (text: string, maxLength: number) => 
    text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
  
  // Generate descriptions
  const ogDescription = product.description 
    ? truncate(product.description, 200)
    : `View this product from ${storeName}`;
  
  const metaDescription = product.description
    ? truncate(product.description, 160)
    : `View ${product.name} from ${storeName}. Shop now!`;
  
  return {
    title: truncate(`${product.name} | ${storeName}`, 60),
    description: metaDescription,
    
    robots: product.status === 'active' 
      ? 'index, follow' 
      : 'noindex, nofollow',
    
    openGraph: {
      type: 'product',
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
      description: ogDescription,
      images: product.image_url ? [product.image_url] : [],
    },
    
    alternates: {
      canonical: productUrl,
    },
    
    other: {
      'product:price:amount': (product.price / 100).toFixed(2),
      'product:price:currency': 'NGN',
      'product:availability': product.stock_quantity > 0 
        ? 'in stock' 
        : 'out of stock',
      'twitter:label1': 'Price',
      'twitter:data1': formatCurrency(product.price),
    },
  };
}
```

## Data Models

### Existing Models (No Changes Required)

**Product**: Already contains all necessary fields
```typescript
type Product = {
  id: string;                    // UUID primary key
  vendor_id: string;             // Foreign key to users
  name: string;                  // Product name
  description: string;           // Product description
  price: number;                 // Price in kobo (cents)
  compare_at_price: number | null; // Original price for sales
  status: 'active' | 'inactive'; // Visibility status
  category: string | null;       // Product category
  stock_quantity: number | null; // Available quantity
  image_url: string | null;      // Primary image URL
  gallery_images: string;        // JSON array of additional images
  options: string;               // JSON array of variants
  created_at: string;            // Timestamp
}
```

**User** (Vendor): Contains store and subscription information
```typescript
type User = {
  id: string;
  store_slug: string;            // URL-friendly store identifier
  store_name: string;            // Display name
  store_description?: string | null;
  whatsapp_number?: string | null;
  subscription_status?: 'active' | 'past_due' | 'inactive' | 'trial';
  subscription_expires_at?: string | null;
  location_state?: string | null; // Delivery restriction
  // ... other fields
}
```

**StoreTheme**: Complete theme configuration
```typescript
type StoreTheme = {
  id: string;
  vendor_id: string;
  primary_color: string;
  background_color: string;
  text_color: string;
  heading_color: string;
  surface_color: string;
  border_color: string;
  font_family: string;
  heading_font: string;
  border_radius: 'sharp' | 'rounded' | 'pill';
  card_style: 'modern' | 'classic' | 'minimal' | 'bold';
  button_style: 'solid' | 'outline' | 'soft' | 'glass';
  button_radius: 'sharp' | 'rounded' | 'pill';
  animation_style: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce';
  image_aspect_ratio: 'square' | 'portrait' | 'landscape';
  spacing: 'compact' | 'comfortable' | 'spacious';
  // ... additional fields
}
```

### Database Queries

**Optimized Product Fetch with Vendor Validation**:
```sql
-- Single query to validate product and vendor relationship
SELECT 
  p.*,
  u.store_slug,
  u.store_name,
  u.subscription_status,
  u.subscription_expires_at
FROM products p
INNER JOIN users u ON p.vendor_id = u.id
WHERE p.id = $1 
  AND u.store_slug = $2
  AND p.status = 'active'
  AND u.subscription_status NOT IN ('inactive', 'past_due')
  AND (u.subscription_expires_at IS NULL OR u.subscription_expires_at > NOW())
LIMIT 1;
```

## Error Handling

### 404 Not Found Scenarios

**Implementation**: `app/s/[slug]/p/[productId]/not-found.tsx`

```typescript
export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-3">
          Product Not Found
        </h2>
        <p className="text-slate-600 mb-8">
          This product doesn't exist or has been removed.
        </p>
        <Link 
          href="/explore"
          className="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Explore Stores
        </Link>
      </div>
    </div>
  );
}
```

### Error Conditions and Handling

| Condition | Detection | Response |
|-----------|-----------|----------|
| Invalid UUID format | Regex validation in page component | `notFound()` |
| Non-existent store slug | `fetchVendorBySlug` returns null | `notFound()` |
| Non-existent product ID | `fetchProductById` returns null | `notFound()` |
| Product-vendor mismatch | `product.vendor_id !== vendor.id` | `notFound()` |
| Inactive product | `product.status === 'inactive'` | `notFound()` |
| Expired subscription | Subscription validation fails | `notFound()` |
| Database timeout (>5s) | PostgreSQL timeout | 503 Service Unavailable page |
| Database connection error | SQL error in catch block | 500 Internal Server Error page |

### Timeout Handling

Next.js App Router handles route-level timeouts automatically. For database operations:

```typescript
// In app/lib/db.ts - add query timeout
import { sql } from '@vercel/postgres';

export const sqlWithTimeout = sql.configure({
  statement_timeout: 5000, // 5 seconds
});
```

## Testing Strategy

### Unit Tests

**Location**: `app/lib/data.test.ts`

**Test Cases**:
1. `fetchProductById` returns correct product for valid UUID
2. `fetchProductById` returns null for non-existent UUID
3. `fetchProductById` returns null for invalid UUID format
4. `validateProductOwnership` returns true for matching vendor
5. `validateProductOwnership` returns false for non-matching vendor

**Location**: `app/s/[slug]/p/[productId]/page.test.tsx`

**Test Cases**:
1. `generateMetadata` creates correct Open Graph tags
2. `generateMetadata` truncates long titles to 60 characters
3. `generateMetadata` truncates descriptions to 200 characters
4. `generateMetadata` falls back to default description when product.description is null
5. `generateMetadata` sets correct availability based on stock_quantity
6. `generateMetadata` sets noindex for inactive products
7. `generateMetadata` generates correct Twitter Card metadata
8. `generateMetadata` handles missing product image gracefully

### Integration Tests

**Location**: `__tests__/integration/product-pages.test.tsx`

**Test Cases**:
1. Product page renders with correct theme styling
2. Product page displays product information correctly
3. Product page shows stock status based on quantity
4. Product page displays compare_at_price when present
5. Product page shows gallery images when available
6. Add to cart button triggers correct flow
7. State selection modal appears when vendor has location restriction
8. Back button navigates to store page
9. Share functionality copies URL to clipboard
10. Social share buttons open correct URLs

### End-to-End Tests

**Location**: `e2e/product-sharing.spec.ts`

**Test Cases**:
1. Navigate from store to product page
2. Share product URL on WhatsApp
3. Verify Open Graph metadata in social media preview
4. Add product to cart from product page
5. Complete checkout from product page
6. Navigate back to store and verify cart persists

### Accessibility Tests

**Location**: `__tests__/a11y/product-page.test.tsx`

**Test Cases**:
1. Product page has correct heading hierarchy (h1, h2, h3)
2. Images have descriptive alt text
3. Buttons have accessible labels
4. Color contrast meets WCAG AA standards
5. Keyboard navigation works for all interactive elements
6. Screen reader announcements are meaningful

### Visual Regression Tests

**Tool**: Playwright or Percy

**Test Cases**:
1. Product page with square images
2. Product page with portrait images
3. Product page with landscape images
4. Product page with gallery
5. Product page on mobile viewport
6. Product page on tablet viewport
7. Product page on desktop viewport
8. Product page with different theme presets (Fresh Market, Bold Modern, etc.)

### Performance Tests

**Metrics**:
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive (TTI) < 3.5s

**Test Cases**:
1. Product page loads primary image within 1.5s
2. Gallery images lazy load on scroll
3. Metadata generation completes within 500ms
4. Database queries complete within 1s
5. Theme application does not cause layout shift

### Security Tests

**Test Cases**:
1. SQL injection attempts in productId parameter are rejected
2. XSS attempts in product description are sanitized
3. CSRF protection on add-to-cart action
4. Rate limiting on product page requests
5. Unauthorized access to inactive products is prevented

### Property-Based Testing

**Not applicable for this feature**. This feature involves UI rendering, route configuration, and metadata generation - all of which are deterministic and better tested with example-based tests. The requirements do not involve universal properties that would benefit from 100+ randomized iterations.

Alternative testing strategies:
- **Snapshot tests** for Open Graph metadata structure
- **Schema validation** for metadata completeness
- **Example-based unit tests** for specific metadata values
- **Integration tests** for UI rendering with different theme configurations
- **Visual regression tests** for layout consistency

## Implementation Plan

### Phase 1: Route and Data Layer (1-2 days)

1. ✅ Route already exists at `app/s/[slug]/p/[productId]/page.tsx`
2. Enhance `generateMetadata` with complete Open Graph and Twitter Card tags
3. Add validation logic for productId UUID format
4. Add validation for vendor-product relationship
5. Add subscription status validation
6. Add product active status validation
7. Create `not-found.tsx` for product 404 page
8. Add timeout handling for database queries

### Phase 2: Component Enhancement (2-3 days)

1. ✅ ProductDetail component already exists
2. Add "Add to Cart" button functionality
3. Integrate with existing cart state management
4. Add state selection modal for location-restricted vendors
5. Connect to existing checkout modal flow
6. Add quantity selector
7. Enhance image gallery with lazy loading
8. Add related products section (optional)

### Phase 3: Theme Integration (1 day)

1. ✅ Theme already applied in ProductDetail component
2. Verify border radius consistency across all elements
3. Verify animation styles match theme configuration
4. Verify spacing matches theme configuration
5. Verify button styles match theme configuration
6. Test with all 8 theme presets

### Phase 4: Image Optimization (1 day)

1. ✅ CldImage already used for Cloudinary images
2. Add priority loading for primary product image
3. Add lazy loading for gallery images
4. Configure responsive image sizes
5. Add placeholder image for missing images
6. Test image optimization with Lighthouse

### Phase 5: Testing (2-3 days)

1. Write unit tests for data layer functions
2. Write unit tests for metadata generation
3. Write integration tests for component rendering
4. Write E2E tests for user flows
5. Write accessibility tests
6. Write visual regression tests
7. Write performance tests
8. Run full test suite and fix failures

### Phase 6: Documentation and Deployment (1 day)

1. Update README with product page documentation
2. Add JSDoc comments to all new functions
3. Create Storybook stories for ProductDetail variants
4. Deploy to staging environment
5. Test social media previews on Facebook, Twitter, LinkedIn
6. Deploy to production
7. Monitor error rates and performance metrics

## Dependencies

### External Libraries (Already Installed)

- `next` v14.x - App Router and Server Components
- `react` v18.x - UI rendering
- `@vercel/postgres` - Database client
- `next-cloudinary` - Image optimization
- `@heroicons/react` - Icon library

### Internal Dependencies

- `app/lib/data.ts` - Data fetching functions
- `app/lib/theme.ts` - Theme management
- `app/lib/utils.ts` - Helper functions
- `app/lib/definitions.ts` - TypeScript types
- `app/ui/store/storefront.tsx` - Cart and checkout logic (for reference)

### Environment Variables

```env
NEXT_PUBLIC_BASE_URL=https://vendle.app
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
```

## Performance Considerations

### Image Optimization Strategy

1. **Primary Image**: 
   - Use `priority` attribute for above-the-fold loading
   - Serve via Cloudinary with `f_auto,q_auto` transformations
   - Generate responsive srcset for 640px, 768px, 1024px, 1280px
   
2. **Gallery Images**:
   - Use `loading="lazy"` attribute
   - Load on scroll or user interaction
   - Limit display to 10 images maximum
   
3. **Thumbnail Images**:
   - Generate 150x150 thumbnails via Cloudinary
   - Use `thumb` crop mode with `g_center` gravity

### Database Query Optimization

1. **Parallel Fetching**: Use `Promise.all()` to fetch vendor, product, and theme simultaneously
2. **Indexing**: Ensure indexes exist on:
   - `products.id` (primary key)
   - `products.vendor_id` (foreign key)
   - `products.status` (for active filtering)
   - `users.store_slug` (for vendor lookup)
3. **Query Timeout**: Set 5-second timeout to prevent hanging requests
4. **Connection Pooling**: Use Vercel Postgres pooling for efficient connections

### Caching Strategy

1. **Static Generation**: Pre-generate product pages for top 100 products at build time
2. **Incremental Static Regeneration**: Revalidate product pages every 60 seconds
3. **CDN Caching**: Cache product images for 1 year with immutable headers
4. **Browser Caching**: Cache theme CSS for 1 hour

### Rendering Strategy

**Recommendation**: Use **Server Components with ISR (Incremental Static Regeneration)**

```typescript
// app/s/[slug]/p/[productId]/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

// Generate static pages for top products at build time
export async function generateStaticParams() {
  const topProducts = await fetchTopProducts(100);
  
  return topProducts.map((product) => ({
    slug: product.store_slug,
    productId: product.id,
  }));
}
```

**Rationale**:
- Product data changes infrequently (price, stock, description)
- Static generation provides fastest initial page load
- ISR keeps data fresh without full rebuilds
- Server-side metadata generation ensures social media crawlers see correct tags

## Monitoring and Observability

### Metrics to Track

1. **Page Load Metrics**:
   - Average page load time
   - 95th percentile page load time
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

2. **Error Rates**:
   - 404 rate (product not found)
   - 500 rate (database errors)
   - 503 rate (timeouts)
   - Metadata generation failures

3. **Business Metrics**:
   - Product page views per day
   - Product page → cart addition rate
   - Product page → checkout completion rate
   - Social media share clicks

4. **Database Metrics**:
   - Query execution time (p50, p95, p99)
   - Connection pool utilization
   - Query timeout rate

### Logging Strategy

```typescript
// In page.tsx
import { logger } from '@/app/lib/logger';

export default async function ProductPage({ params }: Props) {
  const startTime = Date.now();
  
  try {
    // ... fetch data
    
    logger.info('Product page loaded', {
      productId,
      slug,
      loadTime: Date.now() - startTime,
    });
    
    return <ProductDetail ... />;
  } catch (error) {
    logger.error('Product page error', {
      productId,
      slug,
      error: error.message,
      stack: error.stack,
    });
    
    throw error;
  }
}
```

### Alerting Thresholds

- **Page Load Time** > 3 seconds for 5 consecutive minutes → Alert
- **Error Rate** > 5% for 5 minutes → Alert
- **Database Timeout Rate** > 1% for 5 minutes → Alert
- **404 Rate** > 20% for 10 minutes → Alert (potential issue with product links)

## Security Considerations

### Input Validation

1. **Product ID**: Validate UUID format before database query to prevent injection
2. **Store Slug**: Sanitize slug input to prevent directory traversal attacks
3. **User-Generated Content**: Sanitize product descriptions rendered as HTML to prevent XSS

### Access Control

1. **Inactive Products**: Return 404 for products with `status='inactive'`
2. **Expired Subscriptions**: Return 404 for vendors with expired subscriptions
3. **Product-Vendor Mismatch**: Return 404 if product doesn't belong to store

### Rate Limiting

Implement rate limiting at the edge (Vercel Edge Config or Cloudflare):
- 100 requests per minute per IP for product pages
- 10 requests per minute per IP for metadata generation API (if exposed)

### CORS Configuration

Product pages should allow social media crawlers but restrict API access:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Allow social media crawlers
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent.includes('facebookexternalhit') || 
      userAgent.includes('Twitterbot') ||
      userAgent.includes('LinkedInBot')) {
    response.headers.set('X-Robots-Tag', 'all');
  }
  
  return response;
}
```

## Future Enhancements

1. **Product Variants**: Add support for size/color variants with separate URLs
2. **Product Reviews**: Display customer reviews and ratings on product page
3. **Related Products**: Show recommended products from same category
4. **Product Videos**: Support video galleries alongside images
5. **Wishlist**: Add "Save to Wishlist" functionality
6. **Price Alerts**: Allow customers to get notified when price drops
7. **Inventory Notifications**: Notify customers when out-of-stock products return
8. **Dynamic Pricing**: Support time-based pricing and flash sales
9. **A/B Testing**: Test different product page layouts for conversion optimization
10. **Analytics Integration**: Track product view events in Google Analytics / Meta Pixel

## Migration and Rollout Plan

### Migration Strategy

**Phase 1: Soft Launch (Week 1)**
- Deploy product pages to production
- Update existing product links in store pages to point to `/s/[slug]/p/[productId]`
- Monitor error rates and performance metrics
- Keep fallback to inline product view if issues arise

**Phase 2: Social Media Testing (Week 2)**
- Test product URLs on Facebook, Twitter, LinkedIn, WhatsApp
- Validate Open Graph metadata rendering
- Fix any metadata issues discovered
- Update product share buttons in dashboard to use new URLs

**Phase 3: SEO Optimization (Week 3)**
- Submit product page sitemap to Google Search Console
- Monitor search engine indexing
- Optimize metadata based on search performance
- Add structured data for products (schema.org)

**Phase 4: Full Rollout (Week 4)**
- Make product pages the default view
- Remove inline product quick view (optional)
- Update documentation and help articles
- Announce feature to vendors via email

### Rollback Plan

If critical issues arise:
1. Revert to previous deployment via Vercel rollback
2. Update product links to use inline quick view
3. Disable product page routes with middleware
4. Investigate and fix issues in staging
5. Redeploy with fixes after testing

### Success Criteria

- Product pages load in < 2.5 seconds (LCP)
- Social media previews render correctly on all tested platforms
- < 1% error rate on product page requests
- > 10% increase in product sharing activity
- > 5% increase in cart addition rate from product pages
- Positive feedback from vendor beta testers
