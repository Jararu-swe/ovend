const postgres = require('postgres');
const sql = postgres('postgres://postgres.lbhrbwpvwwwtftlhlupf:Cn76atRygV2TuiEb@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });

async function updateSchema() {
  try {
    console.log('Updating users table schema...');
    
    // Add columns if they don't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS store_slug VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS store_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20)
    `;
    
    console.log('Columns added successfully.');

    // For existing users, let's generate a slug based on their name
    const users = await sql`SELECT id, name FROM users WHERE store_slug IS NULL`;
    
    for (const user of users) {
      const slug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      // Ensure uniqueness (simple approach for now)
      const existing = await sql`SELECT id FROM users WHERE store_slug = ${slug}`;
      const finalSlug = existing.length > 0 ? `${slug}-${user.id.slice(0, 4)}` : slug;
      
      await sql`
        UPDATE users 
        SET store_slug = ${finalSlug}, store_name = ${user.name}
        WHERE id = ${user.id}
      `;
      console.log(`Updated user ${user.name} with slug: ${finalSlug}`);
    }

    console.log('Schema update and data migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema:', err);
    process.exit(1);
  }
}

updateSchema();
