# Pickup Location Schema Migration

## Overview

This migration adds support for vendor pickup locations to the Ovend platform. Vendors can now store their physical pickup location, and this location is preserved with each pickup order for historical reference.

## Migration Files

### 1. `add-pickup-location-schema.js`
Main migration script that adds all required columns and indexes.

**Run with:**
```bash
node scripts/migrations/add-pickup-location-schema.js
```

**What it does:**
- Adds pickup location columns to `users` table (vendor's pickup location)
- Adds vendor pickup location columns to `orders` table (historical snapshot)
- Creates performance indexes for queries
- Verifies all changes were applied successfully

### 2. `verify-pickup-schema.js`
Verification script to check if the schema is properly installed.

**Run with:**
```bash
node scripts/verify-pickup-schema.js
```

**What it checks:**
- Presence of all pickup location columns
- Correct data types
- Existence of performance indexes

### 3. `test-pickup-schema.js`
Test script that runs queries against the schema to verify functionality.

**Run with:**
```bash
node scripts/test-pickup-schema.js
```

**What it tests:**
- Query execution on users table with pickup columns
- Query execution on orders table with vendor pickup columns
- Coordinate data type validation
- Index verification
- Column property verification

## Schema Changes

### Users Table
Added columns for vendor's pickup location:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `pickup_latitude` | DECIMAL(10,8) | YES | NULL | Latitude coordinate (-90 to 90) |
| `pickup_longitude` | DECIMAL(11,8) | YES | NULL | Longitude coordinate (-180 to 180) |
| `pickup_address_details` | TEXT | YES | NULL | Human-readable address (max 500 chars) |
| `offers_pickup` | BOOLEAN | YES | FALSE | Whether vendor offers pickup option |

**Index:**
- `idx_users_offers_pickup` - Partial index on `offers_pickup` WHERE `offers_pickup = TRUE`

### Orders Table
Added columns for vendor pickup location snapshot:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `vendor_pickup_latitude` | DECIMAL(10,8) | YES | Vendor's latitude at time of order |
| `vendor_pickup_longitude` | DECIMAL(11,8) | YES | Vendor's longitude at time of order |
| `vendor_pickup_address_details` | TEXT | YES | Vendor's address details at time of order |

**Index:**
- `idx_orders_delivery_type_pickup` - Partial index on `delivery_type` WHERE `delivery_type = 'pickup'`

## Requirements Fulfilled

This migration fulfills the following requirements from the spec:

- **9.1**: pickup_latitude column in users table (DECIMAL(10,8))
- **9.2**: pickup_longitude column in users table (DECIMAL(11,8))
- **9.3**: pickup_address_details column in users table (TEXT)
- **9.4**: offers_pickup column in users table (BOOLEAN, default FALSE)
- **9.5**: vendor_pickup_latitude column in orders table (DECIMAL(10,8))
- **9.6**: vendor_pickup_longitude column in orders table (DECIMAL(11,8))
- **9.7**: vendor_pickup_address_details column in orders table (TEXT)
- **9.8**: Index on users(offers_pickup) for vendors where offers_pickup is TRUE
- **9.9**: Index on orders(delivery_type) for orders where delivery_type is 'pickup'

## Migration Results

✅ **Successfully Completed** on [Date of migration]

### Verification Results:
- ✅ 4 columns added to `users` table
- ✅ 3 columns added to `orders` table
- ✅ 2 performance indexes created
- ✅ All test queries executed successfully
- ✅ Coordinate data types accept valid geographic values
- ✅ Column properties match design requirements

### Test Query Results:
- Users table queries with pickup location columns: **PASSED**
- Orders table queries with vendor pickup location columns: **PASSED**
- Coordinate validation (Lagos, Nigeria: 6.5244, 3.3792): **PASSED**
- Index verification: **2/2 indexes found**
- Column property verification: **7/7 columns verified**

## Usage Examples

### Query vendors with pickup enabled:
```sql
SELECT id, email, pickup_latitude, pickup_longitude, pickup_address_details
FROM users
WHERE offers_pickup = TRUE;
```

### Query pickup orders with vendor location:
```sql
SELECT 
  id, 
  vendor_pickup_latitude, 
  vendor_pickup_longitude, 
  vendor_pickup_address_details,
  delivery_type
FROM orders
WHERE delivery_type = 'pickup';
```

### Update vendor's pickup location:
```sql
UPDATE users
SET 
  pickup_latitude = 6.5244,
  pickup_longitude = 3.3792,
  pickup_address_details = '123 Market Street, Ikeja, Lagos',
  offers_pickup = TRUE
WHERE id = 'vendor-uuid';
```

### Insert order with vendor pickup location:
```sql
INSERT INTO orders (
  vendor_pickup_latitude,
  vendor_pickup_longitude,
  vendor_pickup_address_details,
  delivery_type,
  ...
) VALUES (
  6.5244,
  3.3792,
  '123 Market Street, Ikeja, Lagos',
  'pickup',
  ...
);
```

## Rollback

If you need to rollback this migration:

```sql
-- Remove columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS pickup_latitude;
ALTER TABLE users DROP COLUMN IF EXISTS pickup_longitude;
ALTER TABLE users DROP COLUMN IF EXISTS pickup_address_details;
ALTER TABLE users DROP COLUMN IF EXISTS offers_pickup;

-- Remove columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS vendor_pickup_latitude;
ALTER TABLE orders DROP COLUMN IF EXISTS vendor_pickup_longitude;
ALTER TABLE orders DROP COLUMN IF EXISTS vendor_pickup_address_details;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_offers_pickup;
DROP INDEX IF EXISTS idx_orders_delivery_type_pickup;
```

## Next Steps

With the database schema in place, the next tasks are:

1. **Task 2**: Implement core data layer functions
   - `validatePickupLocation()` - Coordinate and address validation
   - `saveVendorPickupLocation()` - Store vendor pickup location
   - `fetchVendorPickupLocation()` - Retrieve vendor pickup location
   - `clearVendorPickupLocation()` - Clear pickup location

2. **Task 4**: Update server actions
   - Modify `updateProfile()` to handle pickup location fields
   - Modify `createOrder()` to store vendor pickup location with orders

3. **Task 6**: Implement onboarding pickup location step
4. **Task 7**: Update settings page with pickup location management
5. **Task 9**: Update storefront checkout for pickup location display
6. **Task 10**: Update order history for pickup location display

## Notes

- The migration is **idempotent** - it can be run multiple times safely using `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` clauses
- Indexes are **partial indexes** for better performance, only indexing rows where the condition is TRUE
- All columns are **nullable** to maintain backward compatibility with existing data
- Coordinate precision (DECIMAL(10,8) for latitude, DECIMAL(11,8) for longitude) provides accuracy to ~1.1mm, more than sufficient for address-level precision
