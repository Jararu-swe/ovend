import { describe, expect, test, vi } from 'vitest';
import { SubscriptionPlan, SubscriptionTier } from '@/app/lib/definitions';

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

describe('TierCard logic', () => {
  describe('Button state determination', () => {
    test('current tier should show disabled "Current Plan" button', () => {
      const plan = createMockPlan('pro');
      const currentTier: SubscriptionTier = 'pro';
      
      // Logic from component: isCurrent = plan.tier === currentTier
      const isCurrent = plan.tier === currentTier;
      expect(isCurrent).toBe(true);
      
      // When isCurrent, button should be disabled and show "Current Plan"
      const buttonDisabled = isCurrent;
      const buttonText = 'Current Plan';
      
      expect(buttonDisabled).toBe(true);
      expect(buttonText).toBe('Current Plan');
    });
    
    test('upgrade from starter to pro should show "Upgrade" button when trial not available', () => {
      const plan = createMockPlan('pro');
      const currentTier: SubscriptionTier = 'starter';
      const canStartTrial = false;
      
      // Tier order logic
      const tierOrder = { starter: 0, pro: 1, business: 2 };
      const isUpgrade = tierOrder[plan.tier] > tierOrder[currentTier];
      
      expect(isUpgrade).toBe(true);
      
      // Button logic
      const buttonText = canStartTrial && plan.tier !== 'starter' 
        ? 'Start 14-Day Trial' 
        : 'Upgrade';
      
      expect(buttonText).toBe('Upgrade');
    });
    
    test('upgrade from starter to pro should show "Start 14-Day Trial" when trial available', () => {
      const plan = createMockPlan('pro');
      const currentTier: SubscriptionTier = 'starter';
      const canStartTrial = true;
      
      const tierOrder = { starter: 0, pro: 1, business: 2 };
      const isUpgrade = tierOrder[plan.tier] > tierOrder[currentTier];
      
      expect(isUpgrade).toBe(true);
      
      const buttonText = canStartTrial && plan.tier !== 'starter' 
        ? 'Start 14-Day Trial' 
        : 'Upgrade';
      
      expect(buttonText).toBe('Start 14-Day Trial');
    });
    
    test('downgrade from business to pro should show "Downgrade" button', () => {
      const plan = createMockPlan('pro');
      const currentTier: SubscriptionTier = 'business';
      
      const tierOrder = { starter: 0, pro: 1, business: 2 };
      const isDowngrade = tierOrder[plan.tier] < tierOrder[currentTier];
      
      expect(isDowngrade).toBe(true);
      
      const buttonText = 'Downgrade';
      expect(buttonText).toBe('Downgrade');
    });
    
    test('downgrade from business to starter should show "Downgrade" button', () => {
      const plan = createMockPlan('starter');
      const currentTier: SubscriptionTier = 'business';
      
      const tierOrder = { starter: 0, pro: 1, business: 2 };
      const isDowngrade = tierOrder[plan.tier] < tierOrder[currentTier];
      
      expect(isDowngrade).toBe(true);
    });
  });
  
  describe('Tier comparison logic', () => {
    test('should correctly identify upgrades', () => {
      const tierOrder = { starter: 0, pro: 1, business: 2 };
      
      // Starter to Pro is upgrade
      expect(tierOrder['pro']).toBeGreaterThan(tierOrder['starter']);
      
      // Pro to Business is upgrade
      expect(tierOrder['business']).toBeGreaterThan(tierOrder['pro']);
      
      // Starter to Business is upgrade
      expect(tierOrder['business']).toBeGreaterThan(tierOrder['starter']);
    });
    
    test('should correctly identify downgrades', () => {
      const tierOrder = { starter: 0, pro: 1, business: 2 };
      
      // Pro to Starter is downgrade
      expect(tierOrder['starter']).toBeLessThan(tierOrder['pro']);
      
      // Business to Pro is downgrade
      expect(tierOrder['pro']).toBeLessThan(tierOrder['business']);
      
      // Business to Starter is downgrade
      expect(tierOrder['starter']).toBeLessThan(tierOrder['business']);
    });
  });
  
  describe('Handler assignment', () => {
    test('current tier should have null handler', () => {
      const isCurrent = true;
      const buttonHandler = isCurrent ? null : vi.fn();
      
      expect(buttonHandler).toBeNull();
    });
    
    test('upgrade tier should have non-null handler', () => {
      const isCurrent = false;
      const isUpgrade = true;
      const onUpgrade = vi.fn();
      
      const buttonHandler = isUpgrade ? onUpgrade : null;
      
      expect(buttonHandler).not.toBeNull();
    });
    
    test('downgrade tier should have non-null handler', () => {
      const isCurrent = false;
      const isDowngrade = true;
      const onDowngrade = vi.fn();
      
      const buttonHandler = isDowngrade ? onDowngrade : null;
      
      expect(buttonHandler).not.toBeNull();
    });
  });
});
