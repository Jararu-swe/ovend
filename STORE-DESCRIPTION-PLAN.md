# Store Description Feature - Implementation Plan

## Overview
Add store description functionality that appears in:
1. **Explore page** - Store listings with descriptions
2. **Open Graph meta tags** - Social media sharing previews
3. **Onboarding wizard** - Step to add description during setup
4. **Settings page** - Edit description after onboarding

---

## Database Changes

### 1. Add `store_description` column to `users` table

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS store_description TEXT DEFAULT NULL;
```

**Location**: Create migration file or add to existing migration
**Field specs**:
- Type: TEXT (allows longer descriptions)
- Nullable: Yes (optional field)
- Default: NULL

---

## Implementation Steps

### Phase 1: Database & Type Definitions

#### Task 1.1: Update User Type Definition
**File**: `app/lib/definitions.ts`

Add to User type:
```typescript
export type User = {
  // ... existing fields
  store_description?: string | null;
};
```

#### Task 1.2: Create Database Migration
**File**: `add-store-description.js` (root directory)

```javascript
const { sql } = require('@vercel/postgres');

async function main() {
  await sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS store_description TEXT DEFAULT NULL;
  `;
  console.log('✅ Added store_description column');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
```

---

### Phase 2: Onboarding Integration

#### Task 2.1: Add Description Step to Onboarding Wizard
**File**: `app/ui/dashboard/onboarding-wizard.tsx`

**Where**: Between Step 1 (Store Details) and Step 2 (Store Hours)
**New Step**: Step 2 - Store Description
**Shift existing steps**: Store Hours becomes Step 3, etc.

**UI Design**:
```
┌─────────────────────────────────────┐
│  📝 Tell Customers About Your Store │
│                                     │
│  Write a short description that     │
│  appears when people discover your  │
│  store or share it on social media. │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Textarea (3-4 rows)             ││
│  │ Placeholder: "We sell fresh...  ││
│  │ Max: 200 characters             ││
│  └─────────────────────────────────┘│
│                                     │
│  Character count: 0/200             │
│                                     │
│  [Back]  [Skip]  [Next: Store Hours]│
└─────────────────────────────────────┘
```

**State management**:
```typescript
const [storeDescription, setStoreDescription] = useState('');
const maxDescriptionLength = 200;
```

**Validation**:
- Optional field (can skip)
- Max 200 characters
- Trim whitespace

#### Task 2.2: Update Onboarding API Endpoint
**File**: `app/api/vendor/onboarding-profile/route.ts`

Add `store_description` to the update query:
```typescript
await sql`
  UPDATE users 
  SET 
    store_name = ${store_name},
    store_slug = ${store_slug},
    whatsapp_number = ${whatsapp_number},
    location_state = ${location_state},
    category = ${category},
    store_description = ${store_description}
  WHERE id = ${session.user.id}
`;
```

---

### Phase 3: Settings Page Integration

#### Task 3.1: Add Description Field to Settings Form
**File**: `app/ui/dashboard/settings-form.tsx`

**Location**: After store name and slug fields, before WhatsApp number

**UI Component**:
```tsx
<div>
  <label className="block text-sm font-medium text-slate-700 mb-2">
    Store Description
    <span className="text-slate-400 font-normal ml-1">(Optional)</span>
  </label>
  <textarea
    name="store_description"
    defaultValue={user.store_description || ''}
    maxLength={200}
    rows={3}
    placeholder="Tell customers about your store..."
    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
  />
  <p className="mt-1 text-xs text-slate-500">
    Appears on Explore page and when sharing your store link
  </p>
</div>
```

#### Task 3.2: Update Settings Action
**File**: `app/lib/actions.ts`

Update `updateVendorSettings` action to include `store_description`:
```typescript
export async function updateVendorSettings(prevState: any, formData: FormData) {
  // ... existing validation
  
  const store_description = formData.get('store_description') as string;
  
  await sql`
    UPDATE users 
    SET 
      store_name = ${store_name},
      store_slug = ${store_slug},
      whatsapp_number = ${whatsapp_number},
      store_description = ${store_description?.trim() || null}
    WHERE id = ${session.user.id}
  `;
}
```

---

### Phase 4: Explore Page Display

#### Task 4.1: Update Explore Page Store Cards
**File**: `app/explore/page.tsx` and related components

**Current**: Store cards show name, category, location
**Add**: Description preview (truncated to ~80 characters)

**UI Update**:
```tsx
<div className="store-card">
  <h3>{store.store_name}</h3>
  <div className="flex gap-2 text-xs">
    <span>{store.category}</span>
    <span>{store.location_state}</span>
  </div>
  
  {/* NEW: Description */}
  {store.store_description && (
    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
      {store.store_description}
    </p>
  )}
  
  <button>Visit Store</button>
</div>
```

#### Task 4.2: Update Store Fetching Query
**File**: `app/lib/data.ts`

Update `fetchAllPublicStores` to include `store_description`:
```typescript
export async function fetchAllPublicStores() {
  const stores = await sql<User[]>`
    SELECT 
      id, 
      store_name, 
      store_slug, 
      category, 
      location_state,
      store_description
    FROM users 
    WHERE role = 'vendor' 
    AND store_slug IS NOT NULL
    ORDER BY created_at DESC
  `;
  return stores;
}
```

---

### Phase 5: Open Graph Integration

#### Task 5.1: Update Store Page Metadata
**File**: `app/s/[slug]/page.tsx`

**Already implemented** ✅ (from previous task)
- Uses `vendor.store_description` in Open Graph tags
- Fallback: `Shop at ${vendor.store_name}`

#### Task 5.2: Update Product Page Metadata
**File**: `app/s/[slug]/p/[productId]/page.tsx`

**Already implemented** ✅ (from previous task)
- Uses product description
- Includes store description in `og:see_also`

---

## File Structure Summary

```
Changes Required:
├── Database
│   └── add-store-description.js (NEW migration)
│
├── Type Definitions
│   └── app/lib/definitions.ts (UPDATE User type)
│
├── Onboarding
│   ├── app/ui/dashboard/onboarding-wizard.tsx (ADD step 2)
│   └── app/api/vendor/onboarding-profile/route.ts (UPDATE)
│
├── Settings
│   ├── app/ui/dashboard/settings-form.tsx (ADD field)
│   └── app/lib/actions.ts (UPDATE updateVendorSettings)
│
├── Explore
│   ├── app/explore/page.tsx (UPDATE display)
│   └── app/lib/data.ts (UPDATE query)
│
└── Open Graph
    ├── app/s/[slug]/page.tsx (✅ Already done)
    └── app/s/[slug]/p/[productId]/page.tsx (✅ Already done)
```

---

## User Flow

### New Vendor Onboarding:
1. **Step 1**: Enter store name, slug, WhatsApp, location, category
2. **Step 2 (NEW)**: Write store description (optional, can skip)
3. **Step 3**: Set store hours
4. **Step 4**: Choose theme
5. **Step 5**: Add products
6. **Step 6**: Share store link

### Existing Vendor:
1. Go to **Settings** page
2. Find "Store Description" field
3. Add/edit description
4. Save changes
5. Description appears on:
   - Explore page listings
   - Social media share previews
   - Store Open Graph tags

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Length | Max 200 characters | "Description must be 200 characters or less" |
| Required | No (optional) | N/A |
| Format | Plain text only | N/A |
| Whitespace | Trim on save | N/A |

---

## UI/UX Considerations

### Character Counter
- Show live character count: "45/200"
- Turn red when approaching limit (>180 chars)
- Prevent typing beyond 200 chars

### Placeholder Text Examples
- "We sell fresh organic produce delivered daily"
- "Handmade jewelry and accessories for every occasion"
- "Your one-stop shop for quality electronics"
- "Authentic Nigerian fashion and traditional wear"

### Help Text
- "This description appears when people discover your store on Explore or share your link on social media"
- "Keep it short and highlight what makes your store special"

---

## Testing Checklist

### Onboarding
- [ ] New vendor can add description during onboarding
- [ ] Can skip description step
- [ ] Character limit enforced (200 chars)
- [ ] Description saves correctly to database
- [ ] Can proceed without description

### Settings
- [ ] Existing vendors can add description
- [ ] Can edit existing description
- [ ] Can clear description (set to null)
- [ ] Character limit enforced
- [ ] Changes save and persist

### Explore Page
- [ ] Stores with descriptions show them
- [ ] Stores without descriptions don't show empty space
- [ ] Description truncates properly (line-clamp-2)
- [ ] Layout looks good with/without descriptions

### Open Graph
- [ ] Store page meta tags include description
- [ ] Product page meta tags include store description
- [ ] Fallback text works when no description
- [ ] Social media previews look good (test on WhatsApp, Facebook, Twitter)

---

## Priority & Timeline

### High Priority (Do First)
1. ✅ Database migration
2. ✅ Type definitions update
3. Settings page integration (most important for existing users)
4. Explore page display

### Medium Priority
5. Onboarding wizard integration
6. Testing and validation

### Already Complete ✅
- Open Graph meta tags (already using store_description)
- Product page Open Graph

---

## Notes

- **Backward Compatibility**: Field is nullable, so existing stores work fine without it
- **SEO Benefit**: Descriptions improve search engine visibility
- **Social Sharing**: Better previews = more clicks = more customers
- **User Control**: Optional field gives vendors flexibility
- **Character Limit**: 200 chars is optimal for social media previews (Twitter: 280, Facebook: ~300)

---

## Example Descriptions

**Good Examples** (concise, informative):
- "Fresh farm produce delivered to your door. Organic vegetables, fruits, and eggs from local farmers."
- "Handcrafted leather bags and accessories. Each piece is unique and made with premium materials."
- "Your neighborhood electronics store. Phones, laptops, and gadgets at competitive prices."

**Bad Examples** (too vague or too long):
- "We sell things" ❌ (too vague)
- "Welcome to our store where we have been selling quality products for many years and we pride ourselves on excellent customer service and fast delivery..." ❌ (too long, rambling)

---

## Implementation Order

1. **Run database migration** (add column)
2. **Update type definitions** (TypeScript)
3. **Add to Settings page** (immediate value for existing users)
4. **Update Explore page** (show descriptions)
5. **Add to Onboarding** (for new users)
6. **Test Open Graph** (verify social sharing works)

---

## Success Metrics

- **Adoption Rate**: % of vendors who add descriptions
- **Explore CTR**: Click-through rate on stores with vs without descriptions
- **Social Shares**: Track shares of store links
- **Onboarding Completion**: Ensure new step doesn't reduce completion rate
