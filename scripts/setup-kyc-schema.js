const postgres = require('postgres');

const sql = postgres({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lbhrbwpvwwwtftlhlupf',
  password: 'Cn76atRygV2TuiEb',
  ssl: 'require'
});

async function setupKYCSchema() {
  try {
    console.log('Connecting to database...');

    // 1. Add KYC and verified bank columns to users table
    console.log('Updating users table with KYC columns...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS bank_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS bank_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS bank_verified_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS bank_updated_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS bank_name_match_score NUMERIC(5, 2),
      ADD COLUMN IF NOT EXISTS kyc_tier VARCHAR(20) NOT NULL DEFAULT 'starter',
      ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) NOT NULL DEFAULT 'unverified'
    `;

    // 2. Create kyc_verifications table for audit trail & tier upgrades (Pro BVN/NIN, Business CAC)
    console.log('Creating kyc_verifications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS kyc_verifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tier VARCHAR(20) NOT NULL, -- 'starter', 'pro', 'business'
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
        id_type VARCHAR(30) NOT NULL, -- 'nuban_bank', 'bvn', 'nin', 'cac'
        id_number_masked VARCHAR(50),
        id_hash VARCHAR(64),
        resolved_name VARCHAR(255),
        name_match_score NUMERIC(5, 2),
        dob DATE,
        rejection_reason TEXT,
        metadata JSONB,
        verified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_kyc_verifications_vendor ON kyc_verifications(vendor_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_kyc_verifications_hash ON kyc_verifications(id_hash)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_kyc_tier ON users(kyc_tier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status)`;

    console.log('✅ KYC database schema setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up KYC schema:', error);
    process.exit(1);
  }
}

setupKYCSchema();
