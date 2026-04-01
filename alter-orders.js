const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function run() {
  try {
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50)`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INT DEFAULT 0`;
    console.log('Columns added');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
