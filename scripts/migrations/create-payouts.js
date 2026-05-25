/**
 * Migration: Create payouts table
 *
 * Tracks all payout requests from vendors including:
 * - Payout amount requested
 * - Service fees
 * - Bank account details at time of request
 * - Status (pending, processing, completed, failed)
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

async function createPayoutsTable() {
  try {
    console.log("Creating payouts table...");

    await sql`
      CREATE TABLE IF NOT EXISTS payouts (
        id SERIAL PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        requested_amount DECIMAL(12, 2) NOT NULL,
        net_amount DECIMAL(12, 2) NOT NULL,
        service_fee DECIMAL(12, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        -- Status: pending, processing, completed, failed
        bank_name VARCHAR NOT NULL,
        account_number VARCHAR NOT NULL,
        account_name VARCHAR NOT NULL,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        failed_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ payouts table created");

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_payouts_vendor ON payouts(vendor_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payouts_requested_at ON payouts(requested_at)`;
    console.log("✅ Indexes created");

    console.log("\n✅ Payouts table created successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error creating payouts table:", error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  createPayoutsTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createPayoutsTable };
