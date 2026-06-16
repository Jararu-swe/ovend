import { auth } from "@/auth";
import { getPaystackBanks, PaystackBank } from "@/app/lib/paystack";

// Cache the banks for 24 hours
let cachedBanks: PaystackBank[] = [];
let lastCachedAt: number = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if cache is fresh
  const now = Date.now();
  if (cachedBanks.length > 0 && now - lastCachedAt < CACHE_TTL) {
    return new Response(JSON.stringify({ banks: cachedBanks }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch fresh banks from Paystack
  const banks = await getPaystackBanks();
  
  // Update cache
  cachedBanks = banks;
  lastCachedAt = now;

  return new Response(JSON.stringify({ banks }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
