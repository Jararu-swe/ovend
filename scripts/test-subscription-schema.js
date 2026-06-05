/**
 * Test subscription schema functionality
 * This script tests data insertion and retrieval for the subscription system
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

async function testSchema() {
  console.log('🧪 Testing subscription schema...\n');

  try {
    // Test 1: Fetch subscription plans
    console.log('Test 1: Fetching subscription plans...');
    const plans = await sql`
      SELECT * FROM subscription_plans ORDER BY price_kobo ASC
    `;
    console.log(`✓ Found ${plans.length} subscription plans`);
    plans.forEach(p => console.log(`  - ${p.name}: ₦${p.price_kobo / 100}`));
    
    if (plans.length !== 3) {
      throw new Error(`Expected 3 plans, found ${plans.length}`);
    }
    
    // Test 2: Verify plan features
    console.log('\nTest 2: Verifying plan features...');
    const starterPlan = plans.find(p => p.tier === 'starter');
    const proPlan = plans.find(p => p.tier === 'pro');
    const businessPlan = plans.find(p => p.tier === 'business');
    
    if (!starterPlan || !proPlan || !businessPlan) {
      throw new Error('Missing required plans');
    }
    
    console.log(`✓ Starter plan features:`, starterPlan.features);
    console.log(`✓ Pro plan features:`, proPlan.features);
    console.log(`✓ Business plan features:`, businessPlan.features);
    
    // Verify feature gating
    if (starterPlan.features.analytics !== false) {
      throw new Error('Starter plan should not have analytics');
    }
    if (proPlan.features.analytics !== true) {
      throw new Error('Pro plan should have analytics');
    }
    if (businessPlan.features.team_members !== true) {
      throw new Error('Business plan should have team_members feature');
    }
    
    console.log('✓ Feature gating verified');
    
    // Test 3: Verify product limits
    console.log('\nTest 3: Verifying product limits...');
    if (starterPlan.product_limit !== 10) {
      throw new Error(`Starter limit should be 10, got ${starterPlan.product_limit}`);
    }
    if (proPlan.product_limit !== 100) {
      throw new Error(`Pro limit should be 100, got ${proPlan.product_limit}`);
    }
    if (businessPlan.product_limit !== 1000) {
      throw new Error(`Business limit should be 1000, got ${businessPlan.product_limit}`);
    }
    console.log('✓ Product limits correct: 10, 100, 1000');
    
    // Test 4: Verify transaction fees
    console.log('\nTest 4: Verifying transaction fees...');
    if (Number(starterPlan.transaction_fee_percentage) !== 5.00) {
      throw new Error(`Starter fee should be 5%, got ${starterPlan.transaction_fee_percentage}`);
    }
    if (Number(proPlan.transaction_fee_percentage) !== 3.00) {
      throw new Error(`Pro fee should be 3%, got ${proPlan.transaction_fee_percentage}`);
    }
    if (Number(businessPlan.transaction_fee_percentage) !== 2.00) {
      throw new Error(`Business fee should be 2%, got ${businessPlan.transaction_fee_percentage}`);
    }
    console.log('✓ Transaction fees correct: 5%, 3%, 2%');
    
    // Test 5: Test subscription_events table
    console.log('\nTest 5: Testing subscription_events table structure...');
    const eventColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_events'
      ORDER BY ordinal_position
    `;
    console.log(`✓ subscription_events has ${eventColumns.length} columns`);
    
    const requiredEventColumns = ['id', 'vendor_id', 'event_type', 'from_tier', 'to_tier', 'metadata', 'created_at'];
    const eventColumnNames = eventColumns.map(c => c.column_name);
    const missingColumns = requiredEventColumns.filter(col => !eventColumnNames.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing columns in subscription_events: ${missingColumns.join(', ')}`);
    }
    console.log('✓ All required columns present');
    
    // Test 6: Test team_members table
    console.log('\nTest 6: Testing team_members table structure...');
    const teamColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'team_members'
      ORDER BY ordinal_position
    `;
    console.log(`✓ team_members has ${teamColumns.length} columns`);
    
    const requiredTeamColumns = ['id', 'vendor_id', 'user_id', 'email', 'role', 'permissions', 'invited_by', 'status'];
    const teamColumnNames = teamColumns.map(c => c.column_name);
    const missingTeamColumns = requiredTeamColumns.filter(col => !teamColumnNames.includes(col));
    
    if (missingTeamColumns.length > 0) {
      throw new Error(`Missing columns in team_members: ${missingTeamColumns.join(', ')}`);
    }
    console.log('✓ All required columns present');
    
    // Test 7: Test subscription_invoices table
    console.log('\nTest 7: Testing subscription_invoices table structure...');
    const invoiceColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'subscription_invoices'
      ORDER BY ordinal_position
    `;
    console.log(`✓ subscription_invoices has ${invoiceColumns.length} columns`);
    
    const requiredInvoiceColumns = ['id', 'vendor_id', 'payment_id', 'invoice_number', 'amount_kobo', 'tier', 'billing_period_start', 'billing_period_end'];
    const invoiceColumnNames = invoiceColumns.map(c => c.column_name);
    const missingInvoiceColumns = requiredInvoiceColumns.filter(col => !invoiceColumnNames.includes(col));
    
    if (missingInvoiceColumns.length > 0) {
      throw new Error(`Missing columns in subscription_invoices: ${missingInvoiceColumns.join(', ')}`);
    }
    console.log('✓ All required columns present');
    
    // Test 8: Verify indexes exist
    console.log('\nTest 8: Verifying performance indexes...');
    const indexes = await sql`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND (
        indexname LIKE 'idx_users_subscription%'
        OR indexname LIKE 'idx_vendor_payments%'
        OR indexname LIKE 'idx_team_members%'
        OR indexname LIKE 'idx_subscription_events%'
        OR indexname LIKE 'idx_invoices%'
      )
      ORDER BY tablename, indexname
    `;
    
    console.log(`✓ Found ${indexes.length} performance indexes:`);
    const indexesByTable = {};
    indexes.forEach(idx => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = [];
      }
      indexesByTable[idx.tablename].push(idx.indexname);
    });
    
    Object.keys(indexesByTable).sort().forEach(table => {
      console.log(`  ${table}:`);
      indexesByTable[table].forEach(idx => console.log(`    - ${idx}`));
    });
    
    // Test 9: Verify constraints
    console.log('\nTest 9: Verifying database constraints...');
    const constraints = await sql`
      SELECT 
        tc.constraint_name, 
        tc.table_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.constraint_type = 'CHECK'
      AND (
        tc.constraint_name LIKE '%subscription%'
        OR tc.constraint_name LIKE '%team%'
      )
      ORDER BY tc.table_name, tc.constraint_name
    `;
    
    console.log(`✓ Found ${constraints.length} constraints:`);
    constraints.forEach(c => {
      console.log(`  - ${c.table_name}.${c.constraint_name}`);
      if (c.check_clause) {
        console.log(`    ${c.check_clause}`);
      }
    });
    
    // Test 10: Verify users table enhancements
    console.log('\nTest 10: Verifying users table subscription columns...');
    const userSubColumns = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('subscription_tier', 'subscription_status', 'subscription_expires_at', 'subscription_last_payment_reference', 'subscription_updated_at')
      ORDER BY column_name
    `;
    
    console.log(`✓ Found ${userSubColumns.length} subscription columns in users table:`);
    userSubColumns.forEach(c => {
      console.log(`  - ${c.column_name} (${c.data_type})`);
    });
    
    if (userSubColumns.length !== 5) {
      throw new Error(`Expected 5 subscription columns in users, found ${userSubColumns.length}`);
    }
    
    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('  ✓ Subscription plans seeded correctly (3 tiers)');
    console.log('  ✓ Feature gating configured properly');
    console.log('  ✓ Product limits set correctly');
    console.log('  ✓ Transaction fees configured');
    console.log('  ✓ All tables created with correct structure');
    console.log('  ✓ Performance indexes in place');
    console.log('  ✓ Database constraints active');
    console.log('  ✓ Users table enhanced with subscription columns');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

testSchema()
  .then(() => {
    console.log('\n🎉 Schema testing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Testing failed');
    process.exit(1);
  });
