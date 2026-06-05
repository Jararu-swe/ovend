/**
 * POST /api/subscriptions/cancel
 * 
 * Cancels the current subscription. Access is maintained until the current
 * billing period ends (subscription_expires_at date).
 * 
 * Requires authentication.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cancelSubscription, getVendorSubscription } from '@/app/lib/subscriptions';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check current subscription status
    const currentSubscription = await getVendorSubscription(session.user.id);
    
    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }
    
    // Can only cancel active or trial subscriptions
    if (currentSubscription.status !== 'active' && currentSubscription.status !== 'trial') {
      return NextResponse.json(
        { error: `Cannot cancel subscription with status: ${currentSubscription.status}` },
        { status: 400 }
      );
    }
    
    // Can only cancel paid tiers (not starter)
    if (currentSubscription.tier === 'starter') {
      return NextResponse.json(
        { error: 'Cannot cancel Starter tier (free) subscription' },
        { status: 400 }
      );
    }
    
    // Cancel the subscription
    await cancelSubscription(session.user.id);
    
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
      message: 'Subscription cancelled successfully',
      subscription: {
        tier: updatedSubscription.tier,
        status: updatedSubscription.status,
        expires_at: updatedSubscription.expires_at,
        access_until: updatedSubscription.expires_at
      },
      note: 'You will retain access to your current plan until ' + 
            (updatedSubscription.expires_at 
              ? new Date(updatedSubscription.expires_at).toLocaleDateString() 
              : 'the end of your billing period')
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
