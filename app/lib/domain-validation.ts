/**
 * Domain Validation Utilities
 *
 * Provides a validateDomain function to validate custom domains before
 * attempting to add them via the Vercel API. Checks for:
 * - Blocked/reserved domains and TLDs
 * - Internal/private hostnames
 * - The platform's own domain (vendle.com.ng)
 * - Proper domain format
 */

export interface DomainValidationResult {
  valid: boolean;
  error?: string;
  normalizedDomain?: string;
}

/** Reserved TLDs that should never be used as custom domains (RFC 2606 & common) */
const RESERVED_TLDS = new Set([
  'local',
  'internal',
  'invalid',
  'test',
  'example',
  'localhost',
  'arpa',
  'onion',
  'i2p',
]);

/** Internal hostnames that are always blocked */
const INTERNAL_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
]);

/**
 * Strips protocol, www prefix, and trailing slash from a raw domain input.
 * Returns the normalized form or null if the input is not a string.
 */
export function normalizeDomain(input: string): string | null {
  if (typeof input !== 'string') return null;

  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

/**
 * Validates a custom domain for use with the platform.
 *
 * Checks performed (in order):
 * 1. Basic format check (valid domain structure with TLD)
 * 2. Not an internal hostname (localhost, 127.0.0.1, etc.)
 * 3. TLD is not a reserved/IANA-blocked TLD (.local, .test, .example, etc.)
 * 4. Domain is not the platform's own domain (vendle.com.ng)
 * 5. Domain is not a subdomain of the platform's domain
 *
 * @param input - The raw domain input from the user
 * @param rootDomain - Optional. The platform's root domain (default: vendle.com.ng)
 * @returns DomainValidationResult with valid flag, optional error, and normalized domain
 */
export function validateDomain(
  input: string,
  rootDomain: string = 'vendle.com.ng'
): DomainValidationResult {
  // Normalize
  const normalized = normalizeDomain(input);
  if (!normalized) {
    return { valid: false, error: 'Domain is required.' };
  }

  // Block internal hostnames
  if (INTERNAL_HOSTNAMES.has(normalized)) {
    return {
      valid: false,
      error: `"${normalized}" is an internal hostname and cannot be used as a custom domain.`,
    };
  }

  // Format validation: must be a valid domain with at least one dot and proper TLD
  const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!domainRegex.test(normalized)) {
    return { valid: false, error: 'Invalid domain format. Enter a valid domain like "mybrand.com".' };
  }

  // Extract TLD (last segment after the final dot)
  const parts = normalized.split('.');
  const tld = parts[parts.length - 1];

  // Block reserved TLDs
  if (RESERVED_TLDS.has(tld)) {
    return {
      valid: false,
      error: `".${tld}" is a reserved top-level domain and cannot be used. Use a real domain like "mybrand.com".`,
    };
  }

  // Block the platform's own root domain
  if (normalized === rootDomain) {
    return {
      valid: false,
      error: `You cannot use ${rootDomain} as your custom domain.`,
    };
  }

  // Block subdomains of the platform's root domain
  if (normalized.endsWith(`.${rootDomain}`)) {
    return {
      valid: false,
      error: `Subdomains of ${rootDomain} are reserved and cannot be used as custom domains.`,
    };
  }

  // Success
  return { valid: true, normalizedDomain: normalized };
}
