/**
 * Paystack Subscription Payment Integration
 * 
 * This module provides functions for processing subscription payments through Paystack.
 * It handles payment initialization, verification, and metadata extraction for
 * subscription tier upgrades.
 */

import { verifyPaymentDetails, PaystackVerifyDetails } from './paystack';
import { getSubscriptionPlan } from './subscriptions';
import { SubscriptionTier } from './definitions';

/**
 * Request parameters for initializing a subscription payment.
 */
export interface SubscriptionPaymentRequest {
  vendorId: string;
  tier: 'pro' | 'business';
  email: string;
  callbackUrl: string;
}

/**
 * Result of subscription payment initialization.
 */
export interface SubscriptionPaymentInitResult {
  ok: boolean;
  authorization_url?: string;
  reference?: string;
  error?: string;
}

/**
 * Result of subscription payment verification.
 */
export interface SubscriptionPaymentVerifyResult {
  ok: boolean;
  vendorId?: string;
  tier?: string;
  error?: string;
}

/**
 * Initializes a subscription payment transaction with Paystack.
 * Creates a Paystack transaction with subscription-specific metadata.
 * 
 * @param request - Subscription payment request parameters
 * @returns Payment initialization result with authorization URL and reference
 * 
 * @example
 * ```typescript
 * const result = await initializeSubscriptionPayment({
 *   vendorId: 'vendor-123',
 *   tier: 'pro',
 *   email: 'vendor@example.com',
 *   callbackUrl: 'https://app.vendle.com/dashboard/billing'
 * });
 * 
 * if (result.ok) {
 *   // Redirect user to result.authorization_url
 * }
 * ```
 */
export async function initializeSubscriptionPayment(
  request: SubscriptionPaymentRequest
): Promise<SubscriptionPaymentInitResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  
  if (!secretKey) {
    return { ok: false, error: 'Paystack not configured' };
  }
  
  // Get plan price
  const plan = await getSubscriptionPlan(request.tier);
  if (!plan) {
    return { ok: false, error: 'Invalid subscription tier' };
  }
  
  // Generate unique reference with SUB- prefix
  const reference = `SUB-${request.vendorId.slice(0, 8)}-${Date.now()}`;
  
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: request.email,
        amount: plan.price_kobo,
        reference,
        callback_url: request.callbackUrl,
        metadata: {
          vendorId: request.vendorId,
          tier: request.tier,
          type: 'subscription'
        }
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.status) {
      return { ok: false, error: data.message || 'Payment initialization failed' };
    }
    
    return {
      ok: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Payment initialization error' };
  }
}

/**
 * Verifies a subscription payment and extracts subscription metadata.
 * Uses Paystack's payment verification API to validate the transaction
 * and extract vendor ID and tier information.
 * 
 * @param reference - The Paystack payment reference to verify
 * @returns Verification result with vendor ID and tier if successful
 * 
 * @example
 * ```typescript
 * const result = await verifySubscriptionPayment('SUB-abc123-1234567890');
 * 
 * if (result.ok) {
 *   // Process subscription activation
 *   await recordSubscriptionPayment(
 *     result.vendorId,
 *     result.tier,
 *     amount,
 *     reference
 *   );
 * }
 * ```
 */
export async function verifySubscriptionPayment(
  reference: string
): Promise<SubscriptionPaymentVerifyResult> {
  const result = await verifyPaymentDetails(reference);
  
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  
  const metadata = result.metadata || {};
  
  if (metadata.type !== 'subscription') {
    return { ok: false, error: 'Not a subscription payment' };
  }
  
  return {
    ok: true,
    vendorId: metadata.vendorId,
    tier: metadata.tier
  };
}
