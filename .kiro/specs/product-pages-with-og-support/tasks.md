# Implementation Plan: Product Pages with Open Graph Support

## Overview

This implementation adds dedicated product pages at `/s/[storeSlug]/p/[productId]` with comprehensive Open Graph metadata for social media sharing. The feature builds on the existing Next.js App Router architecture, extends the data layer with new fetch functions, creates server-side metadata generation, and integrates with existing cart/checkout functionality while maintaining full theme consistency.

## Tasks

- [x] 1. Set up product page route structure and data layer
  - [x] 1.1 Create product page route at `app/s/[slug]/p/[productId]/page.tsx`
    - Implement async page component with Promise-based params extraction
    - Add UUID format validation using regex pattern for productId
    - Implement parallel data fetching with Promise.all for vendor, product, and theme
    - Add vendor-product relationship validation (product.vendor_id === vendor.id)
    - Add subscription status validation (not 'inactive' or 'past_due')
    - Add subscription expiry validation (null or future date)
    - Add product active status validation (status === 'active')
    - Return notFound() for all validation failures
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_
  
  - [x] 1.2 Add fetchProductById function to `app/lib/data.ts`
    - Create async function that accepts productId as string parameter
    - Add SQL query to fetch product by id with LIMIT 1
    - Return Product type or null
    - Add error handling with console.error logging
    - Throw descriptive error on database failures
    - _Requirements: 1.2, 1.4_
  
  - [x] 1.3 Create product not-found page at `app/s/[slug]/p/[productId]/not-found.tsx`
    - Create centered layout with 404 heading
    - Add "Product Not Found" title and descriptive message
    - Include "Explore Stores" link button to /explore page
    - Style with Tailwind CSS matching existing design system
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.15, 8.8_

- [ ] 2. Implement Open Graph and Twitter Card metadata generation
  - [ ] 2.1 Create generateMetadata function in product page
    - Extract slug and productId from params Promise
    - Fetch vendor by slug and return fallback metadata if not found
    - Fetch product by productId and validate vendor ownership
    - Generate base URL from NEXT_PUBLIC_BASE_URL environment variable
    - Create canonical product URL in format: {baseUrl}/s/{slug}/p/{productId}
    - _Requirements: 5.5, 9.1_
  
  - [~] 2.2 Generate Open Graph meta tags
    - Create og:title with product name truncated to 60 characters
    - Create og:description with product description truncated to 200 characters
    - Use fallback description "View this product from {store_name}" if description is null/empty
    - Set og:type to "product"
    - Set og:url to canonical product URL
    - Set og:site_name to store_name from vendor
    - Add og:image with product.image_url (if not null)
    - Add og:image:width as 1200
    - Add og:image:height as 630
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.12, 5.13, 5.14_
  
  - [~] 2.3 Generate product-specific Open Graph tags
    - Add product:price:amount with price divided by 100 and formatted to 2 decimals
    - Add product:price:currency as "NGN"
    - Set product:availability to "in stock" when stock_quantity > 0
    - Set product:availability to "out of stock" when stock_quantity is 0 or null
    - _Requirements: 5.8, 5.9, 5.10, 5.11_
  
  - [~] 2.4 Generate Twitter Card meta tags
    - Set twitter:card to "summary_large_image"
    - Create twitter:title with product name truncated to 70 characters
    - Create twitter:description with product description truncated to 200 characters
    - Use fallback description for twitter:description if product.description is null/empty
    - Add twitter:image with product.image_url (if not null)
    - Set twitter:label1 to "Price"
    - Set twitter:data1 to formatted price using formatCurrency function
    - Handle null/invalid price by omitting twitter:data1
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  
  - [~] 2.5 Generate SEO meta tags
    - Create page title in format "{product_name} | {store_name}" truncated to 60 characters
    - Create meta description with product description truncated to 160 characters
    - Use fallback "View {product_name} from {store_name}. Shop now!" if description is null/empty
    - Set canonical link to product URL
    - Set robots meta tag to "index, follow" for active products
    - Set robots meta tag to "noindex, nofollow" for inactive products
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [~] 3. Checkpoint - Verify route and metadata generation
  - Ensure product page route is accessible at /s/[slug]/p/[productId]
  - Test generateMetadata function returns correct Open Graph tags
  - Verify 404 handling for invalid product IDs and vendor mismatches
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Enhance ProductDetail client component
  - [~] 4.1 Update ProductDetail component in `app/ui/store/product-detail.tsx`
    - Accept vendor, product, and theme as props
    - Apply theme configuration to all styled elements
    - Render product name with heading_font and heading_color from theme
    - Render product description with font_family and text_color from theme
    - Apply background_color from theme to page wrapper
    - Apply border_radius from theme to image containers and cards
    - Apply card_style, card_shadow, and surface_color to product detail card
    - Apply spacing configuration for vertical layout sections
    - Apply animation_style to image transitions and hover states
    - _Requirements: 2.1, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.8, 3.9_
  
  - [~] 4.2 Implement product image display with theme-aware styling
    - Render primary product image using CldImage for Cloudinary URLs
    - Use Next.js Image component with priority loading for primary image
    - Apply image_aspect_ratio from theme (square, portrait, landscape)
    - Display placeholder image with photo icon if image_url is null/empty
    - Apply border_radius from theme to image container
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 10.1, 10.2, 10.3, 10.7_
  
  - [~] 4.3 Display product pricing and stock information
    - Format product price using formatCurrency function
    - Display compare_at_price with strikethrough if present and greater than price
    - Show "In Stock" status when stock_quantity > 10 or null
    - Show "Low Stock - Only {stock_quantity} left" when stock_quantity is 1-10
    - Show "Out of Stock" status when stock_quantity is 0
    - Apply text_color from theme to price text
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_
  
  - [~] 4.4 Implement gallery images with lazy loading
    - Parse gallery_images JSON string if not null
    - Render gallery images using Next.js Image component with loading="lazy"
    - Apply image_aspect_ratio from theme to gallery thumbnails
    - Implement click handler to update main image on thumbnail click
    - Add responsive sizes attribute: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    - Limit maximum image width to 1920px
    - _Requirements: 2.12, 10.4, 10.5, 10.6, 10.8_
  
  - [~] 4.5 Add back navigation button
    - Create "Back to Store" button above or beside product image
    - Link button to storefront at `/s/{slug}`
    - Apply button_style and button_radius from theme
    - Style with theme's primary_color
    - _Requirements: 2.14, 8.5, 8.7_

