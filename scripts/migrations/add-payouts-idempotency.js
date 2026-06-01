/**
 * Migration: Add idempotency support to payouts table
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

async function addIdempotencyColumn() {
  try {
    console.log("Adding idempotency_key column to payouts table...");

    await sql`ALTER TABLE payouts ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payouts_idempotency ON payouts(idempotency_key)`;

    console.log("✅ idempotency_key column added");
    return true;
  } catch (error) {
    console.error("❌ Error adding idempotency column:", error);
    throw error;
  }
}

if (require.main === module) {
  addIdempotencyColumn()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { addIdempotencyColumn };
