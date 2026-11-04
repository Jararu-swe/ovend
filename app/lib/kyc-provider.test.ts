import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PaystackKYCProvider,
  PremblyKYCProvider,
  SandboxKYCProvider,
  getKYCProvider,
  setTestKYCProvider,
} from './kyc-provider';

describe('KYC & KYB Provider Tests', () => {
  beforeEach(() => {
    setTestKYCProvider(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PaystackKYCProvider', () => {
    it('should verify test BVN in test mode (sk_test_...)', async () => {
      const paystack = new PaystackKYCProvider('sk_test_1234567890');
      const result = await paystack.verifyBVN({
        bvn: '22233344455',
        accountNumber: '0123456789',
        bankCode: '058',
      });

      expect(result.ok).toBe(true);
      expect(result.bvnMasked).toBe('•••• ••• 4455');
      expect(result.fullName).toBe('PAYSTACK TEST ACCOUNT');
    });

    it('should require bank account number and bank code for BVN verification', async () => {
      const paystack = new PaystackKYCProvider('sk_test_1234567890');
      const result = await paystack.verifyBVN({
        bvn: '22233344455',
      });

      expect(result.ok).toBe(false);
      expect(result.error).toContain('verify your bank account first');
    });

    it('should reject invalid BVN length', async () => {
      const paystack = new PaystackKYCProvider('sk_test_1234567890');
      const result = await paystack.verifyBVN({
        bvn: '123',
        accountNumber: '0123456789',
        bankCode: '058',
      });

      expect(result.ok).toBe(false);
      expect(result.error).toContain('11 digits');
    });

    it('should call live Paystack /bvn/match API in production mode (sk_live_...)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: true,
          message: 'BVN match confirmed',
          data: {
            bvn: '22233344455',
            is_blacklisted: false,
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const paystack = new PaystackKYCProvider('sk_live_9876543210');
      const result = await paystack.verifyBVN({
        bvn: '22233344455',
        accountNumber: '0123456789',
        bankCode: '058',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.paystack.co/bvn/match');
      expect(options.headers['Authorization']).toBe('Bearer sk_live_9876543210');
      expect(JSON.parse(options.body)).toEqual({
        bvn: '22233344455',
        account_number: '0123456789',
        bank_code: '058',
      });

      expect(result.ok).toBe(true);
      expect(result.bvnMasked).toBe('•••• ••• 4455');
    });

    it('should handle Paystack mismatch response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          status: false,
          message: 'The BVN does not match the bank account record provided',
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const paystack = new PaystackKYCProvider('sk_live_9876543210');
      const result = await paystack.verifyBVN({
        bvn: '22233344455',
        accountNumber: '0123456789',
        bankCode: '058',
      });

      expect(result.ok).toBe(false);
      expect(result.error).toContain('does not match');
    });

    it('should verify CAC registration format in Paystack provider', async () => {
      const paystack = new PaystackKYCProvider('sk_test_123');
      const result = await paystack.verifyCAC({
        rcNumber: 'RC1894231',
        companyName: 'Bakare Global Ventures Ltd',
      });

      expect(result.ok).toBe(true);
      expect(result.companyStatus).toBe('ACTIVE');
      expect(result.rcNumber).toBe('RC1894231');
    });
  });

  describe('SandboxKYCProvider', () => {
    const sandbox = new SandboxKYCProvider();

    it('should verify valid 11-digit BVN in sandbox', async () => {
      const result = await sandbox.verifyBVN({ bvn: '22222222222' });
      expect(result.ok).toBe(true);
      expect(result.fullName).toBe('SANDBOX VERIFIED USER');
      expect(result.bvnMasked).toBe('•••• ••• 2222');
    });

    it('should reject invalid length BVN', async () => {
      const result = await sandbox.verifyBVN({ bvn: '12345' });
      expect(result.ok).toBe(false);
      expect(result.error).toContain('11 digits');
    });

    it('should return error for deterministic test failure BVN 00000000000', async () => {
      const result = await sandbox.verifyBVN({ bvn: '00000000000' });
      expect(result.ok).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should verify valid 11-digit NIN in sandbox', async () => {
      const result = await sandbox.verifyNIN({ nin: '11111111111' });
      expect(result.ok).toBe(true);
      expect(result.fullName).toBe('SANDBOX VERIFIED USER');
      expect(result.ninMasked).toBe('•••• ••• 1111');
    });

    it('should verify valid CAC registration number in sandbox', async () => {
      const result = await sandbox.verifyCAC({
        rcNumber: 'RC1894231',
        companyName: 'Bakare Logistics Ltd',
      });
      expect(result.ok).toBe(true);
      expect(result.companyStatus).toBe('ACTIVE');
      expect(result.companyName).toBe('Bakare Logistics Ltd');
      expect(result.rcNumber).toBe('RC1894231');
    });
  });

  describe('PremblyKYCProvider', () => {
    it('should call Prembly BVN validation endpoint with correct headers', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: true,
          data: {
            bvn: '22233344455',
            firstName: 'Adeola',
            lastName: 'Bakare',
            dateOfBirth: '1992-04-12',
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const prembly = new PremblyKYCProvider('test-key', 'test-app', 'https://api.myidentitypass.com');
      const result = await prembly.verifyBVN({ bvn: '22233344455' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.myidentitypass.com/api/v2/biometrics/merchant/data/verification/bvn_validation');
      expect(options.headers['x-api-key']).toBe('test-key');
      expect(options.headers['app-id']).toBe('test-app');

      expect(result.ok).toBe(true);
      expect(result.fullName).toBe('Adeola Bakare');
      expect(result.bvnMasked).toBe('•••• ••• 4455');
    });

    it('should handle API errors and non-200 responses gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          status: false,
          message: 'Insufficient wallet balance for verification',
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const prembly = new PremblyKYCProvider('test-key', 'test-app');
      const result = await prembly.verifyBVN({ bvn: '22233344455' });

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Insufficient wallet balance');
    });
  });

  describe('getKYCProvider Factory', () => {
    it('should return PaystackKYCProvider when PAYSTACK_SECRET_KEY is present', () => {
      const originalPaystack = process.env.PAYSTACK_SECRET_KEY;
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_123';
      delete process.env.PREMBLY_API_KEY;

      const provider = getKYCProvider();
      expect(provider.name).toBe('paystack');

      if (originalPaystack) process.env.PAYSTACK_SECRET_KEY = originalPaystack;
    });
  });
});
