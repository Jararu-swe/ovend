# Vendle MVP Testing Guide

## Setup

1. **Create the analytics table:**
   ```bash
   node create-analytics-table.js
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

## End-to-End Testing Flow

### 1. Vendor Onboarding
- [ ] Navigate to `http://localhost:3000`
- [ ] Click "Get started free" on the landing page
- [ ] Sign up with email and password
- [ ] Verify redirect to dashboard

### 2. Store Setup
- [ ] Go to Settings page
- [ ] Set store name (e.g., "Amaka's Fashion")
- [ ] Set store slug (e.g., "amaka-fashion")
- [ ] Add WhatsApp number (e.g., "+2348012345678")
- [ ] Save and verify success message

### 3. Product Management
- [ ] Navigate to Products page
- [ ] Verify empty state shows
- [ ] Click "Add Product"
- [ ] Fill in product details:
  - Name: "Ankara Two-Piece Set"
  - Price: 15000
  - Description: "Beautiful handmade ankara outfit"
  - Status: Active
  - Image URL: (optional)
- [ ] Submit and verify redirect to products list
- [ ] Verify product card displays correctly
- [ ] Add 2-3 more products
- [ ] Test edit functionality
- [ ] Test delete functionality

### 4. Public Store
- [ ] Copy store link from dashboard
- [ ] Open in new incognito/private window
- [ ] Verify store displays with vendor name
- [ ] Verify all active products show
- [ ] Add products to cart
- [ ] Verify cart count updates
- [ ] Open cart drawer
- [ ] Adjust quantities
- [ ] Click "Checkout Order"
- [ ] Fill in customer details:
  - Name: "Chioma Okafor"
  - WhatsApp: "+2348098765432"
  - Delivery type: Delivery
  - Address: "123 Lagos Street, Ikeja"
- [ ] Submit order
- [ ] Verify success screen
- [ ] Test WhatsApp link (should open WhatsApp with pre-filled message)

### 5. Order Management
- [ ] Return to vendor dashboard
- [ ] Navigate to Orders page
- [ ] Verify new order appears
- [ ] Click to expand order details
- [ ] Verify all order information is correct
- [ ] Test status updates:
  - [ ] Click "Start" → verify status changes to "In Progress"
  - [ ] Click "Fulfilled" → verify status changes to "Fulfilled"
- [ ] Test order filtering
- [ ] Create another order and test "Cancel" status

### 6. Dashboard Analytics
- [ ] Return to Overview page
- [ ] Verify stats cards show correct data:
  - Total Revenue (fulfilled orders only)
  - Total Orders
  - Active Products
  - Pending Orders
- [ ] Verify "Last 7 Days" analytics section shows:
  - Store Visits
  - Orders
  - Revenue
  - Conversion Rate
- [ ] Visit public store multiple times to increase visit count
- [ ] Refresh dashboard to see updated analytics

### 7. Loading States
- [ ] Navigate between pages quickly
- [ ] Verify skeleton loaders appear during data fetching
- [ ] Check Products page loading state
- [ ] Check Orders page loading state
- [ ] Check Dashboard loading state

### 8. Mobile Responsiveness
- [ ] Open DevTools and toggle device toolbar
- [ ] Test on mobile viewport (375px width)
- [ ] Verify:
  - [ ] Landing page is mobile-friendly
  - [ ] Dashboard sidebar collapses properly
  - [ ] Products grid stacks on mobile
  - [ ] Public store is touch-friendly
  - [ ] Cart drawer works on mobile
  - [ ] Checkout form is usable on mobile

### 9. Edge Cases
- [ ] Try creating product with invalid data (empty name, negative price)
- [ ] Try accessing another vendor's store
- [ ] Try submitting order without required fields
- [ ] Test with very long product names/descriptions
- [ ] Test with 0 products in store
- [ ] Test with 0 orders

## Expected Results

✅ All flows should work smoothly without errors
✅ Data should persist across page refreshes
✅ Analytics should track visits and orders
✅ Loading states should appear during data fetching
✅ Mobile experience should be fully functional
✅ WhatsApp integration should work correctly

## Known Limitations (MVP)

- No image upload (URL only)
- No payment integration (cash/transfer only)
- No email notifications
- Basic analytics (no charts/graphs)
- No multi-user access
- No discount codes

## Next Steps After Testing

If all tests pass, the MVP is ready for:
1. User acceptance testing with real vendors
2. Deployment to production
3. Implementation of nice-to-haves (payment integration, WhatsApp deep-linking, etc.)
