import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getVendorDomain, updateDomainStatus, linkDomainToVendor } from '@/app/lib/domains';
import { verifyDomainOnVercel, getDomainStatusFromVercel } from '@/app/lib/vercel-domains';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vendorDomain = await getVendorDomain(session.user.id);
    if (!vendorDomain) {
      return NextResponse.json({ error: 'No domain found to verify.' }, { status: 404 });
    }

    if (vendorDomain.status === 'verified') {
      return NextResponse.json({
        success: true,
        message: 'Domain is already verified.',
        domain: {
          id: vendorDomain.id,
          domain: vendorDomain.domain,
          status: vendorDomain.status,
          ssl_status: vendorDomain.ssl_status,
        },
      });
    }

    // Trigger verification on Vercel side
    const vercelResult = await verifyDomainOnVercel(vendorDomain.domain);

    // Check actual verification status
    const domainStatus = await getDomainStatusFromVercel(vendorDomain.domain);

    if (domainStatus.verified) {
      // Domain is verified! Update status and link to vendor
      await updateDomainStatus(vendorDomain.id, 'verified', vendorDomain.vercel_domain_id || undefined);
      await linkDomainToVendor(session.user.id, vendorDomain.domain);

      return NextResponse.json({
        success: true,
        message: 'Domain verified successfully! Your store is now live on your custom domain.',
        domain: {
          id: vendorDomain.id,
          domain: vendorDomain.domain,
          status: 'verified',
          ssl_status: 'provisioning', // Vercel will auto-provision SSL
        },
      });
    } else {
      // Still not verified - return the pending verification records
      await updateDomainStatus(vendorDomain.id, 'verifying');

      return NextResponse.json({
        success: false,
        message: 'Domain not yet verified. Please ensure DNS records are correctly configured.',
        verificationRecords: domainStatus.verification || vendorDomain.verification_token,
        status: 'verifying',
      });
    }
  } catch (error: any) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify domain.' },
      { status: 500 }
    );
  }
}
