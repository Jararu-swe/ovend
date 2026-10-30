import { auth } from '@/auth';
import { getVendorKYCProfile } from '@/app/lib/kyc';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getVendorKYCProfile(vendorId);

    if (!profile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Error fetching KYC status:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch KYC profile' },
      { status: 500 },
    );
  }
}
