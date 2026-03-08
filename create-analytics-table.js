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
    
    // Create analytics table for tracking store visits
    await sql`
      CREATE TABLE IF NOT EXISTS store_analytics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id),
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        visits INT DEFAULT 0,
        orders_count INT DEFAULT 0,
        revenue INT DEFAULT 0,
        UNIQUE(vendor_id, date)
      )
    `;
    
    console.log('Analytics table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating analytics table:', err);
    process.exit(1);
  }
}

createTable();
