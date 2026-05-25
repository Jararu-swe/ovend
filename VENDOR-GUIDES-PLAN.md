# Vendor Guides System - Implementation Plan

## Overview

Build a comprehensive vendor guides and tutorials system that helps vendors learn how to use Vendle. When new guides are published, all vendors will see notifications and can access them from a dedicated guides hub on the dashboard home.

## Goals

- 📚 Provide self-serve learning resources for vendors (automated)
- 🔔 Auto-notify vendors about relevant guides based on their actions
- 🎯 Reduce support burden with contextual tutorials
- 📈 Increase vendor adoption and platform engagement
- 🌟 Help vendors maximize earnings
- ⚙️ **Zero admin overhead** - guides generate automatically

---

## Architecture Overview: Automated System

### Guide Generation Sources (No Manual Admin Work!)

1. **Trigger-Based Guides** ✅ Auto-created when vendor reaches milestones
   - After completing onboarding → Show "Getting Started"
   - After adding first product → Show "Product Best Practices"
   - After first order → Show "Managing Orders"
   - After 30 days → Show "Sales Growth Tips"
   - After team member invited → Show "Team Management"

2. **Context-Aware Guides** ✅ Show based on current action
   - Viewing Products page → Surface "Adding Products" guide
   - Viewing Orders page → Surface "Managing Orders" guide
   - Viewing Settings → Surface "Store Customization" guide
   - Visiting Dashboard → Show "Analytics Guide"

3. **Support Ticket Automation** ✅ Convert FAQ/tickets into guides
   - Monitor support tickets/emails
   - Detect recurring questions
   - Auto-generate guides from frequent topics
   - Example: "Why aren't my products showing?" → Auto-create troubleshooting guide

4. **Category-Based Guides** ✅ Personalized by store type
   - Detect vendor's store category during onboarding
   - Auto-create category-specific guides
   - Fashion vendor → "Fashion Sizing Guide", "Trend Tips", etc.
   - Food vendor → "Fresh Ingredients Guide", "Food Safety", etc.
   - Beauty vendor → "Product Storage", "Ingredient Substitutes", etc.

5. **Performance-Based Guides** ✅ Show based on store metrics
   - Low sales → Auto-show "Growing Your Sales" guide
   - High cart abandonment → Auto-show "Checkout Optimization" guide
   - Low product views → Auto-show "Product Photography Tips" guide

6. **Scheduled Seasonal Guides** ✅ Auto-activate for seasons/holidays
   - Christmas → "Holiday Sales Strategy" guide
   - New Year → "Setting Sales Goals" guide
   - Black Friday → "Promotion Tips" guide

### Database Schema

#### 1. `vendor_guides` Table

Stores guide content and metadata (auto-generated or seed content).

```sql
CREATE TABLE vendor_guides (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category VARCHAR(50),
  -- 'getting-started', 'products', 'orders', 'payments', 'marketing', 'tips'
  trigger_type VARCHAR(50),
  -- AUTO-GENERATION: 'onboarding-complete', 'first-product', 'first-order',
  -- 'context-products', 'context-orders', 'category-specific', 'support-ticket', 'performance-based'
  trigger_value VARCHAR(100),
  -- e.g., 'after_7_days', 'low_sales', 'high_cart_abandonment', 'fashion_vendor'
  applies_to_categories VARCHAR[],
  -- For category-specific guides: ['fashion', 'food', 'beauty']
  icon_name VARCHAR(50),
  featured BOOLEAN DEFAULT FALSE,
  video_url VARCHAR,
  reading_time INT,
  difficulty VARCHAR(20),
  auto_generated BOOLEAN DEFAULT TRUE,
  -- Marks if guide was auto-created
  generated_from TEXT,
  -- e.g., 'support_ticket_id_123', 'category_fashion', 'metric_low_sales'
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `guide_views` Table

Tracks which vendors have viewed which guides (for engagement analytics).

```sql
CREATE TABLE guide_views (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR NOT NULL REFERENCES users(id),
  guide_id INT NOT NULL REFERENCES vendor_guides(id),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(vendor_id, guide_id)
);
```

#### 3. `guide_notifications` Table

Tracks which vendors have been notified about which guides (auto-triggered).

```sql
CREATE TABLE guide_notifications (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR NOT NULL REFERENCES users(id),
  guide_id INT NOT NULL REFERENCES vendor_guides(id),
  trigger_event VARCHAR(100),
  -- What event triggered this: 'onboarding_complete', 'first_product', 'performance_alert'
  notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP,
  UNIQUE(vendor_id, guide_id)
);
```

---

---

## Feature Implementation

### Phase 1: Automated Guide Triggers (Week 1)

#### Task 1.1: Lifecycle Event Tracking

**File**: `app/lib/actions.ts` (update existing functions)

Add trigger calls at key moments:

```typescript
// After onboarding completion
await triggerGuide(vendorId, "onboarding-complete");

