/**
 * POST /api/test-email
 * 
 * Test endpoint to verify SMTP email configuration.
 * Send a test email to verify Brevo/SMTP setup is working.
 * 
 * Body: { email: "test@example.com" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/notifications';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    // Only allow authenticated users to test email
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { email } = body;
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    // Send test email
    const result = await sendEmail(
      email,
      '✅ Vendle Email Test - Success!',
      `Hello!\n\nThis is a test email from your Vendle application.\n\nIf you're seeing this, your SMTP configuration is working correctly!\n\n✅ SMTP Host: Connected\n✅ Authentication: Successful\n✅ Email Delivery: Working\n\nYou can now send team invitations and notifications.\n\nBest regards,\nThe Vendle Team`,
      `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
              .success-icon { font-size: 48px; margin-bottom: 10px; }
              .status-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
              .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="success-icon">✅</div>
                <h1 style="margin: 0;">Email Test Successful!</h1>
              </div>
              <div class="content">
                <p>Hello!</p>
                <p>This is a test email from your <strong>Vendle</strong> application.</p>
                <p>If you're seeing this, your SMTP configuration is working correctly!</p>
                
                <div class="status-item">✅ <strong>SMTP Host:</strong> Connected</div>
                <div class="status-item">✅ <strong>Authentication:</strong> Successful</div>
                <div class="status-item">✅ <strong>Email Delivery:</strong> Working</div>
                
                <p style="margin-top: 20px;">You can now send team invitations and notifications.</p>
                
                <div class="footer">
                  <p>Best regards,<br><strong>The Vendle Team</strong></p>
                  <p style="font-size: 12px; color: #94a3b8;">This is an automated test email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.',
        sentTo: email,
        info: result.info?.fallback ? 'Using console fallback (SMTP not configured)' : 'Sent via SMTP'
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send test email',
          details: result.info
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in test-email endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
