import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getVendorDomain, removeVendorDomain } from '@/app/lib/domains';
import { removeDomainFromVercel } from '@/app/lib/vercel-domains';

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vendorDomain = await getVendorDomain(session.user.id);
    if (!vendorDomain) {
      return NextResponse.json({ error: 'No domain found to disconnect.' }, { status: 404 });
    }

    // Remove from Vercel (best-effort - don't block on Vercel API failure)
    try {
      await removeDomainFromVercel(vendorDomain.domain);
    } catch (vercelError: any) {
      console.warn('Failed to remove domain from Vercel:', vercelError.message);
      // Continue with local cleanup even if Vercel API fails
    }

    // Remove from local database
    await removeVendorDomain(session.user.id, vendorDomain.id);

    return NextResponse.json({
      success: true,
      message: 'Domain disconnected successfully.',
    });
  } catch (error: any) {
    console.error('Error disconnecting domain:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect domain.' },
      { status: 500 }
    );
  }
}
