# Subscription Pricing System - Database Schema Setup

## Overview
This document summarizes the database schema setup for the subscription pricing system, completed as part of Task 1.

## Execution Date
Database schema setup completed successfully.

## What Was Done

### 1. Created New Tables

#### `subscription_plans`
Stores the configuration for all subscription tiers (Starter, Pro, Business).

**Columns:**
- `id` (UUID, Primary Key)
- `tier` (VARCHAR, UNIQUE) - Plan identifier: 'starter', 'pro', 'business'
- `name` (VARCHAR) - Display name
- `price_kobo` (INTEGER) - Monthly price in kobo (₦1 = 100 kobo)
- `transaction_fee_percentage` (DECIMAL) - Fee percentage on transactions
- `product_limit` (INTEGER) - Maximum active products allowed
- `features` (JSONB) - Feature flags and configuration
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Seeded Data:**
- **Starter**: ₦0/month, 5% transaction fee, 10 products
- **Pro**: ₦1,500/month, 3% transaction fee, 100 products
- **Business**: ₦3,500/month, 2% transaction fee, 1,000 products

#### `subscription_invoices`
Tracks billing invoices for paid subscriptions.

**Columns:**
- `id` (UUID, Primary Key)
- `vendor_id` (UUID, Foreign Key → users)
- `payment_id` (UUID, Foreign Key → vendor_subscription_payments)
- `invoice_number` (VARCHAR, UNIQUE)
- `amount_kobo` (INTEGER)
- `tier` (VARCHAR)
- `billing_period_start`, `billing_period_end` (TIMESTAMPTZ)
- `issued_at` (TIMESTAMPTZ)
- `pdf_url` (VARCHAR) - Link to PDF invoice
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_invoices_vendor` on `vendor_id`

#### `subscription_events`
Audit log for all subscription-related events.

**Columns:**
- `id` (UUID, Primary Key)
- `vendor_id` (UUID, Foreign Key → users)
- `event_type` (VARCHAR) - Event name: 'tier_selected', 'upgrade', 'downgrade', 'payment_success', 'payment_failed', 'trial_started', 'trial_converted', 'cancelled', 'reactivated'
- `from_tier`, `to_tier` (VARCHAR) - Tier changes
- `metadata` (JSONB) - Additional event data
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_subscription_events_vendor` on `vendor_id`
- `idx_subscription_events_type` on `event_type`

#### `team_members`
Manages team member access for Business tier vendors.

**Columns:**
- `id` (UUID, Primary Key)
- `vendor_id` (UUID, Foreign Key → users) - Store owner
- `user_id` (UUID, Foreign Key → users) - Team member account
- `email` (VARCHAR)
- `role` (VARCHAR) - 'admin' or 'assistant'
- `permissions` (JSONB) - Access control: products, orders, settings
- `invited_by` (UUID, Foreign Key → users)
- `invited_at`, `accepted_at` (TIMESTAMPTZ)
- `status` (VARCHAR) - 'pending', 'active', 'inactive'
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Constraints:**
- CHECK: role IN ('admin', 'assistant')
- CHECK: status IN ('pending', 'active', 'inactive')
- UNIQUE: (vendor_id, email)

**Indexes:**
- `idx_team_members_vendor` on `vendor_id`
- `idx_team_members_user` on `user_id`

### 2. Enhanced Existing Tables

#### `users`
Added subscription tracking column:
- `subscription_tier` (VARCHAR, DEFAULT 'starter') - Current subscription plan

#### `vendor_subscription_payments`
Added billing metadata columns:
- `tier` (VARCHAR) - Subscription tier for this payment
- `billing_period_start` (TIMESTAMPTZ) - Start of billing period
- `billing_period_end` (TIMESTAMPTZ) - End of billing period

### 3. Database Constraints

#### Valid Subscription Tiers
```sql
ALTER TABLE users 
ADD CONSTRAINT check_subscription_tier 
CHECK (subscription_tier IN ('starter', 'pro', 'business'));
```

#### Valid Subscription Statuses
```sql
ALTER TABLE users 
ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('active', 'trial', 'past_due', 'inactive', 'cancelled'));
```

### 4. Performance Indexes

Created indexes for optimal query performance:
- `idx_users_subscription_tier` on `users(subscription_tier)`
- `idx_users_subscription_status` on `users(subscription_status)`
- `idx_users_subscription_expires` on `users(subscription_expires_at)`
- `idx_vendor_payments_tier` on `vendor_subscription_payments(tier)`
- `idx_vendor_payments_vendor` on `vendor_subscription_payments(vendor_id)`

