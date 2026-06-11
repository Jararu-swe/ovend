import { describe, expect, test } from 'vitest';
import { validateDomain, normalizeDomain } from './domain-validation';

// ---------------------------------------------------------------------------
// normalizeDomain
// ---------------------------------------------------------------------------
describe('normalizeDomain', () => {
  test('strips https:// prefix', () => {
    expect(normalizeDomain('https://mybrand.com')).toBe('mybrand.com');
  });

  test('strips http:// prefix', () => {
    expect(normalizeDomain('http://mybrand.com')).toBe('mybrand.com');
  });

  test('strips www. prefix', () => {
    expect(normalizeDomain('www.mybrand.com')).toBe('mybrand.com');
  });

  test('strips both protocol and www', () => {
    expect(normalizeDomain('https://www.mybrand.com')).toBe('mybrand.com');
  });

  test('strips trailing slash', () => {
    expect(normalizeDomain('mybrand.com/')).toBe('mybrand.com');
  });

  test('lowercases the domain', () => {
    expect(normalizeDomain('MYBRAND.COM')).toBe('mybrand.com');
  });

  test('trims whitespace', () => {
    expect(normalizeDomain('  mybrand.com  ')).toBe('mybrand.com');
  });

  test('handles complex input', () => {
    expect(normalizeDomain('  HTTPS://WWW.Shop.MyBrand.com/  ')).toBe('shop.mybrand.com');
  });

  test('returns null for non-string input', () => {
    expect(normalizeDomain(null as any)).toBeNull();
    expect(normalizeDomain(undefined as any)).toBeNull();
    expect(normalizeDomain(123 as any)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateDomain
// ---------------------------------------------------------------------------
describe('validateDomain', () => {
  // ── Valid domains ──────────────────────────────────────────────
  describe('valid domains', () => {
    test('accepts a simple .com domain', () => {
      const result = validateDomain('mybrand.com');
      expect(result.valid).toBe(true);
      expect(result.normalizedDomain).toBe('mybrand.com');
    });

    test('accepts a domain with https:// prefix', () => {
      const result = validateDomain('https://mybrand.com');
      expect(result.valid).toBe(true);
      expect(result.normalizedDomain).toBe('mybrand.com');
    });

    test('accepts a domain with www prefix', () => {
      const result = validateDomain('www.mybrand.com');
      expect(result.valid).toBe(true);
      expect(result.normalizedDomain).toBe('mybrand.com');
    });

    test('accepts a subdomain', () => {
      const result = validateDomain('shop.mybrand.com');
      expect(result.valid).toBe(true);
      expect(result.normalizedDomain).toBe('shop.mybrand.com');
    });

    test('accepts a .ng ccTLD domain', () => {
      const result = validateDomain('mybrand.ng');
      expect(result.valid).toBe(true);
    });

    test('accepts a .com.ng domain', () => {
      const result = validateDomain('mybrand.com.ng');
      expect(result.valid).toBe(true);
    });

    test('accepts a .co.uk domain', () => {
      const result = validateDomain('mybrand.co.uk');
      expect(result.valid).toBe(true);
    });

    test('accepts a domain with hyphens', () => {
      const result = validateDomain('my-brand-store.com');
      expect(result.valid).toBe(true);
    });

    test('accepts a .io domain', () => {
      const result = validateDomain('mybrand.io');
      expect(result.valid).toBe(true);
    });

    test('accepts a .app TLD domain', () => {
      const result = validateDomain('mybrand.app');
      expect(result.valid).toBe(true);
    });

    test('accepts domain with numbers', () => {
      const result = validateDomain('store123.com');
      expect(result.valid).toBe(true);
    });
  });

  // ── Internal hostnames ─────────────────────────────────────────
  describe('internal hostnames', () => {
    test('rejects localhost', () => {
      const result = validateDomain('localhost');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('internal hostname');
    });

    test('rejects 127.0.0.1', () => {
      const result = validateDomain('127.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('internal hostname');
    });

    test('rejects 0.0.0.0', () => {
      const result = validateDomain('0.0.0.0');
      expect(result.valid).toBe(false);
    });
  });

  // ── Reserved TLDs ──────────────────────────────────────────────
  describe('reserved TLDs', () => {
    test('rejects .local domain', () => {
      const result = validateDomain('mybrand.local');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved');
    });

    test('rejects .test domain', () => {
      const result = validateDomain('mybrand.test');
      expect(result.valid).toBe(false);
    });

    test('rejects .example domain', () => {
      const result = validateDomain('mybrand.example');
      expect(result.valid).toBe(false);
    });

    test('rejects .invalid domain', () => {
      const result = validateDomain('mybrand.invalid');
      expect(result.valid).toBe(false);
    });

    test('rejects .localhost TLD', () => {
      const result = validateDomain('myapp.localhost');
      expect(result.valid).toBe(false);
    });

    test('rejects .internal domain', () => {
      const result = validateDomain('corp.internal');
      expect(result.valid).toBe(false);
    });

    test('rejects .arpa domain', () => {
      const result = validateDomain('reverse.arpa');
      expect(result.valid).toBe(false);
    });

    test('rejects .onion domain', () => {
      const result = validateDomain('darknet.onion');
      expect(result.valid).toBe(false);
    });
  });

  // ── Platform's own domain ──────────────────────────────────────
  describe('platform domain protection', () => {
    test('rejects vendle.com.ng itself', () => {
      const result = validateDomain('vendle.com.ng');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('vendle.com.ng');
    });

    test('rejects www.vendle.com.ng', () => {
      const result = validateDomain('www.vendle.com.ng');
      expect(result.valid).toBe(false);
    });

    test('rejects https://vendle.com.ng', () => {
      const result = validateDomain('https://vendle.com.ng');
      expect(result.valid).toBe(false);
    });

    test('rejects subdomains of vendle.com.ng', () => {
      const result = validateDomain('shop.vendle.com.ng');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved');
    });

    test('accepts a domain that contains vendle but is different', () => {
      const result = validateDomain('myvendlestore.com');
      expect(result.valid).toBe(true);
    });

    test('uses custom root domain when provided', () => {
      const result = validateDomain('myapp.vercel.app', 'vercel.app');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved');
    });

    test('rejects custom root domain itself', () => {
      const result = validateDomain('myplatform.com', 'myplatform.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('myplatform.com');
    });
  });

  // ── Invalid format ─────────────────────────────────────────────
  describe('format validation', () => {
    test('rejects empty string', () => {
      const result = validateDomain('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('rejects string with no TLD', () => {
      const result = validateDomain('mybrand');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid domain format');
    });

    test('rejects string starting with dot', () => {
      const result = validateDomain('.com');
      expect(result.valid).toBe(false);
    });

    test('rejects string with double dots', () => {
      const result = validateDomain('my..brand.com');
      expect(result.valid).toBe(false);
    });

    test('rejects domain with trailing dot', () => {
      const result = validateDomain('mybrand.com.');
      // After normalization this might fail format check depending on trailing dot removal
      expect(result.valid).toBe(false);
    });

    test('rejects domain starting with hyphen', () => {
      const result = validateDomain('-mybrand.com');
      expect(result.valid).toBe(false);
    });

    test('rejects domain ending with hyphen', () => {
      const result = validateDomain('mybrand-.com');
      expect(result.valid).toBe(false);
    });

    test('rejects non-string input via normalize', () => {
      const result = validateDomain(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────
  describe('edge cases', () => {
    test('handles whitespace around the domain', () => {
      const result = validateDomain('  mybrand.com  ');
      expect(result.valid).toBe(true);
      expect(result.normalizedDomain).toBe('mybrand.com');
    });

    test('handles mixed case', () => {
      const result = validateDomain('MyBrand.COM');
      expect(result.valid).toBe(true);
      expect(result.normalizedDomain).toBe('mybrand.com');
    });

    test('handles complex URL input', () => {
      const result = validateDomain('https://www.mybrand.com/');
      expect(result.valid).toBe(true);
      expect(result.normalizedDomain).toBe('mybrand.com');
    });

    test('result has no error when valid', () => {
      const result = validateDomain('mybrand.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('result has no normalizedDomain when invalid', () => {
      const result = validateDomain('');
      expect(result.valid).toBe(false);
      expect(result.normalizedDomain).toBeUndefined();
    });
  });
});
