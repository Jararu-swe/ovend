import { sql } from '@/app/lib/db';
import { logFraudEvent } from '@/app/lib/kyc';

/**
 * Admin emails allowed to access the compliance portal.
 * Reads dynamically from environment variable to support runtime configuration.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Checks whether the given user email is an authorised platform admin.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  try {
    const result = await sql`SELECT email FROM users WHERE id = ${userId} LIMIT 1`;
    if (!result.length) return false;
    const email = (result[0].email || '').toLowerCase();
    const adminEmails = getAdminEmails();
    return adminEmails.includes(email);
  } catch {
    return false;
  }
}

// ─── Dashboard Summary Stats ────────────────────────────────────────────────

export interface ComplianceSummary {
  totalVendors: number;
  unverifiedVendors: number;
  pendingVerifications: number;
  starterTierCount: number;
  proTierCount: number;
  businessTierCount: number;
  fraudAlertsToday: number;
  fraudAlertsCritical: number;
  unresolvedAlerts: number;
  totalPayoutsThisMonth: number;
  blockedPayoutsThisMonth: number;
}

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [vendors] = await sql`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE kyc_status = 'unverified' OR kyc_status IS NULL) AS unverified,
      COUNT(*) FILTER (WHERE kyc_tier = 'starter' OR kyc_tier IS NULL) AS starter,
      COUNT(*) FILTER (WHERE kyc_tier = 'pro') AS pro,
      COUNT(*) FILTER (WHERE kyc_tier = 'business') AS business
    FROM users
    WHERE role = 'vendor'
  `;

  const [pending] = await sql`
    SELECT COUNT(*) AS cnt FROM kyc_verifications WHERE status = 'pending'
  `;

  const [fraud] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= ${startOfDay}) AS today,
      COUNT(*) FILTER (WHERE severity = 'critical' AND resolved = FALSE) AS critical,
      COUNT(*) FILTER (WHERE resolved = FALSE) AS unresolved
    FROM fraud_audit_logs
  `;

  const [payouts] = await sql`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'failed') AS blocked
    FROM payouts
    WHERE requested_at >= ${startOfMonth}
  `;

  return {
    totalVendors: Number(vendors.total),
    unverifiedVendors: Number(vendors.unverified),
    pendingVerifications: Number(pending.cnt),
    starterTierCount: Number(vendors.starter),
    proTierCount: Number(vendors.pro),
    businessTierCount: Number(vendors.business),
    fraudAlertsToday: Number(fraud.today),
    fraudAlertsCritical: Number(fraud.critical),
    unresolvedAlerts: Number(fraud.unresolved),
    totalPayoutsThisMonth: Number(payouts.total),
    blockedPayoutsThisMonth: Number(payouts.blocked),
  };
}

// ─── Vendor KYC List ────────────────────────────────────────────────────────

export interface AdminVendorRow {
  id: string;
  name: string;
  email: string;
  storeName: string;
  kycTier: string;
  kycStatus: string;
  bankVerified: boolean;
  bankName: string | null;
  accountName: string | null;
  bankNameMatchScore: number | null;
  createdAt: string;
  monthlyPayouts: number;
  verificationsCount: number;
  pendingCAC?: {
    id: string;
    rcNumber: string;
    companyName: string;
    bankAccountName?: string;
    bankName?: string;
    isCorporateAccount?: boolean;
    nameMatchScore?: number;
    submittedAt: string;
    cacPortalUrl: string;
  } | null;
}

export async function getVendorsForReview(params: {
  filter?: 'all' | 'unverified' | 'flagged' | 'pending';
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ vendors: AdminVendorRow[]; total: number }> {
  const { filter = 'all', search = '', page = 1, pageSize = 20 } = params;
  const offset = (page - 1) * pageSize;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  let whereClause = sql`WHERE u.role = 'vendor'`;

  if (filter === 'unverified') {
    whereClause = sql`WHERE u.role = 'vendor' AND (u.kyc_status = 'unverified' OR u.kyc_status IS NULL)`;
  } else if (filter === 'flagged') {
    whereClause = sql`WHERE u.role = 'vendor' AND u.id IN (SELECT DISTINCT vendor_id FROM fraud_audit_logs WHERE resolved = FALSE)`;
  } else if (filter === 'pending') {
    whereClause = sql`WHERE u.role = 'vendor' AND u.id IN (SELECT DISTINCT vendor_id FROM kyc_verifications WHERE status = 'pending')`;
  }

  // Build the search condition
  let searchClause = sql``;
  if (search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    searchClause = sql`AND (u.name ILIKE ${searchTerm} OR u.email ILIKE ${searchTerm} OR u.store_name ILIKE ${searchTerm})`;
  }

  const countResult = await sql`
    SELECT COUNT(*) AS total
    FROM users u
    ${whereClause}
    ${searchClause}
  `;

  const rows = await sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u.store_name,
      COALESCE(u.kyc_tier, 'starter') AS kyc_tier,
      COALESCE(u.kyc_status, 'unverified') AS kyc_status,
      COALESCE(u.bank_verified, FALSE) AS bank_verified,
      u.bank_name,
      u.account_name,
      u.bank_name_match_score,
      u.created_at,
      COALESCE((
        SELECT SUM(requested_amount) FROM payouts p
        WHERE p.vendor_id = u.id AND p.status != 'failed' AND p.requested_at >= ${startOfMonth}
      ), 0) AS monthly_payouts,
      (
        SELECT COUNT(*) FROM kyc_verifications kv WHERE kv.vendor_id = u.id
      ) AS verifications_count,
      (
        SELECT json_build_object(
          'id', kv.id,
          'rcNumber', kv.id_number_masked,
          'companyName', kv.resolved_name,
          'bankAccountName', (kv.metadata->>'bankAccountName'),
          'bankName', (kv.metadata->>'bankName'),
          'isCorporateAccount', (kv.metadata->>'isCorporateAccount')::boolean,
          'nameMatchScore', kv.name_match_score,
          'submittedAt', kv.created_at,
          'cacPortalUrl', 'https://search.cac.gov.ng'
        )
        FROM kyc_verifications kv
        WHERE kv.vendor_id = u.id AND kv.status = 'pending' AND kv.id_type = 'cac'
        ORDER BY kv.created_at DESC
        LIMIT 1
      ) AS pending_cac
    FROM users u
    ${whereClause}
    ${searchClause}
    ORDER BY u.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  const vendors: AdminVendorRow[] = rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    storeName: r.store_name || '',
    kycTier: r.kyc_tier,
    kycStatus: r.kyc_status,
    bankVerified: Boolean(r.bank_verified),
    bankName: r.bank_name || null,
    accountName: r.account_name || null,
    bankNameMatchScore: r.bank_name_match_score ? Number(r.bank_name_match_score) : null,
    createdAt: r.created_at,
    monthlyPayouts: Number(r.monthly_payouts),
    verificationsCount: Number(r.verifications_count),
    pendingCAC: r.pending_cac || null,
  }));

  return { vendors, total: Number(countResult[0]?.total || 0) };
}

// ─── Fraud Audit Logs ───────────────────────────────────────────────────────

export interface FraudLogEntry {
  id: string;
  vendorId: string | null;
  vendorName: string | null;
  vendorEmail: string | null;
  eventType: string;
  severity: string;
  details: any;
  ipAddress: string | null;
  resolved: boolean;
  createdAt: string;
}

export async function getFraudLogs(params: {
  severity?: 'all' | 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean | null;
  page?: number;
  pageSize?: number;
}): Promise<{ logs: FraudLogEntry[]; total: number }> {
  const { severity = 'all', resolved = null, page = 1, pageSize = 25 } = params;
  const offset = (page - 1) * pageSize;

  let whereClause = sql`WHERE 1=1`;
  if (severity !== 'all') {
    whereClause = sql`WHERE f.severity = ${severity}`;
  }

  let resolvedClause = sql``;
  if (resolved === true) {
    resolvedClause = sql`AND f.resolved = TRUE`;
  } else if (resolved === false) {
    resolvedClause = sql`AND f.resolved = FALSE`;
  }

  const countResult = await sql`
    SELECT COUNT(*) AS total FROM fraud_audit_logs f ${whereClause} ${resolvedClause}
  `;

  const rows = await sql`
    SELECT
      f.id,
      f.vendor_id,
      u.name AS vendor_name,
      u.email AS vendor_email,
      f.event_type,
      f.severity,
      f.details,
      f.ip_address,
      f.resolved,
      f.created_at
    FROM fraud_audit_logs f
    LEFT JOIN users u ON u.id = f.vendor_id
    ${whereClause}
    ${resolvedClause}
    ORDER BY f.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  const logs: FraudLogEntry[] = rows.map((r: any) => ({
    id: r.id,
    vendorId: r.vendor_id,
    vendorName: r.vendor_name || null,
    vendorEmail: r.vendor_email || null,
    eventType: r.event_type,
    severity: r.severity,
    details: r.details,
    ipAddress: r.ip_address || null,
    resolved: Boolean(r.resolved),
    createdAt: r.created_at,
  }));

  return { logs, total: Number(countResult[0]?.total || 0) };
}

// ─── KYC Verification History for a Vendor ──────────────────────────────────

export interface KYCVerificationEntry {
  id: string;
  tier: string;
  status: string;
  idType: string;
  idNumberMasked: string | null;
  resolvedName: string | null;
  nameMatchScore: number | null;
  rejectionReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export async function getVendorVerifications(vendorId: string): Promise<KYCVerificationEntry[]> {
  const rows = await sql`
    SELECT id, tier, status, id_type, id_number_masked, resolved_name, name_match_score,
           rejection_reason, verified_at, created_at
    FROM kyc_verifications
    WHERE vendor_id = ${vendorId}
    ORDER BY created_at DESC
  `;

  return rows.map((r: any) => ({
    id: r.id,
    tier: r.tier,
    status: r.status,
    idType: r.id_type,
    idNumberMasked: r.id_number_masked || null,
    resolvedName: r.resolved_name || null,
    nameMatchScore: r.name_match_score ? Number(r.name_match_score) : null,
    rejectionReason: r.rejection_reason || null,
    verifiedAt: r.verified_at || null,
    createdAt: r.created_at,
  }));
}

// ─── Admin Actions ──────────────────────────────────────────────────────────

/**
 * Admin manually overrides a vendor's KYC tier (e.g. after document review).
 */
