import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env file
const envPath = join(process.cwd(), '.env');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (err) {
  console.error('Warning: Could not load .env file');
}

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ POSTGRES_URL environment variable is not set');
  process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
  try {
    console.log('Adding store_description column to users table...');
    
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS store_description TEXT DEFAULT NULL;
    `;
    
    console.log('✅ Successfully added store_description column');
    console.log('Column specs: TEXT, nullable, default NULL');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
