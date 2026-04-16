const postgres = require('postgres');
const sql = postgres('postgres://postgres.lbhrbwpvwwwtftlhlupf:Cn76atRygV2TuiEb@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });

async function migrate() {
  try {
    console.log('Adding new columns to store_theme...');
    await sql`ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS primary_gradient TEXT`;
    await sql`ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS glass_effect BOOLEAN DEFAULT FALSE`;
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
