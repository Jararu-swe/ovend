# Vendle - Digital Storefront for Nigerian Vendors

Vendle is a mobile-responsive web platform where Nigerian vendors can quickly create a simple storefront, share one link across social platforms (WhatsApp, Instagram, TikTok), and manage orders from a clean, mobile-first dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase recommended)
- npm or pnpm package manager

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```env
   POSTGRES_URL=your_postgres_connection_string
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Create database tables:**
   ```bash
   npm run setup
   ```
   This will create all required tables (products, orders, analytics).

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 📋 Features

### For Vendors
- ✅ Quick sign-up and store setup
- ✅ Product management (add, edit, delete)
- ✅ Order tracking and status updates
- ✅ Shareable store link
- ✅ Basic analytics (visits, orders, revenue)
- ✅ WhatsApp integration

### For Customers
- ✅ Browse products on mobile-friendly storefront
- ✅ Add items to cart
- ✅ Simple checkout process
- ✅ WhatsApp order notifications

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## 📁 Project Structure

```
vendle/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Vendor dashboard pages
│   │   ├── products/     # Product management
│   │   ├── orders/       # Order management
│   │   └── settings/     # Store settings
│   ├── s/[slug]/         # Public storefront
│   ├── lib/              # Data access and utilities
│   └── ui/               # Reusable components
├── public/               # Static assets
└── create-*-table.js     # Database setup scripts
```

## 🧪 Testing

Follow the comprehensive testing guide:
```bash
# See TESTING-GUIDE.md for detailed instructions
```

Key test areas:
- Vendor onboarding
- Product CRUD operations
- Public store functionality
- Order placement and management
- Analytics tracking
- Mobile responsiveness

## 🚢 Deployment

See `DEPLOYMENT-CHECKLIST.md` for production deployment steps.

Quick deploy to Vercel:
```bash
vercel --prod
```

## 📊 Database Schema

### Users Table
- Vendor accounts with store details (name, slug, WhatsApp)

### Products Table
- Product catalog (name, price, description, status, image URL)

### Orders Table
- Customer orders (items, customer info, delivery details, status)

### Store Analytics Table
- Daily metrics (visits, orders count, revenue)

## 🎯 MVP Scope

**Completed Features:**
- ✅ Landing page with clear value proposition
- ✅ Email/password authentication
- ✅ Vendor dashboard with overview
- ✅ Product management (CRUD)
- ✅ Public storefront with cart
- ✅ Order management with status updates
- ✅ Basic analytics tracking
- ✅ WhatsApp integration
- ✅ Mobile-responsive design

**Future Enhancements:**
- 💳 Payment integration (Paystack/Flutterwave)
- 📸 Image upload functionality
- 📧 Email notifications
- 📈 Advanced analytics with charts
- 🎟️ Discount codes
- 👥 Multi-user access
- 📦 Inventory management

## 🤝 Contributing

This is an MVP project. For feature requests or bug reports, please create an issue.

## 📄 License

[Your License Here]

## 📞 Support

For questions or support, contact [your contact info].

## 🎉 Acknowledgments

Built with Next.js, Tailwind CSS, and PostgreSQL.
Designed for Nigerian small and medium vendors.
