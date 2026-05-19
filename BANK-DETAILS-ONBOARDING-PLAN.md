# Bank Details in Onboarding - Implementation Plan

## Overview
Add bank account details collection to the onboarding wizard. This data is already in the database and settings page, we just need to add it to onboarding for early collection.

## Current State
- ✅ Database columns exist: `bank_name`, `account_number`, `account_name`
- ✅ Settings page has bank details form
- ✅ `updateProfile` action handles bank details
- ❌ Onboarding wizard doesn't collect bank details

## Goal
Add bank details collection to onboarding wizard so vendors can provide payment information during initial setup. This will be used for Paystack settlements.

## Implementation Steps

### 1. Update Onboarding Wizard State
**File**: `app/ui/dashboard/onboarding-wizard.tsx`

Add state variables for bank details:
```typescript
const [bankName, setBankName] = useState(user.bank_name || '');
const [accountNumber, setAccountNumber] = useState(user.account_number || '');
const [accountName, setAccountName] = useState(user.account_name || '');
```

### 2. Add New Step for Bank Details
Insert a new step after Store Description (current Step 2), before Store Hours.

**New Step 3: Bank Account Details**
- Title: "Payment Details"
- Icon: Bank/Money icon
- Description: "Add your bank details so we can settle payments to you"
- Fields:
  - Bank Name (text input)
  - Account Number (text input, numeric)
  - Account Name (text input)
- All fields optional but recommended
- Can skip this step

### 3. Update Total Steps
Change from 6 steps to 7 steps:
1. Store Details
2. Store Description
3. **Bank Details** (NEW)
4. Store Hours
5. Choose Theme
6. Add Products
7. Share Link

### 4. Update saveProfile Function
**File**: `app/ui/dashboard/onboarding-wizard.tsx`

Include bank details in the API call:
```typescript
body: JSON.stringify({
  store_name: storeName.trim(),
  store_slug: storeSlug.trim(),
  store_description: storeDescription.trim() || null,
  whatsapp_number: whatsApp.trim() || null,
  location_state: locationState || null,
  category: category || null,
  bank_name: bankName.trim() || null,
  account_number: accountNumber.trim() || null,
  account_name: accountName.trim() || null,
}),
```

### 5. Update Onboarding API
**File**: `app/api/vendor/onboarding-profile/route.ts`

Update schema to accept bank details:
```typescript
const OnboardingProfileSchema = z.object({
  store_name: z.string().min(2, 'Store name must be at least 2 characters'),
  store_slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  store_description: z.string().max(200, 'Description must be 200 characters or less').optional().nullable(),
  whatsapp_number: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  location_state: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
});
```

Update SQL query:
```typescript
await sql`
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
`;
```

## UI Design for Bank Details Step

```tsx
{/* Step 3: Bank Account Details */}
{step === 3 && (
  <div className="space-y-6">
    <div className="text-center">
      <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-4 mb-4">
        <BanknotesIcon className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Payment Details</h2>
      <p className="mt-2 text-sm text-slate-500">
        Add your bank details so we can settle payments to you when customers buy from your store.
      </p>
    </div>

    <div className="space-y-4 rounded-xl bg-slate-50 p-5">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">
          Bank Name <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="e.g. GTBank, Access Bank, First Bank"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">
          Account Number <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="0123456789"
          type="tel"
          maxLength={10}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">
          Account Name <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Name as it appears on your account"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
        />
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
        <p className="text-xs text-blue-700">
          💡 <strong>Why we need this:</strong> When customers pay via card or transfer, we'll settle the funds directly to this account.
        </p>
      </div>

      {saveError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {saveError}
        </div>
      )}
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => setStep(2)}
        className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
      >
        Back
      </button>
      <button
        onClick={async () => {
          const ok = await saveProfile();
          if (ok) setStep(4);
        }}
        disabled={isSaving}
        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
      >
        {isSaving ? 'Saving…' : (bankName && accountNumber && accountName) ? 'Next: Store Hours' : 'Skip for now'}
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  </div>
)}
```

## Benefits

1. **Early Collection**: Get payment details during onboarding
2. **Better UX**: Vendors don't have to remember to add it later
3. **Paystack Integration**: Ready for automated settlements
4. **Synced Data**: Same fields as settings page
5. **Optional**: Can skip and add later in settings

## Validation

- All fields optional (can skip)
- Account number: numeric only, max 10 digits
- No special validation needed (Paystack will validate on settlement)

## Testing Checklist

- [ ] New step appears in onboarding
- [ ] Can enter bank details
- [ ] Account number accepts only digits
- [ ] Can skip the step
- [ ] Data saves to database
- [ ] Settings page shows saved bank details
- [ ] Can update bank details in settings later

## Notes

- Fields are optional to not block onboarding
- Same validation as settings page
- Data synced between onboarding and settings
- Used for Paystack settlements when customers pay
