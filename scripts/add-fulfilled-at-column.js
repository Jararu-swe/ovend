/**
 * Database migration script to add fulfilled_at column to orders table
 * This enables precise time-to-fulfillment calculations for advanced analytics
 * 
 * Run with: node scripts/add-fulfilled-at-column.js
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

async function addFulfilledAtColumn() {
  console.log('🚀 Starting fulfilled_at column migration...\n');

  try {
    // ============================================================
    // 1. Add fulfilled_at column to orders table
    // ============================================================
    console.log('📋 Adding fulfilled_at column to orders table...');
    await sql.unsafe(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ DEFAULT NULL
    `);
    console.log('✓ fulfilled_at column added successfully\n');

    // ============================================================
    // 2. Backfill existing fulfilled orders
    // ============================================================
    console.log('📋 Backfilling fulfilled_at for existing fulfilled orders...');
    const result = await sql`
      UPDATE orders 
      SET fulfilled_at = created_at + INTERVAL '2 hours'
      WHERE status = 'fulfilled' AND fulfilled_at IS NULL
    `;
    console.log(`✓ Updated ${result.count} existing fulfilled orders with timestamp (created_at + 2 hours)\n`);

    // ============================================================
    // 3. Verify migration
    // ============================================================
    console.log('📋 Verifying migration...');
    const [stats] = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as fulfilled_orders,
        COUNT(CASE WHEN status = 'fulfilled' AND fulfilled_at IS NOT NULL THEN 1 END) as with_timestamp
      FROM orders
    `;
    
    console.log('\n✅ Migration Statistics:');
    console.log(`   - Total orders: ${stats.total_orders}`);
    console.log(`   - Fulfilled orders: ${stats.fulfilled_orders}`);
    console.log(`   - With fulfilled_at timestamp: ${stats.with_timestamp}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nChanges:');
    console.log('  ✓ Added fulfilled_at TIMESTAMPTZ column to orders table');
    console.log('  ✓ Backfilled existing fulfilled orders with created_at + 2 hours');
    console.log('  ✓ Server actions will now set fulfilled_at when orders are marked as fulfilled');

  } catch (error) {
    console.error('❌ Error adding fulfilled_at column:', error);
    throw error;
  }
}

// Execute the migration
addFulfilledAtColumn()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
