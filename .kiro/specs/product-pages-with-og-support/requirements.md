# Requirements Document

## Introduction

This feature introduces dedicated product pages for the Vendle MVP application, enabling individual products to be shared on social media with rich Open Graph metadata. Currently, products are only displayed inline on store pages (/s/[slug]), limiting their discoverability and shareability. With this feature, each product will have its own URL route (/s/[storeSlug]/p/[productId]), a dedicated page layout respecting the store's theme, and comprehensive Open Graph tags for optimal social media presentation across platforms including Facebook, LinkedIn, WhatsApp, Slack, Discord, Telegram, and Twitter/X.

## Glossary

- **Product_Page**: A standalone web page dedicated to displaying a single product with its details, images, and purchase options
- **Open_Graph_Metadata**: HTML meta tags that control how URLs are displayed when shared on social media platforms
- **Store_Theme**: The customizable visual styling configuration for a vendor's store, including colors, fonts, layout, and card styles
- **Storefront**: The main store page where all products are displayed inline at the URL /s/[slug]
- **Product_Route**: The URL pattern /s/[storeSlug]/p/[productId] that identifies a specific product page
- **Social_Media_Preview**: The card-like preview (with image, title, description) shown when a URL is shared on social platforms
- **Cart_Functionality**: The ability for customers to add products to their shopping cart and proceed to checkout
- **Theme_Preset**: One of 8 predefined theme configurations with customizable colors, fonts, and card styles

## Requirements

### Requirement 1: Product Page Routing

**User Story:** As a customer, I want to access individual product pages via a dedicated URL, so that I can view product details and share specific products with others.

#### Acceptance Criteria

1. THE Product_Page_Router SHALL expose a route at /s/[storeSlug]/p/[productId]
2. WHEN a customer navigates to a Product_Route, THE Product_Page_Router SHALL fetch the product data from the database using the productId within 5 seconds
3. IF a customer navigates to a Product_Route with a productId that does not match a UUID format, THEN THE Product_Page_Router SHALL return a 404 not found page
4. IF a customer navigates to a Product_Route with a productId that does not exist in the database, THEN THE Product_Page_Router SHALL return a 404 not found page
5. IF a customer navigates to a Product_Route where the product's vendor_id does not match the vendor associated with the storeSlug, THEN THE Product_Page_Router SHALL return a 404 not found page
6. IF a customer navigates to a Product_Route with a storeSlug that does not exist in the database, THEN THE Product_Page_Router SHALL return a 404 not found page
7. IF a customer navigates to a Product_Route for a product with status='inactive', THEN THE Product_Page_Router SHALL return a 404 not found page
8. IF a customer navigates to a Product_Route for a vendor where subscription_status is 'inactive' OR subscription_status is 'past_due', THEN THE Product_Page_Router SHALL return a 404 not found page
9. IF a customer navigates to a Product_Route for a vendor where subscription_expires_at is not null AND subscription_expires_at is earlier than current timestamp, THEN THE Product_Page_Router SHALL return a 404 not found page
10. IF the database fetch operation exceeds 5 seconds, THEN THE Product_Page_Router SHALL return an error page indicating service unavailable

### Requirement 2: Product Page Display

**User Story:** As a customer, I want to see comprehensive product information on the product page, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. THE Product_Page SHALL display the product's primary image using the Store_Theme's configured image_aspect_ratio
2. IF product.image_url is null or empty string, THEN THE Product_Page SHALL display a placeholder image with a photo icon
3. THE Product_Page SHALL display the product name styled with the Store_Theme's heading_font and heading_color
4. THE Product_Page SHALL display the product description styled with the Store_Theme's text_color and font_family
5. THE Product_Page SHALL display the product price formatted as Nigerian Naira using formatCurrency function
6. IF product.compare_at_price is not null AND product.compare_at_price is greater than product.price, THEN THE Product_Page SHALL display both the sale price and the original compare_at_price with strikethrough styling
7. IF product.stock_quantity is greater than 10, THEN THE Product_Page SHALL display stock status as "In Stock"
8. IF product.stock_quantity is between 1 and 10 inclusive, THEN THE Product_Page SHALL display stock status as "Low Stock - Only {stock_quantity} left"
9. IF product.stock_quantity is 0, THEN THE Product_Page SHALL display stock status as "Out of Stock"
10. IF product.stock_quantity is null, THEN THE Product_Page SHALL display stock status as "In Stock"
11. IF product.stock_quantity is 0, THEN THE "Add to Cart" button SHALL be disabled
12. IF product.gallery_images is not null, THEN THE Product_Page SHALL parse the JSON string and display a gallery or carousel of additional product images
13. THE Product_Page SHALL display an "Add to Cart" button styled according to the Store_Theme's button_style, button_radius, and primary_color
14. THE Product_Page SHALL display a back navigation button labeled "Back to Store" above or beside the product image
15. IF the productId does not match any product in the database, THEN THE Product_Page SHALL display an error message "Product not found" with a link to return to the Storefront

