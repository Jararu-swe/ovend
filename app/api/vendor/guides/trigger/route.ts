import { auth } from "@/auth";
import { triggerGuideForEvent } from "@/app/lib/guide-triggers";

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

    const body = await request.json();
    const { trigger_type } = body;

    if (!trigger_type) {
      return new Response(JSON.stringify({ error: "Missing trigger_type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Trigger guides for this event
    await triggerGuideForEvent(vendorId, trigger_type);

    return new Response(
      JSON.stringify({ success: true, message: "Guides triggered" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error triggering guides:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
