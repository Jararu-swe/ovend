/**
 * Update Guide Categories
 * Updates the category field for existing vendor guides in the database.
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

const guideCategoryUpdates = [
  { slug: "welcome-to-vendle", category: "getting-started" },
  { slug: "product-photography-tips", category: "getting-started" },
  { slug: "your-first-order", category: "getting-started" },
  { slug: "handling-payments-payouts", category: "getting-started" },
  { slug: "customize-your-store", category: "getting-started" },
  { slug: "growing-sales-day-7", category: "growth" },
  { slug: "understanding-analytics", category: "growth" },
  { slug: "reaching-90-days", category: "growth" },
  { slug: "adding-team-members", category: "operations" },
  { slug: "marketing-promotion-basics", category: "marketing" },
  { slug: "building-customer-reviews", category: "marketing" },
  { slug: "running-promotions-discounts", category: "promotions" },
  { slug: "social-media-for-sales", category: "marketing" },
  { slug: "staying-safe-legal", category: "operations" },
];

async function updateGuideCategories() {
  try {
    console.log("🔄 Updating guide categories...");

    for (const { slug, category } of guideCategoryUpdates) {
      const result = await sql`
        UPDATE vendor_guides
        SET category = ${category}
        WHERE slug = ${slug}
      `;

      console.log(`✅ Updated: ${slug} → ${category}`);
    }

    console.log(
      `\n✅ Successfully updated categories for ${guideCategoryUpdates.length} guides!`,
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating guide categories:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateGuideCategories()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { updateGuideCategories };
