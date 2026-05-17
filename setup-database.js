const postgres = require('postgres');

// Database connection details
// Update these if your database credentials are different
const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Create users table
    console.log('👤 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        store_slug VARCHAR(255) UNIQUE NOT NULL,
        store_name VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created\n');

    // Create products table
    console.log('📦 Creating products table...');
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
    console.log('✅ Products table created\n');

    // Create orders table
    console.log('📋 Creating orders table...');
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
    console.log('✅ Orders table created\n');

    // Ensure order table discount columns exist
    console.log('📋 Ensuring order table discount columns exist...');
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50) DEFAULT NULL`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INT DEFAULT 0`;
    console.log('✅ Order table discount columns ensured\n');

    // Create discount_codes table
    console.log('🏷️ Creating discount_codes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS discount_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    console.log('✅ Discount codes table created\n');

    // Create analytics table
    console.log('📊 Creating analytics table...');
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
    console.log('✅ Analytics table created\n');

    console.log('🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Sign up and create your first store!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting up database:', err);
    console.log('\nTroubleshooting:');
    console.log('- Check your database connection');
    console.log('- Verify database credentials are correct');
    console.log('- Ensure you have proper permissions\n');
    process.exit(1);
  }
}

setupDatabase();
