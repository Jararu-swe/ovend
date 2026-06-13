/**
 * Verify that the optimized query returns the correct data structure
 * 
 * Run with: node scripts/verify-query-structure.js
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

async function verifyQueryStructure() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 QUERY STRUCTURE VERIFICATION");
  console.log("=".repeat(60) + "\n");

  try {
    const stores = await sql`
      SELECT 
        u.id,
        u.store_name,
        u.store_slug,
        st.logo_url,
        COUNT(DISTINCT p_count.id)::text AS product_count,
        (
          SELECT json_agg(json_build_object(
            'name', p.name,
            'image_url', p.image_url,
            'price', p.price
          ))
          FROM (
            SELECT name, image_url, price
            FROM products
            WHERE vendor_id = u.id AND status = 'active'
            ORDER BY created_at DESC
            LIMIT 3
          ) p
        ) as top_products
      FROM users u
      LEFT JOIN store_theme st ON st.vendor_id = u.id
      LEFT JOIN products p_count ON p_count.vendor_id = u.id AND p_count.status = 'active'
      WHERE u.store_name IS NOT NULL AND u.store_name != ''
      GROUP BY u.id, u.store_name, u.store_slug, st.logo_url
      HAVING COUNT(p_count.id) > 0
      LIMIT 5
    `;
    
    console.log(`✅ Query returned ${stores.length} stores\n`);
    
    let allValid = true;
    
    stores.forEach((store, idx) => {
      console.log(`Store ${idx + 1}: ${store.store_name}`);
      console.log(`  - ID: ${store.id}`);
      console.log(`  - Slug: ${store.store_slug}`);
      console.log(`  - Logo URL: ${store.logo_url || '(none)'}`);
      console.log(`  - Product Count: ${store.product_count}`);
      console.log(`  - Top Products: ${store.top_products ? store.top_products.length : 0} items`);
      
      // Validate structure
      if (!store.id || !store.store_name || !store.store_slug) {
        console.log(`  ❌ Missing required fields`);
        allValid = false;
      }
      
      if (store.top_products && Array.isArray(store.top_products)) {
        if (store.top_products.length > 3) {
          console.log(`  ❌ Too many top products: ${store.top_products.length} (expected max 3)`);
          allValid = false;
        }
        
        store.top_products.forEach((product, pIdx) => {
          console.log(`    Product ${pIdx + 1}: ${product.name}`);
          if (!product.name || product.price === undefined) {
            console.log(`      ❌ Missing required product fields`);
            allValid = false;
          }
        });
      } else if (store.top_products === null) {
        console.log(`  ⚠️  No top_products (store may have no active products)`);
      }
      
      console.log("");
    });
    
    console.log("=".repeat(60));
    if (allValid) {
      console.log("✅ ALL CHECKS PASSED - Query structure is correct!");
    } else {
      console.log("❌ VALIDATION FAILED - See errors above");
    }
    console.log("=".repeat(60) + "\n");
    
    return { success: allValid, storeCount: stores.length };
    
  } catch (error) {
    console.error("\n❌ Query failed:", error);
    throw error;
  }
}

// Execute the verification
verifyQueryStructure()
  .then((result) => {
    console.log("🎉 Verification completed!\n");
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 Verification failed:", error);
    process.exit(1);
  });
