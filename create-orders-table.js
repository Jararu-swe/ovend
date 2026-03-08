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
    
    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_address TEXT,
        delivery_type VARCHAR(50) NOT NULL,
        total_amount INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        items JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Orders table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating orders table:', err);
    process.exit(1);
  }
}

createTable();
