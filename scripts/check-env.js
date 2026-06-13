/**
 * Check what environment variables the app is seeing
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

console.log('🔍 Current Environment Variables for Email:\n');
console.log('─────────────────────────────────────────────────');
console.log(`SMTP_HOST: ${process.env.SMTP_HOST || '❌ NOT SET'}`);
console.log(`SMTP_PORT: ${process.env.SMTP_PORT || '❌ NOT SET'}`);
console.log(`SMTP_USER: ${process.env.SMTP_USER || '❌ NOT SET'}`);
console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '✅ SET (***' + process.env.SMTP_PASS.slice(-4) + ')' : '❌ NOT SET'}`);
console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE || 'false'}`);
console.log(`\n📧 SENDER EMAIL:`);
console.log(`NOTIFICATIONS_FROM_EMAIL: ${process.env.NOTIFICATIONS_FROM_EMAIL || '❌ NOT SET'}`);
console.log('─────────────────────────────────────────────────\n');

if (process.env.NOTIFICATIONS_FROM_EMAIL === 'ae81d8001@smtp-brevo.com') {
  console.log('✅ Using verified SMTP sender: ae81d8001@smtp-brevo.com');
  console.log('   This should work without any issues!\n');
} else if (process.env.NOTIFICATIONS_FROM_EMAIL?.includes('vendle.com')) {
  console.log('⚠️  Using custom domain sender:', process.env.NOTIFICATIONS_FROM_EMAIL);
  console.log('   Make sure this email is verified in Brevo dashboard!\n');
  console.log('   Go to: https://app.brevo.com/ → Senders → Verify this email\n');
} else {
  console.log('⚠️  Sender email might not be configured correctly\n');
}
