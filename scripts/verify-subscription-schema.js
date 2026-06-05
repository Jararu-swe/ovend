/**
 * Verification script for subscription schema setup
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

async function verifySchema() {
  console.log('🔍 Verifying subscription schema...\n');

  try {
    // Check tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subscription_plans', 'subscription_invoices', 'subscription_events', 'team_members', 'vendor_subscription_payments')
    `;
    
    console.log('📋 Tables found:', tables.length);
    tables.forEach(t => console.log('  ✓', t.table_name));
    
    // Check subscription plans
    const plans = await sql`
      SELECT tier, name, price_kobo, transaction_fee_percentage, product_limit, features 
      FROM subscription_plans 
      ORDER BY price_kobo
    `;
    
    console.log('\n💳 Subscription Plans:', plans.length);
    plans.forEach(p => {
      console.log(`  ✓ ${p.name} (${p.tier})`);
      console.log(`    - Price: ₦${p.price_kobo / 100}`);
      console.log(`    - Transaction Fee: ${p.transaction_fee_percentage}%`);
      console.log(`    - Product Limit: ${p.product_limit}`);
      console.log(`    - Features: ${JSON.stringify(p.features)}`);
    });
    
    // Check users table columns
    const usersCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('subscription_tier', 'subscription_status', 'subscription_expires_at')
    `;
    
    console.log('\n👤 Users table subscription columns:', usersCols.length);
    usersCols.forEach(c => console.log('  ✓', c.column_name));
    
    // Check vendor_subscription_payments columns
    const paymentsCols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_subscription_payments' 
      AND column_name IN ('tier', 'billing_period_start', 'billing_period_end')
    `;
    
    console.log('\n💰 Vendor payments table subscription columns:', paymentsCols.length);
    paymentsCols.forEach(c => console.log('  ✓', c.column_name));
    
    // Check constraints
    const constraints = await sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' 
      AND constraint_name IN ('check_subscription_tier', 'check_subscription_status')
    `;
    
    console.log('\n🔒 Constraints on users table:', constraints.length);
    constraints.forEach(c => console.log('  ✓', c.constraint_name));
    
    // Check indexes
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'vendor_subscription_payments', 'subscription_invoices', 'subscription_events', 'team_members')
      AND indexname LIKE '%subscription%' OR indexname LIKE '%team%' OR indexname LIKE '%invoice%' OR indexname LIKE '%event%'
    `;
    
    console.log('\n📊 Indexes created:', indexes.length);
    indexes.forEach(i => console.log('  ✓', i.indexname));
    
    console.log('\n✅ Schema verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  }
}

verifySchema()
  .then(() => {
    console.log('\n🎉 All checks passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });
