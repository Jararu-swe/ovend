/**
 * Verify subscription schema setup
 */

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
    // Check tables
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subscription_plans', 'subscription_invoices', 'subscription_events', 'team_members')
      ORDER BY table_name
    `;
    
    console.log('✅ Tables created:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    
    // Check subscription_tier column in users
    const userColumns = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'subscription_tier'
    `;
    
    console.log('\n✅ Users table enhanced:');
    console.log(`   - subscription_tier: ${userColumns[0]?.data_type || 'NOT FOUND'}`);
    
    // Check vendor_subscription_payments enhancements
    const paymentColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_subscription_payments' 
      AND column_name IN ('tier', 'billing_period_start', 'billing_period_end')
      ORDER BY column_name
    `;
    
    console.log('\n✅ vendor_subscription_payments enhanced:');
    paymentColumns.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));
    
    // Check constraints
    const constraints = await sql`
      SELECT constraint_name, check_clause 
      FROM information_schema.check_constraints 
      WHERE constraint_name IN ('check_subscription_tier', 'check_subscription_status')
    `;
    
    console.log('\n✅ Constraints:');
    constraints.forEach(c => console.log(`   - ${c.constraint_name}`));
    
    // Check indexes
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'subscription_plans', 'subscription_invoices', 'subscription_events', 'team_members', 'vendor_subscription_payments')
      AND indexname LIKE '%subscription%' OR indexname LIKE '%team%' OR indexname LIKE '%invoice%' OR indexname LIKE '%event%'
      ORDER BY indexname
    `;
    
    console.log('\n✅ Indexes created:');
    indexes.forEach(i => console.log(`   - ${i.indexname}`));
    
    // Check seeded plans
    const plans = await sql`
      SELECT tier, name, price_kobo, transaction_fee_percentage, product_limit 
      FROM subscription_plans 
      ORDER BY price_kobo
    `;
    
    console.log('\n✅ Subscription plans seeded:');
    plans.forEach(p => {
      console.log(`   - ${p.name} (${p.tier}):`);
      console.log(`     Price: ₦${p.price_kobo / 100}`);
      console.log(`     Transaction fee: ${p.transaction_fee_percentage}%`);
      console.log(`     Product limit: ${p.product_limit}`);
    });
    
    console.log('\n✅ Schema verification complete!');
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

verifySchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
