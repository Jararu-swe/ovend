const { sql } = require('@vercel/postgres');

require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log('🗄️  Adding net_revenue column to store_analytics table...');
  
  try {
    await sql`
      ALTER TABLE store_analytics 
      ADD COLUMN IF NOT EXISTS net_revenue INT
    `;
    
    console.log('✅ Column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

main();