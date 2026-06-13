/**
 * Database Migration Script: Add Deep Customization Fields to store_theme
 * 
 * This script adds new columns to the store_theme table to support deep storefront customization:
 * - Enhanced typography controls (line-height, letter-spacing, text-transform, font-weights)
 * - Container width configuration
 * - Design tokens for Pro/Business tier
 * - Secondary gradient support
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.3, 11.1, 14.1, 14.2
 */

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Load environment variables manually
const dotenvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(dotenvPath)) {
  const env = fs.readFileSync(dotenvPath, 'utf8');
  env.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

if (!process.env.POSTGRES_URL) {
  console.error('❌ POSTGRES_URL is not set in .env');
  process.exit(1);
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function main() {
  console.log('🚀 Starting deep customization migration...');

  try {
    // Enhanced Typography Columns (Requirement 3)
    console.log('📝 Adding enhanced typography columns...');
    
    await sql`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS line_height DECIMAL(3, 2) NULL
    `;
    console.log('  ✅ Added line_height column');

    await sql`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS letter_spacing DECIMAL(4, 3) NULL
    `;
    console.log('  ✅ Added letter_spacing column');

    await sql`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS text_transform VARCHAR(20) NULL 
      CHECK (text_transform IN ('none', 'uppercase', 'lowercase', 'capitalize'))
    `;
    console.log('  ✅ Added text_transform column with CHECK constraint');

    await sql`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS body_font_weight INTEGER NULL 
      CHECK (body_font_weight IN (300, 400, 500, 600, 700, 800, 900))
    `;
    console.log('  ✅ Added body_font_weight column with CHECK constraint');

    await sql`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS heading_font_weight INTEGER NULL 
      CHECK (heading_font_weight IN (300, 400, 500, 600, 700, 800, 900))
    `;
    console.log('  ✅ Added heading_font_weight column with CHECK constraint');

    // Container Width Column (Requirement 4)
    console.log('📐 Adding container width column...');
    
    await sql`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS container_width VARCHAR(20) NULL 
      CHECK (container_width IN ('narrow', 'standard', 'wide', 'full'))
    `;
    console.log('  ✅ Added container_width column with CHECK constraint');

    // Design Tokens Column (Requirement 11)
    console.log('🎨 Adding design tokens column...');
    
    await sql`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS design_tokens TEXT NULL
    `;
    console.log('  ✅ Added design_tokens column');

    // Secondary Gradient Column (Requirement 1)
    console.log('🌈 Adding secondary gradient column...');
    
    await sql`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS secondary_gradient TEXT NULL
    `;
    console.log('  ✅ Added secondary_gradient column');

    // Add backward compatibility defaults (Requirement 13)
    console.log('🔄 Setting backward compatibility defaults for existing themes...');
    
    await sql`
      UPDATE store_theme 
      SET 
        line_height = 1.5,
        letter_spacing = 0,
        text_transform = 'none',
        body_font_weight = 400,
        heading_font_weight = 700,
        container_width = 'standard'
      WHERE line_height IS NULL
    `;
    console.log('  ✅ Applied default values to existing themes');

    // Verify migration
    console.log('🔍 Verifying migration...');
    
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'store_theme' 
      AND column_name IN (
        'line_height', 
        'letter_spacing', 
        'text_transform', 
        'body_font_weight', 
        'heading_font_weight', 
        'container_width', 
        'design_tokens', 
        'secondary_gradient'
      )
      ORDER BY column_name
    `;
    
    console.log('  ✅ Verification complete. Added columns:');
    (result.rows || result).forEach(row => {
      console.log(`    - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });

    console.log('\n✨ Deep customization migration completed successfully!');
    console.log('\nSummary:');
    console.log('  • Enhanced Typography: 5 columns added');
    console.log('  • Container Width: 1 column added');
    console.log('  • Design Tokens: 1 column added');
    console.log('  • Secondary Gradient: 1 column added');
    console.log('  • Total: 8 new columns');
    console.log('  • Backward compatibility: Defaults applied to existing themes');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n👍 Migration script finished');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Migration script failed:', err);
    process.exit(1);
  });
