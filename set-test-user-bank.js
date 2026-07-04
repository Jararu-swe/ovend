const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

async function setTestUserBank() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key.trim() && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });

  const sql = postgres(envVars.POSTGRES_URL, { ssl: 'require' });

  try {
    const result = await sql`UPDATE users SET bank_name = 'Access Bank', account_number = '0000000000', account_name = 'Test User' WHERE email = 'testuser@ovend.com' RETURNING id, name, email, bank_name, account_number, account_name`;
    if (result.length > 0) {
      console.log('✅ Bank details set for Test User!');
      console.log('Bank Name:', result[0].bank_name);
      console.log('Account Number:', result[0].account_number);
      console.log('Account Name:', result[0].account_name);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

setTestUserBank();
