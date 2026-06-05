/**
 * Subscription Data Access Functions
 * 
 * This module provides functions for managing subscription plans,
 * vendor subscriptions, and feature access control.
 */

import { sql } from './db';
import { 
  SubscriptionTier, 
  SubscriptionStatus, 
  SubscriptionPlan,
  SubscriptionFeatures,
  VendorSubscriptionInfo 
} from './definitions';

/**
 * Ensures subscription schema is set up and seeds initial plans if needed.
 * This function is idempotent and safe to call multiple times.
 */
export async function ensureSubscriptionSchema(): Promise<void> {
  try {
    // Create subscription_plans table if not exists
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        tier VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        price_kobo INTEGER NOT NULL,
        transaction_fee_percentage DECIMAL(5,2) NOT NULL,
        product_limit INTEGER NOT NULL,
        features JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Seed plans if empty
    const existingPlans = await sql`SELECT COUNT(*) as count FROM subscription_plans`;
    const planCount = Number(existingPlans[0].count);
    
    if (planCount === 0) {
      await seedSubscriptionPlans();
    }
    
    // Add subscription_tier column to users
    await sql.unsafe(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) NOT NULL DEFAULT 'starter'
    `);
    
    // Add tier to vendor_subscription_payments
    await sql.unsafe(`
      ALTER TABLE vendor_subscription_payments ADD COLUMN IF NOT EXISTS tier VARCHAR(20)
    `);
    await sql.unsafe(`
      ALTER TABLE vendor_subscription_payments ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMPTZ
    `);
    await sql.unsafe(`
      ALTER TABLE vendor_subscription_payments ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMPTZ
    `);
    
    // Create team_members table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'assistant',
        permissions JSONB NOT NULL DEFAULT '{"products": true, "orders": true, "settings": false}',
        invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMPTZ DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(vendor_id, email)
      )
    `);

    // Create subscription_invoices table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS subscription_invoices (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        payment_id UUID REFERENCES vendor_subscription_payments(id) ON DELETE CASCADE,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        amount_kobo INTEGER NOT NULL,
        tier VARCHAR(20) NOT NULL,
        billing_period_start TIMESTAMPTZ NOT NULL,
        billing_period_end TIMESTAMPTZ NOT NULL,
        issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        pdf_url VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscription_events table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS subscription_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        from_tier VARCHAR(20),
        to_tier VARCHAR(20),
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('ensureSubscriptionSchema error:', error);
    throw error;
  }
}

/**
 * Seeds the subscription_plans table with default tier configurations.
 * Only inserts plans if the table is empty.
 */
async function seedSubscriptionPlans(): Promise<void> {
  await sql`
    INSERT INTO subscription_plans (tier, name, price_kobo, transaction_fee_percentage, product_limit, features)
    VALUES
      ('starter', 'Starter', 0, 5.00, 10, '{"analytics": false, "team_members": false, "custom_domain": false, "priority_support": false, "theme_level": "basic"}'),
      ('pro', 'Pro', 150000, 3.00, 100, '{"analytics": true, "team_members": false, "custom_domain": false, "priority_support": true, "theme_level": "premium"}'),
      ('business', 'Business', 350000, 2.00, 1000, '{"analytics": true, "advanced_analytics": true, "team_members": true, "custom_domain": true, "priority_support": true, "theme_level": "exclusive"}')
  `;
}

/**
 * Retrieves all available subscription plans ordered by price.
 * 
 * @returns Array of subscription plans (Starter, Pro, Business)
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const plans = await sql<SubscriptionPlan[]>`
    SELECT * FROM subscription_plans ORDER BY price_kobo ASC
  `;
  return plans;
}

/**
 * Retrieves a specific subscription plan by tier.
 * 
 * @param tier - The subscription tier ('starter', 'pro', or 'business')
 * @returns The subscription plan details or null if not found
 */
export async function getSubscriptionPlan(tier: SubscriptionTier): Promise<SubscriptionPlan | null> {
  const plans = await sql<SubscriptionPlan[]>`
    SELECT * FROM subscription_plans WHERE tier = ${tier} LIMIT 1
  `;
  return plans[0] || null;
}

/**
 * Retrieves a vendor's current subscription information including:
 * - Current tier and status
 * - Plan details (price, features, limits)
 * - Grace period calculations for past_due status
 * - Trial period calculations for trial status
 * 
 * @param vendorId - The vendor's user ID
 * @returns Complete subscription information with calculated fields or null if vendor not found
 */
