/**
 * Migration: Add Paystack fields to payouts table
 */

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

async function updatePayoutsTable() {
  try {
    console.log("Updating payouts table with Paystack fields...");

    // Add columns if they don't exist
    await sql`
      ALTER TABLE payouts
      ADD COLUMN IF NOT EXISTS paystack_recipient_code VARCHAR,
      ADD COLUMN IF NOT EXISTS paystack_transfer_code VARCHAR
    `;

    console.log("✅ Paystack fields added");

    // Create index for transfer code lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_payouts_transfer_code
      ON payouts(paystack_transfer_code)
    `;

    console.log("✅ Index created for transfer code");
    console.log("\n✅ Payouts table updated successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error updating payouts table:", error);
    throw error;
  }
}

if (require.main === module) {
  updatePayoutsTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { updatePayoutsTable };
