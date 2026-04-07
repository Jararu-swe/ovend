\\\\---
name: ovend-mvp-product-and-tech-plan
overview: High-level product and technical plan to build Ovend, a digital storefront platform for Nigerian small and medium vendors, starting as a responsive web app MVP.
todos: []
isProject: false
---

### 1. Goal

Build **Ovend**, a mobile‑responsive web platform where Nigerian vendors can quickly create a simple storefront, share one link across social platforms (WhatsApp, Instagram, TikTok), and manage basic orders and payments from a clean, mobile‑first dashboard.

The MVP should feel:

- **Trustworthy** (clear branding, clean UI, no clutter)
- **Fast to understand** (what Ovend does in a few seconds)w
- **Fast to try** (low-friction onboarding and setup)

---

### 2. Primary users & core jobs

- **Primary user**: Nigerian solo or small-team vendor currently selling via WhatsApp / Instagram DMs.
- **Key jobs-to-be-done**:
  - Create a **single storefront link** with products, prices, and availability.
  - Share that link on social channels so customers can **browse without chatting first**.
  - Receive **structured orders** (what, who, where, how to pay) instead of free‑form chats.
  - Track **recent orders and revenue** at a glance.

Non-goals for MVP:

- Full inventory management (stock levels, supplier handling).
- Complex delivery logistics.
- Multi‑currency support beyond NGN.

---

### 3. MVP product scope

**3.1. Public landing + marketing layer**

- Hero section (already implemented, Shopify‑inspired) clearly stating:
  - What Ovend is.
  - Who it’s for (Nigerian vendors).
  - Primary benefit (turn chats into storefront orders).
- Lightweight explanation of:
  - How it works (3 steps: create storefront → share link → manage orders).
  - Key benefits (less admin, more organised orders, mobile‑first).
- Primary CTA: **“Get started free”** → login / sign‑up.

**3.2. Authentication & vendor accounts**

- Email/password auth using **NextAuth** (or credentials provider) with:
  - Sign up, sign in, sign out.
  - Basic session handling.
- Vendor profile with:
  - Store name.
  - Contact WhatsApp number.
  - Optional logo / avatar (can be deferred).

**3.3. Vendor dashboard (after login)**

Core pages (mostly exist via Next.js dashboard starter and can be adapted):

- **Overview / Home**
  - Cards for: total orders (week), revenue (NGN), best‑selling product (simple stats, not deeply accurate at first).
- **Products**
  - List of products.
  - Create/edit/delete product:
    - Name, price (NGN), short description.
    - Status: active / inactive.
    - (Optional) image URL.
- **Orders**
  - List of incoming orders with:
    - Customer name, phone / WhatsApp handle, products ordered, amount, status.
  - Status options: new, in progress, fulfilled, cancelled.

**3.4. Public store link**

- Each vendor has a public URL like `/s/{storeIdOrSlug}`:
  - Shows store name and logo (optional).
  - Lists active products with price and description.
  - Simple mobile‑first layout with large tap targets.
- Customers can:
  - Add 1–N products to a basic cart.
  - Submit order with:
    - Name.
    - Phone / WhatsApp.
    - Delivery or pickup preference.
  - On submission:
    - Order is saved in database.
    - Vendor sees it in dashboard.
    - (Optional later) Vendor gets a notification via email / WhatsApp.

**3.5. Payments (MVP)**

- MVP: **Cash / transfer on delivery** only:
  - On order confirmation page, show instructions like:
    - “Pay via bank transfer or on delivery. You’ll receive a WhatsApp message from the vendor.”
  - Actual fintech integration (e.g. Paystack/Flutterwave) is a **later iteration**.

---

### 4. Technical architecture (high level)

- **Framework**: Next.js App Router (already in use) with TypeScript.
- **Styling**: Tailwind CSS + small CSS modules (`home.module.css`) for accents.
- **UI components**: Headless components or simple custom ones; keep minimal.
- **Database**: Postgres (via `postgres` package in `package.json`).
- **ORM / data access**:
  - Start with a lightweight data access layer using `postgres` tagged templates.
  - Wrap in small repository functions (e.g. `getProductsByVendor`, `createOrder`).
- **Auth**: NextAuth with credentials provider, storing users in Postgres.
- **Deployment target**: Vercel‑style Edge + Node (standard Next.js hosting) or similar.

---

### 5. Implementation phases & order

**Phase 1 – Foundations (you are here / mostly done)**

- Set up Next.js app with:
  - App Router.
  - Tailwind.
  - Typescript.
- Implement **marketing landing page** (Shopify‑like, white background, Ovend branding).
- Add top‑nav with `brandname.svg` logo and clear CTAs.

**Phase 2 – Auth + dashboard shell**

- Implement authentication (sign up, sign in, session).
- Create a basic dashboard layout:
  - Sidebar navigation (Overview, Products, Orders, Settings).
  - Responsive for mobile and desktop.
- Wire fake stats into overview cards (same metrics as hero mock card).

**Phase 3 – Products & public store**

- Build products CRUD:
  - DB tables for vendors and products.
  - Pages/forms to create, edit, delete products.
- Create vendor public store page at `/s/[slug]`:
  - SSR page reading products for the vendor.
  - Clean card layout on mobile.

**Phase 4 – Orders flow**

- Add `orders` table (vendorId, items JSON, totals, customer info, status).
- Implement checkout flow on public store:
  - Simple cart in client state.
  - Order submit hitting a server action / API route.
- Dashboard `Orders` page:
  - List of orders.
  - Detail view with ability to toggle status.

**Phase 5 – Polish & UX**

- Improve empty states and skeletons.
- Add simple “copy your store link” CTA in dashboard.
- Add lightweight analytics: track store visits and orders count per day (can be simple aggregated queries).

---

### 6. Nice‑to‑haves after MVP

- Payment integration (e.g. Paystack) for online payments.
- WhatsApp deep‑linking (auto‑generated message template with order details).
- Basic discount codes / promotions.
- Multi‑user access per store (assistant account).

---

### 7. How the current work fits

- Landing page hero and navigation already align with **Phase 1**: they speak directly to Nigerian vendors and clearly present the primary benefit.
- Next steps to “flow the plan”:
  - Implement auth and dashboard shell (Phase 2).
  - Hook up real product data and a public store link (Phase 3).
  - Wire the dashboard metrics and orders to real data (Phases 3–4).
