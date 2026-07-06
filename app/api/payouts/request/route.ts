import { auth } from "@/auth";
import { sql } from "@/app/lib/db";
import {
  createPaystackRecipient,
  getBankCodeFromName,
  initiatePaystackTransfer,
} from "@/app/lib/paystack";
import { fetchVendorAvailableBalance } from "@/app/lib/payouts";
import { getTransactionFeePercentage } from "@/app/lib/subscriptions";

export async function POST(request: Request) {
  try {
    console.log("=== Starting Payout Request ===");
    
    const session = await auth();
    console.log("Session:", session ? "Authenticated" : "Not authenticated");
    
    const vendorId = session?.user?.id;

    if (!vendorId) {
      console.log("❌ Unauthorized: No vendor ID");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("Vendor ID:", vendorId);

    const { amount, idempotencyKey } = await request.json();
    console.log("Request body:", { amount, idempotencyKey });

    if (!amount || typeof amount !== "number" || amount <= 0) {
      console.log("❌ Invalid amount");
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch vendor's actual available balance (net of transaction fees and previous payouts)
    console.log("Fetching available balance...");
    const balance = await fetchVendorAvailableBalance(vendorId);
    console.log("Available balance:", balance);

    // Check if vendor has sufficient balance
    if (amount > balance) {
      console.log("❌ Insufficient balance:", { amount, balance });
      return new Response(JSON.stringify({ error: "Insufficient balance" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check minimum payout amount (TEMPORARILY set to ₦25 for testing — revert to 5000 after)
    if (amount < 25) {
      console.log("❌ Below minimum payout:", amount);
      return new Response(
        JSON.stringify({ error: "Minimum payout is ₦25" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Idempotency: if an idempotencyKey is provided, return existing payout
    if (idempotencyKey) {
      console.log("Checking idempotency key:", idempotencyKey);
      const existing = await sql`
        SELECT id, requested_amount, net_amount, status, paystack_transfer_code
        FROM payouts
        WHERE vendor_id = ${vendorId} AND idempotency_key = ${idempotencyKey}
        LIMIT 1
      `;
      if (existing.length) {
        console.log("✅ Existing payout found, returning idempotent response");
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
    console.log("Fetching vendor bank details...");
    const vendorData = await sql`
      SELECT bank_name, account_number, account_name
      FROM users
      WHERE id = ${vendorId}
    `;

    const vendor = vendorData[0];
    console.log("Vendor data:", vendor);
    
    if (
      !vendor?.bank_name ||
      !vendor?.account_number ||
      !vendor?.account_name
    ) {
      console.log("❌ Incomplete bank details");
      return new Response(
        JSON.stringify({
          error: "Please complete your bank account details in Settings",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("Getting bank code for:", vendor.bank_name);
    const bankCode = await getBankCodeFromName(vendor.bank_name);
    console.log("Bank code:", bankCode);
    
    if (!bankCode) {
      console.log("❌ Unsupported bank name");
      return new Response(
        JSON.stringify({
          error:
            "Unsupported bank name. Please update your bank details with a Paystack-supported bank.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create or resolve a Paystack recipient
    console.log("Creating Paystack recipient...");
    const recipientResult = await createPaystackRecipient(
      vendor.account_number,
      bankCode,
      vendor.account_name,
    );
    console.log("Recipient result:", recipientResult);

    if (!recipientResult.ok || !recipientResult.recipientCode) {
      console.log("❌ Failed to create transfer recipient");
      return new Response(
        JSON.stringify({
          error: recipientResult.error || "Failed to create transfer recipient",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Calculate service fee based on vendor's subscription tier
    console.log("Getting transaction fee percentage...");
    const feePercentage = await getTransactionFeePercentage(vendorId);
    console.log("Fee percentage:", feePercentage);
    
    const serviceFee = amount * (feePercentage / 100);
    const netAmount = amount - serviceFee;
    const reference = `PAYOUT-${vendorId}-${Date.now()}`;
    console.log("Calculations:", { amount, serviceFee, netAmount, reference });

    // Initiate the Paystack transfer immediately using the net amount (requested minus service fee)
    console.log("Initiating Paystack transfer...");
    const transferResult = await initiatePaystackTransfer(
      netAmount,
      recipientResult.recipientCode,
      `Vendor payout for ${vendorId}`,
      reference,
    );
    console.log("Transfer result:", transferResult);

    if (!transferResult.ok || !transferResult.transferCode) {
      console.log("❌ Failed to initiate transfer");
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

    console.log("Inserting payout record...");
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
    console.log("Payout inserted:", payout[0]);

    // Notify vendor that payout request has been received / initiated
    try {
      console.log("Sending notifications...");
      // dynamic import to avoid issues if notifications helper not configured
      const { fetchVendorContact, sendEmail, sendSMS } =
        await import("@/app/lib/notifications");
      const contact = await fetchVendorContact(vendorId);
      if (contact) {
        const text = `Your payout request (ID: ${payout[0].id}) for ₦${amount.toLocaleString()} has been received and is being processed.`;
        if (contact.email) {
          await sendEmail(contact.email, "Payout Requested", text);
          console.log("Email sent to:", contact.email);
        }
        const phone = contact.phone_number || contact.whatsapp_number;
        if (phone) {
          await sendSMS(phone, text);
          console.log("SMS sent to:", phone);
        }
      } else {
        console.log("No vendor contact found for notifications");
      }
    } catch (err) {
      console.error("❌ notify on request error:", err);
    }

    console.log("✅ Payout request processed successfully!");
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
    console.error("=== Payout Request Error ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", (error as Error)?.message || String(error));
    console.error("Stack trace:", (error as Error)?.stack);
    console.error("Full error:", error);
    console.error("=== End Payout Request Error ===");
    
    const errorMessage = (error as Error)?.message || "Failed to process payout request";
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        details: process.env.NODE_ENV === "development" ? String(error) : undefined 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
