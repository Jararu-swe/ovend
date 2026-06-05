/**
 * Example usage of the FeatureList component
 * 
 * This file demonstrates how to use the FeatureList component
 * with different subscription plans.
 */

import FeatureList from './feature-list';
import { SubscriptionPlan } from '@/app/lib/definitions';

// Example usage in a tier card:
export function TierCardExample() {
  const starterPlan: SubscriptionPlan = {
    id: 'starter-1',
    tier: 'starter',
    name: 'Starter',
    price_kobo: 0,
    transaction_fee_percentage: 5,
    product_limit: 10,
    features: {
      analytics: false,
      advanced_analytics: false,
      team_members: false,
      custom_domain: false,
      priority_support: false,
      theme_level: 'basic',
    },
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  const proPlan: SubscriptionPlan = {
    id: 'pro-1',
    tier: 'pro',
    name: 'Pro',
    price_kobo: 150000,
    transaction_fee_percentage: 3,
    product_limit: 100,
    features: {
      analytics: true,
      advanced_analytics: false,
      team_members: false,
      custom_domain: false,
      priority_support: true,
      theme_level: 'premium',
    },
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  const businessPlan: SubscriptionPlan = {
    id: 'business-1',
    tier: 'business',
    name: 'Business',
    price_kobo: 350000,
    transaction_fee_percentage: 2,
    product_limit: 1000,
    features: {
      analytics: true,
      advanced_analytics: true,
      team_members: true,
      custom_domain: true,
      priority_support: true,
      theme_level: 'exclusive',
    },
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Starter Tier Card */}
      <div className="border border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
        <p className="text-2xl font-bold text-slate-900 mb-4">Free</p>
        <FeatureList plan={starterPlan} />
      </div>

      {/* Pro Tier Card */}
      <div className="border-2 border-emerald-500 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
        <p className="text-2xl font-bold text-slate-900 mb-4">₦1,500/month</p>
        <FeatureList plan={proPlan} currentTier="pro" />
      </div>

      {/* Business Tier Card */}
      <div className="border border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Business</h3>
        <p className="text-2xl font-bold text-slate-900 mb-4">₦3,500/month</p>
        <FeatureList plan={businessPlan} />
      </div>
    </div>
  );
}

/**
 * Expected visual output:
 * 
 * STARTER (Free)
 * ✓ Up to 10 products (green)
 * ✓ 5% per transaction (green)
 * ✗ Analytics (gray, strikethrough)
 * ✗ Advanced Analytics (gray, strikethrough)
 * ✗ Team Members (gray, strikethrough)
 * ✗ Custom Domain (gray, strikethrough)
 * ✗ Priority Support (gray, strikethrough)
 * 
 * PRO (₦1,500/month)
 * ✓ Up to 100 products (green)
 * ✓ 3% per transaction (green)
 * ✓ Analytics (green)
 * ✗ Advanced Analytics (gray, strikethrough)
 * ✗ Team Members (gray, strikethrough)
 * ✗ Custom Domain (gray, strikethrough)
 * ✓ Priority Support (green)
 * 
 * BUSINESS (₦3,500/month)
 * ✓ Up to 1000 products (green)
 * ✓ 2% per transaction (green)
 * ✓ Analytics (green)
 * ✓ Advanced Analytics (green)
 * ✓ Team Members (green)
 * ✓ Custom Domain (green)
 * ✓ Priority Support (green)
 */
