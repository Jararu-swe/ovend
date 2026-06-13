/**
 * Migration: Add deep customization support to store_theme table
 * 
 * This migration adds new columns for enhanced typography, gradients,
 * design tokens, and container width controls to enable deep storefront
 * customization beyond basic template styling.
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.5, 14.6, 14.7, 14.8
 * Design Reference: Deep Storefront Customization - Data Models section
 * 
 * Run with: node scripts/migrations/add-deep-customization-columns.js
 */

// Load environment variables from .env file
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    if (line.trim() && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").replace(/^["']|["']$/g, "");
      process.env[key.trim()] = value;
    }
  });
}

const { sql } = require("../db-connection");

async function addDeepCustomizationColumns() {
  console.log('🚀 Starting deep customization schema migration...\n');

  try {
    // ============================================================
    // 1. Add Enhanced Typography Columns (Requirement 3)
    // ============================================================
    console.log('📋 Adding enhanced typography columns...');
    
    await sql.unsafe(`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS line_height DECIMAL(3, 2) NULL
    `);
    console.log('✓ line_height column added (DECIMAL(3,2), range 1.0-2.5)');

    await sql.unsafe(`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS letter_spacing DECIMAL(4, 3) NULL
    `);
    console.log('✓ letter_spacing column added (DECIMAL(4,3), range -0.1 to 0.5em)');

    await sql.unsafe(`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS text_transform VARCHAR(20) NULL
    `);
    console.log('✓ text_transform column added (VARCHAR(20))');

    await sql.unsafe(`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS body_font_weight INTEGER NULL
    `);
    console.log('✓ body_font_weight column added (INTEGER)');

    await sql.unsafe(`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS heading_font_weight INTEGER NULL
    `);
    console.log('✓ heading_font_weight column added (INTEGER)\n');

    // ============================================================
    // 2. Add Container Width Column (Requirement 4)
    // ============================================================
    console.log('📋 Adding container width column...');
    
    await sql.unsafe(`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS container_width VARCHAR(20) NULL
    `);
    console.log('✓ container_width column added (VARCHAR(20))\n');

    // ============================================================
    // 3. Add Design Tokens Column (Requirement 11)
    // ============================================================
    console.log('📋 Adding design tokens column...');
    
    await sql.unsafe(`
      ALTER TABLE store_theme 
      ADD COLUMN IF NOT EXISTS design_tokens TEXT NULL
    `);
    console.log('✓ design_tokens column added (TEXT, stores JSON)\n');

    // ============================================================
    // 4. Add Secondary Gradient Column (Requirement 1)
    // ============================================================
    console.log('📋 Adding secondary gradient column...');
    
    await sql.unsafe(`
      ALTER TABLE store_themes 
      ADD COLUMN IF NOT EXISTS secondary_gradient TEXT NULL
    `);
    console.log('✓ secondary_gradient column added (TEXT)\n');

    // ============================================================
    // 5. Add CHECK Constraints for Valid Enum Values
    // ============================================================
    console.log('📋 Adding CHECK constraints for valid values...');
    
    // Drop existing constraints if they exist (for idempotency)
    await sql.unsafe(`
      ALTER TABLE store_themes 
      DROP CONSTRAINT IF EXISTS check_text_transform
    `);
    
    await sql.unsafe(`
      ALTER TABLE store_themes 
      DROP CONSTRAINT IF EXISTS check_body_font_weight
    `);
    
    await sql.unsafe(`
      ALTER TABLE store_themes 
      DROP CONSTRAINT IF EXISTS check_heading_font_weight
    `);
    
    await sql.unsafe(`
      ALTER TABLE store_themes 
      DROP CONSTRAINT IF EXISTS check_container_width
    `);

    // Add constraints
    await sql.unsafe(`
      ALTER TABLE store_themes 
      ADD CONSTRAINT check_text_transform 
      CHECK (text_transform IN ('none', 'uppercase', 'lowercase', 'capitalize'))
    `);
    console.log('✓ check_text_transform constraint added');

    await sql.unsafe(`
      ALTER TABLE store_themes 
      ADD CONSTRAINT check_body_font_weight 
      CHECK (body_font_weight IN (300, 400, 500, 600, 700, 800, 900))
    `);
    console.log('✓ check_body_font_weight constraint added');

    await sql.unsafe(`
      ALTER TABLE store_themes 
      ADD CONSTRAINT check_heading_font_weight 
      CHECK (heading_font_weight IN (300, 400, 500, 600, 700, 800, 900))
    `);
    console.log('✓ check_heading_font_weight constraint added');

    await sql.unsafe(`
      ALTER TABLE store_themes 
      ADD CONSTRAINT check_container_width 
      CHECK (container_width IN ('narrow', 'standard', 'wide', 'full'))
    `);
    console.log('✓ check_container_width constraint added\n');

    // ============================================================
    // 6. Set Backward Compatibility Defaults (Requirement 13)
    // ============================================================
    console.log('📋 Setting backward compatibility defaults for existing themes...');
    
    const result = await sql`
      UPDATE store_themes 
      SET 
        line_height = 1.5,
        letter_spacing = 0,
        text_transform = 'none',
        body_font_weight = 400,
        heading_font_weight = 700,
        container_width = 'standard'
      WHERE line_height IS NULL
    `;
    
    console.log(`✓ Updated ${result.count} existing theme(s) with default values\n`);

    // ============================================================
    // 7. Verify Schema Changes
    // ============================================================
    console.log('📋 Verifying schema changes...\n');
    
    // Check new columns
    const newColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'store_themes' 
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
    
    console.log('✅ New store_themes columns:');
    newColumns.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check constraints
    const constraints = await sql`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints
      WHERE constraint_name IN (
        'check_text_transform',
        'check_body_font_weight',
        'check_heading_font_weight',
        'check_container_width'
      )
      ORDER BY constraint_name
    `;
    
    console.log('\n✅ CHECK constraints created:');
    constraints.forEach((con) => {
      console.log(`   - ${con.constraint_name}`);
    });

    // Count themes with defaults applied
    const themeCount = await sql`
      SELECT COUNT(*) as count FROM store_themes
    `;
    
    console.log(`\n✅ Total themes in database: ${themeCount[0].count}`);

    console.log('\n✅ Schema migration completed successfully!');
    console.log('\n📊 Summary of Changes:');
    console.log('\nEnhanced Typography (Requirement 3):');
    console.log('  ✓ line_height (DECIMAL(3,2), default 1.5)');
    console.log('  ✓ letter_spacing (DECIMAL(4,3), default 0)');
    console.log('  ✓ text_transform (VARCHAR(20), default "none")');
    console.log('  ✓ body_font_weight (INTEGER, default 400)');
    console.log('  ✓ heading_font_weight (INTEGER, default 700)');
    console.log('\nContainer Width (Requirement 4):');
    console.log('  ✓ container_width (VARCHAR(20), default "standard")');
    console.log('\nDesign Tokens (Requirement 11):');
    console.log('  ✓ design_tokens (TEXT, stores JSON)');
    console.log('\nGradients (Requirement 1):');
    console.log('  ✓ secondary_gradient (TEXT)');
    console.log('\nData Integrity:');
    console.log('  ✓ CHECK constraints for enum columns');
    console.log('  ✓ Backward compatibility defaults applied');

  } catch (error) {
    console.error('❌ Error during schema migration:', error);
    throw error;
  }
}

// Execute the migration
if (require.main === module) {
  addDeepCustomizationColumns()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update TypeScript types in app/lib/definitions.ts');
      console.log('2. Run verification: node scripts/migrations/verify-deep-customization.js');
      console.log('3. Test migration on development database');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addDeepCustomizationColumns };
