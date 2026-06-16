const postgres = require('postgres');

// Database connection details (same as setup-database.js)
const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function main() {
  console.log('🚀 Running all database migrations...\n');
  
  try {
    console.log('1️⃣ Adding transaction_fee_kobo column to orders table...');
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS transaction_fee_kobo INT
    `;
    console.log('✅ Column added successfully!\n');

    console.log('2️⃣ Adding idempotency_key column to payouts table...');
    await sql`
      ALTER TABLE payouts 
      ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255)
    `;
    console.log('✅ Column added successfully!\n');

    console.log('3️⃣ Adding net_revenue column to store_analytics table...');
    await sql`
      ALTER TABLE store_analytics 
      ADD COLUMN IF NOT EXISTS net_revenue INT
    `;
    console.log('✅ Column added successfully!\n');

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();