/**
 * GET /api/subscriptions/current
 * 
 * Returns the current user's subscription information including:
 * - Current tier and status
 * - Plan details with features and limits
 * - Grace period and trial calculations
 * - Next billing date
 * 
 * Requires authentication.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getVendorSubscription } from '@/app/lib/subscriptions';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const subscription = await getVendorSubscription(session.user.id);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        expires_at: subscription.expires_at,
        last_payment_reference: subscription.last_payment_reference,
        updated_at: subscription.updated_at,
        plan: subscription.plan,
        grace_days_remaining: subscription.grace_days_remaining,
        is_trial: subscription.is_trial,
        trial_days_remaining: subscription.trial_days_remaining
      }
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
