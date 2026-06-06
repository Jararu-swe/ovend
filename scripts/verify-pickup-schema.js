/**
 * Verification script for pickup location schema
 * 
 * Checks if pickup location columns exist in users and orders tables
 * 
 * Run with: node scripts/verify-pickup-schema.js
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

async function verifyPickupSchema() {
  console.log('🔍 Verifying pickup location schema...\n');

  try {
    // Check users table columns
    console.log('📋 Checking users table...');
    const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name IN ('pickup_latitude', 'pickup_longitude', 'pickup_address_details', 'offers_pickup')
      ORDER BY column_name
    `;
    
    if (usersColumns.length === 0) {
      console.log('❌ No pickup location columns found in users table\n');
    } else {
      console.log('✅ Users table columns:');
      usersColumns.forEach((col) => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
      });
      console.log();
    }

    // Check orders table columns
    console.log('📋 Checking orders table...');
    const ordersColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders' 
      AND column_name IN ('vendor_pickup_latitude', 'vendor_pickup_longitude', 'vendor_pickup_address_details')
      ORDER BY column_name
    `;
    
    if (ordersColumns.length === 0) {
      console.log('❌ No vendor pickup location columns found in orders table\n');
    } else {
      console.log('✅ Orders table columns:');
      ordersColumns.forEach((col) => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      console.log();
    }

    // Check indexes
    console.log('📋 Checking indexes...');
    const indexes = await sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE tablename IN ('users', 'orders') 
      AND indexname IN ('idx_users_offers_pickup', 'idx_orders_delivery_type_pickup')
      ORDER BY indexname
    `;
    
    if (indexes.length === 0) {
      console.log('❌ No pickup-related indexes found\n');
    } else {
      console.log('✅ Indexes:');
      indexes.forEach((idx) => {
        console.log(`   - ${idx.indexname} on ${idx.tablename}`);
      });
      console.log();
    }

    // Summary
    const usersComplete = usersColumns.length === 4;
    const ordersComplete = ordersColumns.length === 3;
    const indexesComplete = indexes.length === 2;
    
    if (usersComplete && ordersComplete && indexesComplete) {
      console.log('✅ Schema verification passed! All pickup location components are in place.');
    } else {
      console.log('⚠️  Schema verification incomplete:');
      console.log(`   Users columns: ${usersColumns.length}/4`);
      console.log(`   Orders columns: ${ordersColumns.length}/3`);
      console.log(`   Indexes: ${indexes.length}/2`);
      console.log('\n   Run the migration script to complete setup.');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  }
}

// Execute verification
if (require.main === module) {
  verifyPickupSchema()
    .then(() => {
      console.log('\n🎉 Verification completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyPickupSchema };
