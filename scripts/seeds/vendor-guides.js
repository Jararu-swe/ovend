/**
 * Seed Vendor Guides
 * Inserts all guide templates into the database with proper slug generation
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
const { guideTemplates } = require("../data/guide-content");

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedVendorGuides() {
  try {
    console.log("🌱 Seeding vendor guides...");

    for (const template of guideTemplates) {
      // Ensure slug exists
      const slug = template.slug || generateSlug(template.title);

      // Check if guide already exists
      const existing = await sql`
        SELECT id FROM vendor_guides WHERE slug = ${slug}
      `;

      if (existing && existing.length > 0) {
        console.log(`⏭️  Skipping ${slug} (already exists)`);
        continue;
      }

      // Insert new guide
      await sql`
        INSERT INTO vendor_guides (
          title,
          slug,
          description,
          content,
          category,
          trigger_type,
          trigger_value,
          applies_to_categories,
          icon_name,
          featured,
          reading_time,
          difficulty,
          auto_generated,
          published_at
        ) VALUES (
          ${template.title},
          ${slug},
          ${template.description || null},
          ${template.content},
          ${template.category || "guides"},
          ${template.trigger_type},
          ${template.trigger_value || null},
          ${template.applies_to_categories || null},
          ${template.icon_name || "BookOpenIcon"},
          ${template.featured || false},
          ${template.reading_time || 5},
          ${template.difficulty || "beginner"},
          ${true},
          CURRENT_TIMESTAMP
        )
      `;

      console.log(`✅ Seeded: ${template.title}`);
    }

    console.log(
      `\n✅ Successfully seeded ${guideTemplates.length} vendor guides!`,
    );
    return true;
  } catch (error) {
    console.error("❌ Error seeding guides:", error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedVendorGuides()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedVendorGuides };
