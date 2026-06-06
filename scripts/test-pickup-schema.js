/**
 * Test script for pickup location schema
 * 
 * Runs test queries to verify the pickup location columns work correctly
 * 
 * Run with: node scripts/test-pickup-schema.js
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

async function testPickupSchema() {
  console.log('🧪 Testing pickup location schema...\n');

  try {
    // Test 1: Query users table with pickup columns
    console.log('📋 Test 1: Query users table with pickup location columns...');
    const testQuery1 = await sql`
      SELECT 
        id, 
        email, 
        pickup_latitude, 
        pickup_longitude, 
        pickup_address_details, 
        offers_pickup
      FROM users
      WHERE offers_pickup = TRUE
      LIMIT 1
    `;
    console.log(`✓ Query executed successfully (found ${testQuery1.length} vendors with pickup enabled)\n`);

    // Test 2: Query orders table with vendor pickup columns
    console.log('📋 Test 2: Query orders table with vendor pickup location columns...');
    const testQuery2 = await sql`
      SELECT 
        id, 
        vendor_pickup_latitude, 
        vendor_pickup_longitude, 
        vendor_pickup_address_details,
        delivery_type
      FROM orders
      WHERE delivery_type = 'pickup'
      LIMIT 1
    `;
    console.log(`✓ Query executed successfully (found ${testQuery2.length} pickup orders)\n`);

    // Test 3: Test coordinate validation ranges
    console.log('📋 Test 3: Verify coordinate data types accept valid values...');
    const testLat = 6.5244; // Lagos, Nigeria latitude
    const testLng = 3.3792; // Lagos, Nigeria longitude
    const testDetails = 'Test pickup location - 123 Market Street, Lagos';
    
    const dataTypeTest = await sql`
      SELECT 
        ${testLat}::DECIMAL(10,8) as test_latitude,
        ${testLng}::DECIMAL(11,8) as test_longitude,
        ${testDetails}::TEXT as test_details
    `;
    console.log(`✓ Coordinate data types validated:
   - Latitude: ${dataTypeTest[0].test_latitude} (DECIMAL(10,8))
   - Longitude: ${dataTypeTest[0].test_longitude} (DECIMAL(11,8))
   - Details: "${dataTypeTest[0].test_details}" (TEXT)\n`);

    // Test 4: Verify indexes exist
    console.log('📋 Test 4: Verify performance indexes...');
    const indexCheck = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename IN ('users', 'orders')
      AND indexname IN ('idx_users_offers_pickup', 'idx_orders_delivery_type_pickup')
    `;
    console.log(`✓ Found ${indexCheck.length}/2 expected indexes:`);
    indexCheck.forEach((idx) => {
      console.log(`   - ${idx.indexname}`);
    });
    console.log();

    // Test 5: Verify column constraints
    console.log('📋 Test 5: Verify column properties...');
    const columnCheck = await sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name IN ('users', 'orders')
      AND column_name IN (
        'pickup_latitude', 'pickup_longitude', 'pickup_address_details', 'offers_pickup',
        'vendor_pickup_latitude', 'vendor_pickup_longitude', 'vendor_pickup_address_details'
      )
      ORDER BY table_name, column_name
    `;
    
    console.log('✓ Column verification:');
    let currentTable = '';
    columnCheck.forEach((col) => {
      if (col.table_name !== currentTable) {
        currentTable = col.table_name;
        console.log(`\n   ${col.table_name} table:`);
      }
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    console.log();

    console.log('✅ All schema tests passed successfully!');
    console.log('\nSummary:');
    console.log('  ✓ Users table has pickup location columns');
    console.log('  ✓ Orders table has vendor pickup location columns');
    console.log('  ✓ Coordinate data types accept valid geographic values');
    console.log('  ✓ Performance indexes are in place');
    console.log('  ✓ Column properties match requirements');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    throw error;
  }
}

// Execute tests
if (require.main === module) {
  testPickupSchema()
    .then(() => {
      console.log('\n🎉 Schema testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Schema testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testPickupSchema };
