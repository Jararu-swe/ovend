/**
 * Vendor Guide Content Templates (CommonJS Version)
 *
 * This file contains all guide templates.
 * Add or edit guides here - they'll be auto-seeded into the database!
 */

const guideTemplates = [
  {
    title: "🎉 Welcome to Vendle!",
    slug: "welcome-to-vendle",
    description:
      "Get started with the basics and explore your new store dashboard.",
    trigger_type: "onboarding-complete",
    applies_to_categories: null,
    icon_name: "SparklesIcon",
    featured: true,
    reading_time: 3,
    difficulty: "beginner",
    content: "Welcome content here",
  },

  {
    title: "📸 Product Photography Tips",
    slug: "product-photography-tips",
    description: "Learn how to take great photos that increase sales.",
    trigger_type: "first-product",
    applies_to_categories: null,
    icon_name: "CameraIcon",
    featured: true,
    reading_time: 5,
    difficulty: "beginner",
    content: "Photography tips content here",
  },

  {
    title: "📦 Your First Order - How to Handle It",
    slug: "your-first-order",
    description: "Step-by-step guide for processing your first customer order.",
    trigger_type: "first-order",
    applies_to_categories: null,
    icon_name: "ShoppingBagIcon",
    featured: true,
    reading_time: 4,
    difficulty: "beginner",
    content: "First order handling content here",
  },

  {
    title: "💰 Handling Payments & Payouts",
    slug: "handling-payments-payouts",
    description: "How to receive payments and manage your earnings.",
    trigger_type: "first-payment",
    applies_to_categories: null,
    icon_name: "CreditCardIcon",
    featured: true,
    reading_time: 5,
    difficulty: "beginner",
    content: "Payment handling content here",
  },

  {
    title: "🎨 Customize Your Store",
    slug: "customize-your-store",
    description:
      "Learn how to personalize your storefront with themes and colors.",
    trigger_type: "category-specific",
    applies_to_categories: null,
    icon_name: "PaletteIcon",
    featured: true,
    reading_time: 5,
    difficulty: "beginner",
    content: "Customization content here",
  },

  {
    title: "🚀 7 Days In - Growing Your Sales",
    slug: "growing-sales-day-7",
    description:
      "First week survival guide - strategies to get your first sales.",
    trigger_type: "milestone-7days",
    applies_to_categories: null,
    icon_name: "TrendingUpIcon",
    featured: false,
    reading_time: 6,
    difficulty: "intermediate",
    content: "Growth strategies content here",
  },

  {
    title: "📊 Understanding Your Analytics",
    slug: "understanding-analytics",
    description: "Learn what your store metrics mean and how to use them.",
    trigger_type: "milestone-30days",
    applies_to_categories: null,
    icon_name: "ChartBarIcon",
    featured: false,
    reading_time: 5,
    difficulty: "intermediate",
    content: "Analytics content here",
  },

  {
    title: "🌟 Reaching 90 Days - Building Momentum",
    slug: "reaching-90-days",
    description: "Three months in - taking your business to the next level.",
    trigger_type: "milestone-90days",
    applies_to_categories: null,
    icon_name: "SparklesIcon",
    featured: false,
    reading_time: 6,
    difficulty: "intermediate",
    content: "Momentum building content here",
  },

  {
    title: "👥 Adding Team Members",
    slug: "adding-team-members",
    description: "How to invite and manage team members on your store.",
    trigger_type: "team-member-invited",
    applies_to_categories: null,
    icon_name: "UserGroupIcon",
    featured: false,
    reading_time: 4,
    difficulty: "beginner",
    content: "Team management content here",
  },

  {
    title: "💼 Scaling Your Business",
    slug: "scaling-your-business",
    description:
      "Advanced strategies for growing from side hustle to full business.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "RocketLaunchIcon",
    featured: false,
    reading_time: 8,
    difficulty: "advanced",
    content: "Scaling content here",
  },

  {
    title: "🎯 Marketing & Promotion Basics",
    slug: "marketing-promotion-basics",
    description: "Essential marketing strategies to attract customers.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "MegaphoneIcon",
    featured: true,
    reading_time: 6,
    difficulty: "intermediate",
    content: "Marketing content here",
  },

  {
    title: "⭐ Building Customer Reviews",
    slug: "building-customer-reviews",
    description: "How to encourage positive reviews and handle feedback.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "StarIcon",
    featured: false,
    reading_time: 4,
    difficulty: "beginner",
    content: "Reviews content here",
  },

  {
    title: "🏪 Running Promotions & Discounts",
    slug: "running-promotions-discounts",
    description:
      "Learn how to create effective promotions without hurting margins.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "TicketIcon",
    featured: false,
    reading_time: 5,
    difficulty: "beginner",
    content: "Promotions content here",
  },

  {
    title: "📱 Using Social Media for Sales",
    slug: "social-media-for-sales",
    description: "WhatsApp, Instagram, TikTok - strategies for each platform.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "ShareIcon",
    featured: true,
    reading_time: 7,
    difficulty: "intermediate",
    content: "Social media content here",
  },

  {
    title: "🛡️ Staying Safe & Legal",
    slug: "staying-safe-legal",
    description: "Best practices for protecting your business and customers.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "ShieldCheckIcon",
    featured: false,
    reading_time: 5,
    difficulty: "intermediate",
    content: "Safety and legal content here",
  },
];

module.exports = { guideTemplates };
