// Lightweight notification helper: email (nodemailer) + SMS (Twilio) wrappers
// Uses environment variables when available; otherwise logs to console.

import { sql } from "../lib/db";

type SendResult = { success: boolean; info?: any };

let nodemailerAvailable = false;
let nodemailer: any = null;

try {
  // dynamic require to avoid hard crash if packages not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nodemailer = require("nodemailer");
  nodemailerAvailable = true;
} catch (err) {
  nodemailerAvailable = false;
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
        connectionTimeout: 30000, // 30 second timeout
        greetingTimeout: 30000,
        socketTimeout: 30000,
      });

      // Add timeout to the send operation
      const sendPromise = transporter.sendMail({
        from: from || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });

      // Race against timeout (45 seconds total)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout after 45 seconds')), 45000)
      );

      const info = await Promise.race([sendPromise, timeoutPromise]);

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
    process.env.SENDCHAMP_PUBLIC_KEY &&
    process.env.SENDCHAMP_SENDER_NAME
  ) {
    try {
      // Ensure phone number is in international format (E.164)
      let formattedTo = to;
      if (!formattedTo.startsWith('+')) {
        // If it starts with 0, replace with +234 (Nigeria) by default
        if (formattedTo.startsWith('0')) {
          formattedTo = '+234' + formattedTo.slice(1);
        } else {
          // Otherwise, assume it's already international without +
          formattedTo = '+' + formattedTo;
        }
      }

      const response = await fetch('https://api.sendchamp.com/api/v1/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.SENDCHAMP_PUBLIC_KEY}`
        },
        body: JSON.stringify({
          to: [formattedTo],
          message: body,
          sender_name: process.env.SENDCHAMP_SENDER_NAME,
          route: 'dnd'
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        return { success: true, info: result };
      } else {
        return { success: false, info: result };
      }
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
