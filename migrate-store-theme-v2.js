/**
 * Migration: Add new columns to store_theme for the template + section system.
 *
 * Run with:  node migrate-store-theme-v2.js
 *
 * Safe to run multiple times (every ALTER uses IF NOT EXISTS).
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

async function migrate() {
  console.log('Connecting to database...');

  const statements = [
    // Template identifier
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'fresh-market'`,

    // Extra color tokens
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS surface_color VARCHAR(7) DEFAULT '#ffffff'`,
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS heading_color VARCHAR(7) DEFAULT '#0f172a'`,
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS border_color VARCHAR(7) DEFAULT '#e2e8f0'`,

    // Card shadow
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS card_shadow VARCHAR(20) DEFAULT 'soft'`,

    // Section management (JSONB)
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'`,
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS section_content JSONB DEFAULT '{}'`,

    // Logo layout (may already exist from earlier migration)
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS logo_position VARCHAR(20) DEFAULT 'left'`,
    `ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS logo_frame VARCHAR(20) DEFAULT 'profile'`,
  ];

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      // Extract column name for nice logging
      const col = stmt.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] || '?';
      console.log(`  ✓ ${col}`);
    } catch (err) {
      console.error(`  ✗ ${stmt.slice(0, 60)}...`, err.message);
    }
  }

  console.log('\nMigration complete ✓');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
