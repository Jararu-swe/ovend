import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/app/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const isValid = await verifyPayment(reference);

    if (isValid) {
      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
