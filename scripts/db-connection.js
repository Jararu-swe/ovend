/**
 * Shared Postgres connection for migration/seed/job scripts.
 * Requires POSTGRES_URL in environment (same as the Next.js app).
 */

const postgres = require("postgres");

if (!process.env.POSTGRES_URL) {
  console.error("❌ POSTGRES_URL environment variable is required");
  process.exit(1);
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

module.exports = { sql };
