/**
 * Check if analytics data exists in the database
 */

const fs = require('fs');
const path = require('path');

// Manually load .env file
const envPath = path.join(__dirname, '..', '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
});

const postgres = require('postgres');

async function checkAnalytics() {
  console.log('🔍 Checking Analytics Data...\n');

  const sql = postgres(process.env.POSTGRES_URL);

  try {
    // Check if store_analytics table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'store_analytics'
    `;

    if (tables.length === 0) {
      console.log('❌ store_analytics table does not exist!');
      console.log('   Run: node scripts/create-analytics-table.js\n');
      return;
    }

    console.log('✅ store_analytics table exists\n');

    // Check total records
    const [countResult] = await sql`
      SELECT COUNT(*)::text as count FROM store_analytics
    `;
    console.log(`📊 Total analytics records: ${countResult.count}\n`);

    // Check recent records
    const recentRecords = await sql`
      SELECT vendor_id, date, visits, orders_count, revenue
      FROM store_analytics
      ORDER BY date DESC
      LIMIT 10
    `;

    if (recentRecords.length > 0) {
      console.log('📅 Recent analytics records:');
      console.log('─────────────────────────────────────────────────');
      recentRecords.forEach(record => {
        console.log(`Date: ${record.date}`);
        console.log(`  Vendor: ${record.vendor_id}`);
        console.log(`  Visits: ${record.visits}, Orders: ${record.orders_count}, Revenue: ₦${(record.revenue / 100).toFixed(2)}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No analytics records found\n');
      console.log('💡 Analytics data is created when:');
      console.log('   • Customers visit your store page (/s/your-slug)');
      console.log('   • Orders are placed\n');
      console.log('📝 To test:');
      console.log('   1. Go to your store page: http://localhost:3000/s/your-slug');
      console.log('   2. Make a test order');
      console.log('   3. Refresh the dashboard\n');
    }

    // Check visits tracking
    const [visitsCount] = await sql`
      SELECT COUNT(*)::text as count FROM store_visits
    `;
    console.log(`👁️  Total store visits tracked: ${visitsCount.count}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sql.end();
  }
}

checkAnalytics();
