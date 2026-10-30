const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function setupFraudLogs() {
  try {
    console.log('Connecting to database...');

    console.log('Creating fraud_audit_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS fraud_audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL DEFAULT 'medium',
        details JSONB,
        ip_address VARCHAR(50),
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Creating indexes on fraud_audit_logs...');
    await sql`CREATE INDEX IF NOT EXISTS idx_fraud_vendor ON fraud_audit_logs(vendor_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fraud_event_type ON fraud_audit_logs(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_fraud_severity ON fraud_audit_logs(severity)`;

    console.log('✅ Fraud audit logs table setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up fraud logs table:', error);
    process.exit(1);
  }
}

setupFraudLogs();
