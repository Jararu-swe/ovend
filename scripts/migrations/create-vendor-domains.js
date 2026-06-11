/**
 * Migration: Create vendor_domains table
 * 
 * This migration creates the vendor_domains table for managing custom domain
 * connections for Business tier vendors. Each vendor can have one custom domain.
 * 
 * Run with: node scripts/migrations/create-vendor-domains.js
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

async function createVendorDomainsTable() {
  console.log('🚀 Starting vendor_domains table migration...\n');

  try {
    // ============================================================
    // 1. Create vendor_domains table
    // ============================================================
    console.log('📋 Creating vendor_domains table...');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS vendor_domains (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        domain VARCHAR(255) NOT NULL UNIQUE,
        verification_method VARCHAR(20) NOT NULL DEFAULT 'cname',
        verification_token VARCHAR(255) NOT NULL,
        vercel_domain_id VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        ssl_status VARCHAR(20) DEFAULT 'pending',
        is_primary BOOLEAN DEFAULT false,
        verified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ vendor_domains table created');

    // ============================================================
    // 2. Create indexes for performance
    // ============================================================
    console.log('📋 Creating performance indexes...');

    await sql.unsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_domains_domain
      ON vendor_domains(domain)
    `);
    console.log('✓ Unique index on vendor_domains(domain) created');

    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_vendor_domains_vendor
      ON vendor_domains(vendor_id)
    `);
    console.log('✓ Index on vendor_domains(vendor_id) created');

    await sql.unsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_domains_vendor_active
      ON vendor_domains(vendor_id) WHERE status != 'removed'
    `);
    console.log('✓ Partial unique index on active vendor domains created');

    // ============================================================
    // 3. Add custom_domain column to users table (for quick lookups)
    // ============================================================
    console.log('📋 Adding custom_domain column to users table...');

    await sql.unsafe(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) DEFAULT NULL
    `);
    console.log('✓ custom_domain column added to users table');

    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_custom_domain
      ON users(custom_domain)
      WHERE custom_domain IS NOT NULL
    `);
    console.log('✓ Index on users(custom_domain) created');

    // ============================================================
    // 4. Verify schema changes
    // ============================================================
    console.log('\n📋 Verifying schema changes...');

    // Check vendor_domains table columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'vendor_domains'
      ORDER BY ordinal_position
    `;

    console.log('\n✅ vendor_domains table columns:');
    columns.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
    });

    // Check indexes
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename IN ('vendor_domains', 'users')
      AND indexname IN ('idx_vendor_domains_domain', 'idx_vendor_domains_vendor', 'idx_vendor_domains_vendor_active', 'idx_users_custom_domain')
      ORDER BY indexname
    `;

    console.log('\n✅ Indexes created:');
    indexes.forEach((idx) => {
      console.log(`   - ${idx.indexname}`);
    });

    console.log('\n✅ Schema migration completed successfully!');
    console.log('\nCreated:');
    console.log('  ✓ vendor_domains table');
    console.log('  ✓ idx_vendor_domains_domain (UNIQUE)');
    console.log('  ✓ idx_vendor_domains_vendor');
    console.log('  ✓ idx_vendor_domains_vendor_active (partial, status != removed)');
    console.log('  ✓ custom_domain column on users table');
    console.log('  ✓ idx_users_custom_domain (partial)');

  } catch (error) {
    console.error('❌ Error during schema migration:', error);
    throw error;
  }
}

// Execute the migration
if (require.main === module) {
  createVendorDomainsTable()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createVendorDomainsTable };
