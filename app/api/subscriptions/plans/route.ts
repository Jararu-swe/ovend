/**
 * GET /api/subscriptions/plans
 * 
 * Returns all available subscription plans ordered by price.
 * This endpoint is public and does not require authentication.
 */

import { NextResponse } from 'next/server';
import { getSubscriptionPlans } from '@/app/lib/subscriptions';

export async function GET() {
  try {
    const plans = await getSubscriptionPlans();
    
    return NextResponse.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
