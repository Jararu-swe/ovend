/**
 * Team Member Management Service
 * 
 * This module provides functions for managing team member access control
 * for Business tier vendors. Team members can have different roles and
 * permissions for managing store operations.
 */

import { sql } from './db';
import { hasFeatureAccess } from './subscriptions';
import { TeamMember, TeamMemberPermissions } from './definitions';

export interface TeamMemberWithUser {
  id: string;
  vendor_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'assistant';
  permissions: {
    products: boolean;
    orders: boolean;
    settings: boolean;
  };
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  status: 'pending' | 'active' | 'inactive';
  user_name: string;
  user_email: string;
}

/**
 * Checks if a vendor can manage team members (requires Business tier).
 * 
 * @param vendorId - The vendor's user ID
 * @returns true if vendor has team management access, false otherwise
 */
export async function canManageTeam(vendorId: string): Promise<boolean> {
  return hasFeatureAccess(vendorId, 'team_members');
}

/**
 * Retrieves all team members for a vendor.
 * 
 * @param vendorId - The vendor's user ID
 * @returns Array of team members for the vendor
 */
export async function getTeamMembers(vendorId: string): Promise<TeamMember[]> {
  const members = await sql<TeamMember[]>`
    SELECT * FROM team_members
    WHERE vendor_id = ${vendorId}
    ORDER BY created_at DESC
  `;
  return members;
}

/**
 * Gets the count of active and pending team members for a vendor.
 * Used for enforcing the 5-member limit for Business tier.
 * 
 * @param vendorId - The vendor's user ID
 * @returns Number of team members (pending + active)
 */
export async function getTeamMemberCount(vendorId: string): Promise<number> {
  const [result] = await sql`
    SELECT COUNT(*) as count FROM team_members
    WHERE vendor_id = ${vendorId} AND status IN ('pending', 'active')
  `;
  return Number(result.count);
}

/**
 * Invites a new team member to a vendor's store.
 * Enforces Business tier access, 5-member limit, and duplicate email prevention.
 * 
 * @param vendorId - The vendor's user ID
 * @param email - Email address of the person to invite
 * @param role - Role for the team member ('admin' or 'assistant')
 * @param permissions - Access permissions (products, orders, settings)
 * @param invitedBy - User ID of the person sending the invitation
 * @returns Result object with success status and team member data or error
 */
export async function inviteTeamMember(
  vendorId: string,
  email: string,
  role: 'admin' | 'assistant',
  permissions: TeamMemberPermissions,
  invitedBy: string
): Promise<{ ok: boolean; member?: TeamMember; error?: string }> {
  // Check if vendor has team feature access
  const hasAccess = await canManageTeam(vendorId);
  if (!hasAccess) {
    return { ok: false, error: 'Team management requires Business tier' };
  }
  
  // Check team member limit (5 for Business tier)
  const currentCount = await getTeamMemberCount(vendorId);
  if (currentCount >= 5) {
    return { ok: false, error: 'Maximum team member limit (5) reached. Remove a member before adding new ones.' };
  }
  
  // Check for duplicate email
  const existing = await sql`
    SELECT id FROM team_members
    WHERE vendor_id = ${vendorId} AND email = ${email}
    LIMIT 1
  `;
  
  if (existing.length > 0) {
    return { ok: false, error: 'A team member with this email already exists' };
  }
  
  // Validate permissions
  if (typeof permissions.products !== 'boolean' ||
      typeof permissions.orders !== 'boolean' ||
      typeof permissions.settings !== 'boolean') {
    return { ok: false, error: 'Invalid permissions format' };
  }
  
  try {
    const [member] = await sql<TeamMember[]>`
      INSERT INTO team_members (vendor_id, email, role, permissions, invited_by, status)
      VALUES (${vendorId}, ${email}, ${role}, ${JSON.stringify(permissions)}, ${invitedBy}, 'pending')
      RETURNING *
    `;
    
    return { ok: true, member };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to invite team member' };
  }
}

/**
 * Accepts a team invitation and activates the team member account.
 * 
 * @param invitationId - The team member invitation ID
 * @param userId - The user ID of the person accepting the invitation
 * @returns Result object with success status or error
 */
