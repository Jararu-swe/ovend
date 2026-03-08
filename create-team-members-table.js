const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function createTable() {
  try {
    console.log('Connecting to database...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id),
        user_id UUID NOT NULL REFERENCES users(id),
        role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'assistant')),
        permissions JSONB DEFAULT '{"products": true, "orders": true, "settings": false}'::jsonb,
        invited_by UUID REFERENCES users(id),
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
        UNIQUE(vendor_id, user_id)
      )
    `;
    
    console.log('Team members table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating team members table:', err);
    process.exit(1);
  }
}

createTable();
