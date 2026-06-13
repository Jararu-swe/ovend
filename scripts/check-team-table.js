/**
 * Check team_members table structure and diagnose issues
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

async function checkTeamTable() {
  try {
    console.log('🔍 Checking team_members table...\n');

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'team_members'
      ) as exists
    `;

    if (!tableCheck[0].exists) {
      console.log('❌ team_members table does NOT exist!');
      console.log('Creating table...\n');
      
      await sql`
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'assistant')),
          permissions JSONB NOT NULL DEFAULT '{}',
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
          invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT team_members_vendor_id_email_key UNIQUE(vendor_id, email)
        )
      `;
      
      console.log('✅ team_members table created successfully!\n');
    } else {
      console.log('✅ team_members table exists\n');
    }

    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'team_members'
      ORDER BY ordinal_position
    `;

    console.log('📋 Table Structure:');
    console.log('─────────────────────────────────────────────────');
    columns.forEach(col => {
      console.log(`${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('─────────────────────────────────────────────────\n');

    // Check constraints
    const constraints = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'team_members'
    `;

    console.log('🔒 Constraints:');
    console.log('─────────────────────────────────────────────────');
    constraints.forEach(c => {
      console.log(`${c.constraint_name.padEnd(40)} | ${c.constraint_type}`);
    });
    console.log('─────────────────────────────────────────────────\n');

    // Check for any existing team members
    const count = await sql`
      SELECT COUNT(*) as count FROM team_members
    `;

    console.log(`📊 Current team members: ${count[0].count}\n`);

    console.log('✅ All checks complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await sql.end();
  }
}

checkTeamTable();
