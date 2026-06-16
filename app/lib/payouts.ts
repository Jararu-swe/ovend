import { sql } from "@/app/lib/db";
import { getTransactionFeePercentage } from "./subscriptions";

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

/**
 * Calculates the actual available balance for a vendor in Naira.
 * 
 * Available Balance = (Total Net Earnings of Fulfilled Orders) - (Total Non-Failed Requested Payouts)
 * Net Earnings per Order = total_amount - transaction_fee_kobo (stored per order)
 */
export async function fetchVendorAvailableBalance(vendorId: string): Promise<number> {
  try {
    // 1. Fetch all fulfilled orders with their stored transaction fees
    const orders = await sql<{ total_amount: number; transaction_fee_kobo: number | null }[]>`
      SELECT total_amount, transaction_fee_kobo FROM orders
      WHERE vendor_id = ${vendorId} AND status = 'fulfilled'
    `;

    // 2. Calculate net earnings from orders (in Kobo)
    let totalNetRevenueKobo = 0;
    const feePercentage = await getTransactionFeePercentage(vendorId); // For backward compatibility for orders without stored fee

    for (const order of orders) {
      let feeKobo: number;
      
      if (order.transaction_fee_kobo !== null) {
        // Use stored fee if available
        feeKobo = order.transaction_fee_kobo;
      } else {
        // Backward compatibility: calculate fee using current tier (for old orders)
        feeKobo = Math.round(order.total_amount * (feePercentage / 100));
      }
      
      totalNetRevenueKobo += order.total_amount - feeKobo;
    }

    // 3. Fetch the sum of all non-failed payouts (convert Naira to Kobo)
    const payoutsResult = await sql<{ total_payouts: string }[]>`
      SELECT COALESCE(SUM(requested_amount), 0) as total_payouts
      FROM payouts
      WHERE vendor_id = ${vendorId} AND status != 'failed'
    `;

    const totalPayoutsKobo = Math.round(Number(payoutsResult[0]?.total_payouts || 0) * 100);

    // 4. Available balance in Kobo
    const availableBalanceKobo = Math.max(0, totalNetRevenueKobo - totalPayoutsKobo);

    // Convert to Naira and round to 2 decimal places
    return Math.round(availableBalanceKobo / 100 * 100) / 100;
  } catch (error) {
    console.error("Error calculating vendor available balance:", error);
    return 0;
  }
}

