/**
 * Migration script to add scheduled tier change columns to users table.
 * Run this script once to add the new columns for scheduled downgrades.
 * 
 * Usage: node scripts/add-scheduled-tier-columns.js
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

async function addScheduledTierColumns() {
  try {
    console.log('Adding scheduled tier change columns to users table...\n');

    // Add scheduled_tier_change column
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS scheduled_tier_change VARCHAR(20)
    `;
    console.log('✓ Added scheduled_tier_change column');

    // Add scheduled_tier_change_at column
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS scheduled_tier_change_at TIMESTAMPTZ
    `;
    console.log('✓ Added scheduled_tier_change_at column');

    console.log('\n✅ Migration completed successfully!');
    console.log('The scheduled tier change feature is now ready to use.');
    
    await sql.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    throw error;
  }
}

// Run the migration
addScheduledTierColumns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
