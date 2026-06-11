import { NextRequest, NextResponse } from 'next/server';
import { trackStoreVisit } from '@/app/lib/data';

/**
 * API route for tracking store visits from the client-side beacon.
 * Called by the StoreVisitTracker client component on actual page loads.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId');

  if (!vendorId) {
    return NextResponse.json({ error: 'Missing vendorId' }, { status: 400 });
  }

  // Fire-and-forget tracking — don't block the response
  trackStoreVisit(vendorId).catch((err) => {
    console.error('Track visit error:', err);
  });

  return NextResponse.json({ ok: true });
}

// Also accept POST for flexibility
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const vendorId = body.vendorId || request.nextUrl.searchParams.get('vendorId');

  if (!vendorId) {
    return NextResponse.json({ error: 'Missing vendorId' }, { status: 400 });
  }

  trackStoreVisit(vendorId).catch((err) => {
    console.error('Track visit error:', err);
  });

  return NextResponse.json({ ok: true });
}
