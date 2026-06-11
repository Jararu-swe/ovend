/**
 * Database migration script for subscription pricing system
 * This script sets up the complete database schema for tiered subscriptions
 * 
 * Run with: node scripts/setup-subscription-schema.js
 */

// Load environment variables from .env file
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    if (line.trim() && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      process.env[key.trim()] = value;
    }
  });
}

const { sql } = require("./db-connection");

async function setupSubscriptionSchema() {
  console.log('🚀 Starting subscription schema setup...\n');

  try {
    // ============================================================
    // 1. Create subscription_plans table
    // ============================================================
    console.log('📋 Creating subscription_plans table...');
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
    console.log('✓ subscription_plans table created\n');

    // ============================================================
    // 2. Create subscription_invoices table
    // ============================================================
    console.log('📋 Creating subscription_invoices table...');
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
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_invoices_vendor 
      ON subscription_invoices(vendor_id)
    `);
    console.log('✓ subscription_invoices table created\n');

    // ============================================================
    // 3. Create subscription_events table
    // ============================================================
    console.log('📋 Creating subscription_events table...');
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
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_subscription_events_vendor 
      ON subscription_events(vendor_id)
    `);
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_subscription_events_type 
      ON subscription_events(event_type)
    `);
    console.log('✓ subscription_events table created\n');

    // ============================================================
    // 4. Create team_members table
    // ============================================================
    console.log('📋 Creating team_members table...');
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
        
        CONSTRAINT check_team_role CHECK (role IN ('owner', 'admin', 'assistant')),
        CONSTRAINT check_team_status CHECK (status IN ('pending', 'active', 'inactive')),
        CONSTRAINT unique_vendor_email UNIQUE(vendor_id, email)
      )
    `);
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_team_members_vendor 
      ON team_members(vendor_id)
    `);
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_team_members_user 
      ON team_members(user_id)
    `);
    console.log('✓ team_members table created\n');

    // ============================================================
    // 5. Add subscription_tier column to users table
    // ============================================================
    console.log('📋 Adding subscription_tier column to users table...');
    await sql.unsafe(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) NOT NULL DEFAULT 'starter'
    `);
    console.log('✓ subscription_tier column added\n');

    // ============================================================
    // 6. Enhance vendor_subscription_payments table
    // ============================================================
    console.log('📋 Enhancing vendor_subscription_payments table...');
    await sql.unsafe(`
      ALTER TABLE vendor_subscription_payments 
      ADD COLUMN IF NOT EXISTS tier VARCHAR(20)
    `);
    
    await sql.unsafe(`
      ALTER TABLE vendor_subscription_payments 
      ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMPTZ
    `);
    
    await sql.unsafe(`
      ALTER TABLE vendor_subscription_payments 
      ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMPTZ
    `);
    console.log('✓ vendor_subscription_payments table enhanced\n');

    // ============================================================
    // 7. Add database constraints for valid tiers and statuses
    // ============================================================
    console.log('📋 Adding database constraints...');
    
    // Drop existing constraints if they exist (for idempotency)
    await sql.unsafe(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS check_subscription_tier
    `);
    
    await sql.unsafe(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS check_subscription_status
    `);
    
    // Add constraints
    await sql.unsafe(`
      ALTER TABLE users 
      ADD CONSTRAINT check_subscription_tier 
      CHECK (subscription_tier IN ('starter', 'pro', 'business'))
    `);
    
    await sql.unsafe(`
      ALTER TABLE users 
      ADD CONSTRAINT check_subscription_status 
      CHECK (subscription_status IN ('active', 'trial', 'past_due', 'inactive', 'cancelled'))
    `);
    console.log('✓ Database constraints added\n');

    // ============================================================
    // 8. Create database indexes for performance optimization
    // ============================================================
    console.log('📋 Creating additional performance indexes...');
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_subscription_tier 
      ON users(subscription_tier)
    `);
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_subscription_status 
      ON users(subscription_status)
    `);
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_subscription_expires 
      ON users(subscription_expires_at)
    `);
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_vendor_payments_tier 
      ON vendor_subscription_payments(tier)
    `);
    
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor 
      ON vendor_subscription_payments(vendor_id)
    `);
    console.log('✓ Performance indexes created\n');

    // ============================================================
    // 9. Seed subscription plans
    // ============================================================
    console.log('📋 Seeding subscription plans...');
    
    // Check if plans already exist
    const existingPlans = await sql`SELECT COUNT(*) as count FROM subscription_plans`;
    const planCount = Number(existingPlans[0].count);
    
    if (planCount === 0) {
      await sql`
        INSERT INTO subscription_plans (tier, name, price_kobo, transaction_fee_percentage, product_limit, features)
        VALUES
          (
            'starter', 
            'Starter', 
            0, 
            5.00, 
            10, 
            '{"analytics": false, "team_members": false, "custom_domain": false, "priority_support": false, "theme_level": "basic"}'
          ),
          (
            'pro', 
            'Pro', 
            150000, 
            3.00, 
            100, 
            '{"analytics": true, "team_members": false, "custom_domain": false, "priority_support": true, "theme_level": "premium"}'
          ),
          (
            'business', 
            'Business', 
            350000, 
            2.00, 
            1000, 
            '{"analytics": true, "advanced_analytics": true, "team_members": true, "custom_domain": true, "priority_support": true, "theme_level": "exclusive"}'
          )
      `;
      console.log('✓ Subscription plans seeded successfully\n');
    } else {
      console.log(`⚠️  Found ${planCount} existing plan(s), skipping seed\n`);
    }

    // ============================================================
    // 10. Verify setup
    // ============================================================
    console.log('📋 Verifying setup...');
    
    const plans = await sql`SELECT tier, name, price_kobo, product_limit FROM subscription_plans ORDER BY price_kobo`;
    console.log('\n✅ Subscription Plans:');
    plans.forEach((plan) => {
      console.log(`   - ${plan.name} (${plan.tier}): ₦${plan.price_kobo / 100} | ${plan.product_limit} products`);
    });

    console.log('\n✅ Schema setup completed successfully!');
    console.log('\nCreated tables:');
    console.log('  ✓ subscription_plans');
    console.log('  ✓ subscription_invoices');
    console.log('  ✓ subscription_events');
    console.log('  ✓ team_members');
    console.log('\nEnhanced tables:');
    console.log('  ✓ users (added subscription_tier)');
    console.log('  ✓ vendor_subscription_payments (added tier, billing periods)');
    console.log('\nAdded constraints:');
    console.log('  ✓ Valid subscription tiers (starter, pro, business)');
    console.log('  ✓ Valid subscription statuses (active, trial, past_due, inactive, cancelled)');
    console.log('\nCreated indexes:');
    console.log('  ✓ Performance indexes for subscriptions, payments, invoices, events, and team members');

  } catch (error) {
    console.error('❌ Error setting up subscription schema:', error);
    throw error;
  }
}

// Execute the setup
setupSubscriptionSchema()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });
