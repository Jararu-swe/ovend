/**
 * Database migration script for store_hours data cleanup
 * This script identifies and fixes malformed JSON in the store_hours column
 * 
 * Run with:
 *   node scripts/fix-store-hours-data.js --dry-run  (reports only, no changes)
 *   node scripts/fix-store-hours-data.js --live     (applies fixes)
 */

// Load environment variables from .env file
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, "../.env");
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

const { sql } = require("./db-connection");

async function fixStoreHoursData(dryRun = true) {
  const mode = dryRun ? "DRY RUN" : "LIVE RUN";
  console.log(`\n🔍 ${mode} - Analyzing store_hours data...\n`);
  
  let totalChecked = 0;
  let invalidCount = 0;
  let fixedCount = 0;
  const errors = [];
  
  try {
    // 1. Find all users with non-null store_hours
    console.log("📊 Fetching all users with store_hours data...");
    const stores = await sql`
      SELECT id, store_name, store_hours 
      FROM users 
      WHERE store_hours IS NOT NULL
    `;
    
    totalChecked = stores.length;
    console.log(`   Found ${totalChecked} users with store_hours data\n`);
    
    // 2. Validate each store_hours value
    console.log("🔎 Validating JSON format...\n");
    
    for (const store of stores) {
      const storeName = store.store_name || `User ${store.id}`;
      let isValid = true;
      let errorMessage = "";
      
      try {
        // Try to parse as JSON if it's a string
        if (typeof store.store_hours === 'string') {
          JSON.parse(store.store_hours);
        } else if (typeof store.store_hours === 'object' && store.store_hours !== null) {
          // If it's already an object (JSONB), validate it can be stringified and re-parsed
          JSON.parse(JSON.stringify(store.store_hours));
        } else {
          // Invalid type
          isValid = false;
          errorMessage = `Invalid type: ${typeof store.store_hours}`;
        }
      } catch (err) {
        isValid = false;
        errorMessage = err.message;
      }
      
      // 3. Log and fix invalid entries
      if (!isValid) {
        invalidCount++;
        const rawPreview = String(store.store_hours).substring(0, 100);
        
        errors.push({
          id: store.id,
          store_name: storeName,
          raw_value_preview: rawPreview,
          error: errorMessage
        });
        
        console.log(`   ❌ Invalid: ${storeName} (${store.id})`);
        console.log(`      Error: ${errorMessage}`);
        console.log(`      Preview: ${rawPreview}${String(store.store_hours).length > 100 ? '...' : ''}\n`);
        
        // Fix by setting to NULL
        if (!dryRun) {
          try {
            await sql`
              UPDATE users 
              SET store_hours = NULL 
              WHERE id = ${store.id}
            `;
            fixedCount++;
            console.log(`      ✓ Set to NULL\n`);
          } catch (updateErr) {
            console.error(`      ⚠️  Failed to update: ${updateErr.message}\n`);
          }
        }
      }
    }
    
    // 4. Report results
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`Mode:              ${mode}`);
    console.log(`Total checked:     ${totalChecked}`);
    console.log(`Valid entries:     ${totalChecked - invalidCount}`);
    console.log(`Invalid entries:   ${invalidCount}`);
    
    if (dryRun) {
      console.log(`Would fix:         ${invalidCount}`);
      if (invalidCount > 0) {
        console.log("\n💡 Run with --live flag to apply fixes");
      }
    } else {
      console.log(`Fixed:             ${fixedCount}`);
      console.log(`Failed to fix:     ${invalidCount - fixedCount}`);
    }
    
    console.log("=".repeat(60) + "\n");
    
    if (invalidCount === 0) {
      console.log("✅ All store_hours data is valid! No fixes needed.\n");
    } else if (!dryRun && fixedCount === invalidCount) {
      console.log("✅ All invalid entries have been fixed!\n");
    } else if (!dryRun && fixedCount < invalidCount) {
      console.log(`⚠️  Some entries could not be fixed. Check the errors above.\n`);
    }
    
    return { 
      total: totalChecked, 
      invalid: invalidCount, 
      fixed: fixedCount,
      errors: errors 
    };
    
  } catch (error) {
    console.error("\n❌ Fatal error during migration:", error);
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = !args.includes('--live');

if (args.includes('--help') || args.includes('-h')) {
  console.log("\nUsage:");
  console.log("  node scripts/fix-store-hours-data.js [options]");
  console.log("\nOptions:");
  console.log("  --dry-run    Report issues without making changes (default)");
  console.log("  --live       Apply fixes to the database");
  console.log("  --help, -h   Show this help message");
  console.log("");
  process.exit(0);
}

// Execute the migration
console.log("\n" + "=".repeat(60));
console.log("🔧 STORE HOURS DATA CLEANUP SCRIPT");
console.log("=".repeat(60));

fixStoreHoursData(isDryRun)
  .then((result) => {
    console.log("🎉 Migration completed successfully!\n");
    process.exit(result.invalid > 0 && isDryRun ? 1 : 0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
