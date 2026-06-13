/**
 * Verification Script: Verify deep customization columns migration
 * 
 * This script verifies that all deep customization columns were added
 * correctly with proper constraints and defaults.
 * 
 * Run with: node scripts/migrations/verify-deep-customization.js
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

async function verifyDeepCustomization() {
  console.log('🔍 Verifying deep customization schema...\n');

  let allChecksPassed = true;

  try {
    // ============================================================
    // 1. Verify Column Existence
    // ============================================================
    console.log('📋 Checking column existence...');
    
    const requiredColumns = [
      'line_height',
      'letter_spacing',
      'text_transform',
      'body_font_weight',
      'heading_font_weight',
      'container_width',
      'design_tokens',
      'secondary_gradient'
    ];

    const existingColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'store_themes'
      AND column_name = ANY(${requiredColumns})
      ORDER BY column_name
    `;

    const foundColumnNames = existingColumns.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !foundColumnNames.includes(col));

    if (missingColumns.length > 0) {
      console.error(`❌ Missing columns: ${missingColumns.join(', ')}`);
      allChecksPassed = false;
    } else {
      console.log('✅ All required columns exist');
      existingColumns.forEach(col => {
        console.log(`   ✓ ${col.column_name} (${col.data_type})`);
      });
    }
    console.log();

    // ============================================================
    // 2. Verify CHECK Constraints
    // ============================================================
    console.log('📋 Checking CHECK constraints...');
    
    const requiredConstraints = [
      'check_text_transform',
      'check_body_font_weight',
      'check_heading_font_weight',
      'check_container_width'
    ];

    const existingConstraints = await sql`
      SELECT constraint_name
      FROM information_schema.check_constraints
      WHERE constraint_name = ANY(${requiredConstraints})
      ORDER BY constraint_name
    `;

    const foundConstraintNames = existingConstraints.map(con => con.constraint_name);
    const missingConstraints = requiredConstraints.filter(con => !foundConstraintNames.includes(con));

    if (missingConstraints.length > 0) {
      console.error(`❌ Missing constraints: ${missingConstraints.join(', ')}`);
      allChecksPassed = false;
    } else {
      console.log('✅ All CHECK constraints exist');
      existingConstraints.forEach(con => {
        console.log(`   ✓ ${con.constraint_name}`);
      });
    }
    console.log();

    // ============================================================
    // 3. Verify Data Types
    // ============================================================
    console.log('📋 Verifying data types...');
    
    const expectedTypes = {
      'line_height': 'numeric',
      'letter_spacing': 'numeric',
      'text_transform': 'character varying',
      'body_font_weight': 'integer',
      'heading_font_weight': 'integer',
      'container_width': 'character varying',
      'design_tokens': 'text',
      'secondary_gradient': 'text'
    };

    let dataTypesCorrect = true;
    existingColumns.forEach(col => {
      const expected = expectedTypes[col.column_name];
      if (expected && col.data_type !== expected) {
        console.error(`❌ ${col.column_name}: expected ${expected}, got ${col.data_type}`);
        dataTypesCorrect = false;
        allChecksPassed = false;
      }
    });

    if (dataTypesCorrect) {
      console.log('✅ All data types are correct');
    }
    console.log();

    // ============================================================
    // 4. Test Constraint Validation
    // ============================================================
    console.log('📋 Testing constraint validation...');
    
    // Test invalid text_transform (should fail)
    try {
      await sql`
        INSERT INTO store_themes (
          id, vendor_id, template_id, 
          primary_color, secondary_color, background_color, 
          text_color, accent_color, surface_color, heading_color, border_color,
          font_family, heading_font, font_size,
          layout_style, card_style, border_radius, card_shadow, spacing,
          button_style, button_radius, animation_style,
          show_logo, logo_position, logo_frame, header_style,
          show_product_images, image_aspect_ratio, show_product_description,
          sections, section_content,
          text_transform
        ) VALUES (
          gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
          '#000000', '#000000', '#ffffff',
          '#000000', '#000000', '#ffffff', '#000000', '#e5e5e5',
          'Inter', 'Inter', 'medium',
          'grid', 'modern', 'rounded', 'soft', 'comfortable',
          'solid', 'rounded', 'fade',
          false, 'left', 'none', 'sticky',
          true, 'square', true,
          '[]', '{}',
          'invalid_value'
        )
      `;
      console.error('❌ text_transform constraint did not prevent invalid value');
      allChecksPassed = false;
    } catch (error) {
      if (error.message.includes('check_text_transform')) {
        console.log('✅ text_transform constraint working (rejected invalid value)');
      } else {
        console.error('❌ Unexpected error testing text_transform:', error.message);
        allChecksPassed = false;
      }
    }

    // Test invalid body_font_weight (should fail)
    try {
      await sql`
        INSERT INTO store_themes (
          id, vendor_id, template_id,
          primary_color, secondary_color, background_color,
          text_color, accent_color, surface_color, heading_color, border_color,
          font_family, heading_font, font_size,
          layout_style, card_style, border_radius, card_shadow, spacing,
          button_style, button_radius, animation_style,
          show_logo, logo_position, logo_frame, header_style,
          show_product_images, image_aspect_ratio, show_product_description,
          sections, section_content,
          body_font_weight
        ) VALUES (
          gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
          '#000000', '#000000', '#ffffff',
          '#000000', '#000000', '#ffffff', '#000000', '#e5e5e5',
          'Inter', 'Inter', 'medium',
          'grid', 'modern', 'rounded', 'soft', 'comfortable',
          'solid', 'rounded', 'fade',
          false, 'left', 'none', 'sticky',
          true, 'square', true,
          '[]', '{}',
          350
        )
      `;
      console.error('❌ body_font_weight constraint did not prevent invalid value');
      allChecksPassed = false;
    } catch (error) {
      if (error.message.includes('check_body_font_weight')) {
        console.log('✅ body_font_weight constraint working (rejected invalid value)');
      } else {
        console.error('❌ Unexpected error testing body_font_weight:', error.message);
        allChecksPassed = false;
      }
    }

    // Test invalid container_width (should fail)
    try {
      await sql`
        INSERT INTO store_themes (
          id, vendor_id, template_id,
          primary_color, secondary_color, background_color,
          text_color, accent_color, surface_color, heading_color, border_color,
          font_family, heading_font, font_size,
          layout_style, card_style, border_radius, card_shadow, spacing,
          button_style, button_radius, animation_style,
          show_logo, logo_position, logo_frame, header_style,
          show_product_images, image_aspect_ratio, show_product_description,
          sections, section_content,
          container_width
        ) VALUES (
          gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
          '#000000', '#000000', '#ffffff',
          '#000000', '#000000', '#ffffff', '#000000', '#e5e5e5',
          'Inter', 'Inter', 'medium',
          'grid', 'modern', 'rounded', 'soft', 'comfortable',
          'solid', 'rounded', 'fade',
          false, 'left', 'none', 'sticky',
          true, 'square', true,
          '[]', '{}',
          'extra-wide'
        )
      `;
      console.error('❌ container_width constraint did not prevent invalid value');
      allChecksPassed = false;
    } catch (error) {
      if (error.message.includes('check_container_width')) {
        console.log('✅ container_width constraint working (rejected invalid value)');
      } else {
        console.error('❌ Unexpected error testing container_width:', error.message);
        allChecksPassed = false;
      }
    }
    console.log();

    // ============================================================
    // 5. Check Default Values on Existing Themes
    // ============================================================
    console.log('📋 Checking default values on existing themes...');
    
    const themesWithDefaults = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(line_height) as with_line_height,
        COUNT(letter_spacing) as with_letter_spacing,
        COUNT(text_transform) as with_text_transform,
        COUNT(body_font_weight) as with_body_font_weight,
        COUNT(heading_font_weight) as with_heading_font_weight,
        COUNT(container_width) as with_container_width
      FROM store_themes
    `;

    const stats = themesWithDefaults[0];
    console.log(`   Total themes: ${stats.total}`);
    console.log(`   With line_height: ${stats.with_line_height}`);
    console.log(`   With letter_spacing: ${stats.with_letter_spacing}`);
    console.log(`   With text_transform: ${stats.with_text_transform}`);
    console.log(`   With body_font_weight: ${stats.with_body_font_weight}`);
    console.log(`   With heading_font_weight: ${stats.with_heading_font_weight}`);
    console.log(`   With container_width: ${stats.with_container_width}`);

    if (stats.total > 0) {
      const coveragePercent = (stats.with_line_height / stats.total) * 100;
      if (coveragePercent >= 100) {
        console.log('✅ All existing themes have default values');
      } else {
        console.log(`⚠️  Only ${coveragePercent.toFixed(1)}% of themes have defaults applied`);
      }
    } else {
      console.log('ℹ️  No existing themes in database');
    }
    console.log();

    // ============================================================
    // Final Summary
    // ============================================================
    if (allChecksPassed) {
      console.log('✅ All verification checks passed!');
      console.log('\n🎉 Deep customization schema is correctly configured');
      return true;
    } else {
      console.log('❌ Some verification checks failed');
      console.log('\n⚠️  Please review errors above and re-run migration if needed');
      return false;
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  }
}

// Execute verification
if (require.main === module) {
  verifyDeepCustomization()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('\n💥 Verification failed with error:', error);
      process.exit(1);
    });
}

module.exports = { verifyDeepCustomization };