### Requirement 3: Theme Consistency

**User Story:** As a vendor, I want product pages to match my store's theme styling, so that my brand identity remains consistent across all pages.

#### Acceptance Criteria

1. THE Product_Page SHALL apply the Store_Theme's background_color to the page background
2. THE Product_Page SHALL apply the Store_Theme's border_radius to product image containers, product detail cards, add-to-cart button containers, and related product cards
3. THE Product_Page SHALL apply the Store_Theme's card_style, card_shadow, and surface_color to the primary product detail card and related product cards
4. THE Product_Page SHALL apply the Store_Theme's spacing configuration to vertical spacing between the product image section, product details section, product description section, and related products section
5. THE Product_Page SHALL apply the Store_Theme's animation_style to product image transitions, button hover states, and related product card hover interactions
6. THE Product_Page SHALL render the store header with the Store_Theme's header_style (sticky, static, or transparent)
7. THE Product_Page SHALL use the Store_Theme's logo_url, logo_position, and logo_frame for the store logo display
8. THE Product_Page SHALL apply the Store_Theme's font_family and font_size to product descriptions, specifications, and informational text
9. THE Product_Page SHALL apply the Store_Theme's heading_font and heading_color to the product name and section headings
10. WHEN the Store_Theme has glass_effect enabled, THE Product_Page SHALL apply backdrop-filter blur of 12px to overlay elements including modals, image zoom overlays, and floating action buttons
11. IF any required Store_Theme property is missing or invalid, THEN THE Product_Page SHALL apply default theme values and log the missing property

### Requirement 4: Cart and Checkout Integration

**User Story:** As a customer, I want to add products to my cart from the product page, so that I can purchase items I'm interested in.

#### Acceptance Criteria

1. WHEN a customer clicks "Add to Cart", THE Product_Page SHALL add the product to the shopping cart with quantity 1
2. WHEN a customer clicks "Add to Cart", THE Product_Page SHALL update the cart count indicator in the header
3. WHEN a customer clicks the cart icon, THE Product_Page SHALL open the checkout modal with the current cart contents
4. WHEN a customer clicks "Add to Cart" and vendor location_state is null, THE Product_Page SHALL add the product to cart without location validation
5. WHEN a customer clicks "Add to Cart" and vendor location_state is set and customer has not selected a state, THE Product_Page SHALL display a state selection dropdown before adding to cart
6. WHEN a customer selects their state and it matches vendor location_state, THE Product_Page SHALL add the product to cart
7. IF customer state does not match vendor location_state, THEN THE Product_Page SHALL display an alert message indicating the vendor only delivers to the specified state
8. WHEN delivery_type for the order is "delivery", THE Product_Page SHALL display a location picker in the checkout modal for delivery address selection
9. WHEN delivery_type for the order is "pickup", THE Product_Page SHALL not display the location picker in the checkout modal
10. THE checkout modal SHALL display payment method selection with options "Cash" and "Card"
11. WHEN customer selects "Card" payment method, THE checkout modal SHALL display the Paystack payment button
12. WHEN customer selects "Cash" payment method, THE checkout modal SHALL allow order submission without payment processing
13. WHEN a customer attempts to add an out-of-stock product to cart (stock_quantity is 0 or null), THE Product_Page SHALL display an error message indicating the product is unavailable
14. WHEN a product is in the cart, THE checkout modal SHALL display quantity adjustment controls allowing the customer to increase or decrease quantity
15. WHEN customer increases product quantity in cart and the new quantity exceeds stock_quantity, THE checkout modal SHALL display an error message indicating insufficient stock and prevent the increase
16. WHEN customer decreases product quantity to 0, THE checkout modal SHALL remove the product from the cart

