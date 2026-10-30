import { auth } from '@/auth';
import { verifyAndSaveBankAccount } from '@/app/lib/kyc';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountNumber, bankCode, bankName } = await request.json();

    if (!accountNumber || !bankCode || !bankName) {
      return NextResponse.json(
        { error: 'Account number, bank code, and bank name are required' },
        { status: 400 },
      );
    }

    // Clean account number (10 digits)
    const cleanAccount = String(accountNumber).trim();
    if (!/^\d{10}$/.test(cleanAccount)) {
      return NextResponse.json(
        { error: 'Nigerian NUBAN account number must be exactly 10 digits' },
        { status: 400 },
      );
    }

    const result = await verifyAndSaveBankAccount(
      vendorId,
      cleanAccount,
      String(bankCode).trim(),
      String(bankName).trim(),
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          accountName: result.accountName,
          matchScore: result.matchScore,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bank account verified and saved successfully',
      accountName: result.accountName,
      matchScore: result.matchScore,
    });
  } catch (error: any) {
    console.error('Error in /api/kyc/verify-bank:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify bank account' },
      { status: 500 },
    );
  }
}
