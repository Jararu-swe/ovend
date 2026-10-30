import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import {
  isAdminUser,
  getComplianceSummary,
  getVendorsForReview,
  getFraudLogs,
} from '@/app/lib/kyc-admin';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdminUser(userId);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'summary';

    if (section === 'summary') {
      const summary = await getComplianceSummary();
      return NextResponse.json({ success: true, summary });
    }

    if (section === 'vendors') {
      const filter = (searchParams.get('filter') as any) || 'all';
      const search = searchParams.get('search') || '';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const result = await getVendorsForReview({ filter, search, page });
      return NextResponse.json({ success: true, ...result });
    }

    if (section === 'fraud') {
      const severity = (searchParams.get('severity') as any) || 'all';
      const resolvedParam = searchParams.get('resolved');
      const resolved = resolvedParam === 'true' ? true : resolvedParam === 'false' ? false : null;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const result = await getFraudLogs({ severity, resolved, page });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: 'Invalid section parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin compliance API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
