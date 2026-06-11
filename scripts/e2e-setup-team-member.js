/**
 * E2E Test Data Setup — Team Member Dashboard Access
 *
 * Creates:
 *   1. A Business-tier vendor with active subscription
 *   2. A team member (customer role) with ONLY products permission
 *   3. A team_members record linking them
 *
 * Usage: node scripts/e2e-setup-team-member.js
 *
 * After running this, start the dev server and use the browser-use agent
 * to log in as the team member and verify the sidebar is filtered.
 */

const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require',
});

const VENDOR_ID = 'e2e00000-0000-4000-a000-00000000e001';
const TEAM_MEMBER_ID = 'e2e00000-0000-4000-a000-00000000e002';
const VENDOR_SLUG = 'e2e-test-store';
const VENDOR_EMAIL = 'e2e-vendor@vendle.test';
const MEMBER_EMAIL = 'e2e-team-member@vendle.test';
const PASSWORD = 'test123456';

async function setup() {
  try {
    console.log('🚀 Setting up E2E test data for team member flow...\n');

    // 1. Create/update the vendor (Business tier, active subscription)
    console.log('👤 Creating Business-tier vendor...');
    const vendorHash = await bcrypt.hash(PASSWORD, 10);
    await sql`
      INSERT INTO users (
        id, name, email, password,
        store_slug, store_name,
        role, category, location_state,
        subscription_tier, subscription_status,
        subscription_expires_at, accepting_orders
      ) VALUES (
        ${VENDOR_ID},
        'E2E Test Store',
        ${VENDOR_EMAIL},
        ${vendorHash},
        ${VENDOR_SLUG},
        'E2E Test Store',
        'vendor',
        'fashion',
        'Lagos',
        'business',
        'active',
        NOW() + INTERVAL '90 days',
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        subscription_tier = 'business',
        subscription_status = 'active',
        subscription_expires_at = NOW() + INTERVAL '90 days',
        password = ${vendorHash},
        accepting_orders = true
    `;
    console.log('✅ Vendor created/updated\n');

    // 2. Create/update the team member (customer role)
    console.log('👤 Creating team member user (customer role)...');
    const memberHash = await bcrypt.hash(PASSWORD, 10);
    await sql`
      INSERT INTO users (
        id, name, email, password,
        role
      ) VALUES (
        ${TEAM_MEMBER_ID},
        'E2E Team Member',
        ${MEMBER_EMAIL},
        ${memberHash},
        'customer'
      )
      ON CONFLICT (id) DO UPDATE SET
        password = ${memberHash},
        name = 'E2E Team Member',
        email = ${MEMBER_EMAIL},
        role = 'customer'
    `;
    console.log('✅ Team member user created/updated\n');

    // 3. Ensure team_members table has the required schema
    console.log('📋 Ensuring team_members schema...');
    try {
      await sql.unsafe(`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
      await sql.unsafe(`UPDATE team_members SET email = user_id::text || '@pending' WHERE email IS NULL`);
      await sql.unsafe(`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`);
      await sql.unsafe(`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`);
    } catch (e) {
      console.log('  (schema migration warnings ignored)');
    }
    console.log('✅ Schema ready\n');

    // 4. Insert/replace the team_members record
    console.log('🔗 Linking team member to vendor (products: true only)...');
    // Delete existing record first to avoid constraint issues
    await sql`
      DELETE FROM team_members
      WHERE vendor_id = ${VENDOR_ID} AND email = ${MEMBER_EMAIL}
    `;
    await sql`
      INSERT INTO team_members (
        vendor_id, user_id, email, role,
        permissions, invited_by, status, accepted_at
      ) VALUES (
        ${VENDOR_ID},
        ${TEAM_MEMBER_ID},
        ${MEMBER_EMAIL},
        'assistant',
        ${JSON.stringify({ products: true, orders: false, settings: false })},
        ${VENDOR_ID},
        'active',
        CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Team member linked\n');

    // 5. Ensure the vendor has an owner team_members record
    const [owner] = await sql`
      SELECT id FROM team_members
      WHERE vendor_id = ${VENDOR_ID} AND role = 'owner'
      LIMIT 1
    `;
    if (!owner) {
      await sql`
        INSERT INTO team_members (
          vendor_id, user_id, email, role,
          permissions, invited_by, status, accepted_at
        ) VALUES (
          ${VENDOR_ID},
          ${VENDOR_ID},
          ${VENDOR_EMAIL},
          'owner',
          ${JSON.stringify({ products: true, orders: true, settings: true })},
          ${VENDOR_ID},
          'active',
          CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ Owner record created\n');
    }

    console.log('🎉 E2E test data ready!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Vendor email:    ', VENDOR_EMAIL);
    console.log('  Team member:     ', MEMBER_EMAIL);
    console.log('  Password:        ', PASSWORD);
    console.log('  Team permissions: products only (orders/settings hidden)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Next steps:');
    console.log('  1. Start dev server: npm run dev');
    console.log('  2. Log in as the team member at http://localhost:3000/login');
    console.log('  3. Verify the sidebar only shows: Home, Products, Team, Customize, Billing');
    console.log('  4. Verify Orders, Discounts, and Settings links are hidden\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  }
}

setup();