// After first product created
await triggerGuide(vendorId, "first-product", productData);

// After first order received
await triggerGuide(vendorId, "first-order", orderData);

// After store goes live (7+ days active)
// Scheduled job runs daily

// After vendor gets first payment
await triggerGuide(vendorId, "first-payment");

// After team member invited
await triggerGuide(vendorId, "team-member-invited");
```

#### Task 1.2: Trigger Service

**File to create**: `app/lib/guide-triggers.ts`

```typescript
export async function triggerGuide(
  vendorId: string,
  triggerType: string,
  context?: any,
) {
  // Get vendor data
  const vendor = await fetchUserById(vendorId);

  // Find matching guides for this trigger
  const guides = await sql`
    SELECT * FROM vendor_guides 
    WHERE trigger_type = ${triggerType}
    AND (applies_to_categories IS NULL OR ${vendor.category} = ANY(applies_to_categories))
  `;

  // Create notifications for all matching guides
  for (const guide of guides) {
    await notifyVendorAboutGuide(vendorId, guide.id, triggerType);
  }
}

export async function notifyVendorAboutGuide(
  vendorId: string,
  guideId: number,
  triggerEvent: string,
) {
  await sql`
    INSERT INTO guide_notifications (vendor_id, guide_id, trigger_event)
    VALUES (${vendorId}, ${guideId}, ${triggerEvent})
    ON CONFLICT (vendor_id, guide_id) DO NOTHING
  `;
}
```

#### Task 1.3: Seed Trigger-Based Guides

**File to create**: `scripts/seeds/guide-templates.js`

Pre-create guides with trigger types:

```javascript
// All guides with auto_generated = TRUE and trigger_type set
const guides = [
  {
    title: "Welcome to Vendle! 🎉",
    trigger_type: "onboarding-complete",
    content: "Welcome template...",
    // Auto-triggers after onboarding
  },
  {
    title: "Product Photography Tips",
    trigger_type: "first-product",
    content: "Photography template...",
    // Auto-triggers after first product added
  },
  {
    title: "Your First Order: How to Handle It",
    trigger_type: "first-order",
    content: "Order handling template...",
    // Auto-triggers after first order
  },
  {
    title: "Fashion Store Optimization",
    trigger_type: "category-specific",
    applies_to_categories: ["fashion"],
    content: "Fashion-specific tips...",
  },
  {
    title: "Food Store Best Practices",
    trigger_type: "category-specific",
    applies_to_categories: ["food"],
    content: "Food-specific practices...",
  },
];
```

#### Task 1.4: Performance-Based Triggers

**File to create**: `scripts/jobs/performance-guides.js` (Cron job)

Runs daily:

```typescript
// Check stores with low performance
const lowSalesStores = await sql`
  SELECT u.id, COUNT(o.id) as order_count
  FROM users u
  LEFT JOIN orders o ON u.id = o.vendor_id 
    AND o.created_at > NOW() - INTERVAL '30 days'
  WHERE u.role = 'vendor' 
    AND u.status = 'active'
  GROUP BY u.id
  HAVING COUNT(o.id) < 5
`;

// Trigger performance guides
for (const store of lowSalesStores) {
  await triggerGuide(store.id, "performance-based", {
    metric: "low-sales",
    orderCount: store.order_count,
  });
}
```

---

### Phase 2: Support Ticket Automation (Week 1-2)

#### Task 2.1: FAQ Extraction Service

**File to create**: `app/lib/faq-to-guide.ts`

Monitor support channels and auto-create guides:

```typescript
// Pseudo-code for monitoring support tickets
export async function monitorSupportTickets() {
  // Get frequently asked questions from support (via email parsing, chat logs, etc.)
  const frequentQuestions = await analyzeFrequentQuestions();

  // Pattern matching: detect repeated questions
  // "How do I add products?" (5+ times) → Create guide
  // "Payment not received?" (8+ times) → Create troubleshooting guide

  for (const question of frequentQuestions) {
    if (question.frequency > THRESHOLD) {
      await createGuideFromFAQ(question);
    }
  }
}

