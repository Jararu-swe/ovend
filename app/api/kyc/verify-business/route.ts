import { auth } from '@/auth';
import { verifyBusinessTierRegistration } from '@/app/lib/kyc';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cacNumber, companyName } = await request.json();

    if (!cacNumber || !companyName) {
      return NextResponse.json(
        { error: 'CAC Registration Number (RC/BN) and Registered Business Name are required' },
        { status: 400 },
      );
    }

    const result = await verifyBusinessTierRegistration(
      vendorId,
      String(cacNumber).trim(),
      String(companyName).trim(),
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Business Tier KYB verification successful! Your store is now verified for high-volume enterprise payouts.`,
    });
  } catch (error: any) {
    console.error('Error in /api/kyc/verify-business:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process business verification' },
      { status: 500 },
    );
  }
}