export async function acceptTeamInvitation(
  invitationId: string,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await sql`
      UPDATE team_members
      SET 
        user_id = ${userId},
        status = 'active',
        accepted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${invitationId} AND status = 'pending'
      RETURNING id
    `;
    
    if (result.length === 0) {
      return { ok: false, error: 'Invitation not found or already accepted' };
    }
    
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to accept invitation' };
  }
}

/**
 * Removes a team member from a vendor's store.
 * 
 * @param vendorId - The vendor's user ID
 * @param memberId - The team member ID to remove
 * @returns Result object with success status or error
 */
export async function removeTeamMember(
  vendorId: string,
  memberId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await sql`
      DELETE FROM team_members
      WHERE id = ${memberId} AND vendor_id = ${vendorId}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return { ok: false, error: 'Team member not found' };
    }
    
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to remove team member' };
  }
}

/**
 * Updates the permissions for a team member.
 * 
 * @param vendorId - The vendor's user ID
 * @param memberId - The team member ID
 * @param permissions - New permissions to apply
 * @returns Result object with success status or error
 */
export async function updateTeamMemberPermissions(
  vendorId: string,
  memberId: string,
  permissions: TeamMemberPermissions
): Promise<{ ok: boolean; error?: string }> {
  // Validate permissions
  if (typeof permissions.products !== 'boolean' ||
      typeof permissions.orders !== 'boolean' ||
      typeof permissions.settings !== 'boolean') {
    return { ok: false, error: 'Invalid permissions format' };
  }
  
  try {
    const result = await sql`
      UPDATE team_members
      SET 
        permissions = ${JSON.stringify(permissions)},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${memberId} AND vendor_id = ${vendorId}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return { ok: false, error: 'Team member not found' };
    }
    
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to update permissions' };
  }
}

/**
 * Deactivates all team members for a vendor.
 * Used when a vendor downgrades from Business tier.
 * 
 * @param vendorId - The vendor's user ID
 * @returns Number of team members deactivated
 */
export async function deactivateAllTeamMembers(vendorId: string): Promise<number> {
  const result = await sql`
    UPDATE team_members
    SET 
      status = 'inactive',
      updated_at = CURRENT_TIMESTAMP
    WHERE vendor_id = ${vendorId} AND status IN ('pending', 'active')
    RETURNING id
  `;
  
  return result.length;
}

/**
 * Checks if a user has a specific permission for a vendor's store.
 * Used for authorization checks in team member actions.
 * 
 * @param userId - The user ID to check permissions for
 * @param vendorId - The vendor's user ID
 * @param permission - The permission to check ('products', 'orders', or 'settings')
 * @returns true if user has the permission, false otherwise
 */
export async function hasTeamPermission(
  userId: string,
  vendorId: string,
  permission: keyof TeamMemberPermissions
): Promise<boolean> {
  const [member] = await sql`
    SELECT permissions FROM team_members
    WHERE user_id = ${userId} AND vendor_id = ${vendorId} AND status = 'active'
    LIMIT 1
  `;
  
  if (!member) {
    return false;
  }
  
  const permissions = typeof member.permissions === 'string' 
    ? JSON.parse(member.permissions) 
    : member.permissions;
  
  return permissions[permission] === true;
}

// Legacy functions for backward compatibility

export async function fetchTeamMembers(vendorId: string): Promise<TeamMemberWithUser[]> {
  try {
    const members = await sql<TeamMemberWithUser[]>`
      SELECT 
        tm.*,
        u.name as user_name,
        u.email as user_email
      FROM team_members tm
      LEFT JOIN users u ON tm.user_id = u.id
      WHERE tm.vendor_id = ${vendorId}
      ORDER BY tm.invited_at DESC
    `;
    return members;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function updateTeamMemberRole(
  memberId: string,
  role: 'admin' | 'assistant',
  permissions: { products: boolean; orders: boolean; settings: boolean }
): Promise<void> {
  await sql`
    UPDATE team_members
    SET role = ${role}, permissions = ${JSON.stringify(permissions)}
    WHERE id = ${memberId}
  `;
}
