/**
 * Creates a test vendor with Business tier subscription so we can verify
 * that "Powered by Vendle" branding is hidden on the storefront.
 *
 * Usage: node scripts/create-test-business-vendor.js
 *
 * Creates:
 *   - A test user with business tier (active subscription)
 *   - A default store theme
 *   - 3 sample products
 */

const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

// Fixed UUID so we can reference it if needed
const VENDOR_ID = '00000000-0000-4000-a000-000000001001';
const SLUG = 'test-business-store';

async function createTestVendor() {
  try {
    console.log('🚀 Creating Business tier test vendor...\n');

    // 1. Insert the test user
    console.log('👤 Creating test user...');
    await sql`
      INSERT INTO users (
        id, name, email, password,
        store_slug, store_name, store_description,
        role, category, location_state,
        whatsapp_number, bank_name, account_number, account_name,
        store_timezone, accepting_orders,
        subscription_tier, subscription_status,
        subscription_expires_at
      ) VALUES (
        ${VENDOR_ID},
        'Test Business Store',
        'test-business@vendle.test',
        '$2a$10$dummyhashedpasswordfordevelopmenttesting',
        ${SLUG},
        'Test Business Store',
        'A test store with Business tier subscription for verifying branding removal.',
        'vendor',
        'fashion',
        'Lagos',
        '+2348012345678',
        'Test Bank',
        '0123456789',
        'Test Business',
        'Africa/Lagos',
        true,
        'business',
        'active',
        NOW() + INTERVAL '30 days'
      )
      ON CONFLICT (id) DO UPDATE SET
        subscription_tier = 'business',
        subscription_status = 'active',
        subscription_expires_at = NOW() + INTERVAL '30 days'
    `;
    console.log('✅ Test user created/updated\n');

    // 2. Insert a default store theme
    console.log('🎨 Creating store theme...');
    await sql`
      INSERT INTO store_theme (
        vendor_id,
        template_id,
        primary_color, secondary_color, background_color, text_color, accent_color,
        surface_color, heading_color, border_color,
        font_family, heading_font, font_size,
        layout_style, card_style, border_radius, card_shadow,
        button_style, button_radius, animation_style,
        show_logo, logo_url, logo_position, logo_frame, header_style,
        show_product_images, image_aspect_ratio, show_product_description,
        spacing, layout_width,
        icon_library, icon_fill, icon_weight,
        cart_icon, user_icon, share_icon, add_icon,
        sections, section_content
      ) VALUES (
        ${VENDOR_ID},
        'elite-reserve',
        '#e2e8f0', '#0f172a', '#020617', '#cbd5e1', '#94a3b8',
        '#0f172a', '#f8fafc', '#1e293b',
        'outfit', 'playfair', 'medium',
        'masonry', 'minimal', 'sharp', 'none',
        'glass', 'sharp', 'fade',
        true, NULL, 'center', 'none', 'transparent',
        true, 'portrait', true,
        'spacious', 'wide',
        'lucide', 'outline', 'light',
        'shopping-bag', 'user', 'paper-plane', 'plus',
        '[{"id":"hero-banner","enabled":true,"order":0},{"id":"product-grid","enabled":true,"order":1},{"id":"trust-badges","enabled":true,"order":2},{"id":"contact-cta","enabled":true,"order":3}]',
        '{"hero-banner":{"title":"The Pinnacle of Luxury","subtitle":"Exclusively curated for those who demand the extraordinary.","cta_text":"Discover","cta_link":"#item-list","text_align":"center"}}'
      )
      ON CONFLICT (vendor_id) DO UPDATE SET
        template_id = 'elite-reserve',
        primary_color = '#e2e8f0',
        secondary_color = '#0f172a',
        background_color = '#020617'
    `;
    console.log('✅ Store theme created/updated\n');

    // 3. Insert sample products
    console.log('📦 Creating sample products...');
    const products = [
      { name: 'Premium Leather Bag', description: 'Handcrafted genuine leather bag with gold-plated hardware.', price: 85000, category: 'Accessories' },
      { name: 'Designer Sunglasses', description: 'Crystal frame sunglasses with UV400 protection.', price: 35000, category: 'Accessories' },
      { name: 'Silk Scarf', description: 'Italian silk scarf with hand-rolled edges.', price: 25000, category: 'Accessories' },
    ];

    for (const product of products) {
      await sql`
        INSERT INTO products (vendor_id, name, description, price, status, category)
        VALUES (${VENDOR_ID}, ${product.name}, ${product.description}, ${product.price}, 'active', ${product.category})
        ON CONFLICT DO NOTHING
      `;
    }
    console.log('✅ 3 sample products created\n');

    console.log('🎉 Test vendor created successfully!');
    console.log(`\n🔗 Store URL: http://localhost:3000/s/${SLUG}`);
    console.log(`\nThe storefront should have hideVendleBranding=true (no "Powered by Vendle" in footer).\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating test vendor:', err);
    process.exit(1);
  }
}

createTestVendor();
