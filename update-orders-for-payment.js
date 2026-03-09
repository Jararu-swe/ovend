const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function updateTable() {
  try {
    console.log('Connecting to database...');
    
    // Add payment fields to orders table
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash',
      ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'
    `;
    
    console.log('Orders table updated with payment fields successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating orders table:', err);
    process.exit(1);
  }
}

updateTable();
