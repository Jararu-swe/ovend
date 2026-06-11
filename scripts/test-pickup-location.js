/**
 * Test script to debug pickup location functionality
 * Run with: node scripts/test-pickup-location.js
 */

const fs = require("fs");
const path = require("path");

// Load environment variables
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

async function testPickupLocation() {
  console.log('🔍 Testing pickup location functionality...\n');

  try {
    // 1. Check if columns exist in users table
    console.log('1️⃣ Checking users table schema...');
    const usersColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name IN ('pickup_latitude', 'pickup_longitude', 'pickup_address_details', 'offers_pickup')
      ORDER BY column_name
    `;
    
    if (usersColumns.length === 4) {
      console.log('✅ All pickup columns exist in users table');
      usersColumns.forEach((col) => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ Missing columns! Found:', usersColumns.length, 'of 4');
      console.log('   Run: node scripts/migrations/add-pickup-location-schema.js');
      return;
    }

    // 2. Check if there are any vendors with pickup enabled
    console.log('\n2️⃣ Checking for vendors with pickup enabled...');
    const vendorsWithPickup = await sql`
      SELECT id, store_name, offers_pickup, pickup_latitude, pickup_longitude, pickup_address_details
      FROM users
      WHERE role = 'vendor'
      LIMIT 5
    `;
    
    console.log(`Found ${vendorsWithPickup.length} vendor(s):`);
    vendorsWithPickup.forEach((v) => {
      console.log(`\n   Vendor: ${v.store_name || 'Unnamed'} (${v.id})`);
      console.log(`   offers_pickup: ${v.offers_pickup}`);
      console.log(`   pickup_latitude: ${v.pickup_latitude}`);
      console.log(`   pickup_longitude: ${v.pickup_longitude}`);
      console.log(`   pickup_address_details: ${v.pickup_address_details || 'Not set'}`);
    });

    // 3. Test fetching pickup location for first vendor
    if (vendorsWithPickup.length > 0) {
      const testVendorId = vendorsWithPickup[0].id;
      console.log(`\n3️⃣ Testing fetchVendorPickupLocation for vendor ${testVendorId}...`);
      
      const result = await sql`
        SELECT 
          pickup_latitude,
          pickup_longitude,
          pickup_address_details,
          offers_pickup
        FROM users
        WHERE id = ${testVendorId}
        LIMIT 1
      `;
      
      if (result.length > 0) {
        const vendor = result[0];
        console.log('✅ Query successful:');
        console.log(`   offers_pickup: ${vendor.offers_pickup}`);
        console.log(`   pickup_latitude: ${vendor.pickup_latitude}`);
        console.log(`   pickup_longitude: ${vendor.pickup_longitude}`);
        console.log(`   pickup_address_details: ${vendor.pickup_address_details}`);
        
        if (!vendor.offers_pickup) {
          console.log('\n⚠️  Vendor has offers_pickup set to FALSE');
          console.log('   Pickup location will not be returned');
        } else if (!vendor.pickup_latitude || !vendor.pickup_longitude) {
          console.log('\n⚠️  Vendor has offers_pickup=TRUE but no coordinates');
          console.log('   Make sure location picker is saving coordinates correctly');
        } else {
          console.log('\n✅ Pickup location should be displayed correctly!');
        }
      }
    }

    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('\n❌ Error during test:', error);
    throw error;
  }
}

// Execute the test
if (require.main === module) {
  testPickupLocation()
    .then(() => {
      console.log('\n🎉 Test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testPickupLocation };