export async function adminSetVendorKYCTier(
  adminId: string,
  vendorId: string,
  tier: 'starter' | 'pro' | 'business',
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const validTiers = ['starter', 'pro', 'business'];
  if (!validTiers.includes(tier)) {
    return { success: false, error: 'Invalid tier specified' };
  }

  if (!reason || !reason.trim()) {
    return { success: false, error: 'Reason is required for administrative audit tracking' };
  }

  try {
    await sql`
      UPDATE users
      SET kyc_tier = ${tier}, kyc_status = 'verified'
      WHERE id = ${vendorId}
    `;

    await sql`
      INSERT INTO kyc_verifications (
        vendor_id, tier, status, id_type, resolved_name, verified_at, metadata
      ) VALUES (
        ${vendorId}, ${tier}, 'verified', 'admin_override', ${reason}, CURRENT_TIMESTAMP,
        ${JSON.stringify({ adminId, reason, action: 'tier_override' })}
      )
    `;

    await logFraudEvent(vendorId, 'admin_tier_override', 'low', {
      adminId,
      newTier: tier,
      reason,
    });

    return { success: true };
  } catch (error: any) {
    console.error('adminSetVendorKYCTier error:', error);
    return { success: false, error: error?.message || 'Failed to update tier' };
  }
}

/**
 * Admin suspends a vendor's payout ability by downgrading to unverified.
 */
