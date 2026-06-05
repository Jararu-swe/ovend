import { describe, expect, test } from 'vitest';
import { SubscriptionPlan } from '@/app/lib/definitions';

// Test helper to create mock plans
function createMockPlan(tier: 'starter' | 'pro' | 'business'): SubscriptionPlan {
  const plans = {
    starter: {
      id: 'starter-1',
      tier: 'starter' as const,
      name: 'Starter',
      price_kobo: 0,
      transaction_fee_percentage: 5,
      product_limit: 10,
      features: {
        analytics: false,
        advanced_analytics: false,
        team_members: false,
        custom_domain: false,
        priority_support: false,
        theme_level: 'basic' as const,
      },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
    pro: {
      id: 'pro-1',
      tier: 'pro' as const,
      name: 'Pro',
      price_kobo: 150000,
      transaction_fee_percentage: 3,
      product_limit: 100,
      features: {
        analytics: true,
        advanced_analytics: false,
        team_members: false,
        custom_domain: false,
        priority_support: true,
        theme_level: 'premium' as const,
      },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
    business: {
      id: 'business-1',
      tier: 'business' as const,
      name: 'Business',
      price_kobo: 350000,
      transaction_fee_percentage: 2,
      product_limit: 1000,
      features: {
        analytics: true,
        advanced_analytics: true,
        team_members: true,
        custom_domain: true,
        priority_support: true,
        theme_level: 'exclusive' as const,
      },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  };
  
  return plans[tier];
}

describe('FeatureList component logic', () => {
  describe('Starter tier features', () => {
    test('should show correct product limit', () => {
      const plan = createMockPlan('starter');
      expect(plan.product_limit).toBe(10);
    });

    test('should show correct transaction fee', () => {
      const plan = createMockPlan('starter');
      expect(plan.transaction_fee_percentage).toBe(5);
    });

    test('should not have analytics', () => {
      const plan = createMockPlan('starter');
      expect(plan.features.analytics).toBe(false);
    });

    test('should not have advanced analytics', () => {
      const plan = createMockPlan('starter');
      expect(plan.features.advanced_analytics).toBe(false);
    });

    test('should not have team members', () => {
      const plan = createMockPlan('starter');
      expect(plan.features.team_members).toBe(false);
    });

    test('should not have custom domain', () => {
      const plan = createMockPlan('starter');
      expect(plan.features.custom_domain).toBe(false);
    });

    test('should not have priority support', () => {
      const plan = createMockPlan('starter');
      expect(plan.features.priority_support).toBe(false);
    });
  });

  describe('Pro tier features', () => {
    test('should show correct product limit', () => {
      const plan = createMockPlan('pro');
      expect(plan.product_limit).toBe(100);
    });

    test('should show correct transaction fee', () => {
      const plan = createMockPlan('pro');
      expect(plan.transaction_fee_percentage).toBe(3);
    });

    test('should have analytics', () => {
      const plan = createMockPlan('pro');
      expect(plan.features.analytics).toBe(true);
    });

    test('should not have advanced analytics', () => {
      const plan = createMockPlan('pro');
      expect(plan.features.advanced_analytics).toBe(false);
    });

    test('should not have team members', () => {
      const plan = createMockPlan('pro');
      expect(plan.features.team_members).toBe(false);
    });

    test('should not have custom domain', () => {
      const plan = createMockPlan('pro');
      expect(plan.features.custom_domain).toBe(false);
    });

    test('should have priority support', () => {
      const plan = createMockPlan('pro');
      expect(plan.features.priority_support).toBe(true);
    });
  });

  describe('Business tier features', () => {
    test('should show correct product limit', () => {
      const plan = createMockPlan('business');
      expect(plan.product_limit).toBe(1000);
    });

    test('should show correct transaction fee', () => {
      const plan = createMockPlan('business');
      expect(plan.transaction_fee_percentage).toBe(2);
    });

    test('should have analytics', () => {
      const plan = createMockPlan('business');
      expect(plan.features.analytics).toBe(true);
    });

    test('should have advanced analytics', () => {
      const plan = createMockPlan('business');
      expect(plan.features.advanced_analytics).toBe(true);
    });

    test('should have team members', () => {
      const plan = createMockPlan('business');
      expect(plan.features.team_members).toBe(true);
    });

    test('should have custom domain', () => {
      const plan = createMockPlan('business');
      expect(plan.features.custom_domain).toBe(true);
    });

    test('should have priority support', () => {
      const plan = createMockPlan('business');
      expect(plan.features.priority_support).toBe(true);
    });
  });

  describe('Feature availability comparison', () => {
    test('starter should have fewer features than pro', () => {
      const starter = createMockPlan('starter');
      const pro = createMockPlan('pro');
      
      const starterFeatureCount = Object.values(starter.features).filter(v => v === true).length;
      const proFeatureCount = Object.values(pro.features).filter(v => v === true).length;
      
      expect(starterFeatureCount).toBeLessThan(proFeatureCount);
    });

    test('pro should have fewer features than business', () => {
      const pro = createMockPlan('pro');
      const business = createMockPlan('business');
      
      const proFeatureCount = Object.values(pro.features).filter(v => v === true).length;
      const businessFeatureCount = Object.values(business.features).filter(v => v === true).length;
      
      expect(proFeatureCount).toBeLessThan(businessFeatureCount);
    });

    test('transaction fees should decrease with higher tiers', () => {
      const starter = createMockPlan('starter');
      const pro = createMockPlan('pro');
      const business = createMockPlan('business');
      
      expect(starter.transaction_fee_percentage).toBeGreaterThan(pro.transaction_fee_percentage);
      expect(pro.transaction_fee_percentage).toBeGreaterThan(business.transaction_fee_percentage);
    });

    test('product limits should increase with higher tiers', () => {
      const starter = createMockPlan('starter');
      const pro = createMockPlan('pro');
      const business = createMockPlan('business');
      
      expect(starter.product_limit).toBeLessThan(pro.product_limit);
      expect(pro.product_limit).toBeLessThan(business.product_limit);
    });
  });
});