## Migration Script

**Location:** `scripts/setup-subscription-schema.js`

**Usage:**
```bash
node scripts/setup-subscription-schema.js
```

The script is **idempotent** - it can be run multiple times safely using `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` patterns.

## Verification Script

**Location:** `scripts/verify-subscription-schema.js`

**Usage:**
```bash
node scripts/verify-subscription-schema.js
```

This script verifies:
- All tables were created successfully
- Subscription plans are properly seeded
- Required columns exist in enhanced tables
- Indexes are in place

## Requirements Coverage

This schema setup addresses the following requirements from the specification:

- **Requirement 1.1**: Subscription tier storage and defaults
- **Requirement 2.1**: Payment tracking with tier and billing period
- **Requirement 3.1**: Feature configuration in subscription_plans
- **Requirement 4.1**: Product limits per tier
- **Requirement 5.1**: Transaction fee configuration per tier
- **Requirement 13.1**: Team member management for Business tier
- **Requirement 19.1**: Event logging for audit trails
- **Requirement 20.1**: Configuration serialization via JSONB features column

## Next Steps

With the database schema in place, the following can now be implemented:

1. **Subscription Service Module** (`app/lib/subscriptions.ts`)
   - Functions to query and manage subscriptions
   - Feature access checks
   - Product limit enforcement

2. **Payment Integration** (`app/lib/paystack-subscriptions.ts`)
   - Paystack payment initialization
   - Webhook handling for recurring billing

3. **Feature Gating Middleware** (`app/lib/feature-gate.ts`)
   - Protect routes and actions based on subscription tier

4. **Transaction Fee Calculator** (`app/lib/transaction-fees.ts`)
   - Calculate fees based on vendor's subscription tier

5. **Team Management Service** (`app/lib/team-management.ts`)
   - Invite and manage team members

6. **UI Components**
   - Subscription plan selection
   - Billing dashboard
   - Team member management interface

## Database Diagram

```
┌─────────────────────┐
│  subscription_plans │
│  (3 plans seeded)   │
└─────────────────────┘
          │
          │ Referenced by tier
          ▼
┌─────────────────────┐      ┌──────────────────────────┐
│       users         │◄─────│ vendor_subscription_     │
│  + subscription_    │      │      payments            │
│    tier             │      │  + tier                  │
│  + subscription_    │      │  + billing_period_start  │
│    status           │      │  + billing_period_end    │
│  + subscription_    │      └──────────────────────────┘
│    expires_at       │
└─────────────────────┘
          │
          │
          ├──────────────────────┐
          │                      │
          ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│ subscription_events │  │ subscription_invoices│
│  (audit log)        │  │  (billing records)   │
└─────────────────────┘  └─────────────────────┘
          │
          │
          ▼
┌─────────────────────┐
│   team_members      │
│  (Business tier)    │
└─────────────────────┘
```

## Testing Verification

All tables created successfully:
✓ subscription_plans
✓ subscription_invoices  
✓ subscription_events
✓ team_members
✓ vendor_subscription_payments (enhanced)
✓ users (enhanced)

All subscription plans seeded:
✓ Starter (₦0/month, 5% fee, 10 products)
✓ Pro (₦1,500/month, 3% fee, 100 products)
✓ Business (₦3,500/month, 2% fee, 1,000 products)

## Rollback Procedure

If rollback is needed, execute:

```sql
-- Drop new tables
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS subscription_events CASCADE;
DROP TABLE IF EXISTS subscription_invoices CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Remove added columns from existing tables
ALTER TABLE users DROP COLUMN IF EXISTS subscription_tier;
ALTER TABLE vendor_subscription_payments DROP COLUMN IF EXISTS tier;
ALTER TABLE vendor_subscription_payments DROP COLUMN IF EXISTS billing_period_start;
ALTER TABLE vendor_subscription_payments DROP COLUMN IF EXISTS billing_period_end;

-- Drop constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_subscription_tier;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_subscription_status;
```

## Notes

- All prices are stored in **kobo** (1 Naira = 100 kobo) to avoid floating-point precision issues
- JSONB is used for flexible feature configuration and metadata storage
- Indexes are strategically placed for common query patterns
- Foreign key constraints ensure referential integrity
- CHECK constraints validate data at the database level
- The schema supports future expansion (additional tiers, features)

## Support

For questions about this schema setup, refer to:
- Design document: `.kiro/specs/subscription-pricing-plan/design.md`
- Requirements: `.kiro/specs/subscription-pricing-plan/requirements.md`
- Tasks: `.kiro/specs/subscription-pricing-plan/tasks.md`
