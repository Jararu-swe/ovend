import { sql } from "@/app/lib/db";

export interface PayoutRecord {
  id: number;
  requested_amount: number;
  net_amount: number;
  service_fee: number;
  status: "pending" | "processing" | "completed" | "failed";
  requested_at: string;
  processed_at: string | null;
  bank_name: string;
  account_number: string;
}

export async function fetchVendorPayouts(
  vendorId: string,
): Promise<PayoutRecord[]> {
  try {
    const payouts = await sql<PayoutRecord[]>`
      SELECT id, requested_amount, net_amount, service_fee, status, requested_at, processed_at, bank_name, account_number
      FROM payouts
      WHERE vendor_id = ${vendorId}
      ORDER BY requested_at DESC
      LIMIT 10
    `;
    return payouts || [];
  } catch (error) {
    console.error("Database Error (fetchVendorPayouts):", error);
    return [];
  }
}

export async function fetchPayoutStats(vendorId: string) {
  try {
    const stats = await Promise.all([
      sql`
        SELECT COUNT(*) as total, COALESCE(SUM(requested_amount), 0) as sum
        FROM payouts
        WHERE vendor_id = ${vendorId} AND status = 'completed'
      `,
      sql`
        SELECT COUNT(*) as pending_count, COALESCE(SUM(requested_amount), 0) as pending_sum
        FROM payouts
        WHERE vendor_id = ${vendorId} AND status = 'pending'
      `,
    ]);

    const completed = stats[0][0] || { total: 0, sum: 0 };
    const pending = stats[1][0] || { pending_count: 0, pending_sum: 0 };

    return {
      completedPayouts: Number(completed.total || 0),
      totalCompleted: Number(completed.sum || 0),
      pendingPayouts: Number(pending.pending_count || 0),
      totalPending: Number(pending.pending_sum || 0),
    };
  } catch (error) {
    console.error("Database Error (fetchPayoutStats):", error);
    return {
      completedPayouts: 0,
      totalCompleted: 0,
      pendingPayouts: 0,
      totalPending: 0,
    };
  }
}
