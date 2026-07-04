const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

async function getTestUser() {
  // Load .env file manually
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key.trim() && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });

  // Initialize database connection (use pooling URL for now)
  const sql = postgres(envVars.POSTGRES_URL, { ssl: 'require' });

  try {
    // First try to find "Test User"
    let users = await sql`
      SELECT id, name, email, bank_name, account_number, account_name FROM users WHERE name = 'Test User' LIMIT 1
    `;

    if (users.length > 0) {
      console.log('✅ Found Test User!');
      console.log('Name:', users[0].name);
      console.log('Email:', users[0].email);
      console.log('Bank Name:', users[0].bank_name);
      console.log('Account Number:', users[0].account_number);
      console.log('Account Name:', users[0].account_name);
    } else {
      console.log('ℹ️ No user named "Test User" found. Here are all vendors:');
      const allVendors = await sql`
        SELECT id, name, email FROM users WHERE role = 'vendor'
      `;
      allVendors.forEach((vendor, index) => {
        console.log(`\nVendor ${index + 1}:`);
        console.log('Name:', vendor.name);
        console.log('Email:', vendor.email);
      });
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

getTestUser();
