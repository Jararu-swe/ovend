/**
 * POST /api/subscriptions/trial
 * 
 * Starts a trial period for a paid subscription tier.
 * Sets the subscription status to 'trial' and calculates the trial expiry date (14 days).
 * 
 * Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { startTrial, getVendorSubscription } from '@/app/lib/subscriptions';
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
    const { tier } = body;
    
    // Validate tier parameter - only pro and business can have trials
    if (!tier || (tier !== 'pro' && tier !== 'business')) {
      return NextResponse.json(
        { error: 'Invalid tier. Trial is only available for "pro" or "business"' },
        { status: 400 }
      );
    }
    
    // Check if user already has an active subscription or trial
    const currentSubscription = await getVendorSubscription(session.user.id);
    
    if (currentSubscription && 
        (currentSubscription.status === 'active' || 
         currentSubscription.status === 'trial' ||
         currentSubscription.status === 'past_due')) {
      return NextResponse.json(
        { error: 'You already have an active subscription or trial' },
        { status: 400 }
      );
    }
    
    // Start the trial (14 days by default)
    await startTrial(session.user.id, tier as SubscriptionTier, 14);
    
    // Fetch updated subscription info
    const updatedSubscription = await getVendorSubscription(session.user.id);
    
    if (!updatedSubscription) {
      return NextResponse.json(
        { error: 'Failed to fetch trial subscription' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Trial started successfully',
      subscription: {
        tier: updatedSubscription.tier,
        status: updatedSubscription.status,
        expires_at: updatedSubscription.expires_at,
        trial_days_remaining: updatedSubscription.trial_days_remaining,
        plan: updatedSubscription.plan
      }
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: 'Failed to start trial' },
      { status: 500 }
    );
  }
}
