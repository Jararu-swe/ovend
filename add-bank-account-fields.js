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
    
    // Add bank account fields to users table
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS account_number VARCHAR(20),
      ADD COLUMN IF NOT EXISTS account_name VARCHAR(255)
    `;
    
    console.log('Users table updated with bank account fields successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating users table:', err);
    process.exit(1);
  }
}

updateTable();
