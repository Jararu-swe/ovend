/**
 * Daily cron: trigger performance-based guides (low sales, etc.)
 * Run: POSTGRES_URL=... node scripts/jobs/daily-performance-check.js
 */

const {
  checkPerformanceAndTriggerGuides,
} = require("../lib/guide-triggers-core");

async function main() {
  console.log("🔍 Running daily performance guide check...");
  const result = await checkPerformanceAndTriggerGuides();
  console.log(`✅ Done. Low-sales vendors notified: ${result.lowSales}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Performance check failed:", err);
  process.exit(1);
});
