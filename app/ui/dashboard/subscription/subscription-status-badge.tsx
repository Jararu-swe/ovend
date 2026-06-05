import { SubscriptionStatus } from '@/app/lib/definitions';
import { getStatusBadgeStyle } from '@/app/lib/subscription-utils';

export interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}

/**
 * Capitalize the first letter of a string
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format status for display (e.g., "past_due" -> "Past Due")
 */
function formatStatusText(status: SubscriptionStatus): string {
  return status.split('_').map(capitalize).join(' ');
}

/**
 * Subscription Status Badge Component
 * 
 * Displays the current subscription status with appropriate color coding:
 * - Active: Green background
 * - Trial: Blue background
 * - Past Due: Red background
 * - Cancelled/Inactive: Gray background
 */
export default function SubscriptionStatusBadge({
  status,
  className = '',
}: SubscriptionStatusBadgeProps) {
  const statusText = formatStatusText(status);
  const styleClasses = getStatusBadgeStyle(status);
  
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${styleClasses} ${className}`}
      aria-label={`Subscription status: ${statusText}`}
    >
      {statusText}
    </span>
  );
}
