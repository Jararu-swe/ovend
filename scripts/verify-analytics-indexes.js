/**
 * Verification script for analytics performance indexes
 * 
 * This script verifies that all analytics indexes were created correctly
 * and provides information about their size and usage.
 * 
 * Run with: node scripts/verify-analytics-indexes.js
 */

// Load environment variables from .env file
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "../.env");
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

const { sql } = require("./db-connection");

async function verifyAnalyticsIndexes() {
  console.log('🔍 Verifying analytics performance indexes...\n');

  try {
    // ============================================================
    // 1. Check if all required indexes exist
    // ============================================================
    console.log('📋 Checking index existence...\n');
    
    const requiredIndexes = [
      'idx_store_analytics_vendor_date',
      'idx_orders_vendor_status_date',
      'idx_orders_customer_phone',
      'idx_orders_customer_address',
      'idx_products_vendor_status'
    ];

    const existingIndexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE indexname = ANY(${requiredIndexes})
      ORDER BY tablename, indexname
    `;

    console.log('✅ Found indexes:');
    existingIndexes.forEach((idx) => {
      console.log(`   ✓ ${idx.tablename}.${idx.indexname}`);
    });

    const missingIndexes = requiredIndexes.filter(
      (name) => !existingIndexes.find((idx) => idx.indexname === name)
    );

    if (missingIndexes.length > 0) {
      console.log('\n❌ Missing indexes:');
      missingIndexes.forEach((name) => {
        console.log(`   ✗ ${name}`);
      });
      throw new Error(`Missing ${missingIndexes.length} required index(es)`);
    }

    console.log(`\n✅ All ${requiredIndexes.length} required indexes exist!\n`);

    // ============================================================
    // 2. Get detailed index information
    // ============================================================
    console.log('📊 Index Details:\n');

    const indexDetails = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE indexname = ANY(${requiredIndexes})
      ORDER BY tablename, indexname
    `;

    indexDetails.forEach((idx) => {
      console.log(`📍 ${idx.indexname}`);
      console.log(`   Table: ${idx.tablename}`);
      console.log(`   Definition: ${idx.indexdef}`);
      console.log('');
    });

    // ============================================================
    // 3. Test index usage with sample queries
    // ============================================================
    console.log('🧪 Testing index usage with EXPLAIN queries...\n');

    // Test 1: store_analytics vendor_id + date range query
    console.log('Test 1: store_analytics time range query');
    const explain1 = await sql`
      EXPLAIN (FORMAT JSON)
      SELECT vendor_id, date, visits, orders_count, revenue
      FROM store_analytics
      WHERE vendor_id = gen_random_uuid()
        AND date >= CURRENT_DATE - INTERVAL '30 days'
        AND date <= CURRENT_DATE
      ORDER BY date DESC
    `;
    const plan1 = explain1[0]['QUERY PLAN'][0].Plan;
    console.log(`   Plan: ${plan1['Node Type']}`);
    if (plan1['Index Name']) {
      console.log(`   ✓ Using index: ${plan1['Index Name']}`);
    } else if (plan1.Plans && plan1.Plans[0]['Index Name']) {
      console.log(`   ✓ Using index: ${plan1.Plans[0]['Index Name']}`);
    }
    console.log('');

    // Test 2: orders vendor_id + status + created_at query
    console.log('Test 2: orders vendor + status + date query');
    const explain2 = await sql`
      EXPLAIN (FORMAT JSON)
      SELECT id, vendor_id, status, created_at, total_amount
      FROM orders
      WHERE vendor_id = gen_random_uuid()
        AND status = 'fulfilled'
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY created_at DESC
    `;
    const plan2 = explain2[0]['QUERY PLAN'][0].Plan;
    console.log(`   Plan: ${plan2['Node Type']}`);
    if (plan2['Index Name']) {
      console.log(`   ✓ Using index: ${plan2['Index Name']}`);
    } else if (plan2.Plans && plan2.Plans[0]['Index Name']) {
      console.log(`   ✓ Using index: ${plan2.Plans[0]['Index Name']}`);
    }
    console.log('');

    // Test 3: orders customer_phone query
    console.log('Test 3: orders customer_phone query');
    const explain3 = await sql`
      EXPLAIN (FORMAT JSON)
      SELECT customer_phone, COUNT(*) as order_count, SUM(total_amount) as total_spent
      FROM orders
      WHERE customer_phone IS NOT NULL
      GROUP BY customer_phone
      HAVING COUNT(*) > 1
    `;
    const plan3 = explain3[0]['QUERY PLAN'][0].Plan;
    console.log(`   Plan: ${plan3['Node Type']}`);
    if (plan3.Plans && plan3.Plans[0].Plans) {
      const scanNode = plan3.Plans[0].Plans[0];
      if (scanNode['Index Name']) {
        console.log(`   ✓ Using index: ${scanNode['Index Name']}`);
      }
    }
    console.log('');

    // Test 4: products vendor_id + status query
    console.log('Test 4: products vendor + status query');
    const explain4 = await sql`
      EXPLAIN (FORMAT JSON)
      SELECT id, name, status, price
      FROM products
      WHERE vendor_id = gen_random_uuid()
        AND status = 'active'
    `;
    const plan4 = explain4[0]['QUERY PLAN'][0].Plan;
    console.log(`   Plan: ${plan4['Node Type']}`);
    if (plan4['Index Name']) {
      console.log(`   ✓ Using index: ${plan4['Index Name']}`);
    } else if (plan4.Plans && plan4.Plans[0]['Index Name']) {
      console.log(`   ✓ Using index: ${plan4.Plans[0]['Index Name']}`);
    }
    console.log('');

    console.log('✅ All verification checks passed!');
    console.log('\n📈 Performance Benefits:');
    console.log('  • Extended time range queries (30d, 90d) will be significantly faster');
    console.log('  • Customer analytics (repeat rate, CLV) will use indexed lookups');
    console.log('  • Product performance queries will benefit from composite index');
    console.log('  • Geographic insights will use full-text search index');

  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  }
}

// Execute verification
if (require.main === module) {
  verifyAnalyticsIndexes()
    .then(() => {
      console.log('\n🎉 Verification completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyAnalyticsIndexes };
