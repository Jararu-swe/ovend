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
      CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Products table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating table:', err);
    process.exit(1);
  }
}

createTable();
