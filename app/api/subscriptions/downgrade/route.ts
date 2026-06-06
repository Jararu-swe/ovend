import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { updateSubscriptionTier, getVendorSubscription } from '@/app/lib/subscriptions';
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

    if (!tier || !['starter', 'pro', 'business'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
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
    
    // Immediate downgrade
    await updateSubscriptionTier(session.user.id, tier as SubscriptionTier, true);
    
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
      message: `Successfully downgraded to ${tier} tier`,
      subscription: {
        tier: updatedSubscription.tier,
        status: updatedSubscription.status,
        expires_at: updatedSubscription.expires_at,
      }
    });
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    return NextResponse.json(
      { error: 'Failed to downgrade subscription' },
      { status: 500 }
    );
  }
}
