/**
 * Tests for ThemeEditor's premium theme gating via the updateThemeAction server action.
 *
 * Verifies that the backend gate in updateThemeAction correctly:
 * - Rejects premium theme saves for starter users
 * - Allows premium theme saves for pro users
 * - Returns the correct error message with theme name and required plan
 * - Allows free (starter-level) theme saves for all tiers
 */

import { describe, expect, test, beforeEach, vi } from 'vitest';
import { auth } from '@/auth';
import { getVendorSubscription } from '@/app/lib/subscriptions';
import { getTemplateById } from '@/app/lib/template-presets';
import { updateThemeAction } from './actions';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  sql: Object.assign(
    vi.fn().mockResolvedValue([{ subscription_expires_at: '2099-12-31T23:59:59Z' }]),
    { unsafe: vi.fn().mockResolvedValue([]) }
  ),
}));

vi.mock('@/app/lib/data', () => ({
  ensureVendorSubscriptionSchema: vi.fn().mockResolvedValue(undefined),
  ensureLogoLayoutColumns: vi.fn().mockResolvedValue(undefined),
  ensureProductColumns: vi.fn().mockResolvedValue(undefined),
  ensureStoreColumns: vi.fn().mockResolvedValue(undefined),
  ensureDiscountSchema: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/app/lib/subscriptions', () => ({
  getVendorSubscription: vi.fn(),
}));

vi.mock('@/app/lib/template-presets', () => ({
  getTemplateById: vi.fn(),
  getDefaultSections: vi.fn().mockReturnValue([]),
  getDefaultSectionContent: vi.fn().mockReturnValue({}),
}));

// ---------------------------------------------------------------------------
// Helpers: build FormData from theme config
// ---------------------------------------------------------------------------

const BASE_THEME_DATA: Record<string, string> = {
  template_id: 'fresh-market',
  primary_color: '#16a34a',
  secondary_color: '#15803d',
  background_color: '#f0fdf4',
  text_color: '#14532d',
  accent_color: '#eab308',
  surface_color: '#ffffff',
  heading_color: '#052e16',
  border_color: '#bbf7d0',
  font_family: 'poppins',
  heading_font: 'poppins',
  font_size: 'medium',
  layout_style: 'grid',
  card_style: 'modern',
  border_radius: 'rounded',
  card_shadow: 'soft',
  button_style: 'solid',
  button_radius: 'pill',
  animation_style: 'bounce',
  spacing: 'comfortable',
  header_style: 'sticky',
  show_product_images: 'true',
  show_product_description: 'true',
  image_aspect_ratio: 'square',
  show_logo: 'true',
  logo_position: 'left',
  logo_frame: 'profile',
  logo_url: '',
  custom_css: '',
  sections: '[]',
  section_content: '{}',
};

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const data = { ...BASE_THEME_DATA, ...overrides };
  Object.entries(data).forEach(([key, value]) => fd.append(key, value));
  return fd;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const proTemplates = [
  { id: 'midnight-luxe', name: 'Midnight Luxe', minTier: 'pro' as const },
  { id: 'studio-clean', name: 'Studio Clean', minTier: 'pro' as const },
  { id: 'monochrome-pro', name: 'Monochrome Pro', minTier: 'pro' as const },
  { id: 'gold-reserve', name: 'Gold Reserve', minTier: 'pro' as const },
  { id: 'crystal-diamond', name: 'Crystal Diamond', minTier: 'pro' as const },
  { id: 'noir-luxe', name: 'Noir Luxe', minTier: 'pro' as const },
  { id: 'neon-nights', name: 'Neon Nights', minTier: 'pro' as const },
  { id: 'tropical-paradise', name: 'Tropical Paradise', minTier: 'pro' as const },
];

