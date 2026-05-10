import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function main() {
  console.log('Starting migration for customer profiles...');

  try {
    // 1. Add role to users table (defaulting to vendor for existing users)
    console.log('Adding role column to users table...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'vendor';
    `;
    console.log('Success: role column added.');

    // 2. Add default delivery fields for customers
    console.log('Adding customer-specific columns to users table...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS delivery_address TEXT,
      ADD COLUMN IF NOT EXISTS delivery_latitude NUMERIC,
      ADD COLUMN IF NOT EXISTS delivery_longitude NUMERIC,
      ADD COLUMN IF NOT EXISTS delivery_address_details TEXT;
    `;
    console.log('Success: customer delivery columns added.');

    // 3. Add customer_account_id to orders table
    console.log('Adding customer_account_id to orders table...');
    await sql`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_account_id UUID REFERENCES users(id) ON DELETE SET NULL;
    `;
    console.log('Success: customer_account_id added to orders.');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
