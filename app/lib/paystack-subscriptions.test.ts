/**
 * Unit tests for Paystack subscription payment functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeSubscriptionPayment, verifySubscriptionPayment } from './paystack-subscriptions';
import * as paystackModule from './paystack';
import * as subscriptionsModule from './subscriptions';

// Mock environment variable
const originalEnv = process.env;

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
  process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key';
});

afterEach(() => {
  process.env = originalEnv;
  vi.restoreAllMocks();
});

describe('initializeSubscriptionPayment', () => {
  it('should initialize payment with correct parameters for Pro tier', async () => {
    // Mock getSubscriptionPlan
    vi.spyOn(subscriptionsModule, 'getSubscriptionPlan').mockResolvedValue({
      id: 'plan-123',
      tier: 'pro',
      name: 'Pro',
      price_kobo: 150000,
      transaction_fee_percentage: 3.0,
      product_limit: 100,
      features: {
        analytics: true,
        team_members: false,
        custom_domain: false,
        priority_support: true,
        theme_level: 'premium'
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    });

    // Mock fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          authorization_url: 'https://paystack.com/pay/xyz',
          reference: 'SUB-12345678-1234567890'
        }
      })
    });
    global.fetch = mockFetch;

    const result = await initializeSubscriptionPayment({
      vendorId: '12345678-1234-1234-1234-123456789012',
      tier: 'pro',
      email: 'vendor@example.com',
      callbackUrl: 'https://example.com/callback'
    });

    expect(result.ok).toBe(true);
    expect(result.authorization_url).toBe('https://paystack.com/pay/xyz');
    expect(result.reference).toMatch(/^SUB-/);
    
    // Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.paystack.co/transaction/initialize',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sk_test_mock_secret_key',
          'Content-Type': 'application/json'
        }),
        body: expect.stringContaining('150000') // Pro tier price
      })
    );

    // Verify metadata includes vendorId and tier
    const bodyData = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(bodyData.metadata).toEqual({
      vendorId: '12345678-1234-1234-1234-123456789012',
      tier: 'pro',
      type: 'subscription'
    });
  });

  it('should initialize payment with correct parameters for Business tier', async () => {
    // Mock getSubscriptionPlan
    vi.spyOn(subscriptionsModule, 'getSubscriptionPlan').mockResolvedValue({
      id: 'plan-456',
      tier: 'business',
      name: 'Business',
      price_kobo: 350000,
      transaction_fee_percentage: 2.0,
      product_limit: 1000,
      features: {
        analytics: true,
        advanced_analytics: true,
        team_members: true,
        custom_domain: true,
        priority_support: true,
        theme_level: 'exclusive'
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    });

    // Mock fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          authorization_url: 'https://paystack.com/pay/abc',
          reference: 'SUB-87654321-9876543210'
        }
      })
    });
    global.fetch = mockFetch;

    const result = await initializeSubscriptionPayment({
      vendorId: '87654321-4321-4321-4321-210987654321',
      tier: 'business',
      email: 'business@example.com',
      callbackUrl: 'https://example.com/callback'
    });

    expect(result.ok).toBe(true);
    expect(result.authorization_url).toBe('https://paystack.com/pay/abc');
    
    // Verify fetch was called with Business tier price
    const bodyData = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(bodyData.amount).toBe(350000);
    expect(bodyData.metadata.tier).toBe('business');
  });

  it('should generate unique reference with SUB- prefix', async () => {
    vi.spyOn(subscriptionsModule, 'getSubscriptionPlan').mockResolvedValue({
      id: 'plan-123',
      tier: 'pro',
      name: 'Pro',
      price_kobo: 150000,
      transaction_fee_percentage: 3.0,
      product_limit: 100,
      features: {
        analytics: true,
        team_members: false,
        custom_domain: false,
        priority_support: true,
        theme_level: 'premium'
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          authorization_url: 'https://paystack.com/pay/xyz',
          reference: 'SUB-12345678-1234567890'
        }
      })
    });
    global.fetch = mockFetch;

    await initializeSubscriptionPayment({
      vendorId: '12345678-1234-1234-1234-123456789012',
      tier: 'pro',
      email: 'vendor@example.com',
      callbackUrl: 'https://example.com/callback'
    });

    const bodyData = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(bodyData.reference).toMatch(/^SUB-12345678-\d+$/);
  });

  it('should return error when Paystack secret key is not configured', async () => {
    delete process.env.PAYSTACK_SECRET_KEY;

    const result = await initializeSubscriptionPayment({
      vendorId: '12345678-1234-1234-1234-123456789012',
      tier: 'pro',
      email: 'vendor@example.com',
      callbackUrl: 'https://example.com/callback'
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Paystack not configured');
  });

  it('should return error when subscription tier is invalid', async () => {
    vi.spyOn(subscriptionsModule, 'getSubscriptionPlan').mockResolvedValue(null);

    const result = await initializeSubscriptionPayment({
      vendorId: '12345678-1234-1234-1234-123456789012',
      tier: 'pro',
      email: 'vendor@example.com',
      callbackUrl: 'https://example.com/callback'
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Invalid subscription tier');
  });

  it('should return error when Paystack API fails', async () => {
    vi.spyOn(subscriptionsModule, 'getSubscriptionPlan').mockResolvedValue({
      id: 'plan-123',
      tier: 'pro',
      name: 'Pro',
      price_kobo: 150000,
      transaction_fee_percentage: 3.0,
      product_limit: 100,
      features: {
        analytics: true,
        team_members: false,
        custom_domain: false,
        priority_support: true,
        theme_level: 'premium'
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        status: false,
        message: 'Invalid API key'
      })
    });
    global.fetch = mockFetch;

    const result = await initializeSubscriptionPayment({
      vendorId: '12345678-1234-1234-1234-123456789012',
      tier: 'pro',
      email: 'vendor@example.com',
      callbackUrl: 'https://example.com/callback'
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Invalid API key');
  });

  it('should handle network errors gracefully', async () => {
    vi.spyOn(subscriptionsModule, 'getSubscriptionPlan').mockResolvedValue({
      id: 'plan-123',
      tier: 'pro',
      name: 'Pro',
      price_kobo: 150000,
      transaction_fee_percentage: 3.0,
      product_limit: 100,
      features: {
        analytics: true,
        team_members: false,
        custom_domain: false,
        priority_support: true,
        theme_level: 'premium'
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    });

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    const result = await initializeSubscriptionPayment({
      vendorId: '12345678-1234-1234-1234-123456789012',
      tier: 'pro',
      email: 'vendor@example.com',
      callbackUrl: 'https://example.com/callback'
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Network error');
  });
});

describe('verifySubscriptionPayment', () => {
  it('should verify subscription payment and extract metadata', async () => {
    vi.spyOn(paystackModule, 'verifyPaymentDetails').mockResolvedValue({
      ok: true,
      reference: 'SUB-12345678-1234567890',
      status: 'success',
      amount: 150000,
      currency: 'NGN',
      metadata: {
        vendorId: '12345678-1234-1234-1234-123456789012',
        tier: 'pro',
        type: 'subscription'
      },
      paid_at: '2024-01-01T12:00:00Z'
    });

    const result = await verifySubscriptionPayment('SUB-12345678-1234567890');

    expect(result.ok).toBe(true);
    expect(result.vendorId).toBe('12345678-1234-1234-1234-123456789012');
    expect(result.tier).toBe('pro');
  });

  it('should verify Business tier subscription payment', async () => {
    vi.spyOn(paystackModule, 'verifyPaymentDetails').mockResolvedValue({
      ok: true,
      reference: 'SUB-87654321-9876543210',
      status: 'success',
      amount: 350000,
      currency: 'NGN',
      metadata: {
        vendorId: '87654321-4321-4321-4321-210987654321',
        tier: 'business',
        type: 'subscription'
      },
      paid_at: '2024-01-01T12:00:00Z'
    });

    const result = await verifySubscriptionPayment('SUB-87654321-9876543210');

    expect(result.ok).toBe(true);
    expect(result.vendorId).toBe('87654321-4321-4321-4321-210987654321');
    expect(result.tier).toBe('business');
  });

  it('should return error when payment verification fails', async () => {
    vi.spyOn(paystackModule, 'verifyPaymentDetails').mockResolvedValue({
      ok: false,
      error: 'Payment not found'
    });

    const result = await verifySubscriptionPayment('INVALID-REF');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Payment not found');
  });

  it('should return error when payment is not a subscription type', async () => {
    vi.spyOn(paystackModule, 'verifyPaymentDetails').mockResolvedValue({
      ok: true,
      reference: 'OVD-12345678-1234567890',
      status: 'success',
      amount: 5000,
      currency: 'NGN',
      metadata: {
        orderId: 'order-123',
        vendorId: '12345678-1234-1234-1234-123456789012',
        type: 'order'
      },
      paid_at: '2024-01-01T12:00:00Z'
    });

    const result = await verifySubscriptionPayment('OVD-12345678-1234567890');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Not a subscription payment');
  });

  it('should handle missing metadata gracefully', async () => {
    vi.spyOn(paystackModule, 'verifyPaymentDetails').mockResolvedValue({
      ok: true,
      reference: 'SUB-12345678-1234567890',
      status: 'success',
      amount: 150000,
      currency: 'NGN',
      metadata: {},
      paid_at: '2024-01-01T12:00:00Z'
    });

    const result = await verifySubscriptionPayment('SUB-12345678-1234567890');

    expect(result.ok).toBe(false);
    expect(result.error).toBe('Not a subscription payment');
  });
});
