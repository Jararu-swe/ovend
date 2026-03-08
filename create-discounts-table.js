const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function createTable() {
  try {
    console.log('Connecting to database...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS discount_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id),
        code VARCHAR(50) NOT NULL,
        discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value INT NOT NULL,
        min_purchase INT DEFAULT 0,
        max_uses INT,
        uses_count INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(vendor_id, code)
      )
    `;
    
    console.log('Discount codes table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating discount codes table:', err);
    process.exit(1);
  }
}

createTable();
