/**
 * Adds hide_branding to the Business plan features in subscription_plans table.
 * 
 * Usage: node scripts/update-business-plan-features.js
 */

const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function updatePlan() {
  try {
    console.log('Updating Business plan features...');

    // Get current features
    const [plan] = await sql`
      SELECT features FROM subscription_plans WHERE tier = 'business' LIMIT 1
    `;

    if (!plan) {
      console.error('Business plan not found in database!');
      process.exit(1);
    }

    const features = plan.features;
    console.log('Current features:', JSON.stringify(features));

    // Add hide_branding
    features.hide_branding = true;

    await sql`
      UPDATE subscription_plans
      SET features = ${JSON.stringify(features)}, updated_at = CURRENT_TIMESTAMP
      WHERE tier = 'business'
    `;

    console.log('✅ Business plan updated with hide_branding: true');
    console.log('Updated features:', JSON.stringify(features, null, 2));

    // Also update Pro plan features to explicitly have hide_branding: false for consistency
    const [proPlan] = await sql`
      SELECT features FROM subscription_plans WHERE tier = 'pro' LIMIT 1
    `;
    if (proPlan) {
      proPlan.features.hide_branding = false;
      await sql`
        UPDATE subscription_plans
        SET features = ${JSON.stringify(proPlan.features)}, updated_at = CURRENT_TIMESTAMP
        WHERE tier = 'pro'
      `;
      console.log('✅ Pro plan updated with hide_branding: false');
    }

    // Update Starter plan too
    const [starterPlan] = await sql`
      SELECT features FROM subscription_plans WHERE tier = 'starter' LIMIT 1
    `;
    if (starterPlan) {
      starterPlan.features.hide_branding = false;
      await sql`
        UPDATE subscription_plans
        SET features = ${JSON.stringify(starterPlan.features)}, updated_at = CURRENT_TIMESTAMP
        WHERE tier = 'starter'
      `;
      console.log('✅ Starter plan updated with hide_branding: false');
    }

    console.log('\n🎉 All plan features updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating plans:', err);
    process.exit(1);
  }
}

updatePlan();
