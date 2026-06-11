import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getVendorDomain } from '@/app/lib/domains';
import { getDomainStatusFromVercel } from '@/app/lib/vercel-domains';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vendorDomain = await getVendorDomain(session.user.id);

    if (!vendorDomain) {
      return NextResponse.json({ domain: null });
    }

    // Poll Vercel for current status (only if not yet verified)
    let vercelStatus = null;
    if (vendorDomain.status !== 'verified' && vendorDomain.status !== 'removed') {
      try {
        vercelStatus = await getDomainStatusFromVercel(vendorDomain.domain);
      } catch {
        // Vercel might not have the domain yet if it failed to add
        vercelStatus = null;
      }
    }

    return NextResponse.json({
      domain: {
        id: vendorDomain.id,
        domain: vendorDomain.domain,
        status: vendorDomain.status,
        ssl_status: vendorDomain.ssl_status,
        verified_at: vendorDomain.verified_at,
        created_at: vendorDomain.created_at,
      },
      vercelStatus: vercelStatus ? {
        verified: vercelStatus.verified,
        verificationRecords: vercelStatus.verification || [],
      } : null,
      storeUrl: `https://${vendorDomain.domain}`,
    });
  } catch (error: any) {
    console.error('Error checking domain status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check domain status.' },
      { status: 500 }
    );
  }
}
