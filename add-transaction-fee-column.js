const { sql } = require('@vercel/postgres');

require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log('🗄️  Adding transaction_fee_kobo column to orders table...');
  
  try {
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS transaction_fee_kobo INT
    `;
    
    console.log('✅ Column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

main();