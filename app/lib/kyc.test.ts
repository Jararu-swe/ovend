import { describe, it, expect } from 'vitest';
import {
  compareNames,
  hashIdentifier,
  maskIdentifier,
  KYC_TIERS,
} from './kyc';

describe('KYC System Tests', () => {
  describe('Tier Configurations & Naming', () => {
    it('should have exact tier names matching billing tiers: starter, pro, business', () => {
      expect(KYC_TIERS.starter).toBeDefined();
      expect(KYC_TIERS.pro).toBeDefined();
      expect(KYC_TIERS.business).toBeDefined();

      expect(KYC_TIERS.starter.tier).toBe('starter');
      expect(KYC_TIERS.pro.tier).toBe('pro');
      expect(KYC_TIERS.business.tier).toBe('business');
    });

    it('should have correct regulatory payout limits per tier', () => {
      expect(KYC_TIERS.starter.maxPayoutPerRequestNaira).toBe(50_000);
      expect(KYC_TIERS.starter.maxMonthlyPayoutNaira).toBe(200_000);
      expect(KYC_TIERS.starter.settlementDays).toBe(3);

      expect(KYC_TIERS.pro.maxPayoutPerRequestNaira).toBe(500_000);
      expect(KYC_TIERS.pro.maxMonthlyPayoutNaira).toBe(2_000_000);
      expect(KYC_TIERS.pro.settlementDays).toBe(1);

      expect(KYC_TIERS.business.maxPayoutPerRequestNaira).toBe(10_000_000);
      expect(KYC_TIERS.business.maxMonthlyPayoutNaira).toBe(50_000_000);
      expect(KYC_TIERS.business.settlementDays).toBe(0);
    });
  });

  describe('Name Matching Algorithm (Nigerian Name Order & Anti-Mule Protection)', () => {
    it('should match exact names', () => {
      const result = compareNames('Adeola Bakare', 'Adeola Bakare');
      expect(result.isMatch).toBe(true);
      expect(result.score).toBe(100);
    });

    it('should match Nigerian surname-first order (e.g. Bakare Adeola vs Adeola Bakare)', () => {
      const result = compareNames('Adeola Bakare', 'Bakare Adeola');
      expect(result.isMatch).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it('should match when bank account includes middle name (e.g. Bakare Adeola Joseph)', () => {
      const result = compareNames('Adeola Bakare', 'Bakare Adeola Joseph');
      expect(result.isMatch).toBe(true);
    });

    it('should ignore Nigerian titles (Mr, Chief, Alhaja, Dr, Engr)', () => {
      const result = compareNames('Chief Adeola Bakare', 'Bakare Adeola');
      expect(result.isMatch).toBe(true);
    });

    it('should reject completely different mule account names', () => {
      const result = compareNames('Adeola Bakare', 'Chinedu Eze Okoro');
      expect(result.isMatch).toBe(false);
      expect(result.score).toBeLessThan(75);
    });
  });

  describe('NDPA-Compliant Masking & Hashing', () => {
    it('should mask 11-digit BVN/NIN showing only last 4 digits', () => {
      const masked = maskIdentifier('22233344455');
      expect(masked).toBe('•••• ••• 4455');
    });

    it('should produce consistent salted hashes for duplicate detection', () => {
      const hash1 = hashIdentifier('22233344455');
      const hash2 = hashIdentifier('22233344455');
      const hash3 = hashIdentifier('99988877766');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).toHaveLength(64); // SHA-256 hex string
    });
  });
});
