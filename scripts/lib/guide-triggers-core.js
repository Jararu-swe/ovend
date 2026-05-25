/**
 * Core guide trigger logic for Node scripts (migrations, seeds, cron jobs).
 * Mirrors app/lib/guide-triggers.ts without Next.js server action wrappers.
 */

const { sql } = require("../db-connection");

async function triggerGuideForEvent(vendorId, triggerType) {
  const vendor = await sql`
    SELECT id, category FROM users
    WHERE id = ${vendorId} AND role = 'vendor'
    LIMIT 1
  `;

  if (!vendor.length) return;

  const guides = await sql`
    SELECT * FROM vendor_guides
    WHERE trigger_type = ${triggerType}
    AND published_at IS NOT NULL
    AND (
      applies_to_categories IS NULL
      OR ${vendor[0].category} = ANY(applies_to_categories)
    )
  `;

  for (const guide of guides) {
    await sql`
      INSERT INTO guide_notifications (vendor_id, guide_id, trigger_event)
      VALUES (${vendorId}, ${guide.id}, ${triggerType})
      ON CONFLICT (vendor_id, guide_id) DO UPDATE
      SET dismissed = FALSE, dismissed_at = NULL
    `;
  }

  return guides.length;
}

async function checkPerformanceAndTriggerGuides() {
  const lowSalesVendors = await sql`
    SELECT u.id, COUNT(o.id) as order_count
    FROM users u
    LEFT JOIN orders o ON u.id = o.vendor_id
      AND o.created_at > NOW() - INTERVAL '30 days'
    WHERE u.role = 'vendor'
      AND u.status = 'active'
      AND u.created_at < NOW() - INTERVAL '7 days'
    GROUP BY u.id
    HAVING COUNT(o.id) < 5
  `;

  for (const vendor of lowSalesVendors) {
    await triggerGuideForEvent(vendor.id, "performance-low-sales");
  }

  return { lowSales: lowSalesVendors.length };
}

async function checkMilestonesAndTriggerGuides() {
  const sevenDay = await sql`
    SELECT id FROM users
    WHERE role = 'vendor' AND status = 'active'
      AND created_at < NOW() - INTERVAL '7 days'
      AND created_at > NOW() - INTERVAL '8 days'
  `;
  const thirtyDay = await sql`
    SELECT id FROM users
    WHERE role = 'vendor' AND status = 'active'
      AND created_at < NOW() - INTERVAL '30 days'
      AND created_at > NOW() - INTERVAL '31 days'
  `;
  const ninetyDay = await sql`
    SELECT id FROM users
    WHERE role = 'vendor' AND status = 'active'
      AND created_at < NOW() - INTERVAL '90 days'
      AND created_at > NOW() - INTERVAL '91 days'
  `;

  for (const v of sevenDay) await triggerGuideForEvent(v.id, "milestone-7days");
  for (const v of thirtyDay) await triggerGuideForEvent(v.id, "milestone-30days");
  for (const v of ninetyDay) await triggerGuideForEvent(v.id, "milestone-90days");

  return {
    sevenDay: sevenDay.length,
    thirtyDay: thirtyDay.length,
    ninetyDay: ninetyDay.length,
  };
}

module.exports = {
  triggerGuideForEvent,
  checkPerformanceAndTriggerGuides,
  checkMilestonesAndTriggerGuides,
};
