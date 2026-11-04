import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import {
  isAdminUser,
  adminSetVendorKYCTier,
  adminSuspendVendor,
  adminResolveFraudAlert,
  adminApproveCACVerification,
  adminRejectCACVerification,
  getVendorVerifications,
} from '@/app/lib/kyc-admin';
import { getVendorKYCProfile } from '@/app/lib/kyc';

export async function POST(request: Request) {
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

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'set_tier': {
        const { vendorId, tier, reason } = body;
        if (!vendorId || !tier || !reason) {
          return NextResponse.json(
            { error: 'vendorId, tier, and reason are required' },
            { status: 400 },
          );
        }
        if (!['starter', 'pro', 'business'].includes(tier)) {
          return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }
        const result = await adminSetVendorKYCTier(userId, vendorId, tier, reason);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: `Vendor tier updated to ${tier}` });
      }

      case 'suspend': {
        const { vendorId, reason } = body;
        if (!vendorId || !reason) {
          return NextResponse.json(
            { error: 'vendorId and reason are required' },
            { status: 400 },
          );
        }
        const result = await adminSuspendVendor(userId, vendorId, reason);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Vendor suspended' });
      }

      case 'resolve_alert': {
        const { alertId, notes } = body;
        if (!alertId) {
          return NextResponse.json({ error: 'alertId is required' }, { status: 400 });
        }
        const result = await adminResolveFraudAlert(userId, alertId, notes);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Alert resolved' });
      }

      case 'approve_cac': {
        const { verificationId, notes } = body;
        if (!verificationId) {
          return NextResponse.json({ error: 'verificationId is required' }, { status: 400 });
        }
        const result = await adminApproveCACVerification(userId, verificationId, notes);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: 'CAC verification approved! Vendor upgraded to Business Tier.',
        });
      }

      case 'reject_cac': {
        const { verificationId, reason } = body;
        if (!verificationId || !reason) {
          return NextResponse.json(
            { error: 'verificationId and rejection reason are required' },
            { status: 400 },
          );
        }
        const result = await adminRejectCACVerification(userId, verificationId, reason);
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'CAC submission rejected' });
      }

      case 'get_vendor_detail': {
        const { vendorId } = body;
        if (!vendorId) {
          return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
        }
        const [profile, verifications] = await Promise.all([
          getVendorKYCProfile(vendorId),
          getVendorVerifications(vendorId),
        ]);
        return NextResponse.json({ success: true, profile, verifications });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Admin action error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