### Requirement 5: Open Graph Metadata Generation

**User Story:** As a vendor, I want product pages to include Open Graph metadata, so that my products display attractively when shared on social media platforms.

#### Acceptance Criteria

1. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate an og:title meta tag with the product name truncated to 60 characters
2. WHEN the Product_Page loads and product.description is not null, THE Product_Page_Metadata_Generator SHALL generate an og:description meta tag with the product description truncated to 200 characters
3. IF product.description is null or empty string, THEN THE Product_Page_Metadata_Generator SHALL generate an og:description meta tag with value "View this product from {store_name}"
4. WHEN the Product_Page loads and product.image_url is not null, THE Product_Page_Metadata_Generator SHALL generate an og:image meta tag with the product's primary image URL
5. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate an og:url meta tag with the canonical Product_Route URL in format https://vendle.app/s/{storeSlug}/p/{productId}
6. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate an og:type meta tag with value "product"
7. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate an og:site_name meta tag with the store_name
8. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate a product:price:amount meta tag with the product price formatted to 2 decimal places
9. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate a product:price:currency meta tag with value "NGN"
10. IF product.stock_quantity is greater than 0, THEN THE Product_Page_Metadata_Generator SHALL generate a product:availability meta tag with value "in stock"
11. IF product.stock_quantity is 0 or null, THEN THE Product_Page_Metadata_Generator SHALL generate a product:availability meta tag with value "out of stock"
12. IF product.image_url is not null, THEN THE Product_Page_Metadata_Generator SHALL generate an og:image:width meta tag with value 1200
13. IF product.image_url is not null, THEN THE Product_Page_Metadata_Generator SHALL generate an og:image:height meta tag with value 630
14. IF product.name is null or empty string, THEN THE Product_Page_Metadata_Generator SHALL generate an og:title meta tag with value "Product | {store_name}"

### Requirement 6: Twitter Card Metadata

**User Story:** As a vendor, I want product pages to include Twitter Card metadata, so that my products display properly when shared on Twitter/X.

#### Acceptance Criteria

1. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate a twitter:card meta tag with value "summary_large_image"
2. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate a twitter:title meta tag with the product name truncated to 70 characters
3. WHEN the Product_Page loads and product.description is not null, THE Product_Page_Metadata_Generator SHALL generate a twitter:description meta tag with the product description truncated to 200 characters
4. WHEN the Product_Page loads and product.image_url is not null, THE Product_Page_Metadata_Generator SHALL generate a twitter:image meta tag with the product's primary image URL
5. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate a twitter:label1 meta tag with value "Price"
6. WHEN the Product_Page loads and product.price is not null, THE Product_Page_Metadata_Generator SHALL generate a twitter:data1 meta tag with the formatted product price in Nigerian Naira format "₦{price}" with 2 decimal places
7. IF product.name is null or empty string, THEN THE Product_Page_Metadata_Generator SHALL generate a twitter:title meta tag with value "Product | {store_name}"
8. IF product.description is null or empty string, THEN THE Product_Page_Metadata_Generator SHALL generate a twitter:description meta tag with value "View this product from {store_name}"
9. IF product.price is null or not a valid number, THEN THE Product_Page_Metadata_Generator SHALL not generate twitter:data1 meta tag

### Requirement 7: Social Media Platform Compatibility

**User Story:** As a vendor, I want my product links to display correctly on all major social platforms, so that I can effectively market my products across different channels.

#### Acceptance Criteria

1. WHEN a Product_Route URL is shared on Facebook, THE Social_Media_Preview SHALL display the product image, name, description, and price
2. WHEN a Product_Route URL is shared on LinkedIn, THE Social_Media_Preview SHALL display the product image, name, and description
3. WHEN a Product_Route URL is shared on WhatsApp, THE Social_Media_Preview SHALL display the product image and name
4. WHEN a Product_Route URL is shared on Slack, THE Social_Media_Preview SHALL display the product image, name, and description
5. WHEN a Product_Route URL is shared on Discord, THE Social_Media_Preview SHALL display the product image, name, and description
6. WHEN a Product_Route URL is shared on Telegram, THE Social_Media_Preview SHALL display the product image and name
7. WHEN a Product_Route URL is shared on Twitter/X, THE Social_Media_Preview SHALL display the product image, name, description, and price label
8. WHEN a Product_Route URL is shared on any platform, THE Social_Media_Preview SHALL load metadata using Open Graph and Twitter Card tags and display within 3 seconds
9. IF product.image_url is null or empty string, THEN THE Social_Media_Preview SHALL display a placeholder image from /images/product-placeholder.png
10. WHEN product.description exceeds 200 characters, THE Social_Media_Preview SHALL truncate the description to 200 characters followed by ellipsis

