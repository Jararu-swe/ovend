/**
 * Migration: Add pickup location support
 * 
 * This migration adds pickup location fields to:
 * - users table (vendor's pickup location)
 * - orders table (vendor pickup location snapshot for historical reference)
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9
 * 
 * Run with: node scripts/migrations/add-pickup-location-schema.js
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

async function addPickupLocationSchema() {
  console.log('🚀 Starting pickup location schema migration...\n');

  try {
    // ============================================================
    // 1. Add pickup location columns to users table
    // ============================================================
    console.log('📋 Adding pickup location columns to users table...');
    
    await sql.unsafe(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10, 8) NULL
    `);
    console.log('✓ pickup_latitude column added');

    await sql.unsafe(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11, 8) NULL
    `);
    console.log('✓ pickup_longitude column added');

    await sql.unsafe(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS pickup_address_details TEXT NULL
    `);
    console.log('✓ pickup_address_details column added');

    await sql.unsafe(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS offers_pickup BOOLEAN DEFAULT FALSE
    `);
    console.log('✓ offers_pickup column added\n');

    // ============================================================
    // 2. Add vendor pickup location columns to orders table
    // ============================================================
    console.log('📋 Adding vendor pickup location columns to orders table...');
    
    await sql.unsafe(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS vendor_pickup_latitude DECIMAL(10, 8) NULL
    `);
    console.log('✓ vendor_pickup_latitude column added');

    await sql.unsafe(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS vendor_pickup_longitude DECIMAL(11, 8) NULL
    `);
    console.log('✓ vendor_pickup_longitude column added');

    await sql.unsafe(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS vendor_pickup_address_details TEXT NULL
    `);
    console.log('✓ vendor_pickup_address_details column added\n');

    // ============================================================
    // 3. Create indexes for performance optimization
    // ============================================================
    console.log('📋 Creating performance indexes...');
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_offers_pickup 
      ON users(offers_pickup) 
      WHERE offers_pickup = TRUE
    `);
    console.log('✓ Index on users(offers_pickup) created');

    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_orders_delivery_type_pickup 
      ON orders(delivery_type) 
      WHERE delivery_type = 'pickup'
    `);
    console.log('✓ Index on orders(delivery_type) created\n');

    // ============================================================
    // 4. Verify schema changes
    // ============================================================
    console.log('📋 Verifying schema changes...\n');
    
    // Check users table columns
    const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name IN ('pickup_latitude', 'pickup_longitude', 'pickup_address_details', 'offers_pickup')
      ORDER BY column_name
    `;
    
    console.log('✅ Users table columns:');
    usersColumns.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
    });

    // Check orders table columns
    const ordersColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders' 
      AND column_name IN ('vendor_pickup_latitude', 'vendor_pickup_longitude', 'vendor_pickup_address_details')
      ORDER BY column_name
    `;
    
    console.log('\n✅ Orders table columns:');
    ordersColumns.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check indexes
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename IN ('users', 'orders') 
      AND indexname IN ('idx_users_offers_pickup', 'idx_orders_delivery_type_pickup')
      ORDER BY indexname
    `;
    
    console.log('\n✅ Indexes created:');
    indexes.forEach((idx) => {
      console.log(`   - ${idx.indexname}`);
    });

    console.log('\n✅ Schema migration completed successfully!');
    console.log('\nAdded to users table:');
    console.log('  ✓ pickup_latitude (DECIMAL(10,8))');
    console.log('  ✓ pickup_longitude (DECIMAL(11,8))');
    console.log('  ✓ pickup_address_details (TEXT)');
    console.log('  ✓ offers_pickup (BOOLEAN, default FALSE)');
    console.log('\nAdded to orders table:');
    console.log('  ✓ vendor_pickup_latitude (DECIMAL(10,8))');
    console.log('  ✓ vendor_pickup_longitude (DECIMAL(11,8))');
    console.log('  ✓ vendor_pickup_address_details (TEXT)');
    console.log('\nCreated indexes:');
    console.log('  ✓ idx_users_offers_pickup');
    console.log('  ✓ idx_orders_delivery_type_pickup');

  } catch (error) {
    console.error('❌ Error during schema migration:', error);
    throw error;
  }
}

// Execute the migration
if (require.main === module) {
  addPickupLocationSchema()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addPickupLocationSchema };