- [ ] 5. Implement Add to Cart functionality with location validation
  - [~] 5.1 Create Add to Cart button with theme styling
    - Render "Add to Cart" button using theme's button_style, button_radius, primary_color
    - Disable button when stock_quantity is 0
    - Apply glass_effect backdrop-filter blur if theme has glass_effect enabled
    - Add click handler for addToCart action
    - _Requirements: 2.11, 2.13, 3.10, 4.1, 4.13_
  
  - [~] 5.2 Implement addToCart function with location state validation
    - Check if vendor has location_state set
    - If location_state is null, add product to cart immediately with quantity 1
    - If location_state is set and customer has no selected state, show state selection modal
    - If customer state matches vendor location_state, add product to cart
    - If customer state does not match, display alert indicating delivery restriction
    - Update cart count indicator in header after successful addition
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 4.7_
  
  - [~] 5.3 Create state selection modal component
    - Display dropdown with Nigerian states when vendor has location_state restriction
    - Show modal before adding to cart when customer has no state selected
    - Store customer's selected state in localStorage or session
    - Apply theme's surface_color, border_radius, and card_shadow to modal
    - Apply glass_effect backdrop-filter if theme has glass_effect enabled
    - _Requirements: 4.5, 3.10_
  
  - [~] 5.4 Handle out-of-stock products
    - Display error message when attempting to add out-of-stock product (stock_quantity 0)
    - Display error message when attempting to add product with null stock_quantity
    - Prevent cart addition for out-of-stock products
    - _Requirements: 4.13_

- [ ] 6. Integrate checkout modal with delivery options
  - [~] 6.1 Connect cart icon to checkout modal
    - Add click handler to cart icon in header
    - Open checkout modal with current cart contents
    - Display cart items with quantity adjustment controls
    - _Requirements: 4.3, 4.14_
  
  - [~] 6.2 Implement delivery type selection
    - Display radio buttons for "Delivery" and "Pickup" options
    - Show location picker when delivery_type is "delivery"
    - Hide location picker when delivery_type is "pickup"
    - _Requirements: 4.8, 4.9_
  
  - [~] 6.3 Implement payment method selection
    - Display radio buttons for "Cash" and "Card" payment methods
    - Show Paystack payment button when "Card" is selected
    - Allow direct order submission when "Cash" is selected
    - _Requirements: 4.10, 4.11, 4.12_
  
  - [~] 6.4 Add quantity adjustment in checkout modal
    - Display increment and decrement buttons for each cart item
    - Validate new quantity against stock_quantity before allowing increase
    - Display error message if requested quantity exceeds available stock
    - Remove product from cart when quantity is decreased to 0
    - _Requirements: 4.14, 4.15, 4.16_

