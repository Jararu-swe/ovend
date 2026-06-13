import { auth } from "@/auth";
import { sql } from "@/app/lib/db";
import {
  createPaystackRecipient,
  getBankCodeFromName,
  initiatePaystackTransfer,
} from "@/app/lib/paystack";
import { fetchVendorAvailableBalance } from "@/app/lib/payouts";

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

    const { amount, idempotencyKey } = await request.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch vendor's actual available balance (net of transaction fees and previous payouts)
    const balance = await fetchVendorAvailableBalance(vendorId);

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

    // Idempotency: if an idempotencyKey is provided, return existing payout
    if (idempotencyKey) {
      const existing = await sql`
        SELECT id, requested_amount, net_amount, status, paystack_transfer_code
        FROM payouts
        WHERE vendor_id = ${vendorId} AND idempotency_key = ${idempotencyKey}
        LIMIT 1
      `;
      if (existing.length) {
        return new Response(
          JSON.stringify({
            success: true,
            payout: existing[0],
            idempotent: true,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
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

    const bankCode = getBankCodeFromName(vendor.bank_name);
    if (!bankCode) {
      return new Response(
        JSON.stringify({
          error:
            "Unsupported bank name. Please update your bank details with a Paystack-supported bank.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create or resolve a Paystack recipient
    const recipientResult = await createPaystackRecipient(
      vendor.account_number,
      bankCode,
      vendor.account_name,
    );

    if (!recipientResult.ok || !recipientResult.recipientCode) {
      return new Response(
        JSON.stringify({
          error: recipientResult.error || "Failed to create transfer recipient",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Calculate service fee (2%)
    const serviceFee = amount * 0.02;
    const netAmount = amount - serviceFee;
    const reference = `PAYOUT-${vendorId}-${Date.now()}`;

    // Initiate the Paystack transfer immediately using the net amount (requested minus service fee)
    const transferResult = await initiatePaystackTransfer(
      netAmount,
      recipientResult.recipientCode,
      `Vendor payout for ${vendorId}`,
      reference,
    );

    if (!transferResult.ok || !transferResult.transferCode) {
      await sql`
        INSERT INTO payouts (
          vendor_id,
          requested_amount,
          net_amount,
          service_fee,
          status,
          bank_name,
          account_number,
          account_name,
          failed_reason,
          idempotency_key,
          requested_at
        )
        VALUES (
          ${vendorId},
          ${amount},
          ${netAmount},
          ${serviceFee},
          'failed',
          ${vendor.bank_name},
          ${vendor.account_number},
          ${vendor.account_name},
          ${transferResult.error || "Transfer initiation failed"},
          ${idempotencyKey ?? null},
          CURRENT_TIMESTAMP
        )
      `;
      return new Response(
        JSON.stringify({
          error: transferResult.error || "Failed to initiate payout transfer",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

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
        paystack_recipient_code,
        paystack_transfer_code,
        idempotency_key,
        requested_at
      )
      VALUES (
        ${vendorId},
        ${amount},
        ${netAmount},
        ${serviceFee},
        'processing',
        ${vendor.bank_name},
        ${vendor.account_number},
        ${vendor.account_name},
        ${recipientResult.recipientCode},
        ${transferResult.transferCode},
        ${idempotencyKey ?? null},
        CURRENT_TIMESTAMP
      )
      RETURNING id, requested_amount, net_amount, status, paystack_transfer_code
    `;

    // Notify vendor that payout request has been received / initiated
    try {
      // dynamic import to avoid issues if notifications helper not configured
      const { fetchVendorContact, sendEmail, sendSMS } =
        await import("@/app/lib/notifications");
      const contact = await fetchVendorContact(vendorId);
      if (contact) {
        const text = `Your payout request (ID: ${payout[0].id}) for ₦${amount.toLocaleString()} has been received and is being processed.`;
        if (contact.email)
          await sendEmail(contact.email, "Payout Requested", text);
        const phone = contact.phone_number || contact.whatsapp_number;
        if (phone) await sendSMS(phone, text);
      }
    } catch (err) {
      console.error("notify on request error:", err);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Payout transfer initiated. Status will update automatically via Paystack webhook.",
        payout: payout[0],
        transfer: {
          reference: transferResult.reference,
          transfer_code: transferResult.transferCode,
        },
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
