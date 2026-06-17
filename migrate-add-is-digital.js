const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: 'require'
});

async function main() {
  console.log('🚀 Adding is_digital column to products table...');

  try {
    await sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT FALSE
    `;
    console.log('✅ is_digital column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();