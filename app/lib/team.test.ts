/**
 * Tests for team member access flow
 *
 * Covers:
 * - getTeamMemberAccess: looks up active team membership from DB
 * - JWT override logic: when a team member's token.id gets replaced with vendor ID
 * - Sidebar nav-links filtering: links hidden based on teamPermissions
 * - deleteStore guard: team members blocked from deleting the store
 */

import { describe, expect, test, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// getTeamMemberAccess
// ---------------------------------------------------------------------------

describe('getTeamMemberAccess', () => {
  const MOCK_USER_ID = 'user-456';
  const MOCK_VENDOR_ID = 'vendor-789';
  const MOCK_PERMISSIONS = { products: true, orders: true, settings: false };

  // Use vi.hoisted() so the variable is created before vi.mock hoisting
  const { sql: mockSql } = vi.hoisted(() => ({ sql: vi.fn() }));
  vi.mock('./db', () => ({ sql: mockSql }));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  test('returns null for empty userId', async () => {
    mockSql.mockResolvedValue([]);
    const { getTeamMemberAccess } = await import('./team');
    const result = await getTeamMemberAccess('');
    expect(result).toBeNull();
  });

  test('returns null when user has no team membership', async () => {
    mockSql.mockResolvedValue([]);
    const { getTeamMemberAccess } = await import('./team');
    const result = await getTeamMemberAccess(MOCK_USER_ID);
    expect(result).toBeNull();
  });

  test('returns vendorId and permissions for active team member', async () => {
    mockSql.mockResolvedValue([
      { vendor_id: MOCK_VENDOR_ID, permissions: MOCK_PERMISSIONS },
    ]);
    const { getTeamMemberAccess } = await import('./team');
    const result = await getTeamMemberAccess(MOCK_USER_ID);

    expect(result).not.toBeNull();
    expect(result!.vendorId).toBe(MOCK_VENDOR_ID);
    expect(result!.permissions.products).toBe(true);
    expect(result!.permissions.orders).toBe(true);
    expect(result!.permissions.settings).toBe(false);
  });

  test('parses string permissions JSON from database', async () => {
    mockSql.mockResolvedValue([
      {
        vendor_id: MOCK_VENDOR_ID,
        permissions: JSON.stringify({ products: false, orders: true, settings: true }),
      },
    ]);
    const { getTeamMemberAccess } = await import('./team');
    const result = await getTeamMemberAccess(MOCK_USER_ID);

    expect(result).not.toBeNull();
    expect(result!.permissions.products).toBe(false);
    expect(result!.permissions.orders).toBe(true);
    expect(result!.permissions.settings).toBe(true);
  });

  test('returns null when database throws', async () => {
    mockSql.mockRejectedValue(new Error('DB error'));
    const { getTeamMemberAccess } = await import('./team');
    const result = await getTeamMemberAccess(MOCK_USER_ID);
    expect(result).toBeNull();
  });

  test('returns null for non-existent user ID', async () => {
    mockSql.mockResolvedValue([]);
    const { getTeamMemberAccess } = await import('./team');
    const result = await getTeamMemberAccess('non-existent-id');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// JWT override logic — testing the transformation function in isolation
// ---------------------------------------------------------------------------

describe('JWT team member override logic', () => {
  /**
   * Simulates the JWT callback logic from auth.ts:
   * If the user is NOT a vendor but IS an active team member,
   * override token.id with the vendor ID and store metadata.
   */
  function applyTeamMemberOverride(
    token: Record<string, unknown>,
    teamAccess: {
      vendorId: string;
      permissions: { products: boolean; orders: boolean; settings: boolean };
    } | null,
  ): Record<string, unknown> {
    if (token.id && token.role !== 'vendor' && teamAccess) {
      return {
        ...token,
        teamMemberId: token.id,
        id: teamAccess.vendorId,
        teamPermissions: teamAccess.permissions,
        subscription_expires_at: null,
        subscription_status: null,
      };
    }
    return token;
  }

  test('overrides token.id with vendor ID for non-vendor team members', () => {
    const token = { id: 'team-member-1', role: 'customer' };
    const teamAccess = {
      vendorId: 'vendor-1',
      permissions: { products: true, orders: false, settings: false },
    };

    const result = applyTeamMemberOverride(token, teamAccess);

    expect(result.id).toBe('vendor-1');
    expect(result.teamMemberId).toBe('team-member-1');
    expect(result.teamPermissions).toEqual({
      products: true,
      orders: false,
      settings: false,
    });
  });

  test('does NOT override token for vendor role users', () => {
    const token = { id: 'vendor-1', role: 'vendor' };
    const teamAccess = {
      vendorId: 'other-vendor',
      permissions: { products: true, orders: true, settings: true },
    };

    const result = applyTeamMemberOverride(token, teamAccess);

    expect(result.id).toBe('vendor-1');
    expect(result.teamMemberId).toBeUndefined();
  });

  test('does NOT override when user has no team membership', () => {
    const token = { id: 'regular-user', role: 'customer' };

    const result = applyTeamMemberOverride(token, null);

    expect(result.id).toBe('regular-user');
    expect(result.teamMemberId).toBeUndefined();
  });

  test('clears subscription fields for team members', () => {
    const token = { id: 'team-member-1', role: 'customer' };
    const teamAccess = {
      vendorId: 'vendor-1',
      permissions: { products: true, orders: true, settings: true },
    };

    const result = applyTeamMemberOverride(token, teamAccess);

    expect(result.subscription_expires_at).toBeNull();
    expect(result.subscription_status).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sidebar nav-links filtering — testing the link visibility logic
// ---------------------------------------------------------------------------

describe('NavLinks team permission filtering', () => {
  type Link = {
    name: string;
    href: string;
    teamPermission?: 'products' | 'orders' | 'settings';
  };

  const allLinks: Link[] = [
    { name: 'Home', href: '/dashboard' },
    {
      name: 'Products',
      href: '/dashboard/products',
      teamPermission: 'products',
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      teamPermission: 'orders',
    },
    {
      name: 'Discounts',
      href: '/dashboard/discounts',
      teamPermission: 'orders',
    },
    { name: 'Team', href: '/dashboard/team' },
    { name: 'Customize', href: '/dashboard/customize' },
    { name: 'Billing', href: '/dashboard/billing' },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      teamPermission: 'settings',
    },
  ];

  function getVisibleLinks(
    teamPermissions: {
      products: boolean;
      orders: boolean;
      settings: boolean;
    } | null,
  ): Link[] {
    return allLinks.filter((link) => {
      if (!teamPermissions) return true;
      if (!link.teamPermission) return true;
      return teamPermissions[link.teamPermission] === true;
    });
  }

  test('vendor (null permissions) sees all links', () => {
    const visible = getVisibleLinks(null);
    expect(visible).toHaveLength(allLinks.length);
    expect(visible.map((l) => l.name)).toEqual([
      'Home',
      'Products',
      'Orders',
      'Discounts',
      'Team',
      'Customize',
      'Billing',
      'Settings',
    ]);
  });

  test('team member with only products permission sees relevant links', () => {
    const visible = getVisibleLinks({
      products: true,
      orders: false,
      settings: false,
    });

    const names = visible.map((l) => l.name);
    expect(names).toContain('Home');
    expect(names).toContain('Products');
    expect(names).not.toContain('Orders');
    expect(names).not.toContain('Discounts');
    expect(names).not.toContain('Settings');
    expect(names).toContain('Team');
    expect(names).toContain('Customize');
    expect(names).toContain('Billing');
  });

  test('team member with orders permission sees Orders and Discounts', () => {
    const visible = getVisibleLinks({
      products: false,
      orders: true,
      settings: false,
    });

    const names = visible.map((l) => l.name);
    expect(names).toContain('Orders');
    expect(names).toContain('Discounts');
    expect(names).not.toContain('Products');
    expect(names).not.toContain('Settings');
  });

  test('team member with settings permission sees Settings link', () => {
    const visible = getVisibleLinks({
      products: false,
      orders: false,
      settings: true,
    });

    const names = visible.map((l) => l.name);
    expect(names).toContain('Settings');
    expect(names).not.toContain('Products');
    expect(names).not.toContain('Orders');
  });

  test('team member with all permissions sees all links', () => {
    const visible = getVisibleLinks({
      products: true,
      orders: true,
      settings: true,
    });
    expect(visible).toHaveLength(allLinks.length);
  });

  test('team member with no permissions sees only unrestricted links', () => {
    const visible = getVisibleLinks({
      products: false,
      orders: false,
      settings: false,
    });

    const names = visible.map((l) => l.name);
    expect(names).toEqual(['Home', 'Team', 'Customize', 'Billing']);
  });
});

// ---------------------------------------------------------------------------
// deleteStore team member guard — testing the access check logic
// ---------------------------------------------------------------------------

describe('deleteStore team member guard', () => {
  function checkDeleteStorePermission(
    session: Record<string, unknown>,
  ): string | null {
    const user = session?.user as Record<string, unknown> | undefined;
    if (!user?.id) {
      return 'Unauthorized.';
    }
    if (user.teamMemberId) {
      return 'Only the store owner can delete the store.';
    }
    return null;
  }

  test('allows vendor without teamMemberId to delete', () => {
    const session = { user: { id: 'vendor-1' } };
    expect(checkDeleteStorePermission(session)).toBeNull();
  });

  test('blocks team member with teamMemberId from deleting', () => {
    const session = {
      user: { id: 'vendor-1', teamMemberId: 'real-user-1' },
    };
    expect(checkDeleteStorePermission(session)).toBe(
      'Only the store owner can delete the store.',
    );
  });

  test('blocks unauthenticated requests', () => {
    expect(checkDeleteStorePermission({})).toBe('Unauthorized.');
    expect(checkDeleteStorePermission({ user: {} })).toBe('Unauthorized.');
  });
});
