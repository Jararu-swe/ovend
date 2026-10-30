import { auth } from '@/auth';
import { verifyProTierIdentity } from '@/app/lib/kyc';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idType, idNumber, dob } = await request.json();

    if (!idType || !idNumber) {
      return NextResponse.json(
        { error: 'ID type (BVN or NIN) and ID number are required' },
        { status: 400 },
      );
    }

    if (idType !== 'bvn' && idType !== 'nin') {
      return NextResponse.json(
        { error: 'Invalid ID type. Please provide BVN or NIN' },
        { status: 400 },
      );
    }

    const result = await verifyProTierIdentity(
      vendorId,
      idType,
      String(idNumber).trim(),
      dob ? String(dob).trim() : undefined,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Pro Tier KYC verification successful! Your payout limit has been upgraded to ₦500,000 per request.`,
    });
  } catch (error: any) {
    console.error('Error in /api/kyc/verify-identity:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process identity verification' },
      { status: 500 },
    );
  }
}
