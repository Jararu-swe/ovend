/**
 * POST /api/subscriptions/initialize
 * 
 * Initializes a Paystack payment for subscription upgrade.
 * Returns the Paystack authorization URL for redirecting the user.
 * 
 * Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { initializeSubscriptionPayment } from '@/app/lib/paystack-subscriptions';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { tier, callbackUrl } = body;
    
    // Validate tier parameter
    if (!tier || (tier !== 'pro' && tier !== 'business')) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "business"' },
        { status: 400 }
      );
    }
    
    // Validate callback URL
    if (!callbackUrl || typeof callbackUrl !== 'string') {
      return NextResponse.json(
        { error: 'Callback URL is required' },
        { status: 400 }
      );
    }
    
    const result = await initializeSubscriptionPayment({
      vendorId: session.user.id,
      tier,
      email: session.user.email,
      callbackUrl
    });
    
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Payment initialization failed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      authorization_url: result.authorization_url,
      reference: result.reference
    });
  } catch (error) {
    console.error('Error initializing subscription payment:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
