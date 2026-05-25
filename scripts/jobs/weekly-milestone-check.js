/**
 * Weekly cron: trigger milestone guides (7/30/90 day store anniversaries)
 * Run: POSTGRES_URL=... node scripts/jobs/weekly-milestone-check.js
 */

const {
  checkMilestonesAndTriggerGuides,
} = require("../lib/guide-triggers-core");

async function main() {
  console.log("🎯 Running milestone guide check...");
  const result = await checkMilestonesAndTriggerGuides();
  console.log("✅ Done.", result);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Milestone check failed:", err);
  process.exit(1);
});