### Requirement 8: Navigation Between Store and Product Pages

**User Story:** As a customer, I want to easily navigate between the store page and individual product pages, so that I can browse products efficiently.

#### Acceptance Criteria

1. WHEN a customer views the Storefront, THE Product_Card SHALL include a clickable link to the product detail route `/s/{store_slug}/p/{product_id}`
2. WHEN a customer clicks a product link, THE Product_Card SHALL navigate to the product detail page in the same browser tab within 2 seconds
3. WHEN a customer navigates from Storefront to a product detail page, THE Navigation_System SHALL preserve all cart items in browser session storage
4. WHEN a customer navigates from a product detail page back to Storefront, THE Navigation_System SHALL restore all previously added cart items from session storage
5. WHEN a customer is on a product detail page, THE Product_Detail_Header SHALL display a back button labeled "Back to Store" that navigates to the Storefront
6. IF the vendor has configured a store logo, WHEN a customer is on a product detail page, THEN THE Product_Detail_Header SHALL display the clickable store name or logo that navigates to the Storefront
7. WHEN a customer clicks the back button or store identifier on a product detail page, THE Navigation_System SHALL navigate to the Storefront within 2 seconds
8. IF a customer navigates to an invalid product ID, THEN THE Navigation_System SHALL display a "Product not found" page with a link to return to the Storefront
9. WHEN a customer navigates between multiple product detail pages, THE Navigation_System SHALL preserve cart contents in session storage across all navigation events
10. THE Navigation_System SHALL persist cart contents in session storage until the browser tab is closed or the customer completes checkout

### Requirement 9: SEO and Canonical URLs

**User Story:** As a vendor, I want product pages to be properly indexed by search engines, so that my products can be discovered through organic search.

#### Acceptance Criteria

1. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate a canonical link tag with the Product_Route URL in absolute format https://vendle.app/s/{storeSlug}/p/{productId}
2. WHEN the Product_Page loads, THE Product_Page_Metadata_Generator SHALL generate a title tag with format "{product_name} | {store_name}" truncated to 60 characters
3. WHEN the Product_Page loads and product.description is not null, THE Product_Page_Metadata_Generator SHALL generate a meta description tag with the product description truncated to 160 characters
4. IF product.description is null or empty string, THEN THE Product_Page_Metadata_Generator SHALL generate a meta description tag with value "View {product_name} from {store_name}. Shop now!"
5. IF product.status is "active", THEN THE Product_Page_Metadata_Generator SHALL generate a robots meta tag with value "index, follow"
6. IF product.status is "inactive", THEN THE Product_Page_Metadata_Generator SHALL generate a robots meta tag with value "noindex, nofollow"

### Requirement 10: Performance and Image Optimization

**User Story:** As a customer, I want product pages to load quickly with optimized images, so that I have a smooth browsing experience.

#### Acceptance Criteria

1. WHEN a product image URL contains "cloudinary.com", THE Product_Page SHALL render the image using CldImage component with format set to "auto" and quality set to "auto"
2. WHEN a product image URL does not contain "cloudinary.com", THE Product_Page SHALL render the image using Next.js Image component with format optimization enabled
3. THE Product_Page SHALL preload the primary product image (product.image_url) using priority attribute
4. WHEN gallery_images array contains one or more image URLs, THE Product_Page SHALL render gallery images using Next.js Image component with loading attribute set to "lazy"
5. THE Product_Page SHALL generate responsive image sizes with breakpoints at 640px (mobile), 768px (tablet), 1024px (desktop), and 1280px (large desktop)
6. THE Product_Page SHALL specify image sizes attribute as "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" for gallery images
7. IF a product image URL is null or empty string, THEN THE Product_Page SHALL display a placeholder image with photo icon
8. THE Product_Page SHALL limit maximum image width to 1920px to prevent loading oversized assets
