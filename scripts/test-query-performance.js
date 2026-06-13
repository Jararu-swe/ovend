/**
 * Performance test for fetchAllPublicStores query optimization
 * This script measures the execution time of the optimized query
 * 
 * Run with: node scripts/test-query-performance.js
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

async function testQueryPerformance() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 QUERY PERFORMANCE TEST");
  console.log("=".repeat(60) + "\n");

  try {
    const limit = 50;
    const searchFilter = "%";
    
    console.log("⏱️  Testing optimized query with single JOIN...\n");
    const startTime = Date.now();
    
    // Run the optimized query
    const stores = await sql`
      SELECT 
        u.id,
        u.store_name,
        u.store_slug,
        u.store_description,
        u.category,
        u.location_state,
        u.store_timezone,
        u.store_hours,
        u.accepting_orders,
        u.store_closed_note,
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
      WHERE u.store_name IS NOT NULL
        AND u.store_name != ''
        AND (
          u.store_name ILIKE ${searchFilter} 
          OR u.category ILIKE ${searchFilter}
          OR u.name ILIKE ${searchFilter}
          OR EXISTS (
            SELECT 1 FROM products p_search 
            WHERE p_search.vendor_id = u.id 
            AND p_search.status = 'active' 
            AND (
              p_search.name ILIKE ${searchFilter}
              OR p_search.category ILIKE ${searchFilter}
            )
          )
        )
      GROUP BY u.id, u.store_name, u.store_slug, u.store_description, u.category, u.location_state, u.store_timezone, u.store_hours, u.accepting_orders, u.store_closed_note, st.logo_url
      HAVING COUNT(p_count.id) > 0
      ORDER BY COUNT(p_count.id) DESC, u.store_name ASC
      LIMIT ${limit}
    `;
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    console.log("=".repeat(60));
    console.log("📊 RESULTS");
    console.log("=".repeat(60));
    console.log(`Query type:        Single optimized query with JOINs`);
    console.log(`Stores returned:   ${stores.length}`);
    console.log(`Execution time:    ${executionTime}ms`);
    console.log(`Target:            <500ms`);
    console.log(`Status:            ${executionTime < 500 ? '✅ PASS' : '⚠️  SLOW'}`);
    console.log("=".repeat(60) + "\n");
    
    if (executionTime >= 500) {
      console.log("⚠️  Performance Warning: Query exceeded 500ms threshold");
      console.log("   This may indicate database indexing issues or large dataset\n");
    } else {
      console.log("✅ Performance is excellent! Query completed well under target.\n");
    }
    
    // Show sample data structure
    if (stores.length > 0) {
      console.log("📦 Sample Store Data Structure:");
      console.log("   Store:", stores[0].store_name);
      console.log("   Logo:", stores[0].logo_url ? "✓ Loaded" : "✗ None");
      console.log("   Top Products:", stores[0].top_products ? stores[0].top_products.length : 0);
      console.log("   Store Hours:", stores[0].store_hours ? "✓ Present" : "✗ None");
      console.log("");
    }
    
    return { 
      success: true, 
      stores: stores.length, 
      executionTime 
    };
    
  } catch (error) {
    console.error("\n❌ Query failed:", error);
    throw error;
  }
}

// Execute the test
testQueryPerformance()
  .then((result) => {
    console.log("🎉 Performance test completed successfully!\n");
    process.exit(result.executionTime < 500 ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 Test failed:", error);
    process.exit(1);
  });
