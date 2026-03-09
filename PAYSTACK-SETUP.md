# Paystack Payment Integration - Setup Guide

## ✅ What's Been Implemented

1. **Paystack Script** - Added to app layout
2. **Payment Method Selection** - Cash/Card options in checkout
3. **Payment Processing** - Card payments via Paystack popup
4. **Payment Verification** - API route to verify payments
5. **Order Tracking** - Payment method and status stored with orders

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Paystack Keys

1. Sign up at https://paystack.com
2. Go to Settings > API Keys & Webhooks
3. Copy your **Public Key** and **Secret Key**

### Step 2: Add Environment Variables

Add to your `.env` file:

```env
# Paystack Keys
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Important:** 
- Use `pk_test_` and `sk_test_` keys for testing
- Use `pk_live_` and `sk_live_` keys for production

### Step 3: Test the Integration

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit a store and add products to cart

3. In checkout, select "💳 Card" as payment method

4. Use Paystack test card:
   - **Card Number**: 4084084084084081
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **OTP**: 123456

5. Complete payment and verify order is created

## 🧪 Testing

### Test Cards

| Card Number | Type | Result |
|-------------|------|--------|
| 4084084084084081 | Visa | Success |
| 5060666666666666666 | Verve | Success |
| 5078000000000000 | Verve | Declined |

### Test Scenarios

- [ ] Select card payment method
- [ ] Paystack popup opens
- [ ] Enter test card details
- [ ] Payment succeeds
- [ ] Order created with payment reference
- [ ] Payment status shows as "paid"
- [ ] Order appears in vendor dashboard

### Cash Payment

- [ ] Select cash/transfer payment
- [ ] Order created immediately
- [ ] Payment status shows as "pending"
- [ ] No Paystack popup appears

## 📊 Order Payment Fields

Orders now include:

```typescript
{
  payment_method: 'cash' | 'card' | 'transfer',
  payment_reference: string | null,  // Paystack reference
  payment_status: 'pending' | 'paid' | 'failed'
}
```

## 🔒 Security

- Public key is safe to expose (client-side)
- Secret key must stay server-side only
- Payment verification happens server-side
- Never trust client-side payment confirmation

## 🌐 Production Checklist

Before going live:

- [ ] Replace test keys with live keys
- [ ] Test with real card (small amount)
- [ ] Set up webhook for payment notifications
- [ ] Add webhook URL in Paystack dashboard
- [ ] Test refund process
- [ ] Monitor failed payments

## 📱 Webhook Setup (Optional but Recommended)

1. Create webhook endpoint:
   ```typescript
   // app/api/webhooks/paystack/route.ts
   export async function POST(req: Request) {
     const signature = req.headers.get('x-paystack-signature');
     // Verify signature
     // Update order status
   }
   ```

2. Add webhook URL in Paystack dashboard:
   ```
   https://yourdomain.com/api/webhooks/paystack
   ```

3. Handle events:
   - `charge.success` - Payment successful
   - `charge.failed` - Payment failed
   - `transfer.success` - Payout successful

## 💡 Tips

1. **Test Mode**: Always test thoroughly before going live
2. **Error Handling**: Show clear messages for failed payments
3. **User Experience**: Payment popup should be smooth
4. **Mobile**: Test on actual mobile devices
5. **Network**: Handle slow connections gracefully

## 🐛 Troubleshooting

### Paystack popup doesn't open
- Check if script is loaded: `window.PaystackPop`
- Verify public key is set in environment
- Check browser console for errors

### Payment verification fails
- Verify secret key is correct
- Check API route is accessible
- Review server logs for errors

### Order not created after payment
- Check payment verification response
- Verify createOrder function is called
- Check database connection

## 📚 Resources

- Paystack Docs: https://paystack.com/docs
- Test Cards: https://paystack.com/docs/payments/test-payments
- Dashboard: https://dashboard.paystack.com
- Support: support@paystack.com

## ✅ Current Status

- [x] Paystack script loaded
- [x] Payment method selection
- [x] Card payment processing
- [x] Payment verification
- [x] Order creation with payment info
- [x] Database schema updated
- [ ] Webhook integration (optional)
- [ ] Production keys (when ready)

**Payment integration is complete and ready for testing!** 🎉
