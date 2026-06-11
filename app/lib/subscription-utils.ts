import { SubscriptionStatus } from './definitions';

/**
 * Format an ISO 8601 date string to a human-readable format
 * @param dateString - ISO date string or null
 * @returns Formatted date string (e.g., "January 15, 2024") or empty string if null
 */
export function formatSubscriptionDate(dateString: string | null): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Calculate the number of days remaining until a date
 * @param expiryDate - ISO date string or null
 * @returns Number of days remaining (0 or greater)
 */
export function calculateDaysRemaining(expiryDate: string | null): number {
  if (!expiryDate) return 0;
  
  try {
    const expiry = new Date(expiryDate);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(expiry.getTime())) {
      return 0;
    }
    
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return 0;
  }
}

/**
 * Get Tailwind CSS classes for subscription status badges
 * @param status - Subscription status
 * @returns Tailwind CSS class string for badge styling
 */
export function getStatusBadgeStyle(status: SubscriptionStatus): string {
  const statusStyles: Record<SubscriptionStatus, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    trial: 'bg-blue-100 text-blue-800 border-blue-200',
    past_due: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return statusStyles[status] || statusStyles.inactive;
}

/**
 * Get display name for subscription tier
 * @param tier - Subscription tier
 * @returns Formatted tier name
 */
export function getTierDisplayName(tier: string | null): string {
  const tierNames: Record<string, string> = {
    starter: 'Starter',
    pro: 'Pro',
    business: 'Business'
  };
  
  return tier ? tierNames[tier] || 'Unknown' : 'Unknown';
}

/**
 * Format price from kobo to naira with currency symbol
 * @param kobo - Price in kobo (100 kobo = 1 naira)
 * @returns Formatted price string (e.g., "₦1,500")
 */
export function formatPrice(kobo: number): string {
  if (kobo === 0) return 'Free';
  
  const naira = kobo / 100;
  
  return `₦${naira.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}
