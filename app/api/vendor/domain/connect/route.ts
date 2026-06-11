import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { addVendorDomain } from '@/app/lib/domains';
import { addDomainToVercel, generateDNSInstructions } from '@/app/lib/vercel-domains';
import { hasFeatureAccess } from '@/app/lib/subscriptions';
import { validateDomain } from '@/app/lib/domain-validation';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check Business tier feature access
  const hasAccess = await hasFeatureAccess(session.user.id, 'custom_domain');
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Custom domain configuration requires Business tier.' },
      { status: 403 }
    );
  }

  try {
    const { domain } = await request.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required.' }, { status: 400 });
    }

    // Validate domain (format, blocked domains, reserved TLDs, etc.)
    const validation = validateDomain(domain);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const normalizedDomain = validation.normalizedDomain!;

    // Add domain to Vercel project
    let vercelResult;
    try {
      vercelResult = await addDomainToVercel(normalizedDomain);
    } catch (vercelError: any) {
      return NextResponse.json(
        { error: `Failed to configure domain: ${vercelError.message}` },
        { status: 502 }
      );
    }

    // Save domain to database
    const vendorDomain = await addVendorDomain(
      session.user.id,
      normalizedDomain,
      'cname'
    );

    // Generate DNS instructions
    const dnsInstructions = generateDNSInstructions(
      normalizedDomain,
      vercelResult.verification || []
    );

    return NextResponse.json({
      success: true,
      domain: {
        id: vendorDomain.id,
        domain: normalizedDomain,
        status: vendorDomain.status,
      },
      dnsInstructions,
      vercelStatus: {
        verified: vercelResult.verified,
        verificationRecords: vercelResult.verification || [],
      },
    });
  } catch (error: any) {
    console.error('Error connecting domain:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect domain.' },
      { status: 500 }
    );
  }
}
