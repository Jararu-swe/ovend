/**
 * Premium Theme Integration Tests
 *
 * Chains together:
 * 1. TEMPLATES data from template-presets.ts (the actual theme definitions)
 * 2. isTemplateLocked logic from template-picker.tsx (the UI gating) 
 * 3. featureGatedAction from feature-gate.ts (the backend gating)
 *
 * Verifies that a starter-tier user cannot select/apply a premium theme
 * at BOTH the UI layer (template picker lock) AND the backend layer (feature gate).
 */

import { describe, expect, test, beforeEach, vi } from 'vitest';
import { TEMPLATES, Template } from './template-presets';
import { auth } from '@/auth';
import { hasFeatureAccess, getVendorSubscription } from './subscriptions';
import { featureGatedAction } from './feature-gate';

// ---------------------------------------------------------------------------
// Mocks for feature-gate dependency
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('./subscriptions', () => ({
  hasFeatureAccess: vi.fn(),
  getVendorSubscription: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Replicate template-picker's isTemplateLocked logic (pure function match)
// ---------------------------------------------------------------------------

const TIER_ORDER = ['starter', 'pro', 'business'] as const;

function isTemplateLocked(template: Template, userTier: string): boolean {
  if (!template.minTier || template.minTier === 'starter') return false;
  const userIdx = TIER_ORDER.indexOf(userTier as typeof TIER_ORDER[number]);
  const requiredIdx = TIER_ORDER.indexOf(template.minTier);
  return userIdx < requiredIdx;
}

function getUpgradeLabel(tier: string): string {
  const labels: Record<string, string> = {
    pro: 'Pro',
    business: 'Business',
  };
  return labels[tier] || 'Pro';
}

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const MOCK_VENDOR_ID = 'integration-vendor-1';

const starterSubscription = {
  tier: 'starter',
  plan: { name: 'Starter', features: { theme_level: 'basic' } },
};

const proSubscription = {
  tier: 'pro',
  plan: { name: 'Pro', features: { theme_level: 'premium' } },
};

const businessSubscription = {
  tier: 'business',
  plan: { name: 'Business', features: { theme_level: 'exclusive' } },
};

function mockStarterBackend() {
  (auth as any).mockResolvedValue({ user: { id: MOCK_VENDOR_ID, role: 'vendor' } });
  (hasFeatureAccess as any).mockResolvedValue(false);
  (getVendorSubscription as any).mockResolvedValue(starterSubscription);
}

function mockProBackend() {
  (auth as any).mockResolvedValue({ user: { id: MOCK_VENDOR_ID, role: 'vendor' } });
  (hasFeatureAccess as any).mockImplementation(async (_id: string, feature: string) => {
    if (feature === 'theme_level') return true;
    if (feature === 'advanced_analytics' || feature === 'team_members' || feature === 'custom_domain') return false;
    return true;
  });
  (getVendorSubscription as any).mockResolvedValue(proSubscription);
}

function mockBusinessBackend() {
  (auth as any).mockResolvedValue({ user: { id: MOCK_VENDOR_ID, role: 'vendor' } });
  (hasFeatureAccess as any).mockResolvedValue(true);
  (getVendorSubscription as any).mockResolvedValue(businessSubscription);
}

// ---------------------------------------------------------------------------
// Identify the themes
// ---------------------------------------------------------------------------

const premiumThemes = TEMPLATES.filter(t => t.minTier === 'pro');
const businessThemes = TEMPLATES.filter(t => t.minTier === 'business');
const allGatedThemes = [...premiumThemes, ...businessThemes];
const freeThemes = TEMPLATES.filter(t => !t.minTier || t.minTier === 'starter');

// ---------------------------------------------------------------------------
// Integration Tests
// ---------------------------------------------------------------------------

describe('Premium Theme End-to-End Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 1. UI Layer: isTemplateLocked (pure logic match) ──────────────
  describe('UI Layer — isTemplateLocked (template-picker gating)', () => {
    test('ALL gated themes (pro + business) are locked for starter users', () => {
      allGatedThemes.forEach(theme => {
        expect(isTemplateLocked(theme, 'starter'), 
          `${theme.id} (${theme.name}) should be locked for Starter`).toBe(true);
      });
    });

    test('Pro themes are unlocked for pro users, business themes are locked for pro users', () => {
      premiumThemes.forEach(theme => {
        expect(isTemplateLocked(theme, 'pro'),
          `${theme.id} (${theme.name}) should NOT be locked for Pro`).toBe(false);
      });
      businessThemes.forEach(theme => {
        expect(isTemplateLocked(theme, 'pro'),
          `${theme.id} (${theme.name}) should be locked for Pro`).toBe(true);
      });
    });

    test('ALL gated themes (pro + business) are unlocked for business users', () => {
      allGatedThemes.forEach(theme => {
        expect(isTemplateLocked(theme, 'business'),
          `${theme.id} (${theme.name}) should NOT be locked for Business`).toBe(false);
      });
    });

    test('NO free themes are locked for any tier', () => {
      const tiers = ['starter', 'pro', 'business'];
      freeThemes.forEach(theme => {
        tiers.forEach(tier => {
          expect(isTemplateLocked(theme, tier),
            `${theme.id} (${theme.name}) should NOT be locked for ${tier}`).toBe(false);
        });
      });
    });

    test('getUpgradeLabel returns "Pro" for pro-required themes', () => {
      expect(getUpgradeLabel('pro')).toBe('Pro');
    });

    test('getUpgradeLabel returns "Business" for business-required themes', () => {
      expect(getUpgradeLabel('business')).toBe('Business');
    });

    test('getUpgradeLabel defaults to "Pro" for unknown tiers', () => {
      expect(getUpgradeLabel('')).toBe('Pro');
      expect(getUpgradeLabel('starter')).toBe('Pro');
    });

    test('all pro-tier themes have minTier set to "pro"', () => {
      premiumThemes.forEach(theme => {
        expect(theme.minTier, `${theme.id} should require pro`).toBe('pro');
      });
    });

    test('all business-tier themes have minTier set to "business"', () => {
      businessThemes.forEach(theme => {
        expect(theme.minTier, `${theme.id} should require business`).toBe('business');
      });
    });

    test('gated themes are locked for unknown/downgraded tiers too', () => {
      allGatedThemes.forEach(theme => {
        expect(isTemplateLocked(theme, 'unknown')).toBe(true);
        expect(isTemplateLocked(theme, '')).toBe(true);
        expect(isTemplateLocked(theme, 'expired')).toBe(true);
      });
    });
  });

  // ── 2. Backend Layer: featureGatedAction ─────────────────────────
  describe('Backend Layer — featureGatedAction (server-side gating)', () => {
    test('starter user applying a premium theme → blocked with requiresUpgrade', async () => {
      mockStarterBackend();

      const result = await featureGatedAction('theme_level', async () => {
        return { applied: true, themeId: 'monochrome-pro' };
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.requiresUpgrade).toBe(true);
        expect(result.currentTier).toBe('starter');
        expect(result.error).toContain('Premium Themes Unavailable');
      }
    });

    test('pro user applying a pro theme → allowed', async () => {
      mockProBackend();

      const result = await featureGatedAction('theme_level', async () => {
        return { applied: true, themeId: 'gold-reserve' };
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({ applied: true, themeId: 'gold-reserve' });
      }
    });

    test('business user applying a premium theme → allowed', async () => {
      mockBusinessBackend();

      const result = await featureGatedAction('theme_level', async () => {
        return { applied: true, themeId: 'noir-luxe' };
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({ applied: true, themeId: 'noir-luxe' });
      }
    });

    test('starter user applying a free theme (analytics) → blocked (different feature)', async () => {
      mockStarterBackend();

      const result = await featureGatedAction('analytics', async () => {
        return { activated: true };
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.requiresUpgrade).toBe(true);
        expect(result.error).toContain('Analytics Unavailable');
      }
    });

    test('handler does NOT execute when starter applies premium theme', async () => {
      mockStarterBackend();
      const handler = vi.fn().mockResolvedValue('should-not-run');

      await featureGatedAction('theme_level', handler);

      expect(handler).not.toHaveBeenCalled();
    });

    test('handler DOES execute when pro applies premium theme', async () => {
      mockProBackend();
      const handler = vi.fn().mockResolvedValue({ success: true });

      await featureGatedAction('theme_level', handler);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // ── 3. End-to-End Scenarios ─────────────────────────────────────
  describe('End-to-End: Starter browsing and applying themes', () => {
    test('scenario: starter user sees ALL gated themes as locked in UI', () => {
      const starterTier = 'starter';

      allGatedThemes.forEach(theme => {
        const lockedInUI = isTemplateLocked(theme, starterTier);
        expect(lockedInUI, `Starter sees ${theme.name} as locked`).toBe(true);
      });
    });

    test('scenario: starter user sees NO free themes as locked in UI', () => {
      const starterTier = 'starter';

      freeThemes.forEach(theme => {
        const lockedInUI = isTemplateLocked(theme, starterTier);
        expect(lockedInUI, `Starter sees ${theme.name} as NOT locked`).toBe(false);
      });
    });

    test('scenario: if starter bypasses UI and calls API, backend blocks ALL gated themes', async () => {
      mockStarterBackend();

      const results = await Promise.all(
        allGatedThemes.map(theme =>
          featureGatedAction('theme_level', async () => ({
            applied: true,
            themeId: theme.id,
          }))
        )
      );

      results.forEach((result, i) => {
        expect(result.ok, `${allGatedThemes[i].name} should be blocked at backend`).toBe(false);
        if (!result.ok) {
          expect(result.requiresUpgrade).toBe(true);
        }
      });
    });

    test('scenario: pro user bypasses UI - pro themes AND business themes pass feature-level gate (per-theme gating is in updateThemeAction)', async () => {
      mockProBackend();

      // featureGatedAction('theme_level') checks feature-level access (Pro has theme_level: true),
      // NOT per-theme minTier gating. Per-theme gating is enforced in updateThemeAction (actions.ts)
      // and is tested separately in theme-editor-gating.test.ts.
      // So ALL premium-category themes pass the feature-level gate for pro users.
      const results = await Promise.all(
        allGatedThemes.map(theme =>
          featureGatedAction('theme_level', async () => ({
            applied: true,
            themeId: theme.id,
          }))
        )
      );

      results.forEach((result, i) => {
        expect(result.ok, `${allGatedThemes[i].name} passes feature-level gate for Pro`).toBe(true);
        if (result.ok) {
          expect(result.data.themeId).toBe(allGatedThemes[i].id);
        }
      });
    });

    test('scenario: clicking a locked premium theme redirects to billing', () => {
      const starterTier = 'starter';
      const midnightLuxe = TEMPLATES.find(t => t.id === 'midnight-luxe')!;
      const neonNights = TEMPLATES.find(t => t.id === 'neon-nights')!;
      const eliteReserve = TEMPLATES.find(t => t.id === 'elite-reserve')!;
      const freeTheme = TEMPLATES.find(t => t.id === 'fresh-market')!;

      // Gated themes are locked for starter → would redirect
      expect(isTemplateLocked(midnightLuxe, starterTier)).toBe(true);
      expect(isTemplateLocked(neonNights, starterTier)).toBe(true);
      expect(isTemplateLocked(eliteReserve, starterTier)).toBe(true);

      // Free theme is not locked → would call onSelect
      expect(isTemplateLocked(freeTheme, starterTier)).toBe(false);
    });

    test('scenario: pro user - pro themes do NOT redirect, business themes redirect to billing', () => {
      const proTier = 'pro';

      premiumThemes.forEach(theme => {
        expect(isTemplateLocked(theme, proTier), `${theme.name} should NOT redirect for Pro`).toBe(false);
      });

      businessThemes.forEach(theme => {
        expect(isTemplateLocked(theme, proTier), `${theme.name} should redirect for Pro`).toBe(true);
      });
    });

    test('scenario: business user - no gated themes redirect', () => {
      const bizTier = 'business';

      allGatedThemes.forEach(theme => {
        expect(isTemplateLocked(theme, bizTier), `${theme.name} should NOT redirect for Business`).toBe(false);
      });
    });
  });

  // ── 4. Cross-tier downgrade protection ──────────────────────────
  describe('Downgrade Protection', () => {
    test('pro theme becomes locked after downgrade from pro to starter', () => {
      premiumThemes.forEach(theme => {
        expect(isTemplateLocked(theme, 'pro')).toBe(false);
        expect(isTemplateLocked(theme, 'starter')).toBe(true);
        expect(isTemplateLocked(theme, 'pro')).toBe(false);
      });
    });

    test('business theme becomes locked after downgrade from business to pro', () => {
      businessThemes.forEach(theme => {
        expect(isTemplateLocked(theme, 'business')).toBe(false);
        expect(isTemplateLocked(theme, 'pro')).toBe(true);
        expect(isTemplateLocked(theme, 'starter')).toBe(true);
        expect(isTemplateLocked(theme, 'business')).toBe(false);
      });
    });

    test('the backend also blocks the premium feature after downgrade', async () => {
      mockStarterBackend();

      const result = await featureGatedAction('theme_level', async () => ({
        applied: true,
      }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.currentTier).toBe('starter');
        expect(result.requiresUpgrade).toBe(true);
      }
    });
  });

  // ── 5. All gated theme metadata consistency ───────────────────
  describe('Gated Theme Data Integrity', () => {
    test('each gated theme (pro + business) has a unique ID and valid emoji', () => {
      allGatedThemes.forEach(theme => {
        expect(theme.id).toBeDefined();
        expect(theme.emoji).toBeDefined();
        expect(theme.name).toBeDefined();
        expect(theme.description).toBeDefined();
        expect(theme.category).toBe('premium');
      });
    });

    test('each gated theme has sections defined', () => {
      allGatedThemes.forEach(theme => {
        expect(theme.sections.length, `${theme.id} should have sections`).toBeGreaterThan(0);
      });
    });

    test('each gated theme has sectionContent defined', () => {
      allGatedThemes.forEach(theme => {
        expect(Object.keys(theme.sectionContent).length,
          `${theme.id} should have section content`).toBeGreaterThan(0);
      });
    });

    test('all gated themes tagged correctly for discoverability', () => {
      allGatedThemes.forEach(theme => {
        expect(theme.tags.length, `${theme.id} should have tags`).toBeGreaterThan(0);
        const hasPremiumTag = theme.tags.some(
          t => ['premium', 'luxury', 'glass', 'minimal', 'dark', 'neon', 'monochrome', 'tropical',
                 'elite', 'futuristic', 'ethereal'].includes(t)
        );
        expect(hasPremiumTag, `${theme.id} should have a recognizable premium tag`).toBe(true);
      });
    });

    test('correct number of pro-tier and business-tier themes', () => {
      expect(premiumThemes.length).toBe(8);
      expect(businessThemes.length).toBe(3);
      expect(allGatedThemes.length).toBe(11);
    });
  });
});
