const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function addFulfilledAtColumn() {
  try {
    console.log('Adding fulfilled_at column to orders table...');
    
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ DEFAULT NULL
    `;
    
    console.log('✓ fulfilled_at column added successfully');
    
    // Update existing fulfilled orders to have a fulfilled_at timestamp
    const result = await sql`
      UPDATE orders 
      SET fulfilled_at = created_at 
      WHERE status = 'fulfilled' AND fulfilled_at IS NULL
    `;
    
    console.log(`✓ Updated ${result.count} existing fulfilled orders with timestamp`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding fulfilled_at column:', error);
    process.exit(1);
  }
}

addFulfilledAtColumn();
