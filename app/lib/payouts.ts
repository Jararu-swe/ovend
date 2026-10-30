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

export interface VendorBalanceBreakdown {
  availableBalance: number;
  escrowPendingBalance: number;
  totalNetEarnings: number;
  settlementDays: number;
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
export interface VendorBalanceBreakdown {
  availableBalance: number; // Cleared funds ready for payout
  escrowPendingBalance: number; // In settlement holding period
  totalNetEarnings: number;
  settlementDays: number;
}

/**
 * Calculates vendor balance breakdown including cleared available balance and
 * escrow pending clearance balance based on Nigerian KYC settlement rules.
 * 
 * - Starter Tier: T+3 days hold
 * - Pro Tier: T+1 day hold
 * - Business Tier: T+0 instant settlement
 */
export async function fetchVendorBalanceBreakdown(vendorId: string): Promise<VendorBalanceBreakdown> {
  try {
    // 1. Fetch all fulfilled orders along with user's kyc_tier in a single query
    const orders = await sql<
      {
        total_amount: number;
        transaction_fee_kobo: number | null;
        fulfilled_at?: string | null;
        created_at?: string;
        vendor_kyc_tier?: string | null;
      }[]
    >`
      SELECT 
        o.total_amount, 
        o.transaction_fee_kobo, 
        o.fulfilled_at, 
        o.created_at,
        u.kyc_tier as vendor_kyc_tier
      FROM orders o
      LEFT JOIN users u ON u.id = o.vendor_id
      WHERE o.vendor_id = ${vendorId} AND o.status = 'fulfilled'
    `;

    // Determine settlement holding days from kyc_tier
    const kycTier = orders[0]?.vendor_kyc_tier || 'starter';
    const settlementDays = kycTier === 'business' ? 0 : kycTier === 'pro' ? 1 : 3;

    // 2. Calculate net earnings from orders (in Kobo) separating cleared vs escrow
    let clearedNetRevenueKobo = 0;
    let escrowPendingRevenueKobo = 0;
    const feePercentage = await getTransactionFeePercentage(vendorId);
    const now = Date.now();
    const settlementHoldMs = settlementDays * 24 * 60 * 60 * 1000;

    for (const order of orders) {
      let feeKobo: number;

      if (order.transaction_fee_kobo !== null && order.transaction_fee_kobo !== undefined) {
        feeKobo = order.transaction_fee_kobo;
      } else {
        feeKobo = Math.round(order.total_amount * (feePercentage / 100));
      }

      const netOrderKobo = order.total_amount - feeKobo;

      // Check if order has cleared the settlement holding period
      let isCleared = true;
      if (settlementDays > 0 && order.fulfilled_at) {
        const fulfilledTime = new Date(order.fulfilled_at).getTime();
        isCleared = (now - fulfilledTime) >= settlementHoldMs;
      }

      if (isCleared) {
        clearedNetRevenueKobo += netOrderKobo;
      } else {
        escrowPendingRevenueKobo += netOrderKobo;
      }
    }

    // 3. Fetch the sum of all non-failed payouts (convert Naira to Kobo)
    const payoutsResult = await sql<{ total_payouts: string }[]>`
      SELECT COALESCE(SUM(requested_amount), 0) as total_payouts
      FROM payouts
      WHERE vendor_id = ${vendorId} AND status != 'failed'
    `;

    const totalPayoutsKobo = Math.round(Number(payoutsResult[0]?.total_payouts || 0) * 100);

    // 4. Available balance in Kobo (cleared revenue minus requested payouts)
    const availableBalanceKobo = Math.max(0, clearedNetRevenueKobo - totalPayoutsKobo);

    return {
      availableBalance: Math.round((availableBalanceKobo / 100) * 100) / 100,
      escrowPendingBalance: Math.round((escrowPendingRevenueKobo / 100) * 100) / 100,
      totalNetEarnings: Math.round(((clearedNetRevenueKobo + escrowPendingRevenueKobo) / 100) * 100) / 100,
      settlementDays,
    };
  } catch (error) {
    console.error("Error calculating vendor available balance:", error);
    return {
      availableBalance: 0,
      escrowPendingBalance: 0,
      totalNetEarnings: 0,
      settlementDays: 3,
    };
  }
}

/**
 * Calculates the actual cleared available balance for a vendor in Naira.
 * 
 * Available Balance = (Total Net Earnings of Cleared Fulfilled Orders) - (Total Non-Failed Requested Payouts)
 */
export async function fetchVendorAvailableBalance(vendorId: string): Promise<number> {
  const breakdown = await fetchVendorBalanceBreakdown(vendorId);
  return breakdown.availableBalance;
}

