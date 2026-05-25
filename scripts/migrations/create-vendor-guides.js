/**
 * Migration: Create vendor guides tables
 *
 * Creates three new tables:
 * - vendor_guides: Store guide content and metadata
 * - guide_views: Track which vendors viewed which guides
 * - guide_notifications: Track guide notifications sent to vendors
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

async function createVendorGuidesTables() {
  try {
    console.log("Creating vendor_guides tables...");

    // 1. Create vendor_guides table
    await sql`
      CREATE TABLE IF NOT EXISTS vendor_guides (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        slug VARCHAR UNIQUE NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        category VARCHAR(50),
        trigger_type VARCHAR(50),
        trigger_value VARCHAR(100),
        applies_to_categories VARCHAR[],
        icon_name VARCHAR(50),
        featured BOOLEAN DEFAULT FALSE,
        video_url VARCHAR,
        reading_time INT,
        difficulty VARCHAR(20),
        auto_generated BOOLEAN DEFAULT TRUE,
        generated_from TEXT,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ vendor_guides table created");

    // 2. Create guide_views table
    await sql`
      CREATE TABLE IF NOT EXISTS guide_views (
        id SERIAL PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        guide_id INT NOT NULL REFERENCES vendor_guides(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed BOOLEAN DEFAULT FALSE,
        UNIQUE(vendor_id, guide_id)
      )
    `;
    console.log("✅ guide_views table created");

    // 3. Create guide_notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS guide_notifications (
        id SERIAL PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        guide_id INT NOT NULL REFERENCES vendor_guides(id) ON DELETE CASCADE,
        trigger_event VARCHAR(100),
        notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dismissed BOOLEAN DEFAULT FALSE,
        dismissed_at TIMESTAMP,
        UNIQUE(vendor_id, guide_id)
      )
    `;
    console.log("✅ guide_notifications table created");

    // 4. Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_guide_views_vendor ON guide_views(vendor_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_guide_views_guide ON guide_views(guide_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_guide_notifications_vendor ON guide_notifications(vendor_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_guide_notifications_guide ON guide_notifications(guide_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vendor_guides_slug ON vendor_guides(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vendor_guides_trigger ON vendor_guides(trigger_type)`;
    console.log("✅ Indexes created");

    console.log("\n✅ All vendor guides tables created successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error creating vendor guides tables:", error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  createVendorGuidesTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createVendorGuidesTables };
