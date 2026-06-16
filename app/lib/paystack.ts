// Paystack integration utilities
// Get your keys from https://dashboard.paystack.com/#/settings/developers

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
}

export interface PaymentData {
  email: string;
  amount: number; // in kobo (multiply NGN by 100)
  reference: string;
  metadata?: {
    orderId: string;
    vendorId: string;
    customerName: string;
    items: any[];
  };
}

// Cache for Paystack banks to avoid repeated API calls
let banksCache: PaystackBank[] | null = null;
let banksCacheTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function normalizeBankName(bankName: string) {
  return bankName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

export async function getBankCodeFromName(bankName: string): Promise<string | undefined> {
  const normalizedInput = normalizeBankName(bankName);
  
  // Refresh cache if needed
  if (!banksCache || Date.now() - banksCacheTime > CACHE_DURATION) {
    banksCache = await getPaystackBanks();
    banksCacheTime = Date.now();
  }
  
  if (!banksCache) {
    return undefined;
  }
  
  // Try exact match first
  let match = banksCache.find(bank => 
    normalizeBankName(bank.name) === normalizedInput
  );
  
  if (match) {
    return match.code;
  }
  
  // Try partial match
  match = banksCache.find(bank => 
    normalizeBankName(bank.name).includes(normalizedInput) || 
    normalizedInput.includes(normalizeBankName(bank.name))
  );
  
  if (match) {
    return match.code;
  }
  
  // Try matching by slug
  match = banksCache.find(bank => 
    bank.slug.toLowerCase() === normalizedInput.replace(/ /g, "-")
  );
  
  return match?.code;
}

export async function initializePayment(data: PaymentData) {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!publicKey) {
    console.warn("Paystack public key not configured");
    return null;
  }

  return {
    key: publicKey,
    email: data.email,
    amount: data.amount,
    ref: data.reference,
    metadata: data.metadata,
    onSuccess: (reference: any) => {
      console.log("Payment successful:", reference);
    },
    onClose: () => {
      console.log("Payment modal closed");
    },
  };
}

export async function verifyPayment(reference: string): Promise<boolean> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error("Paystack secret key not configured");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      },
    );

    const data = await response.json();
    return data.status && data.data.status === "success";
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
}

export type PaystackVerifyDetails =
  | {
      ok: true;
      reference: string;
      status: string;
      amount: number;
      currency: string;
      metadata: any;
      paid_at?: string;
    }
  | { ok: false; error: string };

export async function verifyPaymentDetails(
  reference: string,
): Promise<PaystackVerifyDetails> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return { ok: false, error: "Paystack secret key not configured" };
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      },
    );

    const data = await response.json();
    if (!data?.status || !data?.data) {
      return { ok: false, error: "Invalid Paystack verification response" };
    }

    const d = data.data;
    return {
      ok: d.status === "success",
      ...(d.status === "success"
        ? {
            reference: String(d.reference ?? reference),
            status: String(d.status),
            amount: Number(d.amount ?? 0),
            currency: String(d.currency ?? "NGN"),
            metadata: d.metadata ?? null,
            paid_at: d.paid_at ?? d.paidAt ?? undefined,
          }
        : { error: `Payment status is ${String(d.status)}` }),
    } as PaystackVerifyDetails;
  } catch (error: any) {
    return { ok: false, error: error?.message || "Payment verification error" };
  }
}

export interface PaystackRecipientResult {
  ok: boolean;
  recipientCode?: string;
  error?: string;
}

export async function createPaystackRecipient(
  accountNumber: string,
  bankCode: string,
  accountName: string,
): Promise<PaystackRecipientResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, error: "Paystack secret key not configured" };
  }

  // Test mode mock
  if (secretKey.startsWith("sk_test_")) {
    return {
      ok: true,
      recipientCode: "RCP_test_" + Date.now(),
    };
  }

  const response = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    }),
  });

  const data = await response.json();
  if (!response.ok || !data?.status) {
    return {
      ok: false,
      error: data?.message || "Failed to create Paystack transfer recipient",
    };
  }

  return { ok: true, recipientCode: data.data.recipient_code };
}

export interface PaystackTransferResult {
  ok: boolean;
  transferCode?: string;
  reference?: string;
  error?: string;
}

export async function initiatePaystackTransfer(
  amountInNaira: number,
  recipientCode: string,
  reason: string,
  reference: string,
): Promise<PaystackTransferResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, error: "Paystack secret key not configured" };
  }

  // Test mode mock
  if (secretKey.startsWith("sk_test_")) {
    return {
      ok: true,
      transferCode: "TRF_test_" + Date.now(),
      reference: reference,
    };
  }

  // Retry logic for transient failures (3 attempts, exponential backoff)
  const maxAttempts = 3;
  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxAttempts) {
    try {
      const response = await fetch("https://api.paystack.co/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          type: "nuban",
          amount: Math.round(amountInNaira * 100),
          recipient: recipientCode,
          reason,
          reference,
        }),
      });

      const data = await response.json().catch(() => null);

      // If successful, return
      if (response.ok && data && data.status) {
        return {
          ok: true,
          transferCode: data.data.transfer_code,
          reference: data.data.reference,
        };
      }

      // For client errors (4xx), do not retry
      if (response.status >= 400 && response.status < 500) {
        return {
          ok: false,
          error: data?.message || `Paystack error ${response.status}`,
        };
      }

      // Otherwise treat as transient and retry
      lastError = data?.message || `HTTP ${response.status}`;
    } catch (err: any) {
      lastError = err?.message || String(err);
    }

    attempt += 1;
    const backoffMs = 500 * Math.pow(2, attempt); // 1s, 2s, 4s approx
    await new Promise((res) => setTimeout(res, backoffMs));
  }

  return {
    ok: false,
    error: lastError || "Failed to initiate Paystack transfer",
  };
}

export interface PaystackBank {
  id: number;
  name: string;
  code: string;
  slug: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
}

export async function getPaystackBanks(): Promise<PaystackBank[]> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return [];
  }

  try {
    const response = await fetch("https://api.paystack.co/bank?country=nigeria", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });
    
    const data = await response.json();
    if (!data?.status || !data?.data) {
      return [];
    }
    
    // Only return active Nigerian banks
    return data.data.filter((bank: PaystackBank) => 
      bank.active && bank.country === "Nigeria" && bank.currency === "NGN"
    );
  } catch (error) {
    console.error("Failed to fetch Paystack banks:", error);
    return [];
  }
}

export function generatePaymentReference(orderId: string): string {
  return `OVD-${orderId.slice(0, 8)}-${Date.now()}`;
}
