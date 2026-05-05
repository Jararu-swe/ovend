# Vendle - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Server
```bash
npm run dev
```
Server runs on: `http://localhost:3001`

### Step 2: Create Your Store
1. Go to `http://localhost:3001`
2. Click "Get started free"
3. Sign up with your email
4. You're in! 🎉

### Step 3: Setup Your Store
1. Go to **Settings**
2. Add:
   - Store name
   - WhatsApp number
   - Bank account details (for cash payments)
3. Click "Save profile"

### Step 4: Add Products
1. Go to **Products**
2. Click "Add Product"
3. Fill in:
   - Product name
   - Price (in Naira)
   - Description
   - Status: Active
4. Click "Create Product"
5. Add 2-3 more products

### Step 5: Share Your Store
1. Copy your store link from dashboard
2. Share on WhatsApp, Instagram, etc.
3. Or visit: `http://localhost:3001/s/your-store-slug`

### Step 6: Test an Order

**As a Customer:**
1. Visit your store link
2. Add products to cart
3. Click checkout
4. Fill in details
5. Choose payment method:
   - **💳 Card**: Use test card `4084084084084081`
   - **Cash/Transfer**: See bank details
6. Complete order

**As a Vendor:**
1. Go to **Orders** in dashboard
2. See your new order
3. Update status as needed

## 🎯 Key Features

### For Vendors
- ✅ Create unlimited products
- ✅ Accept card payments (Paystack)
- ✅ Accept cash/transfer payments
- ✅ Track orders and revenue
- ✅ One shareable store link
- ✅ WhatsApp integration

### For Customers
- ✅ Browse products easily
- ✅ Add to cart
- ✅ Pay with card or cash
- ✅ Get order confirmation
- ✅ Contact vendor via WhatsApp

## 💳 Payment Methods

### Card Payments
- Powered by Paystack
- Instant confirmation
- Secure processing
- Test card: `4084084084084081`

### Cash/Transfer
- Bank details shown after order
- Customer transfers money
- Notifies vendor via WhatsApp
- Vendor confirms payment

## 📱 Mobile Friendly

- Fully responsive design
- Touch-friendly buttons
- Mobile-first checkout
- Works on all devices

## 🔗 Important Links

- **Dashboard**: `/dashboard`
- **Products**: `/dashboard/products`
- **Orders**: `/dashboard/orders`
- **Settings**: `/dashboard/settings`
- **Your Store**: `/s/your-slug`

## 🆘 Need Help?

### Common Issues

**Can't see Paystack popup?**
- Check browser console for errors
- Verify Paystack keys in `.env`
- Try refreshing the page

**Database connection error?**
- Check internet connection
- Refresh the page
- Connection usually resolves automatically

**Orders not showing?**
- Refresh the orders page
- Check if you're logged in
- Verify order was created successfully

### Test Cards

| Card | Result |
|------|--------|
| 4084084084084081 | Success |
| CVV: 123 | Any 3 digits |
| Expiry: 12/25 | Any future date |
| OTP: 123456 | For test mode |

## 📊 Dashboard Overview

### Overview Page
- Total revenue
- Total orders
- Active products
- Pending orders
- Weekly analytics
- Quick actions

### Products Page
- List all products
- Create new products
- Edit existing products
- Delete products
- Toggle active/inactive

### Orders Page
- View all orders
- Filter by status
- See order details
- Update order status
- Track payments

### Settings Page
- Store information
- WhatsApp number
- Bank account details
- Store URL slug

## 🎨 Customization

### Store Branding
- Set your store name
- Choose your URL slug
- Add WhatsApp for customer contact

### Product Display
- Add product images (URL)
- Write descriptions
- Set prices in Naira
- Control availability (active/inactive)

## 🚀 Going Live

### Before Production
1. Get Paystack live keys
2. Update `.env` with live keys
3. Test with real card (small amount)
4. Deploy to Vercel
5. Add custom domain (optional)

### Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 💡 Tips

1. **Add products first** before sharing your store
2. **Test the checkout** yourself before going live
3. **Keep WhatsApp updated** for customer contact
4. **Check orders regularly** to fulfill them quickly
5. **Update bank details** if they change

## 🎉 You're Ready!

Your Vendle store is set up and ready to accept orders!

**Next steps:**
1. Add your products
2. Share your store link
3. Start receiving orders
4. Grow your business! 📈

---

**Questions?** Check the other documentation files:
- `IMPLEMENTATION-COMPLETE.md` - Full feature list
- `PAYSTACK-SETUP.md` - Payment setup
- `PAYMENT-TEST-GUIDE.md` - Testing guide
