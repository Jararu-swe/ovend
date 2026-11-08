import React from 'react';

export interface FormattedLog {
  title: string;
  badge: {
    label: string;
    variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  };
  summary: string;
  details?: { label: string; value: string | React.ReactNode }[];
}

/**
 * Parses raw log/alert details (stringified or object) and formats them into
 * human-readable, production-grade log presentations.
 */
export function formatComplianceLog(eventType: string, severity: string, rawDetails: any): FormattedLog {
  let details: any = rawDetails;
  if (typeof rawDetails === 'string') {
    try {
      details = JSON.parse(rawDetails);
    } catch {
      details = { message: rawDetails };
    }
  }

  const cleanEvent = (eventType || 'system_event').toLowerCase();
  const sev = (severity || 'low').toLowerCase();

  // Helper for badge variant
  const getBadgeVariant = (s: string): 'neutral' | 'success' | 'warning' | 'danger' | 'info' => {
    if (s === 'critical' || s === 'error') return 'danger';
    if (s === 'high' || s === 'warning' || s === 'warn') return 'warning';
    if (s === 'medium' || s === 'info') return 'info';
    if (s === 'verified' || s === 'approved' || s === 'good' || s === 'success') return 'success';
    return 'neutral';
  };

  switch (cleanEvent) {
    case 'cac_submitted_for_review':
      return {
        title: 'CAC Registration Submitted for Review',
        badge: { label: 'Under Review', variant: 'info' },
        summary: `CAC verification for "${details.companyName || 'Business'}" (${details.rcNumber || 'BN/RC'}) submitted and queued for verification.`,
        details: [
          { label: 'Registered Name', value: details.companyName || '—' },
          { label: 'CAC Registration No.', value: details.rcNumber || '—' },
          { label: 'Settlement Account', value: details.bankAccountName || '—' },
          { label: 'Name Match Score', value: `${details.matchScore ?? details.nameMatchScore ?? 0}%` },
          {
            label: 'Account Type',
            value: details.isCorporateAccount ? 'Corporate Entity Account' : 'Personal Individual Account',
          },
        ],
      };

    case 'duplicate_bvn_attempt':
      return {
        title: 'Duplicate National Identity Detected',
        badge: { label: 'Critical Block', variant: 'danger' },
        summary: `Registration blocked: The provided ${(details.idType || 'identity').toUpperCase()} (${details.idNumberMasked || '••••'}) is already registered and verified on another active vendor account.`,
        details: [
          { label: 'Identity Type', value: (details.idType || 'BVN/NIN').toUpperCase() },
          { label: 'Identifier', value: details.idNumberMasked || '••••' },
          { label: 'Compliance Action', value: 'Multi-account sybil prevention triggered (NDPA/CBN Compliance Rule).' },
        ],
      };

    case 'bvn_name_mismatch':
    case 'nin_name_mismatch':
      return {
        title: `${(details.idType || cleanEvent.includes('nin') ? 'NIN' : 'BVN')} Identity Name Mismatch`,
        badge: { label: 'Verification Failed', variant: 'warning' },
        summary: `The name registered on file ("${details.registeredName || 'Vendor'}") did not meet the similarity threshold with national identity records ("${details.bvnFullName || details.ninFullName || 'National Record'}").`,
        details: [
          { label: 'Account Name', value: details.registeredName || '—' },
          { label: 'Database Name', value: details.bvnFullName || details.ninFullName || '—' },
          { label: 'Match Confidence', value: `${details.matchScore || 0}%` },
        ],
      };

    case 'bank_name_mismatch':
      return {
        title: 'Bank Account Name Mismatch',
        badge: { label: 'Bank Check Failed', variant: 'warning' },
        summary: `The bank account holder name ("${details.accountName || 'Bank Name'}") does not sufficiently match the vendor name ("${details.vendorName || 'Vendor'}").`,
        details: [
          { label: 'Vendor Name', value: details.vendorName || '—' },
          { label: 'Bank Account Name', value: details.accountName || '—' },
          { label: 'Match Confidence', value: `${details.matchScore || 0}%` },
        ],
      };

    case 'payout_blocked_cooldown':
      return {
        title: 'Payout Request Held (Security Cooldown)',
        badge: { label: 'Cooldown Active', variant: 'warning' },
        summary: 'A settlement request was temporarily held because bank account details were recently changed. A 24-hour security hold protects vendor funds against unauthorized updates.',
        details: [
          { label: 'Security Policy', value: '24-hour mandatory settlement hold following bank credential updates.' },
        ],
      };

    case 'payout_limit_breach':
      return {
        title: 'Payout Amount Exceeded Tier Limits',
        badge: { label: 'Limit Exceeded', variant: 'info' },
        summary: `Requested settlement of ₦${Number(details.requestedAmountNaira || 0).toLocaleString()} exceeded the current tier limit of ₦${Number(details.maxAllowedNaira || 0).toLocaleString()}.`,
        details: [
          { label: 'Requested Amount', value: `₦${Number(details.requestedAmountNaira || 0).toLocaleString()}` },
          { label: 'Tier Limit Allowed', value: `₦${Number(details.maxAllowedNaira || 0).toLocaleString()}` },
          { label: 'Next Step', value: 'Complete identity verification to upgrade to Pro or Business tier.' },
        ],
      };

    case 'admin_tier_override':
      return {
        title: 'KYC Tier Updated by Administrator',
        badge: { label: 'Tier Override', variant: 'neutral' },
        summary: `Vendor tier was administratively updated to ${(details.newTier || '').toUpperCase()}.`,
        details: [
          { label: 'New Tier', value: (details.newTier || '').toUpperCase() },
          { label: 'Audit Reason', value: details.reason || 'Manual review verified' },
        ],
      };

    case 'admin_cac_approved':
      return {
        title: 'CAC Business Registration Approved',
        badge: { label: 'Approved', variant: 'success' },
        summary: 'Business registration was verified and authorized by compliance. Vendor upgraded to Business Tier.',
        details: [
          { label: 'Status', value: 'Business Tier Active' },
          { label: 'Review Notes', value: details.notes || 'Verified against CAC public registry' },
        ],
      };

    case 'admin_cac_rejected':
      return {
        title: 'CAC Business Registration Rejected',
        badge: { label: 'Rejected', variant: 'danger' },
        summary: `Business registration could not be verified: ${details.reason || 'Document mismatch'}.`,
        details: [
          { label: 'Rejection Reason', value: details.reason || 'Failed CAC check' },
        ],
      };

    case 'admin_suspension':
      return {
        title: 'Account Payouts Suspended',
        badge: { label: 'Suspended', variant: 'danger' },
        summary: `Payout privileges suspended by compliance officer: ${details.reason || 'Compliance review pending'}.`,
        details: [
          { label: 'Suspension Reason', value: details.reason || 'Compliance violation' },
        ],
      };

    default:
      // Generic fallback for any unstructured log
      const title = eventType
        ? eventType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'System Notice';

      let summary = 'System log recorded.';
      const items: { label: string; value: string }[] = [];

      if (details && typeof details === 'object') {
        for (const [k, v] of Object.entries(details)) {
          if (['conflictingVendorId', 'cacSearchUrl'].includes(k)) continue;
          const label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
          items.push({
            label: label.charAt(0).toUpperCase() + label.slice(1),
            value: String(v),
          });
        }
        if (details.message || details.error || details.reason) {
          summary = String(details.message || details.error || details.reason);
        } else if (items.length > 0) {
          summary = items.map((i) => `${i.label}: ${i.value}`).join(' • ');
        }
      } else if (typeof details === 'string') {
        summary = details;
      }

      return {
        title,
        badge: { label: severity.toUpperCase(), variant: getBadgeVariant(sev) },
        summary,
        details: items.length > 0 ? items : undefined,
      };
  }
}

