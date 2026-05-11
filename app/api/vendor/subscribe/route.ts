import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { verifyPaymentDetails } from '@/app/lib/paystack';
import { sql } from '@/app/lib/db';
import { ensureVendorSubscriptionSchema } from '@/app/lib/data';

const MONTHLY_AMOUNT_KOBO = 3000 * 100;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user?.id || role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference } = await req.json();
    if (!reference || typeof reference !== 'string') {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    const details = await verifyPaymentDetails(reference);
    if (!details.ok) {
      return NextResponse.json({ error: details.error }, { status: 400 });
    }

    if (details.currency !== 'NGN') {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    if (details.amount !== MONTHLY_AMOUNT_KOBO) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Optional sanity check: ensure metadata vendorId matches session vendor
    const metaVendorId = details.metadata?.vendorId;
    if (metaVendorId && String(metaVendorId) !== session.user.id) {
      return NextResponse.json({ error: 'Vendor mismatch' }, { status: 400 });
    }

    await ensureVendorSubscriptionSchema();

    // Extend: if current expiry is in the future, extend from there; otherwise from now
    const [row] = await sql<{ subscription_expires_at: string | null }[]>`
      SELECT subscription_expires_at
      FROM users
      WHERE id = ${session.user.id}
      LIMIT 1
    `;

    const baseExpr =
      row?.subscription_expires_at
        ? sql`GREATEST(subscription_expires_at, CURRENT_TIMESTAMP)`
        : sql`CURRENT_TIMESTAMP`;

    const [updated] = await sql<{ subscription_expires_at: string | null }[]>`
      UPDATE users
      SET
        subscription_status = 'active',
        subscription_expires_at = (${baseExpr} + INTERVAL '30 days'),
        subscription_last_payment_reference = ${details.reference},
        subscription_updated_at = CURRENT_TIMESTAMP
      WHERE id = ${session.user.id}
      RETURNING subscription_expires_at
    `;

    await sql`
      INSERT INTO vendor_subscription_payments (vendor_id, amount_kobo, reference, status, paid_at)
      VALUES (${session.user.id}, ${details.amount}, ${details.reference}, 'paid', ${details.paid_at || null})
      ON CONFLICT (vendor_id, reference) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      subscription_expires_at: updated?.subscription_expires_at ?? null,
    });
  } catch (error) {
    console.error('Vendor subscription activation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