const businessTemplates = [
  { id: 'elite-reserve', name: 'Elite Reserve', minTier: 'business' as const },
  { id: 'aura', name: 'Aura', minTier: 'business' as const },
  { id: 'nexus', name: 'Nexus', minTier: 'business' as const },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('updateThemeAction — Premium Theme Gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Starter tier saving pro-gated themes', () => {
    test.each(proTemplates)(
      'rejects $name (pro theme) for starter user',
      async (proTheme) => {
        (auth as any).mockResolvedValue({
          user: { id: 'starter-vendor', role: 'vendor' },
        });
        (getTemplateById as any).mockReturnValue({
          id: proTheme.id,
          name: proTheme.name,
          minTier: proTheme.minTier,
          theme: {},
        });
        (getVendorSubscription as any).mockResolvedValue({
          tier: 'starter',
          plan: { name: 'Starter' },
        });

        const result = await updateThemeAction(
          { message: '' },
          buildFormData({ template_id: proTheme.id })
        );

        expect(result.message).toContain(proTheme.name);
        expect(result.message).toContain('Pro');
        expect(result.message).toContain('upgrade');
      }
    );

    test.each(businessTemplates)(
      'rejects $name (business theme) for starter user',
      async (bizTheme) => {
        (auth as any).mockResolvedValue({
          user: { id: 'starter-vendor', role: 'vendor' },
        });
        (getTemplateById as any).mockReturnValue({
          id: bizTheme.id,
          name: bizTheme.name,
          minTier: bizTheme.minTier,
          theme: {},
        });
        (getVendorSubscription as any).mockResolvedValue({
          tier: 'starter',
          plan: { name: 'Starter' },
        });

        const result = await updateThemeAction(
          { message: '' },
          buildFormData({ template_id: bizTheme.id })
        );

        expect(result.message).toContain(bizTheme.name);
        expect(result.message).toContain('Business');
        expect(result.message).toContain('upgrade');
      }
    );

    test('error message includes exact required Pro plan tier name', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'starter-vendor', role: 'vendor' },
      });
      (getTemplateById as any).mockReturnValue({
        id: 'midnight-luxe',
        name: 'Midnight Luxe',
        minTier: 'pro',
        theme: {},
      });
      (getVendorSubscription as any).mockResolvedValue({
        tier: 'starter',
        plan: { name: 'Starter' },
      });

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: 'midnight-luxe' })
      );

      expect(result.message).toBe(
        'The "Midnight Luxe" theme requires the Pro plan. Please upgrade to use it.'
      );
    });

    test('error message includes exact required Business plan tier name', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'starter-vendor', role: 'vendor' },
      });
      (getTemplateById as any).mockReturnValue({
        id: 'elite-reserve',
        name: 'Elite Reserve',
        minTier: 'business',
        theme: {},
      });
      (getVendorSubscription as any).mockResolvedValue({
        tier: 'starter',
        plan: { name: 'Starter' },
      });

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: 'elite-reserve' })
      );

      expect(result.message).toBe(
        'The "Elite Reserve" theme requires the Business plan. Please upgrade to use it.'
      );
    });
  });

  describe('Pro tier saving gated themes', () => {
    test.each(proTemplates)(
      'allows $name (pro theme) for pro user (no tier rejection)',
      async (proTheme) => {
        (auth as any).mockResolvedValue({
          user: { id: 'pro-vendor', role: 'vendor' },
        });
        (getTemplateById as any).mockReturnValue({
          id: proTheme.id,
          name: proTheme.name,
          minTier: proTheme.minTier,
          theme: {},
        });
        (getVendorSubscription as any).mockResolvedValue({
          tier: 'pro',
          plan: { name: 'Pro' },
        });

        const result = await updateThemeAction(
          { message: '' },
          buildFormData({ template_id: proTheme.id })
        );

        expect(result.message).not.toContain('requires the');
        expect(result.message).not.toContain('upgrade');
      }
    );

    test.each(businessTemplates)(
      'rejects $name (business theme) for pro user',
      async (bizTheme) => {
        (auth as any).mockResolvedValue({
          user: { id: 'pro-vendor', role: 'vendor' },
        });
        (getTemplateById as any).mockReturnValue({
          id: bizTheme.id,
          name: bizTheme.name,
          minTier: bizTheme.minTier,
          theme: {},
        });
        (getVendorSubscription as any).mockResolvedValue({
          tier: 'pro',
          plan: { name: 'Pro' },
        });

        const result = await updateThemeAction(
          { message: '' },
          buildFormData({ template_id: bizTheme.id })
        );

        expect(result.message).toContain(bizTheme.name);
        expect(result.message).toContain('Business');
        expect(result.message).toContain('upgrade');
      }
    );
  });

  describe('Business tier saving gated themes', () => {
    test.each([...proTemplates, ...businessTemplates])(
      'allows $name for business user (no tier rejection)',
      async (gatedTheme) => {
        (auth as any).mockResolvedValue({
          user: { id: 'biz-vendor', role: 'vendor' },
        });
        (getTemplateById as any).mockReturnValue({
          id: gatedTheme.id,
          name: gatedTheme.name,
          minTier: gatedTheme.minTier,
          theme: {},
        });
        (getVendorSubscription as any).mockResolvedValue({
          tier: 'business',
          plan: { name: 'Business' },
        });

        const result = await updateThemeAction(
          { message: '' },
          buildFormData({ template_id: gatedTheme.id })
        );

        expect(result.message).not.toContain('requires the');
        expect(result.message).not.toContain('upgrade');
      }
    );
  });

  describe('Free themes allowed for all tiers', () => {
    const freeThemeIds = [
      'fresh-market',
      'luxe-boutique',
      'tech-store',
      'beauty-glow',
      'quick-bites',
      'handmade-craft',
      'pro-athlete',
      'urban-runner',
      'gym-iron',
      'vogue-minimal',
    ];

    test.each(freeThemeIds)('saving %s does NOT trigger tier error for starter', async (themeId) => {
      (auth as any).mockResolvedValue({
        user: { id: 'starter-vendor', role: 'vendor' },
      });
      (getTemplateById as any).mockReturnValue({
        id: themeId,
        name: 'Free Theme',
        theme: {},
      });

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: themeId })
      );

      expect(result.message).not.toContain('requires the');
      expect(result.message).not.toContain('upgrade');
    });

    test('free theme with explicit minTier starter also allowed', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'starter-vendor', role: 'vendor' },
      });
      (getTemplateById as any).mockReturnValue({
        id: 'fresh-market',
        name: 'Fresh Market',
        minTier: 'starter',
        theme: {},
      });

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: 'fresh-market' })
      );

      expect(result.message).not.toContain('requires the');
    });
  });

  describe('Authentication and unauthorized access', () => {
    test('returns Unauthorized when no session exists', async () => {
      (auth as any).mockResolvedValue(null);

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: 'midnight-luxe' })
      );

      expect(result.message).toBe('Unauthorized');
    });

    test('returns Unauthorized when user.id is missing', async () => {
      (auth as any).mockResolvedValue({ user: {} });

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: 'midnight-luxe' })
      );

      expect(result.message).toBe('Unauthorized');
    });
  });

  describe('Missing premium template ID fallback', () => {
    test('does not block when no template_id is sent', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'vendor-123', role: 'vendor' },
      });

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: '' })
      );

      expect(result.message).not.toContain('requires the');
    });

    test('does not block when getTemplateById returns undefined', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'vendor-123', role: 'vendor' },
      });
      (getTemplateById as any).mockReturnValue(undefined);

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: 'non-existent-theme' })
      );

      expect(result.message).not.toContain('requires the');
      expect(result.message).not.toContain('upgrade');
    });

    test('does not block template with minTier starter', async () => {
      (auth as any).mockResolvedValue({
        user: { id: 'vendor-123', role: 'vendor' },
      });
      (getTemplateById as any).mockReturnValue({
        id: 'fresh-market',
        name: 'Fresh Market',
        minTier: 'starter',
        theme: {},
      });

      const result = await updateThemeAction(
        { message: '' },
        buildFormData({ template_id: 'fresh-market' })
      );

      expect(result.message).not.toContain('requires the');
    });
  });
});
