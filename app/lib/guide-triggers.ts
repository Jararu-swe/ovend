"use server";

import { sql } from "./db";

/**
 * Guide Trigger System
 *
 * Automatically creates guide notifications based on vendor events and metrics.
 * This is the automation engine - NO MANUAL WORK NEEDED!
 */

/**
 * Trigger a guide for a vendor based on an event
 */
export async function triggerGuideForEvent(
  vendorId: string,
  triggerType: string,
  context?: Record<string, any>,
) {
  try {
    // Get vendor data
    const vendor = await sql`
      SELECT id, category, created_at, store_name FROM users 
      WHERE id = ${vendorId} AND role = 'vendor'
      LIMIT 1
    `;

    if (!vendor || vendor.length === 0) {
      console.log(`Vendor ${vendorId} not found`);
      return;
    }

    const vendorData = vendor[0];

    // Find all guides matching this trigger
    const guides = await sql`
      SELECT * FROM vendor_guides 
      WHERE trigger_type = ${triggerType}
      AND published_at IS NOT NULL
      AND (
        applies_to_categories IS NULL 
        OR ${vendorData.category} = ANY(applies_to_categories)
      )
    `;

    if (!guides || guides.length === 0) {
      console.log(`No guides found for trigger: ${triggerType}`);
      return;
    }

    // Create notifications for matching guides
    for (const guide of guides) {
      await notifyVendorAboutGuide(vendorId, guide.id, triggerType);
    }

    console.log(
      `✅ Triggered ${guides.length} guide(s) for vendor ${vendorId} on event ${triggerType}`,
    );
  } catch (error) {
    console.error(`Error triggering guides for ${vendorId}:`, error);
  }
}

/**
 * Create a notification for a vendor about a guide
 */
export async function notifyVendorAboutGuide(
  vendorId: string,
  guideId: number,
  triggerEvent: string,
) {
  try {
    await sql`
      INSERT INTO guide_notifications (vendor_id, guide_id, trigger_event)
      VALUES (${vendorId}, ${guideId}, ${triggerEvent})
      ON CONFLICT (vendor_id, guide_id) DO UPDATE
      SET dismissed = FALSE, dismissed_at = NULL
    `;
  } catch (error) {
    console.error(
      `Error notifying vendor ${vendorId} about guide ${guideId}:`,
      error,
    );
  }
}

/**
 * Mark a guide as viewed by a vendor
 */
export async function markGuideViewed(vendorId: string, guideId: number) {
  try {
    await sql`
      INSERT INTO guide_views (vendor_id, guide_id, viewed_at)
      VALUES (${vendorId}, ${guideId}, CURRENT_TIMESTAMP)
      ON CONFLICT (vendor_id, guide_id) DO UPDATE
      SET viewed_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error(`Error marking guide ${guideId} as viewed:`, error);
  }
}

/**
 * Mark a guide as completed by a vendor
 */
export async function markGuideCompleted(vendorId: string, guideId: number) {
  try {
    await sql`
      INSERT INTO guide_views (vendor_id, guide_id, viewed_at, completed)
      VALUES (${vendorId}, ${guideId}, CURRENT_TIMESTAMP, TRUE)
      ON CONFLICT (vendor_id, guide_id) DO UPDATE
      SET completed = TRUE, viewed_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error(`Error marking guide ${guideId} as completed:`, error);
  }
}

/**
 * Count undismissed guide notifications for nav badge
 */
