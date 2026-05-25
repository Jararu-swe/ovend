import { auth } from "@/auth";
import { markGuideViewed } from "@/app/lib/guide-triggers";

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
    const { guide_id } = body;

    if (!guide_id) {
      return new Response(JSON.stringify({ error: "Missing guide_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mark guide as viewed
    await markGuideViewed(vendorId, guide_id);

    return new Response(
      JSON.stringify({ success: true, message: "Guide marked as viewed" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error marking guide as viewed:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
