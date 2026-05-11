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

export function initializePayment(data: PaymentData) {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  
  if (!publicKey) {
    console.warn('Paystack public key not configured');
    return null;
  }

  return {
    key: publicKey,
    email: data.email,
    amount: data.amount,
    ref: data.reference,
    metadata: data.metadata,
    onSuccess: (reference: any) => {
      console.log('Payment successful:', reference);
    },
    onClose: () => {
      console.log('Payment modal closed');
    },
  };
}

export async function verifyPayment(reference: string): Promise<boolean> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  
  if (!secretKey) {
    console.error('Paystack secret key not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const data = await response.json();
    return data.status && data.data.status === 'success';
  } catch (error) {
    console.error('Payment verification error:', error);
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

export async function verifyPaymentDetails(reference: string): Promise<PaystackVerifyDetails> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return { ok: false, error: 'Paystack secret key not configured' };
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const data = await response.json();
    if (!data?.status || !data?.data) {
      return { ok: false, error: 'Invalid Paystack verification response' };
    }

    const d = data.data;
    return {
      ok: d.status === 'success',
      ...(d.status === 'success'
        ? {
            reference: String(d.reference ?? reference),
            status: String(d.status),
            amount: Number(d.amount ?? 0),
            currency: String(d.currency ?? 'NGN'),
            metadata: d.metadata ?? null,
            paid_at: d.paid_at ?? d.paidAt ?? undefined,
          }
        : { error: `Payment status is ${String(d.status)}` }),
    } as PaystackVerifyDetails;
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Payment verification error' };
  }
}

export function generatePaymentReference(orderId: string): string {
  return `OVD-${orderId.slice(0, 8)}-${Date.now()}`;
}
