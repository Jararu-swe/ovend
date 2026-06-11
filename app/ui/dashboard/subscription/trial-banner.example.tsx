/**
 * Example usage of the TrialBanner component
 * 
 * This file demonstrates how to use the TrialBanner component
 * with different trial scenarios.
 */

import TrialBanner from './trial-banner';
import { VendorSubscriptionInfo } from '@/app/lib/definitions';

// Helper to create subscription data for examples
function createExampleSubscription(daysRemaining: number): VendorSubscriptionInfo {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  
  return {
    tier: 'pro',
    status: 'trial',
    expires_at: expiresAt.toISOString(),
    last_payment_reference: null,
    updated_at: now.toISOString(),
    scheduled_tier_change: null,
    scheduled_tier_change_at: null,
    plan: {
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
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    grace_days_remaining: null,
    is_trial: true,
    trial_days_remaining: daysRemaining,
  };
}

// Example 1: Normal trial (more than 3 days remaining)
export function NormalTrialExample() {
  const subscription = createExampleSubscription(10);
  
  return (
    <div className="p-6 bg-slate-50">
      <h3 className="text-lg font-semibold mb-4">Normal Trial (10 days remaining)</h3>
      <TrialBanner 
        subscription={subscription}
        onAddPaymentMethod={() => console.log('Add payment method clicked')}
      />
    </div>
  );
}

// Example 2: Urgent trial (3 days or less remaining)
export function UrgentTrialExample() {
  const subscription = createExampleSubscription(2);
  
  return (
    <div className="p-6 bg-slate-50">
      <h3 className="text-lg font-semibold mb-4">Urgent Trial (2 days remaining)</h3>
      <TrialBanner 
        subscription={subscription}
        onAddPaymentMethod={() => console.log('Add payment method clicked')}
      />
    </div>
  );
}

// Example 3: Last day of trial
export function LastDayTrialExample() {
  const subscription = createExampleSubscription(1);
  
  return (
    <div className="p-6 bg-slate-50">
      <h3 className="text-lg font-semibold mb-4">Last Day of Trial (1 day remaining)</h3>
      <TrialBanner 
        subscription={subscription}
        onAddPaymentMethod={() => console.log('Add payment method clicked')}
      />
    </div>
  );
}

// Example 4: Trial at urgent threshold (exactly 3 days)
export function ThresholdTrialExample() {
  const subscription = createExampleSubscription(3);
  
  return (
    <div className="p-6 bg-slate-50">
      <h3 className="text-lg font-semibold mb-4">Threshold Trial (3 days remaining)</h3>
      <TrialBanner 
        subscription={subscription}
        onAddPaymentMethod={() => console.log('Add payment method clicked')}
      />
    </div>
  );
}

// Example 5: Full page with trial banner
export function FullPageExample() {
  const subscription = createExampleSubscription(7);
  
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Billing Dashboard</h1>
        
        {/* Trial Banner at top of page */}
        <TrialBanner 
          subscription={subscription}
          onAddPaymentMethod={() => console.log('Add payment method clicked')}
        />
        
        {/* Rest of billing page content would go here */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold mb-4">Subscription Details</h2>
          <p className="text-slate-600">Your subscription information goes here...</p>
        </div>
      </div>
    </div>
  );
}

// Example 6: No banner (non-trial status)
export function NoTrialExample() {
  const subscription = createExampleSubscription(10);
  subscription.status = 'active'; // Change status to active
  subscription.is_trial = false;
  
  return (
    <div className="p-6 bg-slate-50">
      <h3 className="text-lg font-semibold mb-4">Active Subscription (No Trial Banner)</h3>
      <TrialBanner 
        subscription={subscription}
        onAddPaymentMethod={() => console.log('Add payment method clicked')}
      />
      <p className="text-sm text-slate-600 mt-4">
        The banner should not appear above this text because the subscription is active, not trial.
      </p>
    </div>
  );
}

/**
 * Expected visual output for each example:
 * 
 * NORMAL TRIAL (10 days):
 * - Blue background (bg-blue-50)
 * - Blue icon and button
 * - Message: "10 days remaining in your trial"
 * - Subtext: "Add a payment method to continue accessing premium features after your trial ends."
 * - "Add Payment Method" button with card icon
 * 
 * URGENT TRIAL (2 days):
 * - Orange background (bg-orange-50)
 * - Orange icon and button
 * - Message: "2 days remaining in your trial"
 * - Subtext: "Your trial is ending soon. Add a payment method to continue accessing premium features."
 * - "Add Payment Method" button with card icon (orange)
 * 
 * LAST DAY TRIAL (1 day):
 * - Orange background (bg-orange-50)
 * - Orange icon and button
 * - Message: "1 day remaining in your trial" (singular "day")
 * - Subtext: "Your trial is ending soon. Add a payment method to continue accessing premium features."
 * - "Add Payment Method" button with card icon (orange)
 * 
 * THRESHOLD TRIAL (3 days):
 * - Orange background (bg-orange-50)
 * - Orange icon and button
 * - Message: "3 days remaining in your trial"
 * - Subtext: "Your trial is ending soon. Add a payment method to continue accessing premium features."
 * - "Add Payment Method" button with card icon (orange)
 * 
 * NO TRIAL (active status):
 * - No banner displayed
 * - Component returns null
 */

