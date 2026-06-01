import { sql } from "@/app/lib/db";
import crypto from "crypto";
import {
  sendEmail,
  sendSMS,
  fetchVendorContact,
} from "@/app/lib/notifications";

export async function POST(request: Request) {
  try {
    // Verify webhook signature from Paystack
    const signature = request.headers.get("x-paystack-signature");
    const body = await request.text();

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);

    // Helper to notify vendor about payout status
    const notifyVendor = async (
      payoutId: number,
      vendorId: number,
      status: string,
      meta?: any,
    ) => {
      try {
        const contact = await fetchVendorContact(vendorId);
        if (!contact) return;

        const subject = `Payout ${status.toUpperCase()}`;
        let text = `Your payout (ID: ${payoutId}) status is now: ${status}.`;
        if (meta?.reason) text += ` Reason: ${meta.reason}`;

        if (contact.email) {
          await sendEmail(contact.email, subject, text);
        }

        // Prefer phone number fields in this order
        const phone = contact.phone_number || contact.whatsapp_number;
        if (phone) {
          await sendSMS(phone, text);
        }
      } catch (err) {
        console.error("notifyVendor error:", err);
      }
    };

    // Handle transfer events
    if (event.event === "transfer.success") {
      const { reference, transfer_code } = event.data;

      // Find payout by transfer code
      const payout = await sql`
        SELECT id, vendor_id FROM payouts
        WHERE paystack_transfer_code = ${transfer_code}
      `;

      if (payout.length) {
        await sql`
          UPDATE payouts
          SET status = 'completed', processed_at = CURRENT_TIMESTAMP
          WHERE id = ${payout[0].id}
        `;

        console.log(`✅ Payout ${payout[0].id} completed via Paystack`);
        await notifyVendor(payout[0].id, payout[0].vendor_id, "completed");
      }
    }

    if (event.event === "transfer.failed") {
      const { reference, transfer_code, reason } = event.data;

      const payout = await sql`
        SELECT id, vendor_id FROM payouts
        WHERE paystack_transfer_code = ${transfer_code}
      `;

      if (payout.length) {
        await sql`
          UPDATE payouts
          SET status = 'failed', failed_reason = ${reason}
          WHERE id = ${payout[0].id}
        `;

        console.log(`❌ Payout ${payout[0].id} failed: ${reason}`);
        await notifyVendor(payout[0].id, payout[0].vendor_id, "failed", {
          reason,
        });
      }
    }

    if (event.event === "transfer.reversed") {
      const { transfer_code } = event.data;

      const payout = await sql`
        SELECT id, vendor_id FROM payouts
        WHERE paystack_transfer_code = ${transfer_code}
      `;

      if (payout.length) {
        await sql`
          UPDATE payouts
          SET status = 'failed', failed_reason = 'Transfer reversed by bank'
          WHERE id = ${payout[0].id}
        `;
        await notifyVendor(payout[0].id, payout[0].vendor_id, "failed", {
          reason: "Transfer reversed by bank",
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
