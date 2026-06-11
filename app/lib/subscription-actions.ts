/**
 * Client-side subscription action functions.
 * 
 * These functions provide a consistent interface for interacting with 
 * subscription API endpoints from client components.
 */

'use client';

import { SubscriptionTier } from './definitions';

/**
 * Result structure for subscription actions
 */
export type SubscriptionActionResult = {
  ok: boolean;
  error?: string;
  data?: any;
};

/**
 * Initializes a subscription upgrade by creating a Paystack payment.
 * 
 * @param tier - The target subscription tier ('pro' or 'business')
 * @param callbackUrl - URL to redirect to after payment completion
 * @returns Result object with authorization_url and reference on success
 */
export async function upgradeSubscription(
  tier: SubscriptionTier,
  callbackUrl: string
): Promise<SubscriptionActionResult> {
  try {
    const response = await fetch('/api/subscriptions/initialize', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ tier, callbackUrl })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        ok: false, 
        error: data.error || 'Failed to initialize subscription upgrade' 
      };
    }
    
    return { 
      ok: true, 
      data: {
        authorization_url: data.authorization_url,
        reference: data.reference,
        email: data.email
      }
    };
  } catch (error) {
    console.error('Network error upgrading subscription:', error);
    return { 
      ok: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
}

/**
 * Starts a trial period for a paid subscription tier.
 * Sets subscription status to 'trial' with 14-day expiry.
 * 
 * @param tier - The target subscription tier ('pro' or 'business')
 * @returns Result object with updated subscription info on success
 */
export async function startTrial(
  tier: SubscriptionTier
): Promise<SubscriptionActionResult> {
  try {
    const response = await fetch('/api/subscriptions/trial', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ tier })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        ok: false, 
        error: data.error || 'Failed to start trial' 
      };
    }
    
    return { 
      ok: true, 
      data: data.subscription 
    };
  } catch (error) {
    console.error('Network error starting trial:', error);
    return { 
      ok: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
}

/**
 * Cancels the current subscription.
 * Access is maintained until the current billing period ends.
 * 
 * @returns Result object with cancellation details on success
 */
export async function cancelSubscription(): Promise<SubscriptionActionResult> {
  try {
    const response = await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        ok: false, 
        error: data.error || 'Failed to cancel subscription' 
      };
    }
    
    return { 
      ok: true, 
      data: {
        subscription: data.subscription,
        note: data.note
      }
    };
  } catch (error) {
    console.error('Network error cancelling subscription:', error);
    return { 
      ok: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
}

/**
 * Verifies a Paystack payment and activates the subscription.
 * 
 * @param reference - The Paystack payment reference to verify
 * @returns Result object with updated subscription info on success
 */
export async function verifyPayment(
  reference: string
): Promise<SubscriptionActionResult> {
  try {
    const response = await fetch('/api/subscriptions/verify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ reference })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        ok: false, 
        error: data.error || 'Failed to verify payment' 
      };
    }
    
    return { 
      ok: true, 
      data: data.subscription 
    };
  } catch (error) {
    console.error('Network error verifying payment:', error);
    return { 
      ok: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
}
