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

    const { payoutId } = await request.json();

    if (!payoutId) {
      return new Response(JSON.stringify({ error: "Payout ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch payout details
    const payoutData = await sql`
      SELECT * FROM payouts
      WHERE id = ${payoutId} AND vendor_id = ${vendorId} AND status = 'pending'
    `;

    if (!payoutData.length) {
      return new Response(
        JSON.stringify({ error: "Payout not found or already processed" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const payout = payoutData[0];

    // Initiate Paystack transfer
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance", // Transfer from your Paystack balance
        type: "nuban", // Bank account transfer
        amount: Math.floor(Number(payout.net_amount) * 100), // Convert to kobo
        recipient: payout.paystack_recipient_code, // Recipient code from validation
        reason: `Payout - Payout ID: ${payout.id}`,
        reference: `PAYOUT-${payout.id}-${Date.now()}`, // Unique reference
      }),
    });

    const transferData = await transferResponse.json();

    if (!transferResponse.ok) {
      // Update payout status to failed
      await sql`
        UPDATE payouts
        SET status = 'failed', failed_reason = ${transferData.message}
        WHERE id = ${payoutId}
      `;

      return new Response(
        JSON.stringify({
          error: transferData.message || "Transfer initiation failed",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Update payout with Paystack transfer reference
    await sql`
      UPDATE payouts
      SET status = 'processing', paystack_transfer_code = ${transferData.data.transfer_code}
      WHERE id = ${payoutId}
    `;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Transfer initiated",
        transfer_code: transferData.data.transfer_code,
        reference: transferData.data.reference,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Payout processing error:", error);
    return new Response(JSON.stringify({ error: "Failed to process payout" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
