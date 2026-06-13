/**
 * Test SMTP email connection to Brevo
 * This script will test the connection and send a test email
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

const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔍 Testing SMTP Connection to Brevo...\n');

  // Check environment variables
  console.log('📋 SMTP Configuration:');
  console.log('─────────────────────────────────────────────────');
  console.log(`Host: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`Port: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`User: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.log(`Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
  console.log(`From: ${process.env.NOTIFICATIONS_FROM_EMAIL || 'NOT SET'}`);
  console.log('─────────────────────────────────────────────────\n');

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ SMTP credentials are not fully configured!');
    console.log('Please check your .env file.\n');
    return;
  }

  // Create transporter
  console.log('🔌 Creating SMTP transporter...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    logger: true, // Enable logging
    debug: true,  // Enable debug output
  });

  try {
    // Test connection
    console.log('\n🔗 Testing connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Try to send a test email
    console.log('📧 Sending test email...');
    const testEmail = process.env.SMTP_USER; // Send to yourself

    const info = await transporter.sendMail({
      from: process.env.NOTIFICATIONS_FROM_EMAIL || process.env.SMTP_USER,
      to: testEmail,
      subject: '✅ Brevo SMTP Test - Success!',
      text: 'This is a test email from your Vendle application.\n\nIf you\'re seeing this, your SMTP configuration is working correctly!\n\nBest regards,\nThe Vendle Team',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ SMTP Test Successful!</h2>
          <p>This is a test email from your <strong>Vendle</strong> application.</p>
          <p>If you're seeing this, your SMTP configuration is working correctly!</p>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <strong>Configuration:</strong><br>
            Host: ${process.env.SMTP_HOST}<br>
            Port: ${process.env.SMTP_PORT}<br>
            User: ${process.env.SMTP_USER}
          </div>
          <p style="color: #64748b; font-size: 14px;">Best regards,<br>The Vendle Team</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`\n📥 Check your inbox: ${testEmail}\n`);

  } catch (error) {
    console.log('\n❌ SMTP Error:');
    console.log('─────────────────────────────────────────────────');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Possible causes:');
      console.log('  • SMTP password is incorrect');
      console.log('  • SMTP user email is wrong');
      console.log('  • Brevo account might be suspended');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection failed. Possible causes:');
      console.log('  • Firewall blocking port 587');
      console.log('  • Network/VPN issues');
      console.log('  • SMTP server is down');
    } else if (error.code === 'EENVELOPE') {
      console.log('\n💡 Email address issue. Possible causes:');
      console.log('  • From email not verified in Brevo');
      console.log('  • Invalid email format');
    }
    
    console.log('\n📚 Troubleshooting:');
    console.log('  1. Verify SMTP credentials in Brevo dashboard');
    console.log('  2. Check Brevo logs: https://app.brevo.com/');
    console.log('  3. Try regenerating your SMTP password');
    console.log('─────────────────────────────────────────────────\n');
    
    console.log('Full error details:');
    console.error(error);
  }
}

testSMTP().catch(console.error);
