import { NextRequest, NextResponse } from 'next/server';
import { fetchOrderByTracking } from '@/app/lib/data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const phone = searchParams.get('phone');

  if (!id || !phone) {
    return NextResponse.json({ error: 'Missing id or phone' }, { status: 400 });
  }

  const order = await fetchOrderByTracking(id, phone);

  if (!order) {
    return NextResponse.json({ order: null });
  }

  return NextResponse.json({ order });
}
