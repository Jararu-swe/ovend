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
    category: "getting-started",
    description:
      "Get started with the basics and explore your new store dashboard.",
    trigger_type: "onboarding-complete",
    applies_to_categories: null,
    icon_name: "SparklesIcon",
    featured: true,
    reading_time: 3,
    difficulty: "beginner",
    content:
      "# Welcome to Vendle!\n\nCongratulations! You are now part of the Vendle platform. This guide will help you get started.\n\n## What You Can Do\n- Create a beautiful storefront\n- Manage inventory\n- Process payments\n- Track orders\n- Grow your sales\n\n## Next Steps\n1. Add your first product\n2. Customize your store\n3. Share your store link\n4. Monitor your orders",
  },
  {
    title: "📸 Product Photography Tips",
    slug: "product-photography-tips",
    category: "getting-started",
    description: "Learn how to take great photos that increase sales.",
    trigger_type: "first-product",
    applies_to_categories: null,
    icon_name: "CameraIcon",
    featured: true,
    reading_time: 5,
    difficulty: "beginner",
    content:
      "# Product Photography Tips\n\nGreat photos are essential for sales. Here is how to take amazing product photos:\n\n## Golden Rules\n1. Use natural light\n2. Show the product clearly\n3. Take multiple angles\n4. Keep backgrounds simple\n5. Show the product in use\n\n## Common Mistakes to Avoid\n- Blurry photos\n- Too many items in one photo\n- Bad angles\n- Inconsistent styling",
  },
  {
    title: "📦 Your First Order - How to Handle It",
    slug: "your-first-order",
    category: "getting-started",
    description: "Step-by-step guide for processing your first customer order.",
    trigger_type: "first-order",
    applies_to_categories: null,
    icon_name: "ShoppingBagIcon",
    featured: true,
    reading_time: 4,
    difficulty: "beginner",
    content:
      "# Your First Order\n\nCongratulations on your first order! Here is how to handle it perfectly:\n\n## Order Status Workflow\n1. Pending - New order received\n2. Processing - You are preparing the order\n3. Ready - Order is packed and ready\n4. Shipped - Order is on the way\n5. Delivered - Customer received it\n6. Completed - Order is finished\n\n## Step-by-Step Process\n1. Check order details\n2. Prepare the item\n3. Update status to Processing\n4. Pack and ship\n5. Update status to Shipped\n6. Send tracking info to customer",
  },
  {
    title: "💰 Handling Payments & Payouts",
    slug: "handling-payments-payouts",
    category: "getting-started",
    description: "How to receive payments and manage your earnings.",
    trigger_type: "first-payment",
    applies_to_categories: null,
    icon_name: "CreditCardIcon",
    featured: true,
    reading_time: 5,
    difficulty: "beginner",
    content:
      "# Handling Payments & Payouts\n\nManaging payments is crucial for your business. Here is how:\n\n## Payment Methods\nVendle supports:\n- Paystack for card payments\n- Bank transfers\n- Mobile money\n\n## Getting Paid\n1. Save your bank details in Settings\n2. Reach payment threshold (usually ₦5000)\n3. Request payout\n4. Payment arrives in 24-48 hours\n\n## Payment Fees\nVendle charges a small percentage for processing payments. Check your dashboard for exact rates.",
  },
  {
    title: "🎨 Customize Your Store",
    slug: "customize-your-store",
    category: "getting-started",
    description:
      "Learn how to personalize your storefront with themes and colors.",
    trigger_type: "category-specific",
    applies_to_categories: null,
    icon_name: "PaletteIcon",
    featured: true,
    reading_time: 5,
    difficulty: "beginner",
    content:
      "# Customize Your Store\n\nYour store appearance reflects your brand. Here is how to customize it:\n\n## Where to Customize\n1. Go to Settings\n2. Click Store Customization\n3. Choose a theme\n4. Pick colors and fonts\n5. Add logo and banner\n6. Save changes\n\n## Themes Available\n- Luxe Boutique (fashion)\n- Beauty Glow (beauty)\n- Fresh Market (food)\n- Tech Store (electronics)\n- Minimal Clean (universal)\n\n## Color Tips\n- Primary color should pop\n- Text should be readable\n- Use light backgrounds",
  },
  {
    title: "🚀 7 Days In - Growing Your Sales",
    slug: "growing-sales-day-7",
    category: "growth",
    description:
      "First week survival guide - strategies to get your first sales.",
    trigger_type: "milestone-7days",
    applies_to_categories: null,
    icon_name: "TrendingUpIcon",
    featured: false,
    reading_time: 6,
    difficulty: "intermediate",
    content:
      "# Growing Your Sales - Day 7\n\nYou have been live for a week! Here is how to get your first sales:\n\n## The 70/20/10 Rule\n- 70% from existing audience\n- 20% from paid promotion\n- 10% from organic search\n\n## Leverage Your Existing Audience\n1. Share on WhatsApp status\n2. Message friends directly\n3. Post on Instagram\n4. Create Facebook shop\n5. Share on TikTok\n\n## Create Urgency\n- Limited time offers\n- Flash sales\n- Early bird discounts\n- Bundle deals\n\n## First Sales Tips\n- Respond quickly to messages\n- Offer good customer service\n- Ask for referrals\n- Build relationships",
  },
  {
    title: "📊 Understanding Your Analytics",
    slug: "understanding-analytics",
    category: "growth",
    description: "Learn what your store metrics mean and how to use them.",
    trigger_type: "milestone-30days",
    applies_to_categories: null,
    icon_name: "ChartBarIcon",
    featured: false,
    reading_time: 5,
    difficulty: "intermediate",
    content:
      "# Understanding Your Analytics\n\nYour dashboard shows important metrics about your store:\n\n## Key Metrics\n- Visits: How many people viewed your store\n- Orders: Total orders received\n- Revenue: Total money earned\n- Conversion Rate: Percentage of visitors who buy\n\n## What to Focus On\n- Track weekly trends\n- Monitor profitable products\n- Check conversion rates\n- Identify slow products\n\n## Improvement Tips\n- Improve product photos\n- Better descriptions\n- Faster response time\n- Better pricing\n\n## Using Data\nCheck analytics weekly to understand your business better.",
  },
  {
    title: "🌟 Reaching 90 Days - Building Momentum",
    slug: "reaching-90-days",
    category: "growth",
    description: "Three months in - taking your business to the next level.",
    trigger_type: "milestone-90days",
    applies_to_categories: null,
    icon_name: "SparklesIcon",
    featured: false,
    reading_time: 6,
    difficulty: "intermediate",
    content:
      "# Reaching 90 Days - Building Momentum\n\nYou have been running for 90 days! Time to scale up:\n\n## Evaluate Your Progress\n- How many orders did you get?\n- What products sell best?\n- How is your revenue growing?\n- What feedback did you get?\n\n## Next Level Strategies\n1. Expand your product range\n2. Improve your top sellers\n3. Test paid advertising\n4. Hire help if needed\n5. Streamline operations\n\n## Growth Mindset\n- Learn from failures\n- Track what works\n- Reinvest profits\n- Stay consistent\n- Keep improving\n\n## Looking Ahead\nYou have the foundation. Now it is time to build.",
  },
  {
    title: "👥 Adding Team Members",
    slug: "adding-team-members",
    category: "operations",
    description: "How to invite and manage team members on your store.",
    trigger_type: "team-member-invited",
    applies_to_categories: null,
    icon_name: "UserGroupIcon",
    featured: false,
    reading_time: 4,
    difficulty: "beginner",
    content:
      "# Adding Team Members\n\nGrow your business by delegating work to team members:\n\n## How to Add Team Members\n1. Go to Settings\n2. Click Team Members\n3. Click Add Member\n4. Enter their email\n5. Choose their role\n6. Send invitation\n\n## Available Roles\n- Admin: Full access\n- Manager: Can manage orders and products\n- Editor: Can edit products only\n- Viewer: Can view analytics only\n\n## Managing Your Team\n- Assign clear roles\n- Keep communication open\n- Track their performance\n- Pay them fairly\n- Recognize good work\n\n## Best Practices\n- Start with one trusted person\n- Train them well\n- Delegate gradually",
  },
  {
    title: "🎯 Marketing & Promotion Basics",
    slug: "marketing-promotion-basics",
    category: "marketing",
    description: "Essential marketing strategies to attract customers.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "MegaphoneIcon",
    featured: true,
    reading_time: 6,
    difficulty: "intermediate",
    content:
      "# Marketing & Promotion Basics\n\nAttract more customers with smart marketing:\n\n## Free Marketing Channels\n1. Social media (WhatsApp, Instagram, TikTok)\n2. Word of mouth (ask customers to share)\n3. Email (collect emails for promotions)\n4. Community groups\n5. Your store link everywhere\n\n## Paid Advertising\n1. Facebook/Instagram ads (start small)\n2. Google Shopping\n3. TikTok ads\n4. Influencer partnerships\n\n## Promotion Ideas\n- First-time buyer discount\n- Bundle deals\n- Seasonal promotions\n- Referral bonuses\n- Flash sales\n\n## Content Ideas\n- Product photos\n- Behind-the-scenes videos\n- Customer testimonials\n- How-to guides\n- Special announcements",
  },
  {
    title: "⭐ Building Customer Reviews",
    slug: "building-customer-reviews",
    category: "marketing",
    description: "How to encourage positive reviews and handle feedback.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "StarIcon",
    featured: false,
    reading_time: 4,
    difficulty: "beginner",
    content:
      "# Building Customer Reviews\n\nPositive reviews build trust and increase sales:\n\n## How to Get Reviews\n1. Ask after delivery\n2. Send follow-up message\n3. Make it easy to review\n4. Offer incentives (not required)\n5. Respond to all reviews\n\n## Handling Negative Reviews\n1. Do not argue\n2. Apologize sincerely\n3. Offer a solution\n4. Take conversation offline if needed\n5. Learn from the feedback\n\n## Review Best Practices\n- Be honest in your product descriptions\n- Deliver exactly what you promise\n- Provide excellent customer service\n- Package items well\n- Follow up with customers\n\n## Building Reputation\nYour reputation takes time to build but is worth it.",
  },
  {
    title: "🏪 Running Promotions & Discounts",
    slug: "running-promotions-discounts",
    category: "promotions",
    description:
      "Learn how to create effective promotions without hurting margins.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "TicketIcon",
    featured: false,
    reading_time: 5,
    difficulty: "beginner",
    content:
      "# Running Promotions & Discounts\n\nPromotions attract customers but protect your profit:\n\n## Types of Promotions\n1. Percentage off (20% off)\n2. Amount off (Save ₦500)\n3. Buy 2 Get 1 Free\n4. Free shipping\n5. Bundle deals\n\n## Smart Discount Strategy\n- Set a discount limit (max 30%)\n- Only discount slow sellers\n- Time limited promotions\n- Promote heavily when discounted\n- Measure ROI\n\n## When to Promote\n- Seasonal events\n- Holidays\n- New product launch\n- Clearing old stock\n- Increase traffic\n\n## Discount Myths\n- Discount does not mean losing profit\n- Volume makes up for margin loss\n- Customers appreciate value\n- Timing matters more than depth",
  },
  {
    title: "📱 Using Social Media for Sales",
    slug: "social-media-for-sales",
    category: "marketing",
    description: "WhatsApp, Instagram, TikTok - strategies for each platform.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "ShareIcon",
    featured: true,
    reading_time: 7,
    difficulty: "intermediate",
    content:
      "# Using Social Media for Sales\n\nEach platform has different strengths:\n\n## WhatsApp Strategy\n- Add store link to status\n- Send personal messages\n- Create broadcast lists\n- Share order updates\n- Handle customer service\n\n## Instagram Strategy\n- Post product photos daily\n- Use relevant hashtags\n- Add store link in bio\n- Post stories with updates\n- Engage with followers\n- Go live for events\n\n## TikTok Strategy\n- Create short product videos\n- Show behind-the-scenes\n- Use trending sounds\n- Link to store in bio\n- Post regularly\n- Engage with comments\n\n## Facebook Strategy\n- Join local community groups\n- Share product updates\n- Create Facebook Shop\n- Run targeted ads\n- Engage with comments\n\n## Content Calendar\n- Plan posts weekly\n- Mix product and lifestyle content\n- Stay consistent\n- Track what works",
  },
  {
    title: "🛡️ Staying Safe & Legal",
    slug: "staying-safe-legal",
    category: "operations",
    description: "Best practices for protecting your business and customers.",
    trigger_type: null,
    applies_to_categories: null,
    icon_name: "ShieldCheckIcon",
    featured: false,
    reading_time: 5,
    difficulty: "intermediate",
    content:
      "# Staying Safe & Legal\n\nProtect your business and build customer trust:\n\n## Payment Safety\n- Use Paystack for secure payments\n- Never ask for card details via WhatsApp\n- Use Vendle shop link only\n- Keep customer data private\n\n## Product Safety\n- Know your product quality\n- Check expiry dates (if applicable)\n- Meet health standards (if food)\n- Honest product descriptions\n- No counterfeits\n\n## Customer Privacy\n- Protect customer data\n- Do not share contacts\n- Use secure connections\n- Delete old customer info\n\n## Business Practices\n- Keep records\n- Pay taxes\n- Honor refunds\n- Meet delivery promises\n- Respect customer rights\n\n## Terms & Policies\n- Have clear return policy\n- Explain shipping costs\n- Set delivery timelines\n- Document everything\n\n## Trust Building\nLegal compliance builds long-term trust.",
  },
];

module.exports = { guideTemplates };
