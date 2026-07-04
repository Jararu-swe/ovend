// test-payout-setup.js
// Run this with: npm run test:payout

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

async function setupTestPayoutData() {
  console.log('🔧 Setting up test payout data...');

  // Load .env file manually
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key.trim() && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });

  // Initialize database connection (use non-pooling URL for one-off scripts)
  const sql = postgres(envVars.POSTGRES_URL_NON_POOLING, { ssl: 'require' });

  try {
    // First, let's get the first vendor from the database
    let vendors = await sql`
      SELECT id, name FROM users WHERE role = 'vendor' LIMIT 1
    `;

    if (vendors.length === 0) {
      console.log('⚠️ No vendor accounts found! Please sign up as a vendor first.');
      process.exit(1);
    }

    const vendor = vendors[0];
    console.log('✅ Using vendor:', vendor.name, 'ID:', vendor.id);

    // 1. Add a test product (if vendor doesn't have one)
    await sql`
      INSERT INTO products (vendor_id, name, description, price, status)
      VALUES (
        ${vendor.id},
        'Test Product',
        'A product for testing payouts',
        10000, -- ₦10,000
        'active'
      )
      ON CONFLICT DO NOTHING;
    `;

    // 2. Add a test fulfilled order
    const testOrder = await sql`
      INSERT INTO orders (
        vendor_id,
        customer_name,
        customer_phone,
        total_amount,
        status,
        delivery_type,
        items,
        transaction_fee_kobo,
        created_at
      )
      VALUES (
        ${vendor.id},
        'Test Customer',
        '08012345678',
        10000, -- ₦10,000
        'fulfilled',
        'pickup',
        '[{"name": "Test Product", "quantity": 1, "price": 10000}]'::jsonb,
        500, -- 5% transaction fee in kobo (₦50)
        CURRENT_TIMESTAMP - INTERVAL '1 day'
      )
      RETURNING id;
    `;

    console.log('✅ Test order added with ID:', testOrder[0].id);
    console.log('🎉 Test data setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Log in as vendor:', vendor.name);
    console.log('2. Go to /dashboard/billing');
    console.log('3. Verify Available Balance shows ~₦9,500');
    console.log('4. Request a payout of ₦8,000!');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

setupTestPayoutData();
