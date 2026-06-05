/**
 * POST /api/subscriptions/verify
 * 
 * Verifies a subscription payment with Paystack and activates the subscription.
 * Extracts vendor ID and tier from payment metadata, records the payment,
 * and updates the user's subscription status to active.
 * 
 * Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { verifySubscriptionPayment } from '@/app/lib/paystack-subscriptions';
import { recordSubscriptionPayment, getVendorSubscription } from '@/app/lib/subscriptions';
import { SubscriptionTier } from '@/app/lib/definitions';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { reference } = body;
    
    if (!reference || typeof reference !== 'string') {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }
    
    // Verify payment with Paystack
    const verifyResult = await verifySubscriptionPayment(reference);
    
    if (!verifyResult.ok) {
      return NextResponse.json(
        { error: verifyResult.error || 'Payment verification failed' },
        { status: 400 }
      );
    }
    
    // Ensure the payment belongs to the current user
    if (verifyResult.vendorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Payment does not belong to current user' },
        { status: 403 }
      );
    }
    
    // Get the plan to get the amount
    const { getSubscriptionPlan } = await import('@/app/lib/subscriptions');
    const plan = await getSubscriptionPlan(verifyResult.tier as SubscriptionTier);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }
    
    // Record the payment and activate subscription
    await recordSubscriptionPayment(
      verifyResult.vendorId,
      verifyResult.tier as SubscriptionTier,
      plan.price_kobo,
      reference
    );
    
    // Fetch updated subscription info
    const updatedSubscription = await getVendorSubscription(session.user.id);
    
    if (!updatedSubscription) {
      return NextResponse.json(
        { error: 'Failed to fetch updated subscription' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        tier: updatedSubscription.tier,
        status: updatedSubscription.status,
        expires_at: updatedSubscription.expires_at,
        plan: updatedSubscription.plan
      }
    });
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
