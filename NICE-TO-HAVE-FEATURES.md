# Nice-to-Have Features Implementation Guide

## Overview

This document covers the implementation of post-MVP features for Ovend:
1. ✅ Enhanced WhatsApp Deep-Linking
2. ✅ Payment Integration (Paystack)
3. ✅ Discount Codes System
4. ✅ Multi-User Access (Team Members)

---

## 1. Enhanced WhatsApp Deep-Linking ✅

### What Was Implemented

Enhanced the WhatsApp message template to include detailed order information.

### Features
- Order ID included
- Itemized list of products with quantities and prices
- Total amount
- Professional formatting with emojis
- Store name personalization

### Example Message
```
Hello *Amaka's Fashion*! 👋

I just placed an order on your Ovend store:

📦 *Order ID:* a1b2c3d4

*Items:*
• 2x Ankara Dress - ₦30,000
• 1x Head Wrap - ₦5,000

💰 *Total:* ₦35,000

Please confirm my order. Thank you!
```

### Usage
No configuration needed - automatically works when vendor has WhatsApp number set.

### Testing
1. Place an order on a store with WhatsApp configured
2. Click "Notify via WhatsApp"
3. Verify message contains all order details

---

## 2. Payment Integration (Paystack) ✅

### Setup Required

1. **Get Paystack Keys:**
   - Sign up at https://paystack.com
   - Get your Public and Secret keys from Dashboard > Settings > API Keys & Webhooks

2. **Add Environment Variables:**
   ```env
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```

3. **Add Paystack Script:**
   Add to `app/layout.tsx` or `app/s/[slug]/page.tsx`:
   ```html
   <script src="https://js.paystack.co/v1/inline.js"></script>
   ```

### Files Created

- `app/lib/paystack.ts` - Payment utilities
- `app/ui/store/payment-button.tsx` - Payment component

### Integration Steps

1. **Install in Storefront:**
   ```tsx
   import PaymentButton from '@/app/ui/store/payment-button';
   
   <PaymentButton
     amount={cartTotal}
     email={customerEmail}
     onSuccess={(reference) => {
       // Handle successful payment
       console.log('Payment successful:', reference);
     }}
   />
   ```

2. **Verify Payment:**
   ```typescript
   import { verifyPayment } from '@/app/lib/paystack';
   
   const isValid = await verifyPayment(reference);
   if (isValid) {
     // Create order
   }
   ```

### Features
- Card payments (Visa, Mastercard, Verve)
- Bank transfers
- USSD payments
- Mobile money
- Automatic currency conversion
- Payment verification
- Webhook support

### Testing
1. Use test keys for development
2. Test card: 4084084084084081
3. Any CVV and future expiry date
4. Any OTP

---

## 3. Discount Codes System ✅

### Database Setup

```bash
node create-discounts-table.js
```

### Features Implemented

- **Discount Types:**
  - Percentage off (e.g., 10% off)
  - Fixed amount off (e.g., ₦1,000 off)

- **Restrictions:**
  - Minimum purchase amount
  - Maximum number of uses
  - Expiration date
  - Active/inactive status

- **Validation:**
  - Code uniqueness per vendor
  - Expiry checking
  - Usage limit checking
  - Minimum purchase validation

### API Functions

```typescript
import {
  validateDiscountCode,
  calculateDiscount,
  createDiscountCode,
  fetchVendorDiscounts,
} from '@/app/lib/discounts';

// Validate a discount code
const result = await validateDiscountCode(vendorId, 'SAVE10', orderTotal);
if (result.valid) {
  const discountAmount = calculateDiscount(orderTotal, result.discount);
}

// Create a discount code
await createDiscountCode(vendorId, {
  code: 'SAVE10',
  discount_type: 'percentage',
  discount_value: 10,
  min_purchase: 5000, // ₦50 minimum
  max_uses: 100,
  expires_at: '2024-12-31',
});
```

### UI Integration (To Do)

Create pages for:
1. `/dashboard/discounts` - List all discount codes
2. `/dashboard/discounts/create` - Create new discount
3. Add discount input in storefront checkout

### Example Discount Codes

```javascript
// 10% off, no restrictions
{ code: 'WELCOME10', discount_type: 'percentage', discount_value: 10 }

// ₦500 off orders over ₦5,000
{ code: 'SAVE500', discount_type: 'fixed', discount_value: 50000, min_purchase: 500000 }

// 20% off, limited to 50 uses
{ code: 'FLASH20', discount_type: 'percentage', discount_value: 20, max_uses: 50 }

// ₦1,000 off, expires end of month
{ code: 'MONTH1K', discount_type: 'fixed', discount_value: 100000, expires_at: '2024-01-31' }
```

