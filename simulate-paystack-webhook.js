const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

async function simulateWebhook() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key.trim() && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });

  const sql = postgres(envVars.POSTGRES_URL, { ssl: 'require' });

  try {
    const payouts = await sql`SELECT id, vendor_id, paystack_transfer_code FROM payouts WHERE status = 'processing' ORDER BY requested_at DESC LIMIT 1`;
    if (payouts.length === 0) {
      console.log('❌ No processing payouts found');
      return;
    }

    const payout = payouts[0];
    console.log('Found payout:', payout);

    await sql`UPDATE payouts SET status = 'completed', processed_at = CURRENT_TIMESTAMP WHERE id = ${payout.id}`;
    console.log('✅ Payout marked as completed!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

simulateWebhook();
