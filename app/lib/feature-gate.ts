/**
 * Feature Gate Utilities
 * 
 * This module provides utility functions for enforcing feature access
 * based on subscription tiers. It includes functions for checking access,
 * throwing errors, wrapping handlers, and returning structured results.
 */

import { auth } from '@/auth';
import { hasFeatureAccess, getVendorSubscription } from './subscriptions';
import { SubscriptionFeatures } from './definitions';

/**
 * User-friendly error messages for feature gate failures.
 * Each feature has a title, message, and upgrade action text.
 */
export const FEATURE_GATE_ERRORS = {
  analytics: {
    title: 'Analytics Unavailable',
    message: 'Analytics dashboard requires Pro or Business tier.',
    action: 'Upgrade to Pro'
  },
  advanced_analytics: {
    title: 'Advanced Analytics Unavailable',
    message: 'Advanced analytics features require Business tier.',
    action: 'Upgrade to Business'
  },
  team_members: {
    title: 'Team Management Unavailable',
    message: 'Team member management requires Business tier.',
    action: 'Upgrade to Business'
  },
  custom_domain: {
    title: 'Custom Domain Unavailable',
    message: 'Custom domain configuration requires Business tier.',
    action: 'Upgrade to Business'
  },
  priority_support: {
    title: 'Priority Support Unavailable',
    message: 'Priority support requires Pro or Business tier.',
    action: 'Upgrade to Pro'
  },
  theme_level: {
    title: 'Premium Themes Unavailable',
    message: 'Premium theme access requires Pro or Business tier.',
    action: 'Upgrade to Pro'
  }
} as const;

/**
 * Requires a specific feature to be available for the current user.
 * Throws an error if the user is unauthorized or doesn't have access to the feature.
 * 
 * This function is designed for use in server actions and API routes where
 * you want to halt execution if access is denied.
 * 
 * @param feature - The feature key to check access for
 * @throws Error if user is unauthorized or doesn't have feature access
 * 
 * @example
 * ```typescript
 * async function viewAnalytics() {
 *   await requireFeature('analytics');
 *   // Proceed with analytics logic...
 * }
 * ```
 */
export async function requireFeature(feature: keyof SubscriptionFeatures): Promise<void> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  const hasAccess = await hasFeatureAccess(session.user.id, feature);
  
  if (!hasAccess) {
    const subscription = await getVendorSubscription(session.user.id);
    const errorInfo = FEATURE_GATE_ERRORS[feature] || {
      title: 'Feature Unavailable',
      message: `This feature is not available on your current plan.`,
      action: 'Upgrade Plan'
    };
    
    throw new Error(
      `${errorInfo.title}: ${errorInfo.message} ` +
      `You are currently on ${subscription?.plan.name || 'Starter'} plan.`
    );
  }
}

/**
 * Wraps a handler function with a feature gate check.
 * Throws an error if access is denied, otherwise executes and returns the handler result.
 * 
 * This is useful for wrapping existing async functions with feature gating.
 * 
 * @param feature - The feature key to check access for
 * @param handler - The async function to execute if access is granted
 * @returns The result of the handler function
 * @throws Error if user is unauthorized or doesn't have feature access
 * 
 * @example
 * ```typescript
 * const analytics = await withFeatureGate('analytics', async () => {
 *   return await fetchAnalyticsData();
 * });
 * ```
 */
export async function withFeatureGate<T>(
  feature: keyof SubscriptionFeatures,
  handler: () => Promise<T>
): Promise<T> {
  await requireFeature(feature);
  return handler();
}

/**
 * Result type for feature-gated actions.
 * Provides a discriminated union for success and failure cases.
 */
export type FeatureGateResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string; requiresUpgrade: boolean; currentTier: string };

/**
 * Executes a handler function with feature gating and returns a structured result.
 * Unlike requireFeature and withFeatureGate, this function does not throw errors.
 * Instead, it returns a result object that can be easily handled by the caller.
 * 
 * This is ideal for server actions that need to return error states to the client
 * without throwing exceptions.
 * 
 * @param feature - The feature key to check access for
 * @param handler - The async function to execute if access is granted
 * @returns A FeatureGateResult with either success data or error information
 * 
 * @example
 * ```typescript
 * const result = await featureGatedAction('team_members', async () => {
 *   return await createTeamMember(data);
 * });
 * 
 * if (result.ok) {
 *   console.log('Success:', result.data);
 * } else {
 *   console.log('Error:', result.error);
 *   if (result.requiresUpgrade) {
 *     // Show upgrade prompt to user
 *   }
 * }
 * ```
 */
export async function featureGatedAction<T>(
  feature: keyof SubscriptionFeatures,
  handler: () => Promise<T>
): Promise<FeatureGateResult<T>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { 
      ok: false, 
      error: 'Unauthorized', 
      requiresUpgrade: false, 
      currentTier: 'none' 
    };
  }
  
  const hasAccess = await hasFeatureAccess(session.user.id, feature);
  const subscription = await getVendorSubscription(session.user.id);
  
  if (!hasAccess) {
    const errorInfo = FEATURE_GATE_ERRORS[feature] || {
      title: 'Feature Unavailable',
      message: `This feature is not available on your current plan.`,
      action: 'Upgrade Plan'
    };
    
    return {
      ok: false,
      error: `${errorInfo.title}: ${errorInfo.message}`,
      requiresUpgrade: true,
      currentTier: subscription?.tier || 'starter'
    };
  }
  
  try {
    const data = await handler();
    return { ok: true, data };
  } catch (error: any) {
    return { 
      ok: false, 
      error: error.message || 'Action failed', 
      requiresUpgrade: false,
      currentTier: subscription?.tier || 'starter'
    };
  }
}
