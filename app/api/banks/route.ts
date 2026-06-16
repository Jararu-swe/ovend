import { getPaystackBanks } from "@/app/lib/paystack";

export async function GET() {
  try {
    const banks = await getPaystackBanks();
    return new Response(JSON.stringify({ banks }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch banks:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch banks" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
