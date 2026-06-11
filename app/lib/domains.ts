/**
 * Custom Domain Data Access Functions
 * 
 * This module provides functions for managing vendor custom domains,
 * including adding, verifying, and removing domain connections.
 */

import { sql } from './db';
import { VendorDomain, VendorDomainStatus, VerificationMethod } from './definitions';

/**
 * Adds a new custom domain for a vendor.
 * Generates a verification token and stores the domain in pending state.
 * 
 * @param vendorId - The vendor's user ID
 * @param domain - The custom domain (e.g. mybrand.com)
 * @param verificationMethod - DNS verification method ('cname' | 'txt')
 * @returns The created VendorDomain record
 */
export async function addVendorDomain(
  vendorId: string,
  domain: string,
  verificationMethod: VerificationMethod = 'cname'
): Promise<VendorDomain> {
  // Check if domain is already taken by another vendor
  const existing = await sql<VendorDomain[]>`
    SELECT * FROM vendor_domains WHERE domain = ${domain} AND status != 'removed'
  `;
  if (existing.length > 0) {
    throw new Error('This domain is already connected to another store.');
  }

  // Check if vendor already has an active domain
  const vendorDomain = await sql<VendorDomain[]>`
    SELECT * FROM vendor_domains 
    WHERE vendor_id = ${vendorId} AND status IN ('pending', 'verifying', 'verified')
  `;
  if (vendorDomain.length > 0) {
    throw new Error('You already have a domain connected. Please disconnect it first.');
  }

  // Generate verification token
  const verificationToken = `vendle-verify-${crypto.randomUUID().slice(0, 8)}`;

  const [created] = await sql<VendorDomain[]>`
    INSERT INTO vendor_domains (vendor_id, domain, verification_method, verification_token, status)
    VALUES (${vendorId}, ${domain}, ${verificationMethod}, ${verificationToken}, 'pending')
    RETURNING *
  `;

  return created;
}

/**
 * Gets a vendor's current domain record.
 * 
 * @param vendorId - The vendor's user ID
 * @returns The VendorDomain record or null if none exists
 */
export async function getVendorDomain(vendorId: string): Promise<VendorDomain | null> {
  const domains = await sql<VendorDomain[]>`
    SELECT * FROM vendor_domains
    WHERE vendor_id = ${vendorId} AND status != 'removed'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return domains[0] || null;
}

/**
 * Finds a vendor by their custom domain hostname.
 * Used by middleware for hostname-based routing.
 * 
 * @param domain - The custom domain hostname
 * @returns The vendor user ID or null if not found
 */
export async function getVendorIdByDomain(domain: string): Promise<string | null> {
  const result = await sql<{ vendor_id: string }[]>`
    SELECT vendor_id FROM vendor_domains
    WHERE domain = ${domain} AND status = 'verified'
    LIMIT 1
  `;
  return result[0]?.vendor_id || null;
}

/**
 * Gets the vendor's store slug by their custom domain.
 * 
 * @param domain - The custom domain hostname
 * @returns The store slug or null if not found
 */
export async function getStoreSlugByDomain(domain: string): Promise<string | null> {
  const result = await sql<{ store_slug: string }[]>`
    SELECT u.store_slug
    FROM vendor_domains vd
    JOIN users u ON u.id = vd.vendor_id
    WHERE vd.domain = ${domain} AND vd.status = 'verified'
    LIMIT 1
  `;
  return result[0]?.store_slug || null;
}

/**
 * Updates the status of a vendor domain.
 * Uses separate queries for each update to avoid nesting issues with the
 * postgres library's tagged template literals.
 * 
 * @param domainId - The domain record ID
 * @param status - New status
 * @param vercelDomainId - Optional Vercel domain ID returned from Vercel API
 */
export async function updateDomainStatus(
  domainId: string,
  status: VendorDomainStatus,
  vercelDomainId?: string
): Promise<void> {
  // Update status and timestamp
  if (status === 'verified') {
    await sql`
      UPDATE vendor_domains
      SET status = ${status}, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${domainId}
    `;
  } else {
    await sql`
      UPDATE vendor_domains
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${domainId}
    `;
  }

  // Update Vercel domain ID in a separate query if provided
  if (vercelDomainId) {
    await sql`
      UPDATE vendor_domains
      SET vercel_domain_id = ${vercelDomainId}
      WHERE id = ${domainId}
    `;
  }
}

/**
 * Updates the SSL status of a verified domain.
 * 
 * @param domainId - The domain record ID
 * @param sslStatus - New SSL status
 */
export async function updateDomainSSLStatus(
  domainId: string,
  sslStatus: VendorDomain['ssl_status']
): Promise<void> {
  await sql`
    UPDATE vendor_domains
    SET ssl_status = ${sslStatus}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${domainId}
  `;
}

/**
 * Removes (disconnects) a custom domain from a vendor.
 * Soft-deletes by setting status to 'removed' and clears the users.custom_domain field.
 * 
 * @param vendorId - The vendor's user ID
 * @param domainId - The domain record ID to remove
 */
export async function removeVendorDomain(vendorId: string, domainId: string): Promise<void> {
  await sql`
    UPDATE vendor_domains
    SET status = 'removed', updated_at = CURRENT_TIMESTAMP
    WHERE id = ${domainId} AND vendor_id = ${vendorId}
  `;

  // Clear the custom domain from the users table
  await sql`
    UPDATE users
    SET custom_domain = NULL
    WHERE id = ${vendorId}
  `;
}

/**
 * After successful verification, links the domain to the vendor's users record
 * for fast lookups in middleware.
 * 
 * @param vendorId - The vendor's user ID
 * @param domain - The verified domain
 */
export async function linkDomainToVendor(vendorId: string, domain: string): Promise<void> {
  await sql`
    UPDATE users
    SET custom_domain = ${domain}
    WHERE id = ${vendorId}
  `;
}
