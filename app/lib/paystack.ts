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

const bankCodeMap: Record<string, string> = {
  "guaranty trust bank": "058",
  gtbank: "058",
  "access bank": "044",
  firstbank: "011",
  "first bank": "011",
  zenithbank: "057",
  "zenith bank": "057",
  uba: "033",
  "united bank for africa": "033",
  "united bank for africa (uba)": "033",
  "heritage bank": "030",
  "stanbic ibtc bank": "039",
  stanbic: "039",
  "fidelity bank": "070",
  fidelity: "070",
  "union bank": "032",
  "union bank of nigeria": "032",
  ecobank: "050",
  "polaris bank": "076",
  polaris: "076",
  "wema bank": "035",
  wema: "035",
  "diamond bank": "063",
  "keystone bank": "082",
  "alumni bank": "023",
  "standard chartered bank": "068",
  "citi bank": "023",
  citi: "023",
  stanbic: "039",
};

export function normalizeBankName(bankName: string) {
  return bankName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/bank$/g, "")
    .trim();
}

export function getBankCodeFromName(bankName: string): string | undefined {
  const normalized = normalizeBankName(bankName);
  return bankCodeMap[normalized] || bankCodeMap[normalized.replace(/ /g, "")];
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

export function generatePaymentReference(orderId: string): string {
  return `OVD-${orderId.slice(0, 8)}-${Date.now()}`;
}
