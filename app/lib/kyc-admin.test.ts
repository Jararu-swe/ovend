import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isAdminUser,
  adminSetVendorKYCTier,
  adminSuspendVendor,
  adminResolveFraudAlert,
  adminApproveCACVerification,
  adminRejectCACVerification,
} from './kyc-admin';

// Mock DB
const mockSql = vi.fn();
vi.mock('@/app/lib/db', () => ({
  sql: (...args: any[]) => mockSql(...args),
}));

vi.mock('@/app/lib/kyc', () => ({
  logFraudEvent: vi.fn().mockResolvedValue('fraud-123'),
}));

describe('KYC Admin Library Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_EMAILS = 'testuser@ovend.com,admin@ovend.com';
  });

  describe('isAdminUser', () => {
    it('should return false if user does not exist in db', async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await isAdminUser('non-existent-id');
      expect(result).toBe(false);
    });

    it('should return false if email is not in ADMIN_EMAILS', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'random-vendor@example.com' }]);
      const result = await isAdminUser('user-123');
      expect(result).toBe(false);
    });

    it('should return true if email is in ADMIN_EMAILS', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'testuser@ovend.com' }]);
      const result = await isAdminUser('user-123');
      expect(result).toBe(true);
    });

    it('should handle case insensitivity in email matching', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'TestUser@OVEND.com' }]);
      const result = await isAdminUser('user-123');
      expect(result).toBe(true);
    });
  });

  describe('adminSetVendorKYCTier', () => {
    it('should reject invalid tier values', async () => {
      const result = await adminSetVendorKYCTier(
        'admin-1',
        'vendor-123',
        'super_tier' as any,
        'Testing invalid tier',
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid tier');
    });

    it('should require a reason for audit logging', async () => {
      const result = await adminSetVendorKYCTier(
        'admin-1',
        'vendor-123',
        'business',
        '   ',
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Reason is required');
    });

    it('should succeed with valid tier and record audit log', async () => {
      mockSql.mockResolvedValueOnce([]); // update query
      mockSql.mockResolvedValueOnce([]); // insert verification audit record

      const result = await adminSetVendorKYCTier(
        'admin-1',
        'vendor-123',
        'pro',
        'Verified ID document physically in office',
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('adminSuspendVendor', () => {
    it('should require a reason for suspension', async () => {
      const result = await adminSuspendVendor(
        'admin-1',
        'vendor-123',
        '',
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Reason is required');
    });

    it('should suspend vendor successfully and mark KYC status blocked', async () => {
      mockSql.mockResolvedValueOnce([]); // user update
      mockSql.mockResolvedValueOnce([]); // insert audit record

      const result = await adminSuspendVendor(
        'admin-1',
        'vendor-123',
        'Reported fraudulent store transactions',
      );

      expect(result.success).toBe(true);
    });
  });

  describe('adminResolveFraudAlert', () => {
    it('should resolve the fraud alert and update the record', async () => {
      mockSql.mockResolvedValueOnce([]); // update fraud log

      const result = await adminResolveFraudAlert(
        'admin-1',
        'fraud-1',
        'Reviewed and confirmed false positive by merchant bank change notice',
      );

      expect(result.success).toBe(true);
    });
  });

  // ─── CAC Compliance Review (Zero API Fee Workflow) ──────────────────────

  describe('adminApproveCACVerification', () => {
    it('should return error if pending CAC submission not found', async () => {
      mockSql.mockResolvedValueOnce([]); // SELECT returns no rows

      const result = await adminApproveCACVerification('admin-1', 'ver-nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should approve a pending CAC and upgrade vendor to business tier', async () => {
      // SELECT pending verification
      mockSql.mockResolvedValueOnce([{
        id: 'ver-100',
        vendor_id: 'vendor-200',
        id_number_masked: 'RC123456',
        resolved_name: 'ACME VENTURES LTD',
        metadata: JSON.stringify({ isCorporateAccount: true }),
      }]);
      mockSql.mockResolvedValueOnce([]); // UPDATE kyc_verifications → verified
      mockSql.mockResolvedValueOnce([]); // UPDATE users → business tier

      const result = await adminApproveCACVerification(
        'admin-1',
        'ver-100',
        'Confirmed active on search.cac.gov.ng',
      );

      expect(result.success).toBe(true);
      // Verify the queries were called (SELECT + UPDATE ver + UPDATE user)
      expect(mockSql).toHaveBeenCalledTimes(3);
    });

    it('should work without optional notes', async () => {
      mockSql.mockResolvedValueOnce([{
        id: 'ver-101',
        vendor_id: 'vendor-201',
        id_number_masked: 'BN789012',
        resolved_name: 'SUNSHINE ENTERPRISES',
        metadata: '{}',
      }]);
      mockSql.mockResolvedValueOnce([]); // UPDATE kyc_verifications
      mockSql.mockResolvedValueOnce([]); // UPDATE users

      const result = await adminApproveCACVerification('admin-1', 'ver-101');
      expect(result.success).toBe(true);
    });
  });

  describe('adminRejectCACVerification', () => {
    it('should require a rejection reason', async () => {
      const result = await adminRejectCACVerification('admin-1', 'ver-100', '');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Rejection reason is required');
    });

    it('should require a non-whitespace rejection reason', async () => {
      const result = await adminRejectCACVerification('admin-1', 'ver-100', '   ');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Rejection reason is required');
    });

    it('should return error if pending CAC submission not found', async () => {
      mockSql.mockResolvedValueOnce([]); // SELECT returns no rows

      const result = await adminRejectCACVerification(
        'admin-1',
        'ver-nonexistent',
        'RC number not found on CAC portal',
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should reject a pending CAC submission and restore vendor status', async () => {
      // SELECT pending verification
      mockSql.mockResolvedValueOnce([{
        id: 'ver-102',
        vendor_id: 'vendor-202',
        id_number_masked: 'RC999999',
        resolved_name: 'FAKE COMPANY LTD',
      }]);
      mockSql.mockResolvedValueOnce([]); // UPDATE kyc_verifications → rejected
      mockSql.mockResolvedValueOnce([]); // UPDATE users → restore status

      const result = await adminRejectCACVerification(
        'admin-1',
        'ver-102',
        'Company status shows INACTIVE on search.cac.gov.ng',
      );

      expect(result.success).toBe(true);
      expect(mockSql).toHaveBeenCalledTimes(3); // SELECT + UPDATE ver + UPDATE user
    });
  });
});

