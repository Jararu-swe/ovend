import { auth } from "@/auth";
import { sql } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;

    if (!vendorId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { amount } = await request.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch vendor's current balance
    const vendorStats = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as balance
      FROM orders
      WHERE vendor_id = ${vendorId} AND status = 'fulfilled'
    `;

    const balance = Number(vendorStats[0]?.balance || 0);

    // Check if vendor has sufficient balance
    if (amount > balance) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check minimum payout amount
    if (amount < 5000) {
      return new Response(
        JSON.stringify({ error: "Minimum payout is ₦5,000" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Fetch vendor's bank details
    const vendorData = await sql`
      SELECT bank_name, account_number, account_name
      FROM users
      WHERE id = ${vendorId}
    `;

    const vendor = vendorData[0];
    if (
      !vendor?.bank_name ||
      !vendor?.account_number ||
      !vendor?.account_name
    ) {
      return new Response(
        JSON.stringify({
          error: "Please complete your bank account details in Settings",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Calculate service fee (2%)
    const serviceFee = amount * 0.02;
    const netAmount = amount - serviceFee;

    // Create payout record
    const payout = await sql`
      INSERT INTO payouts (
        vendor_id,
        requested_amount,
        net_amount,
        service_fee,
        status,
        bank_name,
        account_number,
        account_name,
        requested_at
      )
      VALUES (
        ${vendorId},
        ${amount},
        ${netAmount},
        ${serviceFee},
        'pending',
        ${vendor.bank_name},
        ${vendor.account_number},
        ${vendor.account_name},
        CURRENT_TIMESTAMP
      )
      RETURNING id, requested_amount, net_amount, status
    `;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payout request submitted successfully",
        payout: payout[0],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Payout request error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process payout request" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
