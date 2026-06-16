const { sql } = require('@vercel/postgres');

require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log('🗄️  Adding idempotency_key column to payouts table...');
  
  try {
    await sql`
      ALTER TABLE payouts 
      ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) UNIQUE
    `;
    
    console.log('✅ Column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

main();