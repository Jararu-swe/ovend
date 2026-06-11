// Lightweight notification helper: email (nodemailer) + SMS (Twilio) wrappers
// Uses environment variables when available; otherwise logs to console.

import { sql } from "../lib/db";

type SendResult = { success: boolean; info?: any };

let nodemailerAvailable = false;
let twilioAvailable = false;
let nodemailer: any = null;
let twilio: any = null;

try {
  // dynamic require to avoid hard crash if packages not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nodemailer = require("nodemailer");
  nodemailerAvailable = true;
} catch (err) {
  nodemailerAvailable = false;
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  twilio = require("twilio");
  twilioAvailable = true;
} catch (err) {
  twilioAvailable = false;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<SendResult> {
  const from = process.env.NOTIFICATIONS_FROM_EMAIL || process.env.SMTP_FROM;

  if (
    nodemailerAvailable &&
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: from || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });

      return { success: true, info };
    } catch (err) {
      console.error("sendEmail error:", err);
      return { success: false, info: err };
    }
  }

  // Fallback: log the notification so it can be picked up in logs
  console.log("[Notification] sendEmail (fallback):", {
    to,
    subject,
    text,
    html,
  });
  return { success: true, info: { fallback: true } };
}

export async function sendSMS(to: string, body: string): Promise<SendResult> {
  if (
    twilioAvailable &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  ) {
    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
      const msg = await client.messages.create({
        body,
        from: process.env.TWILIO_FROM,
        to,
      });
      return { success: true, info: msg };
    } catch (err) {
      console.error("sendSMS error:", err);
      return { success: false, info: err };
    }
  }

  console.log("[Notification] sendSMS (fallback):", { to, body });
  return { success: true, info: { fallback: true } };
}

// Convenience: fetch vendor contact info by vendor_id
export async function fetchVendorContact(vendorId: string | number) {
  try {
    const [user] =
      await sql`SELECT id, email, phone_number, whatsapp_number FROM users WHERE id = ${vendorId}`;
    return user || null;
  } catch (err) {
    console.error("fetchVendorContact error:", err);
    return null;
  }
}
