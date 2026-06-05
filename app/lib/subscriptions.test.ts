/**
 * Unit tests for subscription data access functions
 * 
 * Note: These are integration tests that require a database connection.
 * Run the setup script first: node scripts/setup-subscription-schema.js
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  ensureSubscriptionSchema,
  getSubscriptionPlans,
  getSubscriptionPlan,
  getVendorSubscription,
  hasFeatureAccess,
  getProductLimit,
  getTransactionFeePercentage,
  canCreateProduct,
} from './subscriptions';

describe('Subscription Data Access Functions', () => {
  describe('ensureSubscriptionSchema', () => {
    it('should create schema without errors', async () => {
      await expect(ensureSubscriptionSchema()).resolves.not.toThrow();
    });
  });

  describe('getSubscriptionPlans', () => {
    beforeAll(async () => {
      await ensureSubscriptionSchema();
    });

    it('should return all subscription plans', async () => {
      const plans = await getSubscriptionPlans();
      
      expect(plans).toBeDefined();
      expect(plans.length).toBe(3);
      
      // Verify plans are ordered by price
      expect(plans[0].tier).toBe('starter');
      expect(plans[1].tier).toBe('pro');
      expect(plans[2].tier).toBe('business');
    });

    it('should return plans with correct structure', async () => {
      const plans = await getSubscriptionPlans();
      const starterPlan = plans[0];
      
      expect(starterPlan).toHaveProperty('id');
      expect(starterPlan).toHaveProperty('tier');
      expect(starterPlan).toHaveProperty('name');
      expect(starterPlan).toHaveProperty('price_kobo');
      expect(starterPlan).toHaveProperty('transaction_fee_percentage');
      expect(starterPlan).toHaveProperty('product_limit');
      expect(starterPlan).toHaveProperty('features');
    });

    it('should have correct starter plan configuration', async () => {
      const plans = await getSubscriptionPlans();
      const starterPlan = plans.find(p => p.tier === 'starter');
      
      expect(starterPlan?.name).toBe('Starter');
      expect(starterPlan?.price_kobo).toBe(0);
      expect(starterPlan?.transaction_fee_percentage).toBe(5.0);
      expect(starterPlan?.product_limit).toBe(10);
    });

    it('should have correct pro plan configuration', async () => {
      const plans = await getSubscriptionPlans();
      const proPlan = plans.find(p => p.tier === 'pro');
      
      expect(proPlan?.name).toBe('Pro');
      expect(proPlan?.price_kobo).toBe(150000);
      expect(proPlan?.transaction_fee_percentage).toBe(3.0);
      expect(proPlan?.product_limit).toBe(100);
    });

    it('should have correct business plan configuration', async () => {
      const plans = await getSubscriptionPlans();
      const businessPlan = plans.find(p => p.tier === 'business');
      
      expect(businessPlan?.name).toBe('Business');
      expect(businessPlan?.price_kobo).toBe(350000);
      expect(businessPlan?.transaction_fee_percentage).toBe(2.0);
      expect(businessPlan?.product_limit).toBe(1000);
    });
  });

  describe('getSubscriptionPlan', () => {
    beforeAll(async () => {
      await ensureSubscriptionSchema();
    });

    it('should return starter plan details', async () => {
      const plan = await getSubscriptionPlan('starter');
      
      expect(plan).toBeDefined();
      expect(plan?.tier).toBe('starter');
      expect(plan?.name).toBe('Starter');
    });

    it('should return pro plan details', async () => {
      const plan = await getSubscriptionPlan('pro');
      
      expect(plan).toBeDefined();
      expect(plan?.tier).toBe('pro');
      expect(plan?.name).toBe('Pro');
    });

    it('should return business plan details', async () => {
      const plan = await getSubscriptionPlan('business');
      
      expect(plan).toBeDefined();
      expect(plan?.tier).toBe('business');
      expect(plan?.name).toBe('Business');
    });
  });

  describe('Feature Access Logic', () => {
    it('starter tier should not have analytics', async () => {
      const plan = await getSubscriptionPlan('starter');
      expect(plan?.features.analytics).toBe(false);
    });

    it('starter tier should not have team members', async () => {
      const plan = await getSubscriptionPlan('starter');
      expect(plan?.features.team_members).toBe(false);
    });

    it('pro tier should have analytics', async () => {
      const plan = await getSubscriptionPlan('pro');
      expect(plan?.features.analytics).toBe(true);
    });

    it('pro tier should not have advanced analytics', async () => {
      const plan = await getSubscriptionPlan('pro');
      expect(plan?.features.advanced_analytics).toBe(undefined);
    });

    it('business tier should have all features', async () => {
      const plan = await getSubscriptionPlan('business');
      expect(plan?.features.analytics).toBe(true);
      expect(plan?.features.advanced_analytics).toBe(true);
      expect(plan?.features.team_members).toBe(true);
      expect(plan?.features.custom_domain).toBe(true);
      expect(plan?.features.priority_support).toBe(true);
    });
  });

  describe('Product Limits', () => {
    it('should return correct product limits for each tier', async () => {
      const starterPlan = await getSubscriptionPlan('starter');
      const proPlan = await getSubscriptionPlan('pro');
      const businessPlan = await getSubscriptionPlan('business');
      
      expect(starterPlan?.product_limit).toBe(10);
      expect(proPlan?.product_limit).toBe(100);
      expect(businessPlan?.product_limit).toBe(1000);
    });
  });

  describe('Transaction Fees', () => {
    it('should return correct transaction fees for each tier', async () => {
      const starterPlan = await getSubscriptionPlan('starter');
      const proPlan = await getSubscriptionPlan('pro');
      const businessPlan = await getSubscriptionPlan('business');
      
      expect(starterPlan?.transaction_fee_percentage).toBe(5.0);
      expect(proPlan?.transaction_fee_percentage).toBe(3.0);
      expect(businessPlan?.transaction_fee_percentage).toBe(2.0);
    });
  });

  describe('Theme Levels', () => {
    it('should have correct theme levels for each tier', async () => {
      const starterPlan = await getSubscriptionPlan('starter');
      const proPlan = await getSubscriptionPlan('pro');
      const businessPlan = await getSubscriptionPlan('business');
      
      expect(starterPlan?.features.theme_level).toBe('basic');
      expect(proPlan?.features.theme_level).toBe('premium');
      expect(businessPlan?.features.theme_level).toBe('exclusive');
    });
  });

  describe('Priority Support', () => {
    it('starter tier should not have priority support', async () => {
      const plan = await getSubscriptionPlan('starter');
      expect(plan?.features.priority_support).toBe(false);
    });

    it('pro tier should have priority support', async () => {
      const plan = await getSubscriptionPlan('pro');
      expect(plan?.features.priority_support).toBe(true);
    });

    it('business tier should have priority support', async () => {
      const plan = await getSubscriptionPlan('business');
      expect(plan?.features.priority_support).toBe(true);
    });
  });
});

describe('Feature Access Control Functions', () => {
  // Note: These tests require a test vendor to be set up in the database
  // In a production environment, these would use test fixtures or mocks
  
  describe('hasFeatureAccess', () => {
    it('should return false for non-existent vendor', async () => {
      const hasAccess = await hasFeatureAccess('non-existent-id', 'analytics');
      expect(hasAccess).toBe(false);
    });

    // Note: Full tests for hasFeatureAccess require test vendor setup
    // These would test:
    // - Analytics access for starter tier (should be false)
    // - Analytics access for pro tier (should be true)
    // - Analytics access for business tier (should be true)
    // - Team members access for starter tier (should be false)
    // - Team members access for pro tier (should be false)
    // - Team members access for business tier (should be true)
    // - Access during grace period (should maintain access)
    // - Access after grace period (should deny access)
    // - Access during trial period (should allow access)
  });

  describe('getProductLimit', () => {
    it('should return default starter limit for non-existent vendor', async () => {
      const limit = await getProductLimit('non-existent-id');
      expect(limit).toBe(10);
    });

    // Note: Full tests for getProductLimit require test vendor setup
    // These would test:
    // - Starter tier returns 10 product limit
    // - Pro tier returns 100 product limit
    // - Business tier returns 1000 product limit
  });

  describe('getTransactionFeePercentage', () => {
    it('should return default starter fee for non-existent vendor', async () => {
      const fee = await getTransactionFeePercentage('non-existent-id');
      expect(fee).toBe(5.0);
    });

    // Note: Full tests for getTransactionFeePercentage require test vendor setup
    // These would test:
    // - Starter tier returns 5.0% fee
    // - Pro tier returns 3.0% fee
    // - Business tier returns 2.0% fee
  });

  describe('canCreateProduct', () => {
    it('should return allowed for non-existent vendor (no products)', async () => {
      const result = await canCreateProduct('non-existent-id');
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    // Note: Full tests for canCreateProduct require test vendor and products setup
    // These would test:
    // - Allowed when under product limit
    // - Denied when at product limit
    // - Correct limit enforcement for each tier
    // - Correct error message when limit reached
  });
});

describe('Subscription Lifecycle Management', () => {
  // Note: These tests would require database transaction support for proper cleanup
  
  describe('getVendorSubscription', () => {
    it('should return null for non-existent vendor', async () => {
      const subscription = await getVendorSubscription('non-existent-id');
      expect(subscription).toBeNull();
    });

    // Note: Full tests for getVendorSubscription require test vendor setup
    // These would test:
    // - Returns correct subscription info for active subscription
    // - Calculates grace_days_remaining correctly for past_due status
    // - Calculates trial_days_remaining correctly for trial status
    // - Sets grace_days_remaining to null for non-past_due status
    // - Sets trial_days_remaining to null for non-trial status
    // - Returns correct plan details with features
  });

  // Note: Additional lifecycle management function tests would be added here:
  // - updateSubscriptionTier
  // - recordSubscriptionPayment
  // - handlePaymentFailure
  // - startTrial
  // - cancelSubscription
});
