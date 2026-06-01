# Paystack Payout Integration Guide

## Overview

Paystack provides a **Transfer API** that allows you to process payouts directly to bank accounts. This guide explains how to integrate it with your existing payout system.

---

## Step 1: Setup Prerequisites

### Get a Live Paystack Account

1. Sign up at https://paystack.co
2. Go to **Settings → API Keys & Webhooks**
3. Switch to **LIVE** mode (test mode doesn't support transfers)
4. Copy your **Secret Key** (starts with `sk_live_`)

### Verify Your Bank Account in Paystack

1. Go to **Settings → Banks**
2. Add your receiving bank account
3. This is where payouts will be sent before distribution to vendors

### Add Secret Key to Environment

```bash
# .env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
```

---

## Step 2: Database Migration

Run the migration to add Paystack fields:

```bash
node scripts/migrations/add-paystack-fields-payouts.js
```

This adds:

- `paystack_recipient_code` - Recipient ID from Paystack
- `paystack_transfer_code` - Transfer reference from Paystack

---

## Step 3: Workflow - How It Works

### A. Vendor Requests Payout (Existing)

```
Vendor clicks "Request Payout"
→ Amount validated
→ Payout record created with status='pending'
```

### B. Validate Bank Account (New)

```
Client calls: POST /api/payouts/validate-bank
{
  account_number: "0123456789",
  bank_code: "033"  // Get from Paystack banks list
}

Response:
{
  account_name: "John Doe",
  account_number: "0123456789"
}
```

### C. Create Recipient in Paystack (New - Do This Once)

You can create recipients via Paystack API and store the recipient code:

```typescript
// Example: Create recipient endpoint
async function createPaystackRecipient(
  accountNumber: string,
  bankCode: string,
  accountName: string,
) {
  const response = await fetch("https://api.paystack.co/transferrecipient", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "nuban",
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
    }),
  });

  const data = await response.json();
  return data.data.recipient_code; // Store this in database
}
```

### D. Process Payout (Admin)

```
Admin/Scheduled process calls: POST /api/payouts/process-paystack
{
  payoutId: 123
}

Action:
→ Fetch payout record
→ Call Paystack Transfer API
→ Update status to 'processing'
→ Store transfer_code
```

### E. Webhook Updates Status (Automatic)

```
Paystack → POST /api/payouts/webhook

Events handled:
- transfer.success → status = 'completed'
- transfer.failed → status = 'failed' + reason
- transfer.reversed → status = 'failed' + reason
```

---

## Step 4: Get Bank Codes

First, fetch the list of Nigerian banks to get bank codes:

```typescript
// Helper function to get bank codes
export async function getNigerianBanks() {
  const response = await fetch(
    "https://api.paystack.co/bank?country=NG&currency=NGN",
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const data = await response.json();
  return data.data; // Array of banks with codes
}

// Example response:
// [
//   { id: 1, name: "Guaranty Trust Bank", code: "058" },
//   { id: 3, name: "First Bank", code: "011" },
//   { id: 15, name: "United Bank for Africa", code: "033" },
//   ...
// ]
```

---

## Step 5: Update Bank Details in Settings

Add a bank selection component in vendor settings:

```typescript
'use client';

import { useState, useEffect } from 'react';

export function BankDetailsForm() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    // Fetch banks
    fetch('/api/banks')
      .then(res => res.json())
      .then(data => setBanks(data))
      .catch(err => console.error(err));
  }, []);

  const handleValidateAccount = async () => {
    const bankCode = banks.find(b => b.id == selectedBank)?.code;

    const response = await fetch('/api/payouts/validate-bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_number: accountNumber,
        bank_code: bankCode,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setAccountName(data.account_name);
      // Save to database
    }
  };

  return (
    <div className="space-y-4">
      <select
        value={selectedBank}
        onChange={(e) => setSelectedBank(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Select Bank</option>
        {banks.map(bank => (
          <option key={bank.id} value={bank.id}>
            {bank.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        placeholder="Account Number"
        className="w-full border rounded px-3 py-2"
      />

      <button
        onClick={handleValidateAccount}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Validate Account
      </button>

      {accountName && (
        <p className="text-green-600">✅ {accountName}</p>
      )}
    </div>
  );
}
```

---

## Step 6: Create Admin Payout Processing Page

```typescript
// app/admin/payouts/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function AdminPayoutsPage() {
  const [pendingPayouts, setPendingPayouts] = useState([]);

  useEffect(() => {
    fetchPendingPayouts();
  }, []);

  const fetchPendingPayouts = async () => {
    const response = await fetch('/api/admin/payouts?status=pending');
    const data = await response.json();
    setPendingPayouts(data);
  };

  const handleProcessPayout = async (payoutId: number) => {
    const response = await fetch('/api/payouts/process-paystack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payoutId }),
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ Transfer initiated: ' + data.transfer_code);
      fetchPendingPayouts();
    } else {
      alert('❌ Error: ' + data.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Process Payouts</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3">Vendor</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Bank</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingPayouts.map(payout => (
            <tr key={payout.id} className="border-t">
              <td className="p-3">{payout.vendor_id}</td>
              <td className="p-3">₦{(payout.net_amount / 100).toLocaleString()}</td>
              <td className="p-3">{payout.bank_name}</td>
              <td className="p-3">
                <button
                  onClick={() => handleProcessPayout(payout.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Process
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Step 7: Setup Paystack Webhooks

1. Go to **Paystack Dashboard → Settings → API Keys & Webhooks**
2. Add webhook URL:
   ```
   https://yourdomain.com/api/payouts/webhook
   ```
3. Select events:
   - ✅ transfer.success
   - ✅ transfer.failed
   - ✅ transfer.reversed
4. Save

---

## Step 8: Testing

### Test Bank Details

Use these test credentials:

```
Bank: GTBank (058)
Account: 0123456789
Name: TEST ACCOUNT
```

### Test Payouts

1. Create a test payout request
2. Validate bank account
3. Call `/api/payouts/process-paystack`
4. Check Paystack dashboard for transfer status

### Check Status Locally

```bash
curl -X GET \
  http://localhost:3001/api/payouts/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Key Paystack API Endpoints

| Method | Endpoint             | Purpose                 |
| ------ | -------------------- | ----------------------- |
| GET    | `/bank`              | Get list of banks       |
| GET    | `/bank/resolve`      | Validate account number |
| POST   | `/transferrecipient` | Create recipient        |
| POST   | `/transfer`          | Initiate transfer       |
| GET    | `/transfer`          | Get transfer status     |

---

## Production Checklist

- [ ] Switch to live Paystack keys
- [ ] Verify bank account in Paystack
- [ ] Test full payout flow
- [ ] Deploy webhook endpoint
- [ ] Add webhook to Paystack dashboard
- [ ] Test webhook signature verification
- [ ] Add logging for all transfers
- [ ] Setup email notifications for transfer status
- [ ] Add admin dashboard for payout management
- [ ] Document procedure for manual refunds

---

## Costs

**Paystack Transfer Fees:**

- NGN transfers: ₦10.50 per transfer
- International transfers: Varies by destination

These fees are in ADDITION to the 2% fee you're already charging vendors.

---

## Support

- Paystack Docs: https://paystack.com/docs/transfers/
- Test API Keys: https://paystack.com/docs/test-cards/
- API Reference: https://paystack.com/docs/api/