export async function adminSuspendVendor(
  adminId: string,
  vendorId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  if (!reason || !reason.trim()) {
    return { success: false, error: 'Reason is required for vendor suspension' };
  }

  try {
    await sql`
      UPDATE users
      SET kyc_status = 'rejected', bank_verified = FALSE
      WHERE id = ${vendorId}
    `;

    await sql`
      INSERT INTO kyc_verifications (
        vendor_id, tier, status, id_type, rejection_reason, metadata
      ) VALUES (
        ${vendorId}, 'starter', 'rejected', 'admin_suspension', ${reason},
        ${JSON.stringify({ adminId, reason, action: 'suspension' })}
      )
    `;

    await logFraudEvent(vendorId, 'admin_suspension', 'high', {
      adminId,
      reason,
    });

    return { success: true };
  } catch (error: any) {
    console.error('adminSuspendVendor error:', error);
    return { success: false, error: error?.message || 'Failed to suspend vendor' };
  }
}

/**
 * Admin resolves (acknowledges) a fraud alert.
 */
export async function adminResolveFraudAlert(
  adminId: string,
  alertId: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`
      UPDATE fraud_audit_logs
      SET resolved = TRUE
      WHERE id = ${alertId}
    `;

    return { success: true };
  } catch (error: any) {
    console.error('adminResolveFraudAlert error:', error);
    return { success: false, error: error?.message || 'Failed to resolve alert' };
  }
}

