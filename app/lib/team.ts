import { sql } from './db';

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

export async function fetchTeamMembers(vendorId: string): Promise<TeamMemberWithUser[]> {
  try {
    const members = await sql<TeamMemberWithUser[]>`
      SELECT 
        tm.*,
        u.name as user_name,
        u.email as user_email
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
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

export async function removeTeamMember(memberId: string): Promise<void> {
  await sql`
    DELETE FROM team_members
    WHERE id = ${memberId}
  `;
}
