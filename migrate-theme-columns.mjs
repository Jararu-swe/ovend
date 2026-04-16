import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function migrate() {
  try {
    console.log('Adding new columns to store_theme...');
    await sql`ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS primary_gradient TEXT`;
    await sql`ALTER TABLE store_theme ADD COLUMN IF NOT EXISTS glass_effect BOOLEAN DEFAULT FALSE`;
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
