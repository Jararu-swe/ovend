/**
 * Tests for feature-gate.ts (Feature Gate Utilities)
 *
 * These tests verify:
 * - FEATURE_GATE_ERRORS configuration
 * - requireFeature: throws for denied access, passes for granted access
 * - withFeatureGate: wraps handlers with feature gating
 * - featureGatedAction: returns structured results instead of throwing
 *
 * Primary focus: premium themes (theme_level) access for Starter vs Pro tiers.
 */

import { describe, expect, test, beforeEach, vi } from 'vitest';
import { auth } from '@/auth';
import { hasFeatureAccess, getVendorSubscription } from './subscriptions';

// Import the module under test
import {
  FEATURE_GATE_ERRORS,
  requireFeature,
  withFeatureGate,
  featureGatedAction,
  type FeatureGateResult,
} from './feature-gate';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

/**
 * Type-narrowing helper: asserts the result is a failure and returns the failure fields.
 * This lets TS infer the narrowed type after the assertion.
 */
function expectFailed<T>(
  result: FeatureGateResult<T>
): asserts result is { ok: false; error: string; requiresUpgrade: boolean; currentTier: string } {
  expect(result.ok).toBe(false);
}

function expectSucceeded<T>(
  result: FeatureGateResult<T>
): asserts result is { ok: true; data: T } {
  expect(result.ok).toBe(true);
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('./subscriptions', () => ({
  hasFeatureAccess: vi.fn(),
  getVendorSubscription: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_VENDOR_ID = 'vendor-123';

const starterSubscription = {
  tier: 'starter',
  plan: {
    name: 'Starter',
    tier: 'starter',
    features: {
      analytics: false,
      team_members: false,
      custom_domain: false,
      priority_support: false,
      theme_level: 'basic',
    },
  },
};

const proSubscription = {
  tier: 'pro',
  plan: {
    name: 'Pro',
    tier: 'pro',
    features: {
      analytics: true,
      team_members: false,
      custom_domain: false,
      priority_support: true,
      theme_level: 'premium',
    },
  },
};

const businessSubscription = {
  tier: 'business',
  plan: {
    name: 'Business',
    tier: 'business',
    features: {
      analytics: true,
      advanced_analytics: true,
      team_members: true,
      custom_domain: true,
      priority_support: true,
      theme_level: 'exclusive',
      hide_branding: true,
    },
  },
};

function mockAuthenticated(vendorId: string = MOCK_VENDOR_ID) {
  (auth as any).mockResolvedValue({
    user: { id: vendorId, role: 'vendor' },
  });
}

function mockUnauthenticated() {
  (auth as any).mockResolvedValue(null);
}

function mockStarterAccess() {
  mockAuthenticated();
  (hasFeatureAccess as any).mockImplementation(async (_vendorId: string, feature: string) => {
    const accessMap: Record<string, boolean> = {
      analytics: false,
      advanced_analytics: false,
      team_members: false,
      custom_domain: false,
      priority_support: false,
      theme_level: false,
      hide_branding: false,
    };
    return accessMap[feature] ?? false;
  });
  (getVendorSubscription as any).mockResolvedValue(starterSubscription);
}

function mockProAccess() {
  mockAuthenticated();
  (hasFeatureAccess as any).mockImplementation(async (_vendorId: string, feature: string) => {
    const accessMap: Record<string, boolean> = {
      analytics: true,
      advanced_analytics: false,
      team_members: false,
      custom_domain: false,
      priority_support: true,
      theme_level: true,
      hide_branding: false,
    };
    return accessMap[feature] ?? false;
  });
  (getVendorSubscription as any).mockResolvedValue(proSubscription);
}

function mockBusinessAccess() {
  mockAuthenticated();
  (hasFeatureAccess as any).mockResolvedValue(true);
  (getVendorSubscription as any).mockResolvedValue(businessSubscription);
}

// ---------------------------------------------------------------------------
// FEATURE_GATE_ERRORS Configuration
// ---------------------------------------------------------------------------

describe('FEATURE_GATE_ERRORS', () => {
  test('theme_level has correct error messages for premium theme denial', () => {
    const error = FEATURE_GATE_ERRORS.theme_level;
    expect(error.title).toBe('Premium Themes Unavailable');
    expect(error.message).toBe('Premium theme access requires Pro or Business tier.');
    expect(error.action).toBe('Upgrade to Pro');
  });

  test('analytics has correct error messages', () => {
    const error = FEATURE_GATE_ERRORS.analytics;
    expect(error.title).toBe('Analytics Unavailable');
    expect(error.message).toBe('Analytics dashboard requires Pro or Business tier.');
    expect(error.action).toBe('Upgrade to Pro');
  });

  test('advanced_analytics has correct error messages', () => {
    const error = FEATURE_GATE_ERRORS.advanced_analytics;
    expect(error.title).toBe('Advanced Analytics Unavailable');
    expect(error.message).toBe('Advanced analytics features require Business tier.');
    expect(error.action).toBe('Upgrade to Business');
  });

  test('team_members has correct error messages', () => {
    const error = FEATURE_GATE_ERRORS.team_members;
    expect(error.title).toBe('Team Management Unavailable');
    expect(error.message).toBe('Team member management requires Business tier.');
    expect(error.action).toBe('Upgrade to Business');
  });

  test('custom_domain has correct error messages', () => {
    const error = FEATURE_GATE_ERRORS.custom_domain;
    expect(error.title).toBe('Custom Domain Unavailable');
    expect(error.message).toBe('Custom domain configuration requires Business tier.');
    expect(error.action).toBe('Upgrade to Business');
  });

  test('priority_support has correct error messages', () => {
    const error = FEATURE_GATE_ERRORS.priority_support;
    expect(error.title).toBe('Priority Support Unavailable');
    expect(error.message).toBe('Priority support requires Pro or Business tier.');
    expect(error.action).toBe('Upgrade to Pro');
  });

  test('hide_branding has correct error messages', () => {
    const error = FEATURE_GATE_ERRORS.hide_branding;
    expect(error.title).toBe('Branding Customization Unavailable');
    expect(error.message).toBe('Removing Vendle branding requires Business tier.');
    expect(error.action).toBe('Upgrade to Business');
  });

  test('all feature error objects have title, message, and action', () => {
    const features = Object.values(FEATURE_GATE_ERRORS);
    features.forEach((error) => {
      expect(error).toHaveProperty('title');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('action');
    });
  });

  test('all feature error titles are unique', () => {
    const titles = Object.values(FEATURE_GATE_ERRORS).map((e) => e.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

// ---------------------------------------------------------------------------
// requireFeature
// ---------------------------------------------------------------------------

describe('requireFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Premium theme access (theme_level)', () => {
    test('throws for starter tier users trying to access premium themes', async () => {
      mockStarterAccess();
      await expect(requireFeature('theme_level')).rejects.toThrow(
        'Premium Themes Unavailable'
      );
    });

    test('throws error containing current plan name for starter tier', async () => {
      mockStarterAccess();
      await expect(requireFeature('theme_level')).rejects.toThrow('Starter');
    });

    test('throws error containing correct message about Pro/Business requirement', async () => {
      mockStarterAccess();
      await expect(requireFeature('theme_level')).rejects.toThrow(
        'Premium theme access requires Pro or Business tier'
      );
    });

    test('does not throw for pro tier users accessing premium themes', async () => {
      mockProAccess();
      await expect(requireFeature('theme_level')).resolves.toBeUndefined();
    });

    test('does not throw for business tier users accessing premium themes', async () => {
      mockBusinessAccess();
      await expect(requireFeature('theme_level')).resolves.toBeUndefined();
    });
  });

  describe('Other feature gating', () => {
    test('throws for starter tier accessing analytics', async () => {
      mockStarterAccess();
      await expect(requireFeature('analytics')).rejects.toThrow('Analytics Unavailable');
    });

    test('does not throw for pro tier accessing analytics', async () => {
      mockProAccess();
      await expect(requireFeature('analytics')).resolves.toBeUndefined();
    });

    test('throws for pro tier accessing advanced_analytics', async () => {
      mockProAccess();
      await expect(requireFeature('advanced_analytics')).rejects.toThrow(
        'Advanced Analytics Unavailable'
      );
    });

    test('does not throw for business tier accessing advanced_analytics', async () => {
      mockBusinessAccess();
      await expect(requireFeature('advanced_analytics')).resolves.toBeUndefined();
    });

    test('throws for starter tier accessing priority_support', async () => {
      mockStarterAccess();
      await expect(requireFeature('priority_support')).rejects.toThrow(
        'Priority Support Unavailable'
      );
    });

    test('does not throw for pro tier accessing priority_support', async () => {
      mockProAccess();
      await expect(requireFeature('priority_support')).resolves.toBeUndefined();
    });

    test('throws for starter tier accessing team_members', async () => {
      mockStarterAccess();
      await expect(requireFeature('team_members')).rejects.toThrow(
        'Team Management Unavailable'
      );
    });

    test('does not throw for business tier accessing team_members', async () => {
      mockBusinessAccess();
      await expect(requireFeature('team_members')).resolves.toBeUndefined();
    });

    test('throws for starter tier accessing custom_domain', async () => {
      mockStarterAccess();
      await expect(requireFeature('custom_domain')).rejects.toThrow(
        'Custom Domain Unavailable'
      );
    });

    test('does not throw for business tier accessing custom_domain', async () => {
      mockBusinessAccess();
      await expect(requireFeature('custom_domain')).resolves.toBeUndefined();
    });

    test('throws for starter tier accessing hide_branding', async () => {
      mockStarterAccess();
      await expect(requireFeature('hide_branding')).rejects.toThrow(
        'Branding Customization Unavailable'
      );
    });

    test('throws for pro tier accessing hide_branding', async () => {
      mockProAccess();
      await expect(requireFeature('hide_branding')).rejects.toThrow(
        'Branding Customization Unavailable'
      );
    });

    test('does not throw for business tier accessing hide_branding', async () => {
      mockBusinessAccess();
      await expect(requireFeature('hide_branding')).resolves.toBeUndefined();
    });
  });

  describe('Authentication checks', () => {
    test('throws Unauthorized when no session exists', async () => {
      mockUnauthenticated();
      await expect(requireFeature('theme_level')).rejects.toThrow('Unauthorized');
    });

    test('throws Unauthorized when user has no id', async () => {
      (auth as any).mockResolvedValue({ user: {} });
      await expect(requireFeature('theme_level')).rejects.toThrow('Unauthorized');
    });
  });

  describe('Subscription not found fallback', () => {
    test('uses "Starter" plan name in error when subscription is null', async () => {
      mockAuthenticated();
      (hasFeatureAccess as any).mockResolvedValue(false);
      (getVendorSubscription as any).mockResolvedValue(null);

      await expect(requireFeature('theme_level')).rejects.toThrow('Starter plan');
    });
  });
});

// ---------------------------------------------------------------------------
// withFeatureGate
// ---------------------------------------------------------------------------

describe('withFeatureGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('executes handler and returns result when feature access is granted', async () => {
    mockProAccess();
    const handler = vi.fn().mockResolvedValue({ success: true, data: 'theme-data' });

    const result = await withFeatureGate('theme_level', handler);

    expect(result).toEqual({ success: true, data: 'theme-data' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('does not execute handler when feature access is denied', async () => {
    mockStarterAccess();
    const handler = vi.fn().mockResolvedValue('should-not-run');

    await expect(withFeatureGate('theme_level', handler)).rejects.toThrow(
      'Premium Themes Unavailable'
    );
    expect(handler).not.toHaveBeenCalled();
  });

  test('throws error from requireFeature before handler is called', async () => {
    mockStarterAccess();
    const handler = vi.fn();

    await expect(withFeatureGate('theme_level', handler)).rejects.toThrow(
      'Premium theme access requires Pro'
    );
    expect(handler).not.toHaveBeenCalled();
  });

  test('forwards handler return value for non-gated features on pro tier', async () => {
    mockProAccess();
    const handler = vi.fn().mockResolvedValue(42);

    const result = await withFeatureGate('analytics', handler);

    expect(result).toBe(42);
  });

  test('handler is called for business tier with all features', async () => {
    mockBusinessAccess();
    const handler = vi.fn().mockResolvedValue('business-data');

    const result = await withFeatureGate('team_members', handler);

    expect(result).toBe('business-data');
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// featureGatedAction
// ---------------------------------------------------------------------------

describe('featureGatedAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Premium theme access denial for starter tier', () => {
    test('returns structured error with requiresUpgrade=true for starter + theme_level', async () => {
      mockStarterAccess();
      const handler = vi.fn();

      const result = await featureGatedAction('theme_level', handler);

      expectFailed(result);
      expect(result.requiresUpgrade).toBe(true);
      expect(result.error).toContain('Premium Themes Unavailable');
      expect(result.currentTier).toBe('starter');
    });

    test('does not call handler when premium theme access is denied', async () => {
      mockStarterAccess();
      const handler = vi.fn();

      await featureGatedAction('theme_level', handler);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Premium theme access granted for pro tier', () => {
    test('returns ok=true with handler data for pro + theme_level', async () => {
      mockProAccess();
      const handler = vi.fn().mockResolvedValue({ applied: true, themeId: 'midnight-luxe' });

      const result = await featureGatedAction('theme_level', handler);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({ applied: true, themeId: 'midnight-luxe' });
      }
    });

    test('calls handler when premium theme access is granted for pro tier', async () => {
      mockProAccess();
      const handler = vi.fn().mockResolvedValue('theme-applied');

      await featureGatedAction('theme_level', handler);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Business tier access', () => {
    test('returns ok=true for business + team_members (exclusive feature)', async () => {
      mockBusinessAccess();
      const handler = vi.fn().mockResolvedValue(['member-1']);

      const result = await featureGatedAction('team_members', handler);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual(['member-1']);
      }
    });

    test('returns ok=true for business + custom_domain', async () => {
      mockBusinessAccess();
      const handler = vi.fn().mockResolvedValue({ domain: 'store.com' });

      const result = await featureGatedAction('custom_domain', handler);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({ domain: 'store.com' });
      }
    });

    test('returns ok=true for business + hide_branding', async () => {
      mockBusinessAccess();
      const handler = vi.fn().mockResolvedValue({ brandingRemoved: true });

      const result = await featureGatedAction('hide_branding', handler);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({ brandingRemoved: true });
      }
    });
  });

  describe('Authentication failures', () => {
    test('returns ok=false with requiresUpgrade=false for unauthenticated user', async () => {
      mockUnauthenticated();
      const handler = vi.fn();

      const result = await featureGatedAction('theme_level', handler);

      expectFailed(result);
      expect(result.requiresUpgrade).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(result.currentTier).toBe('none');
    });

    test('does not call handler for unauthenticated user', async () => {
      mockUnauthenticated();
      const handler = vi.fn();

      await featureGatedAction('theme_level', handler);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Handler errors', () => {
    test('returns ok=false with handler error message when handler throws', async () => {
      mockProAccess();
      const handler = vi.fn().mockRejectedValue(new Error('Failed to apply theme'));

      const result = await featureGatedAction('theme_level', handler);

      expectFailed(result);
      expect(result.requiresUpgrade).toBe(false);
      expect(result.error).toBe('Failed to apply theme');
    });

    test('includes current tier in error result when handler fails', async () => {
      mockProAccess();
      const handler = vi.fn().mockRejectedValue(new Error('Something went wrong'));

      const result = await featureGatedAction('theme_level', handler);

      expectFailed(result);
      expect(result.currentTier).toBe('pro');
    });

    test('uses generic message when handler throws non-Error', async () => {
      mockProAccess();
      const handler = vi.fn().mockRejectedValue('string error');

      const result = await featureGatedAction('theme_level', handler);

      expectFailed(result);
      expect(result.error).toBe('Action failed');
    });
  });

  describe('Feature-specific denial messages', () => {
    test('premium theme denial error mentions Pro upgrade for starter', async () => {
      mockStarterAccess();
      const handler = vi.fn();

      const result = await featureGatedAction('theme_level', handler);

      expectFailed(result);
      expect(result.error).toContain('Premium Themes Unavailable');
      expect(result.error).toContain('Pro');
    });

    test('advanced_analytics denial error mentions Business upgrade for pro', async () => {
      mockProAccess();
      const handler = vi.fn();

      const result = await featureGatedAction('advanced_analytics', handler);

      expectFailed(result);
      expect(result.error).toContain('Advanced Analytics Unavailable');
      expect(result.error).toContain('Business');
      expect(result.currentTier).toBe('pro');
    });

    test('team_members denial error mentions Business upgrade for pro', async () => {
      mockProAccess();
      const handler = vi.fn();

      const result = await featureGatedAction('team_members', handler);

      expectFailed(result);
      expect(result.error).toContain('Team Management Unavailable');
      expect(result.requiresUpgrade).toBe(true);
    });

    test('hide_branding denial error mentions Business upgrade for pro', async () => {
      mockProAccess();
      const handler = vi.fn();

      const result = await featureGatedAction('hide_branding', handler);

      expectFailed(result);
      expect(result.error).toContain('Branding Customization Unavailable');
      expect(result.error).toContain('Business');
      expect(result.requiresUpgrade).toBe(true);
      expect(result.currentTier).toBe('pro');
    });
  });

  describe('Return shape', () => {
    test('success result has ok, data fields (not error, requiresUpgrade, currentTier)', async () => {
      mockProAccess();
      const handler = vi.fn().mockResolvedValue('data');

      const result = await featureGatedAction('theme_level', handler);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result).toHaveProperty('data');
        expect(result).not.toHaveProperty('error');
        expect(result).not.toHaveProperty('requiresUpgrade');
        expect(result).not.toHaveProperty('currentTier');
      }
    });

    test('failure result has ok, error, requiresUpgrade, currentTier', async () => {
      mockStarterAccess();
      const handler = vi.fn();

      const result = await featureGatedAction('theme_level', handler);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('requiresUpgrade');
        expect(result).toHaveProperty('currentTier');
      }
    });

    test('unauthenticated result does not require upgrade', async () => {
      mockUnauthenticated();
      const handler = vi.fn();

      const result = await featureGatedAction('theme_level', handler);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.requiresUpgrade).toBe(false);
      }
    });
  });
});
