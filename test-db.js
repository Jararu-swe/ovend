const postgres = require('postgres');
const sql = postgres("postgres://postgres.lbhrbwpvwwwtftlhlupf:Cn76atRygV2TuiEb@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require", { ssl: 'require' });

async function test() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Connection successful:', result);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

test();