- [ ] 7. Implement navigation and cart persistence
  - [~] 7.1 Update store product cards to link to product pages
    - Add Link component to product cards in storefront
    - Set href to `/s/{store_slug}/p/{product_id}`
    - Navigate in same browser tab within 2 seconds
    - _Requirements: 8.1, 8.2_
  
  - [~] 7.2 Implement cart session storage
    - Save cart items to sessionStorage on any cart modification
    - Restore cart items from sessionStorage on page load
    - Persist cart across navigation between store and product pages
    - Clear cart from sessionStorage on checkout completion or browser tab close
    - _Requirements: 8.3, 8.4, 8.9, 8.10_
  
  - [~] 7.3 Add store header with logo/name link
    - Display vendor's store_name or logo_url in product page header
    - Apply theme's header_style (sticky, static, transparent)
    - Apply logo_position and logo_frame from theme
    - Make store name/logo clickable, linking to storefront at `/s/{slug}`
    - _Requirements: 3.6, 3.7, 8.6_

- [~] 8. Checkpoint - Verify cart and navigation flow
  - Test adding products to cart from product page
  - Verify cart persists when navigating between store and product pages
  - Test location validation for vendors with delivery restrictions
  - Test checkout modal with delivery and payment options
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Validate social media preview compatibility
  - [~] 9.1 Test Open Graph metadata rendering
    - Share product URL on Facebook and verify image, title, description display
    - Share product URL on LinkedIn and verify preview content
    - Share product URL on WhatsApp and verify preview displays correctly
    - Verify metadata loads within 3 seconds on all platforms
    - _Requirements: 7.1, 7.2, 7.3, 7.8_
  
  - [~] 9.2 Test Twitter Card metadata rendering
    - Share product URL on Twitter/X and verify summary_large_image card displays
    - Verify price label appears in Twitter card preview
    - _Requirements: 7.7, 7.8_
  
  - [~] 9.3 Test additional platform compatibility
    - Share product URL on Slack and verify preview display
    - Share product URL on Discord and verify embed appears correctly
    - Share product URL on Telegram and verify preview shows
    - Verify placeholder image displays when product.image_url is null
    - Verify description truncation at 200 characters with ellipsis
    - _Requirements: 7.4, 7.5, 7.6, 7.9, 7.10_

- [ ] 10. Performance optimization and image loading
  - [~] 10.1 Configure Next.js Image component settings
    - Set priority attribute on primary product image
    - Configure responsive breakpoints at 640px, 768px, 1024px, 1280px
    - Set sizes attribute for responsive image loading
    - Enable format optimization for non-Cloudinary images
    - _Requirements: 10.2, 10.3, 10.5, 10.6_
  
  - [~] 10.2 Optimize Cloudinary image delivery
    - Ensure CldImage uses format="auto" and quality="auto"
    - Configure responsive sizes for Cloudinary transformations
    - _Requirements: 10.1_
  
  - [~] 10.3 Add timeout handling for database queries
    - Configure statement_timeout to 5000ms in database client
    - Add error page for service unavailable (503) on timeout
    - Log database timeout errors with context
    - _Requirements: 1.10_

- [ ] 11. Final integration and testing
  - [~] 11.1 Test complete user journey
    - Navigate from store page to product page via product card
    - Verify theme styling consistency between store and product pages
    - Add product to cart and verify cart count updates
    - Open checkout modal and complete test order
    - Navigate back to store and verify cart persists
    - Test with multiple theme presets
    - _Requirements: All requirements_
  
  - [~] 11.2 Validate error handling
    - Test invalid UUID format in productId parameter
    - Test non-existent product IDs
    - Test vendor-product mismatch scenarios
    - Test inactive products return 404
    - Test expired subscription returns 404
    - Verify database timeout handling
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_
  
  - [~] 11.3 Verify accessibility compliance
    - Check heading hierarchy (h1, h2, h3)
    - Verify all images have alt text
    - Test keyboard navigation for all interactive elements
    - Verify color contrast meets WCAG AA standards
    - Test screen reader compatibility

- [~] 12. Final checkpoint - Complete system verification
  - Run all tests and verify passing
  - Check Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
  - Verify social media previews on all listed platforms
  - Ensure cart functionality works across navigation
  - Confirm theme consistency across all 8 presets
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks build incrementally on existing Next.js App Router architecture
- Theme integration reuses existing StoreTheme type and getOrCreateVendorTheme function
- Cart functionality extends existing cart state management from Storefront component
- Database queries use existing @vercel/postgres client and ensureProductColumns helper
- Image optimization leverages existing CldImage component for Cloudinary and Next.js Image for other sources
- Metadata generation uses Next.js 14's generateMetadata API for automatic <head> population
- Navigation maintains cart state via sessionStorage across all route transitions
- Testing covers unit tests for data layer, integration tests for UI, and E2E tests for complete flows
- Property-based testing is not applicable (UI rendering and metadata generation are deterministic)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "4.2", "4.3", "4.5"] },
    { "id": 3, "tasks": ["4.4", "5.1", "7.1", "7.3"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "6.1", "7.2"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "10.1", "10.2"] },
    { "id": 6, "tasks": ["10.3", "9.1", "9.2", "9.3"] },
    { "id": 7, "tasks": ["11.1", "11.2", "11.3"] }
  ]
}
```
