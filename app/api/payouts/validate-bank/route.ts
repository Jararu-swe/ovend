import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const { account_number, bank_code } = await request.json();

    if (!account_number || !bank_code) {
      return new Response(
        JSON.stringify({ error: "Account number and bank code required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.message || "Bank account validation failed",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        account_name: data.data.account_name,
        account_number: data.data.account_number,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Bank validation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to validate bank account" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