export async function getNewGuideNotificationsCount(
  vendorId: string,
): Promise<number> {
  try {
    const result = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count
      FROM guide_notifications gn
      JOIN vendor_guides g ON gn.guide_id = g.id
      WHERE gn.vendor_id = ${vendorId}
        AND gn.dismissed = FALSE
        AND g.published_at IS NOT NULL
    `;
    return Number(result[0]?.count || 0);
  } catch (error) {
    console.error(`Error counting guide notifications:`, error);
    return 0;
  }
}

/**
 * Fetch contextual guides for a dashboard page (products, orders, etc.)
 */
export async function fetchContextualGuides(
  vendorId: string,
  contextTrigger: string,
  limit = 1,
) {
  try {
    const vendor = await sql`
      SELECT category FROM users WHERE id = ${vendorId} LIMIT 1
    `;
    const category = vendor[0]?.category;

    const guides = await sql`
      SELECT * FROM vendor_guides
      WHERE trigger_type = ${contextTrigger}
      AND published_at IS NOT NULL
      AND (
        applies_to_categories IS NULL
        OR ${category} = ANY(applies_to_categories)
      )
      ORDER BY featured DESC, published_at DESC
      LIMIT ${limit}
    `;
    return guides || [];
  } catch (error) {
    console.error(`Error fetching contextual guides:`, error);
    return [];
  }
}

/**
 * Dismiss a guide notification for a vendor
 */
export async function dismissGuideNotification(
  vendorId: string,
  guideId: number,
) {
  try {
    await sql`
      UPDATE guide_notifications 
      SET dismissed = TRUE, dismissed_at = CURRENT_TIMESTAMP
      WHERE vendor_id = ${vendorId} AND guide_id = ${guideId}
    `;
  } catch (error) {
    console.error(`Error dismissing notification:`, error);
  }
}

/**
 * Get new guide notifications for a vendor
 */
export async function getVendorNewGuideNotifications(vendorId: string) {
  try {
    const notifications = await sql`
      SELECT g.*, gn.notified_at, gn.trigger_event
      FROM guide_notifications gn
      JOIN vendor_guides g ON gn.guide_id = g.id
      WHERE gn.vendor_id = ${vendorId}
      AND gn.dismissed = FALSE
      AND g.published_at IS NOT NULL
      ORDER BY gn.notified_at DESC
    `;

    return notifications || [];
  } catch (error) {
    console.error(`Error fetching guide notifications for ${vendorId}:`, error);
    return [];
  }
}

/**
 * Check store performance and trigger performance-based guides
 * This runs via scheduled job
 */
export async function checkPerformanceAndTriggerGuides() {
  try {
    console.log("🔍 Checking store performance metrics...");

    // 1. Find vendors with low sales (< 5 orders in last 30 days)
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

    for (const vendor of lowSalesVendors || []) {
      await triggerGuideForEvent(vendor.id, "performance-low-sales", {
        orderCount: vendor.order_count,
      });
    }

    console.log(
      `📊 Triggered low-sales guides for ${(lowSalesVendors || []).length} vendors`,
    );

    // 2. Find vendors with high cart abandonment (placeholder - real implementation would calculate actual rate)
    // This is a simplified version - in production, you'd calculate real abandonment rate
    const potentialAbandonmentVendors = await sql`
      SELECT u.id
      FROM users u
      WHERE u.role = 'vendor'
        AND u.status = 'active'
        AND u.created_at < NOW() - INTERVAL '14 days'
      LIMIT 10
    `;

    for (const vendor of potentialAbandonmentVendors || []) {
      await triggerGuideForEvent(vendor.id, "performance-high-abandonment");
    }

    console.log(`✅ Performance-based guide checks complete`);
  } catch (error) {
    console.error("Error checking performance metrics:", error);
  }
}

/**
 * Check for store milestones and trigger milestone guides
 * This runs via scheduled job
 */
export async function checkMilestonesAndTriggerGuides() {
  try {
    console.log("🎯 Checking store milestones...");

    // 1. Find vendors that just hit 7-day milestone
    const sevenDayOldVendors = await sql`
      SELECT id FROM users
      WHERE role = 'vendor'
        AND status = 'active'
        AND created_at < NOW() - INTERVAL '7 days'
        AND created_at > NOW() - INTERVAL '8 days'
    `;

    for (const vendor of sevenDayOldVendors || []) {
      await triggerGuideForEvent(vendor.id, "milestone-7days");
    }

    console.log(
      `🎉 Triggered 7-day milestone guides for ${(sevenDayOldVendors || []).length} vendors`,
    );

    // 2. Find vendors that just hit 30-day milestone
    const thirtyDayOldVendors = await sql`
      SELECT id FROM users
      WHERE role = 'vendor'
        AND status = 'active'
        AND created_at < NOW() - INTERVAL '30 days'
        AND created_at > NOW() - INTERVAL '31 days'
    `;

    for (const vendor of thirtyDayOldVendors || []) {
      await triggerGuideForEvent(vendor.id, "milestone-30days");
    }

    console.log(
      `🎉 Triggered 30-day milestone guides for ${(thirtyDayOldVendors || []).length} vendors`,
    );

    // 3. Find vendors that just hit 90-day milestone
    const ninetyDayOldVendors = await sql`
      SELECT id FROM users
      WHERE role = 'vendor'
        AND status = 'active'
        AND created_at < NOW() - INTERVAL '90 days'
        AND created_at > NOW() - INTERVAL '91 days'
    `;

    for (const vendor of ninetyDayOldVendors || []) {
      await triggerGuideForEvent(vendor.id, "milestone-90days");
    }

    console.log(
      `🎉 Triggered 90-day milestone guides for ${(ninetyDayOldVendors || []).length} vendors`,
    );
    console.log(`✅ Milestone checks complete`);
  } catch (error) {
    console.error("Error checking milestones:", error);
  }
}
