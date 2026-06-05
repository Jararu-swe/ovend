import { describe, expect, test } from 'vitest';
import {
  formatSubscriptionDate,
  calculateDaysRemaining,
  getStatusBadgeStyle,
  getTierDisplayName,
  formatPrice
} from './subscription-utils';

describe('subscription-utils', () => {
  describe('formatSubscriptionDate', () => {
    test('should format ISO date string to readable format', () => {
      const result = formatSubscriptionDate('2024-01-15T00:00:00.000Z');
      expect(result).toBe('January 15, 2024');
    });

    test('should return empty string for null input', () => {
      const result = formatSubscriptionDate(null);
      expect(result).toBe('');
    });

    test('should return empty string for invalid date', () => {
      const result = formatSubscriptionDate('invalid-date');
      expect(result).toBe('');
    });
  });

  describe('calculateDaysRemaining', () => {
    test('should calculate positive days remaining', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const result = calculateDaysRemaining(futureDate.toISOString());
      expect(result).toBeGreaterThanOrEqual(9);
      expect(result).toBeLessThanOrEqual(10);
    });

    test('should return 0 for past dates', () => {
      const pastDate = new Date('2020-01-01T00:00:00.000Z');
      const result = calculateDaysRemaining(pastDate.toISOString());
      expect(result).toBe(0);
    });

    test('should return 0 for null input', () => {
      const result = calculateDaysRemaining(null);
      expect(result).toBe(0);
    });

    test('should return 0 for invalid date', () => {
      const result = calculateDaysRemaining('invalid-date');
      expect(result).toBe(0);
    });
  });

  describe('getStatusBadgeStyle', () => {
    test('should return green styles for active status', () => {
      const result = getStatusBadgeStyle('active');
      expect(result).toContain('green');
    });

    test('should return blue styles for trial status', () => {
      const result = getStatusBadgeStyle('trial');
      expect(result).toContain('blue');
    });

    test('should return red styles for past_due status', () => {
      const result = getStatusBadgeStyle('past_due');
      expect(result).toContain('red');
    });

    test('should return gray styles for cancelled status', () => {
      const result = getStatusBadgeStyle('cancelled');
      expect(result).toContain('gray');
    });

    test('should return gray styles for inactive status', () => {
      const result = getStatusBadgeStyle('inactive');
      expect(result).toContain('gray');
    });
  });

  describe('getTierDisplayName', () => {
    test('should return "Starter" for starter tier', () => {
      const result = getTierDisplayName('starter');
      expect(result).toBe('Starter');
    });

    test('should return "Pro" for pro tier', () => {
      const result = getTierDisplayName('pro');
      expect(result).toBe('Pro');
    });

    test('should return "Business" for business tier', () => {
      const result = getTierDisplayName('business');
      expect(result).toBe('Business');
    });
  });

  describe('formatPrice', () => {
    test('should return "Free" for 0 kobo', () => {
      const result = formatPrice(0);
      expect(result).toBe('Free');
    });

    test('should format kobo to naira with currency symbol', () => {
      const result = formatPrice(150000); // 1,500 naira
      expect(result).toBe('₦1,500');
    });

    test('should format large amounts with comma separator', () => {
      const result = formatPrice(350000); // 3,500 naira
      expect(result).toBe('₦3,500');
    });

    test('should handle amounts without decimal places', () => {
      const result = formatPrice(100000); // 1,000 naira
      expect(result).toBe('₦1,000');
    });
  });
});
