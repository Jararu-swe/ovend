/**
 * Fix team_members table - make user_id nullable
 * This allows pending invitations for users who haven't signed up yet
 */

const fs = require('fs');
const path = require('path');

// Manually load .env file
const envPath = path.join(__dirname, '..', '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
});

const postgres = require('postgres');

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function fixTeamTable() {
  try {
    console.log('🔧 Fixing team_members table...\n');

    // Make user_id nullable (for pending invitations)
    console.log('Making user_id nullable...');
    await sql.unsafe(`
      ALTER TABLE team_members ALTER COLUMN user_id DROP NOT NULL
    `);
    console.log('✅ user_id is now nullable\n');

    // Verify the change
    const columns = await sql`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'team_members' AND column_name = 'user_id'
    `;

    console.log('📋 Verification:');
    console.log(`user_id is_nullable: ${columns[0].is_nullable}\n`);

    console.log('✅ Fix complete! You can now invite team members.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await sql.end();
  }
}

fixTeamTable();
