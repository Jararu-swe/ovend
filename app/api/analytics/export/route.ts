/**
 * POST /api/analytics/export
 * 
 * Export analytics data in CSV, Excel, or PDF format
 * 
 * Business tier feature - requires active Business subscription
 * 
 * Request body:
 * - format: 'csv' | 'excel' | 'pdf'
 * - startDate: ISO date string
 * - endDate: ISO date string
 * 
 * Returns the exported file with appropriate Content-Type and Content-Disposition headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getVendorSubscription } from '@/app/lib/subscriptions';
import { sql } from '@/app/lib/db';
import {
  generateCSVExport,
  generateExcelExport,
  generatePDFExport,
  type ExportFormat,
} from '@/app/lib/business-analytics-export';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const vendorId = session.user.id;
    
    // 2. Verify Business tier subscription
    const subscription = await getVendorSubscription(vendorId);
    
    if (!subscription || subscription.tier !== 'business') {
      return NextResponse.json(
        { 
          error: 'Business tier subscription required',
          message: 'Analytics export is a Business tier feature. Upgrade to access this feature.',
          upgradeUrl: '/dashboard/billing?upgrade=business&reason=analytics-export'
        },
        { status: 403 }
      );
    }
    
    // 3. Parse and validate request body
    let body: { format?: string; startDate?: string; endDate?: string };
    
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { format, startDate, endDate } = body;
    
    // Validate format parameter
    if (!format || !['csv', 'excel', 'pdf'].includes(format)) {
      return NextResponse.json(
        { 
          error: 'Invalid format parameter',
          message: 'Format must be one of: csv, excel, pdf'
        },
        { status: 400 }
      );
    }
    
    // Validate date parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { 
          error: 'Missing date parameters',
          message: 'Both startDate and endDate are required'
        },
        { status: 400 }
      );
    }
    
    // Validate date format (ISO date strings)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { 
          error: 'Invalid date format',
          message: 'Dates must be valid ISO date strings (YYYY-MM-DD)'
        },
        { status: 400 }
      );
    }
    
    // Validate date range logic
    if (startDateObj > endDateObj) {
      return NextResponse.json(
        { 
          error: 'Invalid date range',
          message: 'Start date must be before or equal to end date'
        },
        { status: 400 }
      );
    }
    
    if (endDateObj > new Date()) {
      return NextResponse.json(
        { 
          error: 'Invalid date range',
          message: 'End date cannot be in the future'
        },
        { status: 400 }
      );
    }
    
    // 4. Get vendor store name for export filename
    const vendorData = await sql`
      SELECT store_name, store_slug
      FROM users
      WHERE id = ${vendorId}
    `;
    
    if (!vendorData.length) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }
    
    const storeName = vendorData[0].store_name || vendorData[0].store_slug || 'Store';
    
    // 5. Call appropriate export generator based on format
    const exportFormat = format as ExportFormat;
    let result;
    
    switch (exportFormat) {
      case 'csv':
        result = await generateCSVExport(
          vendorId,
          storeName,
          { startDate, endDate }
        );
        break;
        
      case 'excel':
        result = await generateExcelExport(
          vendorId,
          storeName,
          { startDate, endDate }
        );
        break;
        
      case 'pdf':
        result = await generatePDFExport(
          vendorId,
          storeName,
          { startDate, endDate }
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        );
    }
    
    // 6. Handle export generation errors
    if ('type' in result) {
      // Result is an ExportError
      const statusCode = result.type === 'validation_error' ? 400 : 500;
      
      return NextResponse.json(
        { 
          error: result.type,
          message: result.message,
          suggestion: result.suggestion
        },
        { status: statusCode }
      );
    }
    
    // 7. Stream file to client with correct Content-Type and Content-Disposition headers
    const response = new NextResponse(result.content, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
    return response;
    
  } catch (error) {
    console.error('Analytics export error:', error);
    
    return NextResponse.json(
      { 
        error: 'Export generation failed',
        message: 'An unexpected error occurred while generating the export. Please try again or contact support.',
        suggestion: 'Try selecting a smaller date range or retry in a few moments'
      },
      { status: 500 }
    );
  }
}
