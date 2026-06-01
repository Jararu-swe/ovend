import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const expectedSecret = process.env.NOTIFICATIONS_TEST_SECRET;

  if (!expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Notification test secret is not configured." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (secret !== expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing test secret." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const email = process.env.NOTIFICATIONS_TEST_EMAIL;
  const phone = process.env.NOTIFICATIONS_TEST_PHONE;

  if (!email && !phone) {
    return new Response(
      JSON.stringify({
        error:
          "No test notification recipient configured. Set NOTIFICATIONS_TEST_EMAIL or NOTIFICATIONS_TEST_PHONE.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const { sendEmail, sendSMS } = await import("../../../lib/notifications");
    const results: Record<string, any> = {};

    if (email) {
      results.email = await sendEmail(
        email,
        "Test Notification",
        "This is a test notification from the Ovend payout system.",
      );
    }

    if (phone) {
      results.sms = await sendSMS(
        phone,
        "This is a test notification from the Ovend payout system.",
      );
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification test failed:", error);
    return new Response(
      JSON.stringify({ error: "Notification test failed." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