---

## 4. Multi-User Access (Team Members) ✅

### Database Setup

```bash
node create-team-members-table.js
```

### Features Implemented

- **Roles:**
  - **Owner** - Full access (original store creator)
  - **Admin** - Can manage products, orders, and team
  - **Assistant** - Can view and update orders only

- **Permissions:**
  - Products management
  - Orders management
  - Settings access
  - Team management
  - Analytics viewing

- **Invitation System:**
  - Invite by email
  - Pending/Active/Inactive status
  - Track who invited whom
  - Acceptance tracking

### Database Schema

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES users(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'assistant')),
  permissions JSONB,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP,
  accepted_at TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('pending', 'active', 'inactive'))
);
```

### Implementation Steps

1. **Create Team Management Page:**
   - `/dashboard/team` - List team members
   - `/dashboard/team/invite` - Invite new member

2. **Add Permission Checks:**
   ```typescript
   // Check if user has permission
   async function hasPermission(userId: string, vendorId: string, permission: string) {
     const member = await sql`
       SELECT permissions FROM team_members
       WHERE user_id = ${userId} AND vendor_id = ${vendorId} AND status = 'active'
     `;
     return member[0]?.permissions[permission] === true;
   }
   ```

3. **Update Auth to Support Multiple Stores:**
   ```typescript
   // Get user's accessible stores
   async function getUserStores(userId: string) {
     return await sql`
       SELECT u.*, tm.role, tm.permissions
       FROM users u
       JOIN team_members tm ON u.id = tm.vendor_id
       WHERE tm.user_id = ${userId} AND tm.status = 'active'
     `;
   }
   ```

### UI Components Needed

1. **Team List:**
   - Show all team members
   - Display roles and status
   - Remove/deactivate members

2. **Invite Form:**
   - Email input
   - Role selection
   - Permission checkboxes

3. **Permission Guard:**
   - Wrap sensitive actions
   - Show/hide based on permissions

### Example Usage

```typescript
// Invite a team member
await sql`
  INSERT INTO team_members (vendor_id, user_id, role, invited_by)
  VALUES (${vendorId}, ${newUserId}, 'assistant', ${currentUserId})
`;

// Check permission before action
const canEdit = await hasPermission(userId, vendorId, 'products');
if (!canEdit) {
  return { error: 'Permission denied' };
}
```

---

## Implementation Priority

### Phase 1 (Immediate) ✅
- [x] Enhanced WhatsApp messaging (Already done)

### Phase 2 (High Priority)
- [ ] Add Paystack script to layout
- [ ] Integrate payment button in checkout
- [ ] Add payment verification webhook

### Phase 3 (Medium Priority)
- [ ] Create discount codes UI
- [ ] Add discount input in checkout
- [ ] Test discount validation

### Phase 4 (Lower Priority)
- [ ] Create team management UI
- [ ] Implement invitation system
- [ ] Add permission checks throughout app

---

## Testing Checklist

### WhatsApp Deep-Linking
- [ ] Message includes all order items
- [ ] Formatting displays correctly in WhatsApp
- [ ] Works on mobile and desktop
- [ ] Handles special characters in product names

### Payment Integration
- [ ] Test mode works with test cards
- [ ] Payment modal opens correctly
- [ ] Success callback fires
- [ ] Failed payments handled gracefully
- [ ] Webhook receives notifications

### Discount Codes
- [ ] Valid codes apply correctly
- [ ] Invalid codes show error
- [ ] Expired codes rejected
- [ ] Usage limits enforced
- [ ] Minimum purchase validated
- [ ] Percentage discounts calculate correctly
- [ ] Fixed discounts calculate correctly

### Multi-User Access
- [ ] Invitations sent successfully
- [ ] Users can accept invitations
- [ ] Permissions enforced correctly
- [ ] Owners can manage team
- [ ] Assistants have limited access
- [ ] Inactive members can't access

---

## Environment Variables Summary

Add to `.env`:
```env
# Paystack (optional)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Existing
POSTGRES_URL=your_postgres_url
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000/api/auth
```

---

## Next Steps

1. **Immediate:**
   - Add Paystack script to app
   - Test WhatsApp messages with real orders

2. **This Week:**
   - Build discount codes UI
   - Integrate payment in checkout

3. **Next Week:**
   - Build team management UI
   - Add permission system

4. **Future:**
   - Email notifications for invites
   - Advanced analytics per team member
   - Audit logs for team actions