async function createGuideFromFAQ(faqItem) {
  // Generate title from question
  const title = generateTitleFromQuestion(faqItem.question);

  // Generate content from common answers
  const content = generateContentFromAnswers(faqItem.answers);

  // Create guide
  const guide = await sql`
    INSERT INTO vendor_guides (
      title, slug, content, trigger_type, 
      auto_generated, generated_from, category
    ) VALUES (
      ${title},
      ${slug(title)},
      ${content},
      'support-ticket',
      TRUE,
      ${`support_faq_${faqItem.id}`},
      'troubleshooting'
    )
  `;

  // Notify relevant vendors
  await notifyVendorsAboutNewGuide(guide.id);
}
```

---

### Phase 3: Context-Aware Guide Surfacing (Week 2)

#### Task 3.1: Page-Level Guide Suggestions

**File to create**: `app/ui/dashboard/contextual-guide-banner.tsx`

Component that shows relevant guides based on current page:

```tsx
export function ContextualGuideBanner({
  currentPage,
}: {
  currentPage: string;
}) {
  const contextMap = {
    "/dashboard/products": ["Adding Products", "Product Photography Tips"],
    "/dashboard/orders": ["Managing Orders", "Payment Processing"],
    "/dashboard/settings": ["Store Customization", "Store Hours Setup"],
    "/dashboard": ["Analytics Guide", "Sales Growth Tips"],
  };

  const relevantGuides = contextMap[currentPage] || [];

  return (
    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
      <p className="text-sm font-medium text-blue-900 mb-3">
        💡 Learn: {relevantGuides[0]}
      </p>
      <a
        href={`/dashboard/guides/${slug(relevantGuides[0])}`}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Read Guide →
      </a>
    </div>
  );
}
```

Used in each dashboard page:

```tsx
// In app/dashboard/products/page.tsx
<ContextualGuideBanner currentPage="/dashboard/products" />
```

---

### Phase 4: Dashboard Integration (Week 2)

#### Task 4.1: Dashboard Home - Auto-Populated Learning Hub

**File to modify**: `app/dashboard/page.tsx`

Show auto-triggered guides:

```tsx
export default async function DashboardPage() {
  const session = await auth();
  const vendorId = session?.user?.id;

  // Get auto-triggered guides for this vendor
  const newGuides = await sql`
    SELECT g.* FROM vendor_guides g
    JOIN guide_notifications gn ON g.id = gn.guide_id
    WHERE gn.vendor_id = ${vendorId}
      AND gn.dismissed = FALSE
      AND g.auto_generated = TRUE
    ORDER BY gn.notified_at DESC
    LIMIT 3
  `;

  return (
    <>
      {/* Learning Hub - Auto-populated */}
      {newGuides.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              📚 Recommended for You
            </h3>
            <a href="/dashboard/guides" className="text-sm text-emerald-600">
              View All
            </a>
          </div>

          {/* New guides banner */}
          {newGuides.length > 0 && (
            <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-medium text-blue-900">
                🎯 {newGuides.length} new guide(s) for you!
              </p>
            </div>
          )}

          {/* Auto-recommended guides grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {newGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
```

---

### Phase 5: Guide Content Pages (Week 2-3)

#### Task 5.1: Guide Library Page

**File to create**: `app/dashboard/guides/page.tsx`

Auto-populated from all generated guides:

```tsx
export default async function GuidesPage() {
  const session = await auth();
  const vendorId = session?.user?.id;

  // Fetch all published guides
  const allGuides = await sql`
    SELECT * FROM vendor_guides 
    WHERE published_at IS NOT NULL
    ORDER BY published_at DESC
  `;

  // Get vendor's viewed guides
  const viewedGuides = await getVendorViewedGuides(vendorId);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Learning Hub</h1>
        <p className="text-slate-600 mt-2">
          Guides auto-generated based on your store type and activity
        </p>
      </div>

      {/* Filter by category */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({allGuides.length})</TabsTrigger>
          <TabsTrigger value="new">New for You</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent
          value="all"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {allGuides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              viewed={viewedGuides.includes(guide.id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### Task 5.2: Guide Detail Page

**File to create**: `app/dashboard/guides/[slug]/page.tsx`

```tsx
export default async function GuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  const vendorId = session?.user?.id;

  // Fetch guide by slug
  const guide =
    await sql`SELECT * FROM vendor_guides WHERE slug = ${params.slug}`;

  if (!guide) return <NotFound />;

  // Mark as viewed
  await markGuideViewed(vendorId, guide.id);

  return (
    <div className="max-w-3xl mx-auto py-12">
      {/* Guide header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase text-slate-600">
            {guide.category}
          </span>
          <span className="text-xs font-bold uppercase text-slate-400">
            {guide.reading_time} min read
          </span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          {guide.title}
        </h1>
        {guide.auto_generated && (
          <p className="text-sm text-green-600">
            ✅ Auto-created for{" "}
            {guide.applies_to_categories?.[0] || "all vendors"}
          </p>
        )}
      </div>

      {/* Guide content (markdown) */}
      <div className="prose max-w-none mb-12">
        <ReactMarkdown>{guide.content}</ReactMarkdown>
      </div>

      {/* Mark complete */}
      <div className="border-t border-slate-200 pt-8">
        <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600">
          ✅ Mark as Completed
        </button>
      </div>
    </div>
  );
}
```

---

### Phase 6: Automated Recurring Triggers (Week 3)

#### Task 6.1: Scheduled Jobs

**Files to create**:

- `scripts/jobs/daily-performance-check.js` - Runs daily, checks store metrics
- `scripts/jobs/weekly-milestone-check.js` - Runs weekly, checks achievements
- `scripts/jobs/seasonal-guides.js` - Runs on schedule, triggers seasonal guides

Example:

```javascript
// Check for stores hitting 7-day milestone
const sevenDayOldStores = await sql`
  SELECT u.id FROM users u
  WHERE u.role = 'vendor'
    AND u.created_at < NOW() - INTERVAL '7 days'
    AND u.created_at > NOW() - INTERVAL '8 days'
`;

for (const store of sevenDayOldStores) {
  await triggerGuide(store.id, "milestone-7days", {});
}
```

---

### Phase 7: No Admin Required - Content Templates (Week 3-4)

Content is **hard-coded templates** in seed files - no admin interface needed!

#### Task 7.1: Guide Content Library

**File to create**: `scripts/data/guide-content.js`

Store all guide templates:

```javascript
export const guideTemplates = {
  onboarding_welcome: {
    title: "Welcome to Vendle! 🎉",
    slug: "welcome-to-vendle",
    trigger_type: "onboarding-complete",
    content: `
# Welcome to Vendle!

You're now part of a platform designed to help you sell to customers worldwide.

## What You Can Do
- [x] Create a beautiful storefront
- [x] Manage inventory
- [x] Process payments
- [x] Track orders

[Continue reading...]
    `,
    reading_time: 3,
    difficulty: "beginner",
  },

  first_product: {
    title: "Add Your First Product",
    slug: "add-first-product",
    trigger_type: "first-product",
    content: `
# Adding Your First Product

Congratulations! You're about to launch your store.

## Quick Tips
1. Great photos = more sales
2. Clear descriptions matter
3. Competitive pricing wins

[Full guide...]
    `,
    reading_time: 5,
    difficulty: "beginner",
  },

  fashion_specific: {
    title: "Fashion Store Optimization Guide",
    trigger_type: "category-specific",
    applies_to_categories: ["fashion"],
    content: `
# Selling Fashion on Vendle

Fashion requires special attention to detail...

## Size Charts
## Trend Alerts
## Seasonal Collections
    `,
  },

  // ... 20+ more templates
};
```

All migrations handled automatically - no admin interface!

---

## Implementation Summary (No Admin!)

### Triggers (Fully Automatic)

✅ Onboarding completion  
✅ First product added  
✅ First order received  
✅ Store age milestones (7 days, 30 days, 90 days)  
✅ Low sales alert  
✅ High cart abandonment  
✅ Team member added  
✅ Category-specific guides  
✅ Seasonal events

### Content (Template-Based)

✅ Guides created from `scripts/data/guide-content.js`  
✅ Seeded into database on deployment  
✅ No admin required - just edit templates and deploy  
✅ Easy to add new guides by adding to template file

### Notification (Contextual)

✅ Dashboard Learning Hub  
✅ Contextual banners on each page  
✅ Navbar badge showing new guides  
✅ Carousel of recommended guides

---

## User Experience Flow (Fully Automated - No Admin!)

### For Vendors

1. **Onboarding → Dashboard (Auto-triggers)**
   - Complete onboarding wizard
   - System auto-creates "Welcome" guide notification
   - Dashboard shows "Welcome to Vendle" guide in Learning Hub
   - No admin action required ✅

2. **First Product Added (Auto-triggers)**
   - Add product via Products page
   - System auto-triggers "Product Photography Tips" guide
   - Dashboard shows "Photography Tips" recommendation
   - Contextual banner appears on Products page

3. **First Order Received (Auto-triggers)**
   - Customer places order
   - System auto-triggers "Managing Orders" guide
   - Dashboard shows "Your First Order" guide
   - Contextual banner appears on Orders page

4. **Ongoing (Performance-based)**
   - Low sales? → Auto-show "Growing Sales" guide
   - High cart abandonment? → Auto-show "Checkout Tips" guide
   - Slow response? → Auto-show "Customer Service" guide

5. **Reading Guide**
   - Click guide from dashboard or notification
   - See full guide content
   - Track reading progress
   - Mark as complete
   - See related guides at bottom

### For Admin

- **Zero work required!** ✅
- Guides auto-create from code templates
- Triggers fire automatically based on user actions
- No manual guide creation or publishing needed
- Just update template files and deploy

---

## Technical Specifications

### Content Format

Guides can be written in:

- **Markdown** (stored in DB, rendered with `react-markdown`)
- **Rich HTML** (using Slate.js or Quill editor)
- **Structured Sections** (JSON with blocks)

**Recommendation**: Start with Markdown for simplicity.

### Guide Structure

```typescript
interface VendorGuide {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string; // Markdown
  category:
    | "getting-started"
    | "products"
    | "orders"
    | "payments"
    | "marketing"
    | "tips";
  icon_name: string; // Heroicon name
  featured: boolean;
  video_url?: string; // YouTube embed URL
  reading_time: number; // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  published_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface VendorGuideView {
  id: number;
  vendor_id: string;
  guide_id: number;
  viewed_at: Date;
  completed: boolean;
}
```

---

## Analytics & Metrics

Track:

- Guide views per guide
- Completion rate per guide
- Time spent reading guide
- Popular guides (most viewed)
- Guides by difficulty level
- Vendor engagement with guides
- Correlation between guide reading and store performance

---

## Timeline (No Admin Work!)

| Phase                   | Duration      | Deliverables                                        | Admin Work                    |
| ----------------------- | ------------- | --------------------------------------------------- | ----------------------------- |
| Phase 1: Triggers       | 3-5 days      | Event tracking, trigger service, scheduled jobs     | ❌ None                       |
| Phase 2: FAQ Auto-gen   | 3-5 days      | Support ticket monitoring, guide creation from FAQs | ❌ None                       |
| Phase 3: Context Aware  | 2-3 days      | Page-level guide suggestions                        | ❌ None                       |
| Phase 4: Dashboard      | 2-3 days      | Learning Hub, navbar badge, recommendations         | ❌ None                       |
| Phase 5: Pages          | 3-5 days      | Guide library, detail pages, components             | ❌ None                       |
| Phase 6: Recurring Jobs | 2-3 days      | Scheduled triggers, milestone checks                | ❌ None                       |
| Phase 7: Templates      | 2-3 days      | Guide content templates, seed data                  | ✅ Write guide text (minimal) |
| **Total**               | **2-3 weeks** | **Full automated system**                           | **⚡ Minimal**                |

### Ongoing Maintenance (Fully Automated!)

- ❌ No guide creation UI to manage
- ❌ No manual publish buttons to click
- ✅ **Only update**: Edit template files & deploy when guides need updating
- ✅ **Guides auto-update** for all vendors instantly

---

## MVP vs. Future Features

### MVP ✅ (Fully Automated, No Admin!)

- [x] Auto-trigger guides on key events (onboarding, first product, first order)
- [x] Category-specific guides auto-selected
- [x] Performance-based guide triggers (low sales, etc.)
- [x] Dashboard Learning Hub auto-populated
- [x] Contextual guide banners on each page
- [x] Track viewed guides
- [x] All content from template files (no admin UI needed)

### Future Enhancements 🔮

- [ ] Support ticket → guide automation (parse support emails)
- [ ] Video integration (YouTube embeds)
- [ ] Interactive tutorials with checkpoints
- [ ] Guide comments/discussions
- [ ] A/B testing different guide content
- [ ] Guide analytics dashboard
- [ ] Multi-language guides
- [ ] Mobile app guide access
- [ ] Seasonal guide automation (Black Friday, etc.)
- [ ] AI-powered content generation

---

## Success Metrics

- **Adoption**: % of vendors viewing at least 1 guide within first month
- **Engagement**: Average guides viewed per vendor per month
- **Learning**: Correlation between guide reading and successful store setup
- **Support**: Reduction in support requests after guide publication
- **Impact**: Guides reduce setup time, increase order volume

---

## Implementation Priority

### High Priority (Start immediately) - Week 1

1. ✅ Guide trigger system (event tracking)
2. ✅ Database schema & seed data
3. ✅ Dashboard Learning Hub component
4. ✅ Guide detail pages
5. ✅ Template-based content

### Medium Priority (Week 2)

1. ✅ Contextual guide banners per page
2. ✅ Performance-based triggers
3. ✅ Guide library/hub page
4. ✅ Search & filtering

### Low Priority (Optional Future)

1. 🔮 Support ticket automation
2. 🔮 Video integration
3. 🔮 Interactive tutorials
4. 🔮 Analytics dashboard

---

## File Structure (Minimal - No Admin!)

```
app/
  api/
    vendor/
      guides/
        view/route.ts             # Mark guide viewed
        notifications/
          dismiss/route.ts        # Dismiss notification
  dashboard/
    guides/
      page.tsx                    # Guide library/hub
      [slug]/
        page.tsx                  # Guide detail page
  ui/
    dashboard/
      guide-card.tsx              # Reusable guide card component
      guide-library.tsx           # Guide grid display
      contextual-guide-banner.tsx # Context-aware suggestions
  lib/
    guide-triggers.ts             # ✨ Auto-trigger system (KEY FILE)
    data.ts                       # Guide query functions

scripts/
  migrations/
    create-vendor-guides.js       # DB schema one-time migration
  jobs/
    daily-performance-check.js    # ✨ Auto-runs daily, checks metrics
    weekly-milestone-check.js     # ✨ Auto-runs weekly, checks achievements
    seasonal-guides.js            # ✨ Auto-runs seasonally
  data/
    guide-content.js              # ✨ ALL GUIDE CONTENT - edit here!
  seeds/
    vendor-guides.js              # Seed guides on first migration
```

### Key Automation Files (Where the Magic Happens!)

- **`guide-triggers.ts`** - Detects events → triggers guides automatically
- **`guide-content.js`** - Edit this to add/update guides (no other UI needed!)
- **`daily-performance-check.js`** - Automatically checks store performance
- **`contextual-guide-banner.tsx`** - Shows relevant guides on each page

---

## Next Steps (Quick Start!)

1. **Week 1 - Backend Setup**
   - Create database schema (`scripts/migrations/create-vendor-guides.js`)
   - Build guide trigger system (`app/lib/guide-triggers.ts`)
   - Add event triggers in onboarding, product creation, order handling
   - Create scheduled jobs for performance checks

2. **Week 2 - Frontend**
   - Build guide library page (`app/dashboard/guides/page.tsx`)
   - Build guide detail page (`app/dashboard/guides/[slug]/page.tsx`)
   - Add Learning Hub to dashboard home
   - Add contextual banners to key pages

3. **Week 3 - Content & Testing**
   - Write guide templates in `scripts/data/guide-content.js` (15-20 guides)
   - Seed database with initial guides
   - Test all triggers in dev environment
   - Deploy to production!

4. **Ongoing (No Work!)**
   - Guides auto-trigger based on vendor actions
   - Guides auto-appear on dashboard
   - To add new guide: Just edit `guide-content.js` and redeploy!

---

## Key Benefits (Why No Admin Needed!)

✅ **Trigger-Based**: Guides automatically surface when relevant  
✅ **Event-Driven**: React to vendor actions (not manual admin action)  
✅ **Category-Aware**: Different guides for different store types  
✅ **Performance-Based**: Show guides based on store metrics  
✅ **Template-Driven**: All content in one file, easy to edit  
✅ **Zero UX Burden**: Guides appear contextually, no vendor searching needed  
✅ **Set & Forget**: Deploy once, guides manage themselves

---

## FAQ

**Q: How do I add a new guide?**  
A: Edit `scripts/data/guide-content.js`, add template, redeploy. Done!

**Q: How do vendors get notified?**  
A: Automatically! When trigger event happens → guide notification created → appears on dashboard.

**Q: What if I need to update a guide?**  
A: Edit template in `guide-content.js`, redeploy. All vendors see updated version instantly.

**Q: Can guides be different for different store types?**  
A: Yes! Set `applies_to_categories: ['fashion', 'food']` in template.

**Q: What about guides for vendors in different stages?**  
A: Handled by `trigger_type`. First-time vendor gets different guides than 6-month veteran.

**Q: Can I still change guide text without redeploying?**  
A: Not in MVP. Future: add admin CMS for real-time edits. For now, templates are simple enough.
