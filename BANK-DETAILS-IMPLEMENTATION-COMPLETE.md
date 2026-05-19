# Bank Details in Onboarding - Implementation Complete ✅

## Overview
Successfully added bank account details collection to the onboarding wizard. Vendors can now provide their payment information during initial setup, which will be used for Paystack settlements.

## Changes Made

### 1. Onboarding Wizard UI
**File**: `app/ui/dashboard/onboarding-wizard.tsx`

#### Added State Variables:
```typescript
const [bankName, setBankName] = useState(user.bank_name || '');
const [accountNumber, setAccountNumber] = useState(user.account_number || '');
const [accountName, setAccountName] = useState(user.account_name || '');
```

#### Updated Total Steps:
- Changed from 6 to 7 steps
- New flow: Store Details → Description → **Bank Details** → Hours → Theme → Products → Share

#### Added New Step 3: "Payment Details"
- Icon: BanknotesIcon (blue)
- Title: "Payment Details"
- Description: "Add your bank details so we can settle payments to you when customers buy from your store"
- Fields:
  - **Bank Name**: Text input (optional)
  - **Account Number**: Numeric input, max 10 digits (optional)
  - **Account Name**: Text input (optional)
- Info box explaining why bank details are needed
- Smart button text: Shows "Next: Store Hours" if all fields filled, "Skip for now" if empty
- Account number validation: Only accepts digits, max 10 characters

#### Updated saveProfile Function:
Now includes bank details in API call:
```typescript
bank_name: bankName.trim() || null,
account_number: accountNumber.trim() || null,
account_name: accountName.trim() || null,
```

#### Updated All Step Navigation:
- Step 1 → Step 2 (unchanged)
- Step 2 → Step 3 (new bank details step)
- Step 3 → Step 4 (store hours)
- Step 4 → Step 5 (theme)
- Step 5 → Step 6 (products)
- Step 6 → Step 7 (share link)

### 2. Onboarding API
**File**: `app/api/vendor/onboarding-profile/route.ts`

#### Updated Schema:
```typescript
const OnboardingProfileSchema = z.object({
  // ... existing fields
  bank_name: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
});
```

#### Updated SQL Query:
```sql
UPDATE users
SET
  store_name = ${store_name},
  store_slug = ${store_slug},
  store_description = ${store_description ?? null},
  whatsapp_number = ${whatsapp_number ?? null},
  category = ${category ?? null},
  location_state = ${location_state ?? null},
  bank_name = ${bank_name ?? null},
  account_number = ${account_number ?? null},
  account_name = ${account_name ?? null}
WHERE id = ${session.user.id}
```

### 3. Icon Import
Added `BanknotesIcon` from Heroicons for the bank details step.

## Features

### User Experience
1. **Optional Fields**: All bank details are optional, won't block onboarding
2. **Smart Validation**: Account number only accepts digits, max 10 characters
3. **Clear Messaging**: Info box explains why bank details are needed
4. **Skip Option**: Can skip and add later in settings
5. **Smart Button**: Button text changes based on whether fields are filled

### Data Flow
1. **Onboarding**: Collects bank details in Step 3
2. **API**: Validates and saves to database
3. **Settings**: Same fields available for later updates
4. **Paystack**: Ready for automated settlements

## Onboarding Flow (7 Steps)

1. **Store Details** - Name, slug, WhatsApp, location, category
2. **Store Description** - Optional 200-char description
3. **Bank Details** ⭐ NEW - Bank name, account number, account name
4. **Store Hours** - Timezone and weekly schedule
5. **Choose Theme** - Select storefront template
6. **Add Products** - Link to create first product
7. **Share Link** - Copy store URL and share

## Database Schema

Uses existing columns in `users` table:
- `bank_name` VARCHAR
- `account_number` VARCHAR
- `account_name` VARCHAR

No migration needed - columns already exist!

## Validation Rules

### Account Number
- Only numeric characters allowed
- Maximum 10 digits
- Enforced client-side with `replace(/\D/g, '')` and `slice(0, 10)`

### All Fields
- Optional (nullable)
- Trimmed before saving
- Empty strings converted to NULL

## Use Cases

### For Vendors
1. **During Onboarding**: Provide bank details early for quick setup
2. **Skip Option**: Can skip and add later in settings
3. **Update Anytime**: Can change bank details in settings page

### For Platform (Paystack Integration)
1. **Settlements**: Use bank details to settle vendor payments
2. **Verification**: Can verify account details with Paystack API
3. **Automation**: Automated payment distribution to vendors

## Testing Checklist

- [x] Step 3 appears in onboarding wizard
- [x] Bank name input works
- [x] Account number only accepts digits
- [x] Account number limited to 10 characters
- [x] Account name input works
- [x] Can skip the step (all fields optional)
- [x] Data saves to database via API
- [x] Settings page shows saved bank details
- [x] Can update bank details in settings later
- [x] Button text changes based on field completion
- [x] Back button navigates to Step 2
- [x] Next button navigates to Step 4
- [x] All subsequent steps updated correctly

## Benefits

✅ **Early Collection**: Get payment info during onboarding
✅ **Better UX**: Vendors don't forget to add it later
✅ **Paystack Ready**: Prepared for automated settlements
✅ **Synced Data**: Same fields as settings page
✅ **Optional**: Won't block onboarding if skipped
✅ **Validated**: Account number properly validated
✅ **Clear Purpose**: Info box explains why it's needed

## Next Steps

1. **Paystack Integration**: Use bank details for settlements
2. **Account Verification**: Integrate Paystack account verification API
3. **Validation**: Add bank name dropdown (list of Nigerian banks)
4. **Security**: Consider encrypting sensitive bank data
5. **Notifications**: Remind vendors to add bank details if skipped

## Notes

- All fields are optional to not block onboarding
- Account number validation: digits only, max 10
- Data synced between onboarding and settings
- Ready for Paystack settlement integration
- No database migration needed (columns exist)
