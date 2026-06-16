/**
 * Migration: Add analytics performance indexes
 * 
 * This migration creates database indexes to optimize analytics queries for:
 * - store_analytics table (vendor_id, date)
 * - orders table (vendor_id, status, created_at), (customer_phone), (customer_address)
 * - products table (vendor_id, status)
 * 
 * Requirements: 12.3, 12.4
 * 
 * Run with: node scripts/migrations/add-analytics-performance-indexes.js
 */

// Load environment variables from .env file
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    if (line.trim() && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      process.env[key.trim()] = value;
    }
  });
}

const { sql } = require("../db-connection");

async function addAnalyticsPerformanceIndexes() {
  console.log('🚀 Starting analytics performance indexes migration...\n');

  try {
    // ============================================================
    // 1. Create index on store_analytics (vendor_id, date)
    // ============================================================
    console.log('📋 Creating index on store_analytics(vendor_id, date)...');
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_store_analytics_vendor_date 
      ON store_analytics(vendor_id, date DESC)
    `);
    console.log('✓ Index idx_store_analytics_vendor_date created\n');

    // ============================================================
    // 2. Create index on orders (vendor_id, status, created_at)
    // ============================================================
    console.log('📋 Creating index on orders(vendor_id, status, created_at)...');
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_orders_vendor_status_date 
      ON orders(vendor_id, status, created_at DESC)
    `);
    console.log('✓ Index idx_orders_vendor_status_date created\n');

    // ============================================================
    // 3. Create index on orders (customer_phone)
    // ============================================================
    console.log('📋 Creating index on orders(customer_phone)...');
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_orders_customer_phone 
      ON orders(customer_phone) 
      WHERE customer_phone IS NOT NULL
    `);
    console.log('✓ Index idx_orders_customer_phone created\n');

    // ============================================================
    // 4. Create index on orders (customer_address) using GIN
    // ============================================================
    console.log('📋 Creating GIN index on orders(customer_address)...');
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_orders_customer_address 
      ON orders USING gin(to_tsvector('english', customer_address)) 
      WHERE customer_address IS NOT NULL
    `);
    console.log('✓ Index idx_orders_customer_address created\n');

    // ============================================================
    // 5. Create index on products (vendor_id, status)
    // ============================================================
    console.log('📋 Creating index on products(vendor_id, status)...');
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_products_vendor_status 
      ON products(vendor_id, status) 
      WHERE status = 'active'
    `);
    console.log('✓ Index idx_products_vendor_status created\n');

    // ============================================================
    // 6. Verify indexes were created
    // ============================================================
    console.log('📋 Verifying indexes...\n');
    
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE indexname IN (
        'idx_store_analytics_vendor_date',
        'idx_orders_vendor_status_date',
        'idx_orders_customer_phone',
        'idx_orders_customer_address',
        'idx_products_vendor_status'
      )
      ORDER BY tablename, indexname
    `;
    
    console.log('✅ Indexes created:');
    indexes.forEach((idx) => {
      console.log(`   - ${idx.tablename}.${idx.indexname}`);
    });

    if (indexes.length === 5) {
      console.log('\n✅ All 5 indexes created successfully!');
    } else {
      console.log(`\n⚠️  Expected 5 indexes, found ${indexes.length}`);
    }

    console.log('\n✅ Analytics performance indexes migration completed!');
    console.log('\nCreated indexes:');
    console.log('  ✓ idx_store_analytics_vendor_date - Optimizes time range analytics queries');
    console.log('  ✓ idx_orders_vendor_status_date - Optimizes order filtering and sorting');
    console.log('  ✓ idx_orders_customer_phone - Optimizes customer analytics queries');
    console.log('  ✓ idx_orders_customer_address - Optimizes geographic insights queries');
    console.log('  ✓ idx_products_vendor_status - Optimizes product performance queries');

    console.log('\n📊 Performance Impact:');
    console.log('  • Time range analytics: Faster retrieval for 30d, 90d, custom ranges');
    console.log('  • Customer metrics: Faster repeat customer rate and CLV calculations');
    console.log('  • Product performance: Faster product deep-dive analytics');
    console.log('  • Geographic insights: Faster city/state breakdown queries');

  } catch (error) {
    console.error('❌ Error during index creation:', error);
    throw error;
  }
}

// Execute the migration
if (require.main === module) {
  addAnalyticsPerformanceIndexes()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addAnalyticsPerformanceIndexes };