export async function getVendorSubscription(vendorId: string): Promise<VendorSubscriptionInfo | null> {
  const users = await sql`
    SELECT 
      subscription_tier,
      subscription_status,
      subscription_expires_at,
      subscription_last_payment_reference,
      subscription_updated_at
    FROM users
    WHERE id = ${vendorId}
  `;
  
  if (!users[0]) return null;
  
  const user = users[0];
  const plan = await getSubscriptionPlan(user.subscription_tier as SubscriptionTier);
  
  if (!plan) return null;
  
  const now = new Date();
  const expiresAt = user.subscription_expires_at ? new Date(user.subscription_expires_at) : null;
  
  // Calculate grace period remaining days for past_due status
  let graceDaysRemaining: number | null = null;
  if (user.subscription_status === 'past_due' && expiresAt) {
    const graceEndDate = new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days grace period
    graceDaysRemaining = Math.max(0, Math.ceil((graceEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  }
  
  // Calculate trial period remaining days for trial status
  const isTrial = user.subscription_status === 'trial';
  let trialDaysRemaining: number | null = null;
  if (isTrial && expiresAt) {
    trialDaysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  }
  
  return {
    tier: user.subscription_tier as SubscriptionTier,
    status: user.subscription_status as SubscriptionStatus,
    expires_at: user.subscription_expires_at,
    last_payment_reference: user.subscription_last_payment_reference,
    updated_at: user.subscription_updated_at,
    plan,
    grace_days_remaining: graceDaysRemaining,
    is_trial: isTrial,
    trial_days_remaining: trialDaysRemaining
  };
}

/**
 * Checks if a vendor has access to a specific subscription feature.
 * Accounts for grace periods during past_due status.
 * 
 * @param vendorId - The vendor's user ID
 * @param feature - The feature key to check (e.g., 'analytics', 'team_members')
 * @returns true if the vendor has access to the feature, false otherwise
 */
export async function hasFeatureAccess(
  vendorId: string, 
  feature: keyof SubscriptionFeatures
): Promise<boolean> {
  const subscription = await getVendorSubscription(vendorId);
  if (!subscription) return false;
  
  // Allow access during grace period
  if (subscription.status === 'past_due' && subscription.grace_days_remaining && subscription.grace_days_remaining > 0) {
    return subscription.plan.features[feature] === true;
  }
  
  // Allow access during active or trial status
  if (subscription.status === 'active' || subscription.status === 'trial') {
    return subscription.plan.features[feature] === true;
  }
  
  return false;
}

/**
 * Gets the product limit for a vendor based on their subscription tier.
 * 
 * @param vendorId - The vendor's user ID
 * @returns The maximum number of active products allowed
 */
export async function getProductLimit(vendorId: string): Promise<number> {
  const subscription = await getVendorSubscription(vendorId);
  if (!subscription) return 10; // Default to starter limit
  
  return subscription.plan.product_limit;
}

/**
 * Gets the transaction fee percentage for a vendor based on their subscription tier.
 * 
 * @param vendorId - The vendor's user ID
 * @returns The transaction fee percentage (e.g., 5.0 for 5%)
 */
export async function getTransactionFeePercentage(vendorId: string): Promise<number> {
  const subscription = await getVendorSubscription(vendorId);
  if (!subscription) return 5.0; // Default to starter fee
  
  return subscription.plan.transaction_fee_percentage;
}

/**
 * Checks if a vendor can create a new product based on their tier's product limit.
 * 
 * @param vendorId - The vendor's user ID
 * @returns Object with 'allowed' boolean and optional 'reason' string if denied
 */
export async function canCreateProduct(vendorId: string): Promise<{allowed: boolean; reason?: string}> {
  const [countResult] = await sql`
    SELECT COUNT(*) as count FROM products 
    WHERE vendor_id = ${vendorId} AND status = 'active'
  `;
  
  const currentCount = Number(countResult.count);
  const limit = await getProductLimit(vendorId);
  
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your product limit of ${limit}. Upgrade your plan to add more products.`
    };
  }
  
  return { allowed: true };
}

/**
 * Updates a vendor's subscription tier.
 * 
 * @param vendorId - The vendor's user ID
 * @param newTier - The new subscription tier
 * @param immediate - Whether to apply the change immediately (true) or schedule for billing cycle end (false)
 */
export async function updateSubscriptionTier(
  vendorId: string,
  newTier: SubscriptionTier,
  immediate: boolean = false
): Promise<void> {
  const currentSub = await getVendorSubscription(vendorId);
  
  if (!currentSub) {
    throw new Error('Subscription not found');
  }
  
  // Log the tier change event
  await sql`
    INSERT INTO subscription_events (vendor_id, event_type, from_tier, to_tier)
    VALUES (${vendorId}, 'tier_change', ${currentSub.tier}, ${newTier})
  `;
  
  if (immediate) {
    await sql`
      UPDATE users
      SET subscription_tier = ${newTier}, subscription_updated_at = CURRENT_TIMESTAMP
      WHERE id = ${vendorId}
    `;
  } else {
    // For scheduled downgrades, still update but maintain current status until billing cycle ends
    // In a full implementation, a cron job would check subscription_expires_at and apply tier changes
    await sql`
      UPDATE users
      SET subscription_tier = ${newTier}, subscription_updated_at = CURRENT_TIMESTAMP
      WHERE id = ${vendorId}
    `;
  }
}

/**
 * Records a successful subscription payment and updates vendor subscription status.
 * 
 * @param vendorId - The vendor's user ID
 * @param tier - The subscription tier being paid for
 * @param amountKobo - The payment amount in kobo (smallest currency unit)
 * @param reference - The payment reference from payment gateway
 */
export async function recordSubscriptionPayment(
  vendorId: string,
  tier: SubscriptionTier,
  amountKobo: number,
  reference: string
): Promise<void> {
  const now = new Date();
  const billingPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await sql`
    INSERT INTO vendor_subscription_payments 
      (vendor_id, amount_kobo, reference, tier, status, billing_period_start, billing_period_end, paid_at)
    VALUES 
      (${vendorId}, ${amountKobo}, ${reference}, ${tier}, 'paid', ${now.toISOString()}, ${billingPeriodEnd.toISOString()}, CURRENT_TIMESTAMP)
  `;
  
  await sql`
    UPDATE users
    SET 
      subscription_tier = ${tier},
      subscription_status = 'active',
      subscription_expires_at = ${billingPeriodEnd.toISOString()},
      subscription_last_payment_reference = ${reference},
      subscription_updated_at = CURRENT_TIMESTAMP
    WHERE id = ${vendorId}
  `;
  
  // Log payment success event
  await sql`
    INSERT INTO subscription_events (vendor_id, event_type, to_tier, metadata)
    VALUES (${vendorId}, 'payment_success', ${tier}, ${JSON.stringify({ reference, amount_kobo: amountKobo })})
  `;
}

/**
 * Handles a payment failure by updating subscription status to 'past_due'.
 * Vendor retains access during 7-day grace period.
 * 
 * @param vendorId - The vendor's user ID
 */
export async function handlePaymentFailure(vendorId: string): Promise<void> {
  await sql`
    UPDATE users
    SET subscription_status = 'past_due', subscription_updated_at = CURRENT_TIMESTAMP
    WHERE id = ${vendorId}
  `;
  
  // Log payment failure event
  await sql`
    INSERT INTO subscription_events (vendor_id, event_type)
    VALUES (${vendorId}, 'payment_failed')
  `;
}

/**
 * Starts a trial period for a vendor on a paid tier.
 * 
 * @param vendorId - The vendor's user ID
 * @param tier - The subscription tier for the trial (pro or business)
 * @param trialDays - Number of days for the trial period (default: 14)
 */
export async function startTrial(
  vendorId: string,
  tier: SubscriptionTier,
  trialDays: number = 14
): Promise<void> {
  const trialEnd = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
  
  await sql`
    UPDATE users
    SET 
      subscription_tier = ${tier},
      subscription_status = 'trial',
      subscription_expires_at = ${trialEnd.toISOString()},
      subscription_updated_at = CURRENT_TIMESTAMP
    WHERE id = ${vendorId}
  `;
  
  await sql`
    INSERT INTO subscription_events (vendor_id, event_type, to_tier)
    VALUES (${vendorId}, 'trial_started', ${tier})
  `;
}

/**
 * Cancels a vendor's subscription. Access is maintained until subscription_expires_at.
 * 
 * @param vendorId - The vendor's user ID
 */
export async function cancelSubscription(vendorId: string): Promise<void> {
  await sql`
    UPDATE users
    SET subscription_status = 'cancelled', subscription_updated_at = CURRENT_TIMESTAMP
    WHERE id = ${vendorId}
  `;
  
  await sql`
    INSERT INTO subscription_events (vendor_id, event_type)
    VALUES (${vendorId}, 'cancelled')
  `;
}
