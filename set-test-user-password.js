const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

async function setTestUserPassword() {
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

  // Initialize database connection (use non-pooling URL for one-off scripts)
  const sql = postgres(envVars.POSTGRES_URL_NON_POOLING, { ssl: 'require' });

  // Set the test password (you can change this!)
  const testPassword = 'testpassword123';

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Update the Test User's password
    const result = await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE email = 'testuser@ovend.com'
      RETURNING id, name, email
    `;

    if (result.length > 0) {
      console.log('✅ Password set successfully for Test User!');
      console.log('Email:', 'testuser@ovend.com');
      console.log('Password:', testPassword);
    } else {
      console.log('❌ Test User with email "testuser@ovend.com" not found!');
    }
  } catch (error) {
    console.error('❌ Error setting password:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

setTestUserPassword();
