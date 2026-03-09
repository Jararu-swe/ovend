# Payment Integration Test Guide

## ✅ Pre-Test Checklist

- [x] Paystack test keys added to `.env`
- [x] Paystack script added to layout
- [x] Payment UI added to checkout
- [x] Database updated with payment fields
- [ ] Dev server running
- [ ] Test store with products exists

## 🧪 Test Scenarios

### Test 1: Card Payment (Success)

**Steps:**
1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Sign in or create account
4. Add products to your store (if none exist)
5. Visit your public store: `/s/your-slug`
6. Add products to cart
7. Click "View Cart"
8. Click "Checkout Order"
9. Fill in form:
   - Name: Test Customer
   - Email: test@example.com
   - WhatsApp: +2348012345678
   - Payment Method: **💳 Card**
   - Delivery: Delivery
10. Click "Pay Now"
11. Paystack popup should appear
12. Enter test card:
    - Card: `4084084084084081`
    - CVV: `123`
    - Expiry: `12/25`
    - PIN: `1234` (if asked)
    - OTP: `123456`
13. Complete payment

**Expected Results:**
- ✅ Paystack popup opens
- ✅ Payment processes successfully
- ✅ Success screen shows
- ✅ Order created in database
- ✅ Payment status: "paid"
- ✅ Payment reference saved
- ✅ Order appears in vendor dashboard

---

### Test 2: Cash Payment

**Steps:**
1. Add products to cart
2. Go to checkout
3. Fill in form
4. Select: **Cash/Transfer**
5. Click "Confirm Order"

**Expected Results:**
- ✅ No Paystack popup
- ✅ Order created immediately
- ✅ Payment status: "pending"
- ✅ Payment method: "cash"
- ✅ Order appears in dashboard

---

### Test 3: Payment Cancellation

**Steps:**
1. Start checkout with card payment
2. When Paystack popup opens
3. Click "X" to close popup

**Expected Results:**
- ✅ Popup closes
- ✅ No order created
- ✅ User stays on checkout page
- ✅ Can try again

---

### Test 4: Failed Payment

**Steps:**
1. Use declined test card: `5078000000000000`
2. Try to complete payment

**Expected Results:**
- ✅ Payment fails
- ✅ Error message shown
- ✅ No order created
- ✅ User can try again

---

## 🔍 What to Check

### In Browser Console
- No JavaScript errors
- Paystack script loaded: `window.PaystackPop` exists
- Payment reference generated correctly

### In Database
Check orders table for:
```sql
SELECT 
  id, 
  customer_name, 
  total_amount, 
  payment_method, 
  payment_reference, 
  payment_status 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

### In Vendor Dashboard
- Order appears in orders list
- Payment method displayed
- Payment status shown
- Can update order status

---

## 🐛 Troubleshooting

### Paystack Popup Doesn't Open

**Check:**
1. Browser console for errors
2. Paystack script loaded: View page source, search for "paystack"
3. Public key is set: Check `.env` file
4. Restart dev server after adding keys

**Fix:**
```bash
# Stop server (Ctrl+C)
# Restart
npm run dev
```

### Payment Verification Fails

**Check:**
1. Secret key is correct in `.env`
2. API route is accessible: `http://localhost:3000/api/verify-payment`
3. Server logs for errors

**Test API manually:**
```bash
curl -X POST http://localhost:3000/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{"reference":"test-ref"}'
```

### Order Not Created

**Check:**
1. Database connection working
2. `createOrder` function called
3. Check server console for errors
4. Verify payment before creating order

---

## 📊 Test Results Template

| Test | Status | Notes |
|------|--------|-------|
| Card Payment Success | ⏳ | |
| Cash Payment | ⏳ | |
| Payment Cancellation | ⏳ | |
| Failed Payment | ⏳ | |
| Order in Dashboard | ⏳ | |
| Payment Reference Saved | ⏳ | |
| WhatsApp Message | ⏳ | |

---

## 🎯 Success Criteria

Payment integration is successful if:
- ✅ Paystack popup opens for card payments
- ✅ Test card payment completes successfully
- ✅ Order created with correct payment info
- ✅ Cash payments work without popup
- ✅ Payment status tracked correctly
- ✅ Orders appear in vendor dashboard
- ✅ No console errors

---

## 📝 Test Card Details

### Success Cards
- **Visa**: `4084084084084081`
- **Mastercard**: `5060666666666666666`
- **Verve**: `5078000000000000`

### Declined Card
- **Declined**: `5078000000000000`

### CVV & Expiry
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)
- **PIN**: `1234` (if requested)
- **OTP**: `123456`

---

## 🚀 Next Steps After Testing

Once all tests pass:
1. Document any issues found
2. Test on mobile device
3. Test with slow network
4. Prepare for production (switch to live keys)
5. Set up webhook for payment notifications

---

## 📞 Support

If you encounter issues:
- Check Paystack dashboard for transaction logs
- Review browser console for errors
- Check server logs
- Verify environment variables loaded

**Paystack Test Dashboard**: https://dashboard.paystack.com/transactions