/**
 * Admin approves a pending CAC submission after verifying on search.cac.gov.ng (Zero API fees).
 * Automatically upgrades the vendor to Business Tier.
 */
export async function adminApproveCACVerification(
  adminId: string,
  verificationId: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const verRes = await sql`
      SELECT id, vendor_id, id_number_masked, resolved_name, metadata
      FROM kyc_verifications
      WHERE id = ${verificationId} AND status = 'pending'
      LIMIT 1
    `;
    if (!verRes.length) {
      return { success: false, error: 'Pending CAC submission not found' };
    }
    const ver = verRes[0];

    // 1. Update verification record to verified
    await sql`
      UPDATE kyc_verifications
      SET
        status = 'verified',
        verified_at = CURRENT_TIMESTAMP,
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{adminApproval}',
          ${JSON.stringify({ adminId, notes, approvedAt: new Date().toISOString() })}::jsonb
        )
      WHERE id = ${verificationId}
    `;

    // 2. Upgrade vendor to Business tier
    await sql`
      UPDATE users
      SET
        kyc_tier = 'business',
        kyc_status = 'verified'
      WHERE id = ${ver.vendor_id}
    `;

    // 3. Log fraud/compliance audit event
    await logFraudEvent(ver.vendor_id, 'admin_cac_approved', 'low', {
      adminId,
      verificationId,
      rcNumber: ver.id_number_masked,
      companyName: ver.resolved_name,
      notes,
    });

    return { success: true };
  } catch (error: any) {
    console.error('adminApproveCACVerification error:', error);
    return { success: false, error: error?.message || 'Failed to approve CAC verification' };
  }
}

/**
 * Admin rejects a pending CAC submission with a reason for the vendor.
 */
export async function adminRejectCACVerification(
  adminId: string,
  verificationId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  if (!reason || !reason.trim()) {
    return { success: false, error: 'Rejection reason is required' };
  }

  try {
    const verRes = await sql`
      SELECT id, vendor_id, id_number_masked, resolved_name
      FROM kyc_verifications
      WHERE id = ${verificationId} AND status = 'pending'
      LIMIT 1
    `;
    if (!verRes.length) {
      return { success: false, error: 'Pending CAC submission not found' };
    }
    const ver = verRes[0];

    // 1. Update verification to rejected
    await sql`
      UPDATE kyc_verifications
      SET
        status = 'rejected',
        rejection_reason = ${reason.trim()},
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{adminRejection}',
          ${JSON.stringify({ adminId, reason: reason.trim(), rejectedAt: new Date().toISOString() })}::jsonb
        )
      WHERE id = ${verificationId}
    `;

    // 2. Restore vendor status (keeps current tier like starter or pro)
    await sql`
      UPDATE users
      SET kyc_status = CASE WHEN bank_verified = TRUE THEN 'verified' ELSE 'unverified' END
      WHERE id = ${ver.vendor_id}
    `;

    // 3. Log compliance event
    await logFraudEvent(ver.vendor_id, 'admin_cac_rejected', 'medium', {
      adminId,
      verificationId,
      rcNumber: ver.id_number_masked,
      companyName: ver.resolved_name,
      reason: reason.trim(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('adminRejectCACVerification error:', error);
    return { success: false, error: error?.message || 'Failed to reject CAC verification' };
  }
}
