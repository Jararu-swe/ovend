const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function main() {
  console.log('🚀 Adding is_digital column to products table...');

  try {
    await sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT FALSE
    `;
    console.log('✅ Column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
