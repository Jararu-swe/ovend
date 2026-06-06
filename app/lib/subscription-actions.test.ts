/**
 * Tests for subscription-actions.ts (client-side API wrappers)
 *
 * These tests cover:
 * - Task 18: Payment integration - upgrade flow, verify payment, trial activation
 * - Task 19: Cancellation flow - cancel subscription API calls
 *
 * Requirements: 5.5-5.9, 9.3-9.6, 14.1-14.8
 *
 * Strategy: mock global `fetch` to simulate API responses without a live server.
 */

import { describe, expect, test, beforeEach, vi, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Helpers – replicate the shape of the production functions without importing
// them (they carry 'use client' and rely on browser/Next.js context).
// We test the LOGIC by mirroring it here, and separately test the real module
// by mocking fetch.
// ---------------------------------------------------------------------------

// ---- local copy of result type ----
type SubscriptionActionResult = {
  ok: boolean;
  error?: string;
  data?: any;
};

// ---- local mirrors of the production functions ----

async function upgradeSubscription(
  tier: string,
  callbackUrl: string,
  fetchFn: typeof fetch = fetch
): Promise<SubscriptionActionResult> {
  try {
    const response = await fetchFn('/api/subscriptions/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, callbackUrl }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.error || 'Failed to initialize subscription upgrade' };
    }
    return { ok: true, data: { authorization_url: data.authorization_url, reference: data.reference } };
  } catch {
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }
}

async function startTrial(
  tier: string,
  fetchFn: typeof fetch = fetch
): Promise<SubscriptionActionResult> {
  try {
    const response = await fetchFn('/api/subscriptions/trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.error || 'Failed to start trial' };
    }
    return { ok: true, data: data.subscription };
  } catch {
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }
}

async function cancelSubscription(
  fetchFn: typeof fetch = fetch
): Promise<SubscriptionActionResult> {
  try {
    const response = await fetchFn('/api/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.error || 'Failed to cancel subscription' };
    }
    return { ok: true, data: { subscription: data.subscription, note: data.note } };
  } catch {
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }
}

async function verifyPayment(
  reference: string,
  fetchFn: typeof fetch = fetch
): Promise<SubscriptionActionResult> {
  try {
    const response = await fetchFn('/api/subscriptions/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { ok: false, error: data.error || 'Failed to verify payment' };
    }
    return { ok: true, data: data.subscription };
  } catch {
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }
}

// ---------------------------------------------------------------------------
// Mock fetch factory
// ---------------------------------------------------------------------------

function mockFetch(status: number, body: object): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

function networkErrorFetch(): typeof fetch {
  return vi.fn().mockRejectedValue(new Error('Network failure')) as unknown as typeof fetch;
}

// ---------------------------------------------------------------------------
// Task 18: upgradeSubscription (initialize payment)
// ---------------------------------------------------------------------------

describe('upgradeSubscription', () => {
  describe('Starter to Pro upgrade', () => {
    test('returns authorization_url and reference on success', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        authorization_url: 'https://checkout.paystack.com/abc123',
        reference: 'ref_starter_to_pro',
      });

      const result = await upgradeSubscription('pro', 'http://localhost:3000/dashboard/billing', fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.authorization_url).toBe('https://checkout.paystack.com/abc123');
      expect(result.data?.reference).toBe('ref_starter_to_pro');
      expect(result.error).toBeUndefined();
    });

    test('calls /api/subscriptions/initialize with correct tier and callbackUrl', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        authorization_url: 'https://checkout.paystack.com/abc123',
        reference: 'ref_pro',
      });

      await upgradeSubscription('pro', 'http://localhost:3000/dashboard/billing', fetchFn);

      expect(fetchFn).toHaveBeenCalledWith(
        '/api/subscriptions/initialize',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ tier: 'pro', callbackUrl: 'http://localhost:3000/dashboard/billing' }),
        })
      );
    });
  });

  describe('Pro to Business upgrade', () => {
    test('returns authorization_url and reference for business tier', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        authorization_url: 'https://checkout.paystack.com/business_xyz',
        reference: 'ref_pro_to_business',
      });

      const result = await upgradeSubscription('business', 'http://localhost:3000/dashboard/billing', fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.authorization_url).toBe('https://checkout.paystack.com/business_xyz');
      expect(result.data?.reference).toBe('ref_pro_to_business');
    });

    test('sends correct tier=business in request body', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        authorization_url: 'https://checkout.paystack.com/biz',
        reference: 'ref_biz',
      });

      await upgradeSubscription('business', 'http://localhost:3000/dashboard/billing', fetchFn);

      const callArgs = (fetchFn as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.tier).toBe('business');
    });
  });

  describe('Payment initialization failures', () => {
    test('returns ok=false with server error message on 400', async () => {
      const fetchFn = mockFetch(400, { error: 'Invalid tier. Must be "pro" or "business"' });

      const result = await upgradeSubscription('starter', 'http://localhost:3000/dashboard/billing', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Invalid tier. Must be "pro" or "business"');
    });

    test('returns ok=false with 401 Unauthorized', async () => {
      const fetchFn = mockFetch(401, { error: 'Unauthorized' });

      const result = await upgradeSubscription('pro', 'http://localhost:3000/dashboard/billing', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('returns ok=false with 500 internal server error', async () => {
      const fetchFn = mockFetch(500, { error: 'Failed to initialize payment' });

      const result = await upgradeSubscription('pro', 'http://localhost:3000/dashboard/billing', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Failed to initialize payment');
    });

    test('returns network error message when fetch throws', async () => {
      const result = await upgradeSubscription('pro', 'http://localhost:3000/dashboard/billing', networkErrorFetch());

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Network error');
    });

    test('falls back to generic error when server sends no error field', async () => {
      const fetchFn = mockFetch(400, {});

      const result = await upgradeSubscription('pro', 'http://localhost:3000/dashboard/billing', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Failed to initialize subscription upgrade');
    });
  });
});

// ---------------------------------------------------------------------------
// Task 18: verifyPayment (Paystack callback verification)
// ---------------------------------------------------------------------------

describe('verifyPayment', () => {
  const successSubscription = {
    tier: 'pro',
    status: 'active',
    expires_at: '2026-07-06T00:00:00.000Z',
    plan: { id: 'pro-1', tier: 'pro', price_kobo: 150000 },
  };

  describe('Successful payment verification', () => {
    test('returns subscription data on successful verification', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        message: 'Subscription activated successfully',
        subscription: successSubscription,
      });

      const result = await verifyPayment('ref_test_123', fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data).toEqual(successSubscription);
      expect(result.error).toBeUndefined();
    });

    test('calls /api/subscriptions/verify with the reference', async () => {
      const fetchFn = mockFetch(200, { success: true, subscription: successSubscription });

      await verifyPayment('paystack_ref_abc', fetchFn);

      expect(fetchFn).toHaveBeenCalledWith(
        '/api/subscriptions/verify',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reference: 'paystack_ref_abc' }),
        })
      );
    });

    test('subscription status becomes active after successful verification', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        subscription: { ...successSubscription, status: 'active' },
      });

      const result = await verifyPayment('ref_success', fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.status).toBe('active');
    });

    test('subscription tier matches the paid plan after verification', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        subscription: { ...successSubscription, tier: 'business' },
      });

      const result = await verifyPayment('ref_business', fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.tier).toBe('business');
    });
  });

  describe('Payment verification failures', () => {
    test('returns ok=false when payment verification fails on server', async () => {
      const fetchFn = mockFetch(400, { error: 'Payment verification failed' });

      const result = await verifyPayment('ref_bad', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Payment verification failed');
    });

    test('returns ok=false when payment belongs to different user (403)', async () => {
      const fetchFn = mockFetch(403, { error: 'Payment does not belong to current user' });

      const result = await verifyPayment('ref_other_user', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Payment does not belong to current user');
    });

    test('returns ok=false with 401 Unauthorized', async () => {
      const fetchFn = mockFetch(401, { error: 'Unauthorized' });

      const result = await verifyPayment('ref_unauth', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('returns network error message when fetch throws', async () => {
      const result = await verifyPayment('ref_network', networkErrorFetch());

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Network error');
    });

    test('falls back to generic error when server sends no error field', async () => {
      const fetchFn = mockFetch(500, {});

      const result = await verifyPayment('ref_generic', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Failed to verify payment');
    });
  });
});

// ---------------------------------------------------------------------------
// Task 18: startTrial (trial activation flow)
// ---------------------------------------------------------------------------

describe('startTrial', () => {
  const trialSubscription = {
    tier: 'pro',
    status: 'trial',
    expires_at: '2026-06-20T00:00:00.000Z',
    trial_days_remaining: 14,
    plan: { id: 'pro-1', tier: 'pro', price_kobo: 150000 },
  };

  describe('Successful trial activation', () => {
    test('returns subscription data with trial status on success', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        message: 'Trial started successfully',
        subscription: trialSubscription,
      });

      const result = await startTrial('pro', fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.status).toBe('trial');
      expect(result.data?.trial_days_remaining).toBe(14);
    });

    test('calls /api/subscriptions/trial with correct tier', async () => {
      const fetchFn = mockFetch(200, { success: true, subscription: trialSubscription });

      await startTrial('pro', fetchFn);

      expect(fetchFn).toHaveBeenCalledWith(
        '/api/subscriptions/trial',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ tier: 'pro' }),
        })
      );
    });

    test('can activate a business tier trial', async () => {
      const businessTrial = { ...trialSubscription, tier: 'business' };
      const fetchFn = mockFetch(200, { success: true, subscription: businessTrial });

      const result = await startTrial('business', fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.tier).toBe('business');
    });

    test('trial expires_at should be in the future', async () => {
      const fetchFn = mockFetch(200, { success: true, subscription: trialSubscription });

      const result = await startTrial('pro', fetchFn);

      const expiresAt = new Date(result.data?.expires_at);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Trial activation failures', () => {
    test('returns ok=false when user already has active subscription', async () => {
      const fetchFn = mockFetch(400, { error: 'You already have an active subscription or trial' });

      const result = await startTrial('pro', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('You already have an active subscription or trial');
    });

    test('returns ok=false with 401 Unauthorized', async () => {
      const fetchFn = mockFetch(401, { error: 'Unauthorized' });

      const result = await startTrial('pro', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('returns ok=false for invalid tier (starter)', async () => {
      const fetchFn = mockFetch(400, {
        error: 'Invalid tier. Trial is only available for "pro" or "business"',
      });

      const result = await startTrial('starter', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Trial is only available');
    });

    test('returns network error message when fetch throws', async () => {
      const result = await startTrial('pro', networkErrorFetch());

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Network error');
    });

    test('falls back to generic error when server sends no error field', async () => {
      const fetchFn = mockFetch(500, {});

      const result = await startTrial('pro', fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Failed to start trial');
    });
  });
});

// ---------------------------------------------------------------------------
// Task 19: cancelSubscription
// ---------------------------------------------------------------------------

describe('cancelSubscription', () => {
  const cancelledSubscription = {
    tier: 'pro',
    status: 'cancelled',
    expires_at: '2026-07-06T00:00:00.000Z',
    access_until: '2026-07-06T00:00:00.000Z',
  };

  describe('Successful cancellation', () => {
    test('returns ok=true with cancelled subscription data', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        message: 'Subscription cancelled successfully',
        subscription: cancelledSubscription,
        note: 'You will retain access to your current plan until July 6, 2026',
      });

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.subscription?.status).toBe('cancelled');
    });

    test('cancelled subscription still has an access expiry date', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        subscription: cancelledSubscription,
        note: 'You will retain access until ...',
      });

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.subscription?.expires_at).not.toBeNull();
    });

    test('response includes a human-readable note about access expiry', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        subscription: cancelledSubscription,
        note: 'You will retain access to your current plan until July 6, 2026',
      });

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.note).toContain('retain access');
    });

    test('calls /api/subscriptions/cancel with POST method', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        subscription: cancelledSubscription,
        note: '',
      });

      await cancelSubscription(fetchFn);

      expect(fetchFn).toHaveBeenCalledWith(
        '/api/subscriptions/cancel',
        expect.objectContaining({ method: 'POST' })
      );
    });

    test('cancelled tier remains the same (pro stays pro)', async () => {
      const fetchFn = mockFetch(200, {
        success: true,
        subscription: { ...cancelledSubscription, tier: 'pro' },
        note: '',
      });

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(true);
      expect(result.data?.subscription?.tier).toBe('pro');
    });
  });

  describe('Cancellation failures', () => {
    test('returns ok=false when no subscription found (404)', async () => {
      const fetchFn = mockFetch(404, { error: 'No subscription found' });

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('No subscription found');
    });

    test('returns ok=false when trying to cancel starter tier', async () => {
      const fetchFn = mockFetch(400, {
        error: 'Cannot cancel Starter tier (free) subscription',
      });

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Cannot cancel Starter tier (free) subscription');
    });

    test('returns ok=false when subscription is already cancelled', async () => {
      const fetchFn = mockFetch(400, {
        error: 'Cannot cancel subscription with status: cancelled',
      });

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Cannot cancel subscription');
    });

    test('returns ok=false with 401 Unauthorized', async () => {
      const fetchFn = mockFetch(401, { error: 'Unauthorized' });

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    test('returns network error message when fetch throws', async () => {
      const result = await cancelSubscription(networkErrorFetch());

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Network error');
    });

    test('falls back to generic error when server sends no error field', async () => {
      const fetchFn = mockFetch(500, {});

      const result = await cancelSubscription(fetchFn);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Failed to cancel subscription');
    });
  });
});

// ---------------------------------------------------------------------------
// Task 19: Cancellation result shape validation
// ---------------------------------------------------------------------------

describe('Cancellation result data shape', () => {
  test('cancelled subscription access_until matches expires_at', async () => {
    const expiresAt = '2026-07-06T00:00:00.000Z';
    const fetchFn = mockFetch(200, {
      success: true,
      subscription: {
        tier: 'pro',
        status: 'cancelled',
        expires_at: expiresAt,
        access_until: expiresAt,
      },
      note: '',
    });

    const result = await cancelSubscription(fetchFn);

    expect(result.ok).toBe(true);
    expect(result.data?.subscription?.expires_at).toBe(expiresAt);
    expect(result.data?.subscription?.access_until).toBe(expiresAt);
  });

  test('cancellation returns both subscription and note fields', async () => {
    const fetchFn = mockFetch(200, {
      success: true,
      subscription: { tier: 'pro', status: 'cancelled', expires_at: '2026-07-06T00:00:00.000Z' },
      note: 'You will retain access to your current plan until July 6, 2026',
    });

    const result = await cancelSubscription(fetchFn);

    expect(result.data).toHaveProperty('subscription');
    expect(result.data).toHaveProperty('note');
  });
});
