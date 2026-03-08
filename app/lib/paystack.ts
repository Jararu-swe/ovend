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

export function generatePaymentReference(orderId: string): string {
  return `OVD-${orderId.slice(0, 8)}-${Date.now()}`;
}
