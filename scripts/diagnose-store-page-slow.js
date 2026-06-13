/**
 * Diagnostic script to investigate slow store page loads
 * Measures timing for each database query on the store page
 */

// Load environment variables
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

async function diagnoseStorePageQueries() {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 STORE PAGE PERFORMANCE DIAGNOSTIC");
  console.log("=".repeat(70));
  console.log("\nTesting queries for vendor: 21cc7145-4add-4eaf-8c4b-9dc9d47c16ed (Souper)\n");
  
  const vendorId = '21cc7145-4add-4eaf-8c4b-9dc9d47c16ed';
  const slug = 'souper';
  
  try {
    // Query 1: fetchVendorBySlug
    console.log("1️⃣ Testing fetchVendorBySlug...");
    console.time("  ⏱️  fetchVendorBySlug");
    const vendor = await sql`
      SELECT
        id, name, store_slug, store_name, store_description,
        whatsapp_number, store_timezone, store_hours,
        accepting_orders, store_closed_note, delivery_address,
        delivery_latitude, delivery_longitude, delivery_address_details,
        offers_pickup, pickup_address, pickup_latitude,
        pickup_longitude, pickup_address_details, location_state,
        subscription_status, subscription_expires_at
      FROM users
      WHERE store_slug = ${slug}
      LIMIT 1
    `;
    console.timeEnd("  ⏱️  fetchVendorBySlug");
    console.log(`  ✅ Found vendor: ${vendor[0]?.store_name || 'Not found'}\n`);
    
    if (!vendor[0]) {
      console.log("❌ Vendor not found. Exiting.\n");
      return;
    }
    
    // Query 2: fetchProducts (the slow one)
    console.log("2️⃣ Testing fetchProducts (fetchProductsList)...");
    console.time("  ⏱️  fetchProducts");
    const products = await sql`
      SELECT * FROM products
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
    `;
    console.timeEnd("  ⏱️  fetchProducts");
    console.log(`  ✅ Found ${products.length} products\n`);
    
    // Query 2b: Check if ensureProductColumns is slow
    console.log("2️⃣b Testing ensureProductColumns (ALTER TABLE checks)...");
    console.time("  ⏱️  ensureProductColumns");
    await sql.unsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price INTEGER DEFAULT NULL`);
    await sql.unsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT NULL`);
    await sql.unsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL`);
    await sql.unsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'`);
    await sql.unsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'`);
    console.timeEnd("  ⏱️  ensureProductColumns");
    console.log(`  ✅ Columns ensured\n`);
    
    // Query 3: getOrCreateVendorTheme
    console.log("3️⃣ Testing getOrCreateVendorTheme...");
    console.time("  ⏱️  getOrCreateVendorTheme");
    const theme = await sql`
      SELECT * FROM store_theme WHERE vendor_id = ${vendorId} LIMIT 1
    `;
    console.timeEnd("  ⏱️  getOrCreateVendorTheme");
    console.log(`  ✅ Theme ${theme[0] ? 'found' : 'would be created'}\n`);
    
    // Query 4: hasFeatureAccess (subscription tier check)
    console.log("4️⃣ Testing hasFeatureAccess (subscription check)...");
    console.time("  ⏱️  hasFeatureAccess");
    const userSub = await sql`
      SELECT subscription_tier FROM users WHERE id = ${vendorId} LIMIT 1
    `;
    console.timeEnd("  ⏱️  hasFeatureAccess");
    console.log(`  ✅ Subscription tier: ${userSub[0]?.subscription_tier || 'none'}\n`);
    
    // Check for missing indexes
    console.log("5️⃣ Checking database indexes...");
    console.time("  ⏱️  Check indexes");
    const indexes = await sql`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('products', 'users', 'store_theme')
      ORDER BY tablename, indexname
    `;
    console.timeEnd("  ⏱️  Check indexes");
    
    console.log("\n📊 Current Indexes:");
    const productIndexes = indexes.filter(i => i.tablename === 'products');
    const userIndexes = indexes.filter(i => i.tablename === 'users');
    const themeIndexes = indexes.filter(i => i.tablename === 'store_theme');
    
    console.log(`\n  Products table (${productIndexes.length} indexes):`);
    productIndexes.forEach(idx => {
      console.log(`    - ${idx.indexname}`);
    });
    
    console.log(`\n  Users table (${userIndexes.length} indexes):`);
    userIndexes.forEach(idx => {
      console.log(`    - ${idx.indexname}`);
    });
    
    console.log(`\n  Store_theme table (${themeIndexes.length} indexes):`);
    themeIndexes.forEach(idx => {
      console.log(`    - ${idx.indexname}`);
    });
    
    // Check if vendor_id index exists on products
    const hasVendorIdIndex = productIndexes.some(idx => 
      idx.indexdef.includes('vendor_id')
    );
    
    console.log("\n" + "=".repeat(70));
    console.log("🎯 DIAGNOSIS");
    console.log("=".repeat(70));
    
    if (!hasVendorIdIndex) {
      console.log("\n⚠️  MISSING INDEX DETECTED!");
      console.log("   The products table is missing an index on vendor_id");
      console.log("   This causes full table scans when fetching products by vendor");
      console.log("\n💡 RECOMMENDATION:");
      console.log("   Run: node scripts/add-database-indexes.js");
      console.log("   This will add the missing index and speed up queries significantly\n");
    } else {
      console.log("\n✅ Index on products(vendor_id) exists");
      console.log("   Slow performance may be due to:");
      console.log("   - Database connection latency");
      console.log("   - ensureProductColumns ALTER TABLE checks");
      console.log("   - Large number of products");
      console.log("   - Network latency to database server\n");
    }
    
  } catch (error) {
    console.error("\n❌ Error during diagnosis:", error);
  }
  
  console.log("=".repeat(70) + "\n");
}

// Run the diagnostic
diagnoseStorePageQueries()
  .then(() => {
    console.log("✅ Diagnostic complete\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Diagnostic failed:", error);
    process.exit(1);
  });
