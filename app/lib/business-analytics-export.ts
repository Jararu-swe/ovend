/**
 * Business Analytics Export Utilities
 * 
 * Export functionality for Business-tier analytics (CSV, Excel, PDF)
 */

import {
  DateRange,
  validateDateRange,
  fetchAnalyticsSummary,
  fetchProductPerformance,
  fetchCustomerMetrics,
  calculateDaysDifference,
} from './business-analytics';
import { sql } from './db';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Daily analytics data for exports
 */
export type DailyAnalyticsData = {
  date: string;
  visits: number;
  orders: number;
  revenue: number;
  conversionRate: number;
};

/**
 * Export result containing file data and metadata
 */
export type ExportResult = {
  filename: string;
  content: string | Buffer;
  mimeType: string;
};

/**
 * Export error type
 */
export type ExportError = {
  type: 'validation_error' | 'generation_error' | 'insufficient_data';
  message: string;
  suggestion?: string;
};

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Generate CSV export of analytics data for a date range
 * 
 * This function:
 * 1. Validates the date range (max 365 days for exports)
 * 2. Fetches analytics summary, product performance, and customer metrics
 * 3. Queries daily analytics data from store_analytics table
 * 4. Formats data as CSV with specified columns
 * 5. Generates filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.csv
 * 
 * CSV Columns:
 * - date: ISO date string (YYYY-MM-DD)
 * - visits: Number of store visits
 * - orders: Number of orders
 * - revenue: Revenue in kobo (₦100 = 10000 kobo)
 * - conversion_rate: Percentage (orders/visits × 100)
 * - top_products: Top 5 products by revenue (semicolon-separated)
 * - customer_metrics: Summary of customer metrics (formatted string)
 * 
 * @param vendorId - The vendor's unique identifier
 * @param storeName - The vendor's store name for filename
 * @param range - Date range for export (max 365 days)
 * @returns Promise resolving to ExportResult with CSV data or ExportError
 * 
 * @example
 * const result = await generateCSVExport(
 *   'vendor-123',
 *   'MyStore',
 *   { startDate: '2024-01-01', endDate: '2024-01-31' }
 * );
 * 
 * if ('type' in result) {
 *   // Handle error: result.message, result.suggestion
 * } else {
 *   // Download file: result.filename, result.content, result.mimeType
 * }
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.6, 7.9
 */
export async function generateCSVExport(
  vendorId: string,
  storeName: string,
  range: DateRange
): Promise<ExportResult | ExportError> {
  // Requirement 7.9: Enforce 365-day maximum for CSV exports
  const validation = validateDateRange(range.startDate, range.endDate);
  if (!validation.valid) {
    return {
      type: 'validation_error',
      message: validation.error || 'Invalid date range',
      suggestion: 'Please select a date range within 365 days',
    };
  }

  try {
    // Fetch analytics summary data
    const summary = await fetchAnalyticsSummary(vendorId, range);

    // Fetch top products by revenue
    const productPerformance = await fetchProductPerformance(
      vendorId,
      range,
      { limit: 5, sortBy: 'revenue' }
    );

    // Fetch customer metrics
    const customerMetrics = await fetchCustomerMetrics(vendorId, range);

    // Fetch daily analytics data from store_analytics table
    const dailyDataResult = await sql`
      SELECT 
        date::text as date,
        COALESCE(visits, 0)::int as visits,
        COALESCE(orders_count, 0)::int as orders,
        COALESCE(revenue, 0)::int as revenue
      FROM store_analytics
      WHERE vendor_id = ${vendorId}
        AND date >= ${range.startDate}::date
        AND date <= ${range.endDate}::date
      ORDER BY date ASC
    `;

    // Format daily data with calculated conversion rates
    const dailyData: DailyAnalyticsData[] = dailyDataResult.map((row) => ({
      date: row.date,
      visits: row.visits,
      orders: row.orders,
      revenue: row.revenue,
      conversionRate: row.visits > 0 ? (row.orders / row.visits) * 100 : 0,
    }));

    // Format top products as semicolon-separated string
    const topProducts = productPerformance.products
      .map((p) => `${p.productName} (₦${(p.totalRevenue / 100).toFixed(2)})`)
      .join('; ');

    // Format customer metrics as a readable string
    let customerMetricsStr = 'N/A';
    if (!('type' in customerMetrics)) {
      customerMetricsStr = [
        `Repeat Rate: ${customerMetrics.repeatCustomerRate.toFixed(1)}%`,
        `New: ${customerMetrics.newCustomers}`,
        `Returning: ${customerMetrics.returningCustomers}`,
        `Avg LTV: ₦${(customerMetrics.averageLifetimeValue / 100).toFixed(2)}`,
      ].join('; ');
    }

    // Build CSV content
    // Requirement 7.2: CSV with columns: date, visits, orders, revenue, conversion_rate, top_products, customer_metrics
    const csvRows: string[] = [];

    // CSV Header
    csvRows.push(
      'date,visits,orders,revenue,conversion_rate,top_products,customer_metrics'
    );

    // CSV Data Rows
    dailyData.forEach((row, index) => {
      // Escape CSV values (handle commas and quotes in strings)
      const escapeCSV = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      // Only include top_products and customer_metrics on the first row to avoid repetition
      const topProductsCell = index === 0 ? escapeCSV(topProducts) : '';
      const customerMetricsCell = index === 0 ? escapeCSV(customerMetricsStr) : '';

      csvRows.push([
        row.date,
        row.visits.toString(),
        row.orders.toString(),
        row.revenue.toString(),
        row.conversionRate.toFixed(2),
        topProductsCell,
        customerMetricsCell,
      ].join(','));
    });

    const csvContent = csvRows.join('\n');

    // Requirement 7.6: Generate filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.csv
    const sanitizeStoreName = (name: string) => {
      return name.replace(/[^a-zA-Z0-9-_]/g, '_');
    };

    const formatDateForFilename = (date: string) => {
      return date.replace(/-/g, '');
    };

    const today = new Date().toISOString().split('T')[0];
    const filename = [
      'Ovend-Analytics',
      sanitizeStoreName(storeName),
      `${formatDateForFilename(range.startDate)}-${formatDateForFilename(range.endDate)}`,
      formatDateForFilename(today),
    ].join('-') + '.csv';

    // Return export result
    return {
      filename,
      content: csvContent,
      mimeType: 'text/csv',
    };
  } catch (error) {
    console.error('CSV export generation failed', { vendorId, range, error });

    return {
      type: 'generation_error',
      message: 'Failed to generate CSV export. Please try again or contact support.',
      suggestion: 'Try selecting a smaller date range or retry in a few moments',
    };
  }
}

/**
 * Helper function to format currency for exports
 * 
 * @param amountInKobo - Amount in kobo (smallest currency unit)
 * @returns Formatted currency string (e.g., "₦1,234.56")
 */
export function formatCurrency(amountInKobo: number): string {
  const nairaAmount = amountInKobo / 100;
  return `₦${nairaAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Helper function to format percentage
 * 
 * @param value - Percentage value (e.g., 12.34)
 * @returns Formatted percentage string (e.g., "12.34%")
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Helper function to format date for display
 * 
 * @param date - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDateDisplay(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// ============================================================================
// Excel Export Functions
// ============================================================================

/**
 * Generate Excel export of analytics data for a date range
 * 
 * This function:
 * 1. Validates the date range (max 365 days for exports)
 * 2. Fetches analytics summary, product performance, and customer metrics
 * 3. Queries daily analytics data from store_analytics table
 * 4. Creates multiple Excel sheets: Summary, Daily Metrics, Product Performance, Customer Analytics
 * 5. Formats cells with appropriate data types and number formats
 * 6. Generates filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.xlsx
 * 
 * Excel Sheets:
 * - Summary: Overview of key metrics and period comparisons
 * - Daily Metrics: Date, visits, orders, revenue, conversion rate per day
 * - Product Performance: Top products by revenue with units sold and performance indicators
 * - Customer Analytics: Customer metrics including repeat rate, CLV, and new vs returning customers
 * 
 * @param vendorId - The vendor's unique identifier
 * @param storeName - The vendor's store name for filename
 * @param range - Date range for export (max 365 days)
 * @returns Promise resolving to ExportResult with Excel data or ExportError
 * 
 * @example
 * const result = await generateExcelExport(
 *   'vendor-123',
 *   'MyStore',
 *   { startDate: '2024-01-01', endDate: '2024-01-31' }
 * );
 * 
 * if ('type' in result) {
 *   // Handle error: result.message, result.suggestion
 * } else {
 *   // Download file: result.filename, result.content, result.mimeType
 * }
 * 
 * Validates: Requirements 7.1, 7.4, 7.6, 7.9
 */
export async function generateExcelExport(
  vendorId: string,
  storeName: string,
  range: DateRange
): Promise<ExportResult | ExportError> {
  // Requirement 7.9: Enforce 365-day maximum for Excel exports
  const validation = validateDateRange(range.startDate, range.endDate);
  if (!validation.valid) {
    return {
      type: 'validation_error',
      message: validation.error || 'Invalid date range',
      suggestion: 'Please select a date range within 365 days',
    };
  }

  try {
    // Import xlsx library
    const XLSX = await import('xlsx');
    
    // Fetch analytics summary data
    const summary = await fetchAnalyticsSummary(vendorId, range);

    // Fetch top products by revenue (top 25 for Excel)
    const productPerformance = await fetchProductPerformance(
      vendorId,
      range,
      { limit: 25, sortBy: 'revenue' }
    );

    // Fetch customer metrics
    const customerMetrics = await fetchCustomerMetrics(vendorId, range);

    // Fetch daily analytics data from store_analytics table
    const dailyDataResult = await sql`
      SELECT 
        date::text as date,
        COALESCE(visits, 0)::int as visits,
        COALESCE(orders_count, 0)::int as orders,
        COALESCE(revenue, 0)::int as revenue
      FROM store_analytics
      WHERE vendor_id = ${vendorId}
        AND date >= ${range.startDate}::date
        AND date <= ${range.endDate}::date
      ORDER BY date ASC
    `;

    // Format daily data with calculated conversion rates
    const dailyData: DailyAnalyticsData[] = dailyDataResult.map((row) => ({
      date: row.date,
      visits: row.visits,
      orders: row.orders,
      revenue: row.revenue,
      conversionRate: row.visits > 0 ? (row.orders / row.visits) * 100 : 0,
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // ========================================================================
    // SHEET 1: Summary
    // ========================================================================
    
    const summaryData = [
      ['Ovend Analytics Report'],
      ['Store Name:', storeName],
      ['Date Range:', `${range.startDate} to ${range.endDate}`],
      ['Export Date:', new Date().toISOString().split('T')[0]],
      [],
      ['Key Metrics'],
      ['Metric', 'Value', 'Change vs Previous Period'],
      ['Total Visits', summary.totalVisits.toString(), `${summary.periodChange.visits.change.toFixed(2)}%`],
      ['Total Orders', summary.totalOrders.toString(), `${summary.periodChange.orders.change.toFixed(2)}%`],
      ['Total Revenue (₦)', (summary.totalRevenue / 100).toFixed(2), `${summary.periodChange.revenue.change.toFixed(2)}%`],
      ['Conversion Rate (%)', summary.conversionRate.toFixed(2), `${summary.periodChange.conversionRate.change.toFixed(2)}%`],
      ['Average Order Value (₦)', (summary.avgOrderValue / 100).toFixed(2), ''],
      [],
      ['Customer Insights'],
    ];

    // Add customer metrics to summary if available
    if (!('type' in customerMetrics)) {
      summaryData.push(
        ['Total Unique Customers', customerMetrics.totalUniqueCustomers.toString(), ''],
        ['Repeat Customer Rate (%)', customerMetrics.repeatCustomerRate.toFixed(2), ''],
        ['New Customers', customerMetrics.newCustomers.toString(), ''],
        ['Returning Customers', customerMetrics.returningCustomers.toString(), ''],
        ['Average Customer Lifetime Value (₦)', (customerMetrics.averageLifetimeValue / 100).toFixed(2), '']
      );
    } else {
      summaryData.push(['Customer data unavailable', 'Need at least 5 completed orders', '']);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for Summary sheet
    summarySheet['!cols'] = [
      { wch: 30 }, // Column A
      { wch: 20 }, // Column B
      { wch: 30 }, // Column C
    ];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // ========================================================================
    // SHEET 2: Daily Metrics
    // ========================================================================
    
    const dailyMetricsData = [
      ['Daily Analytics'],
      ['Date', 'Visits', 'Orders', 'Revenue (₦)', 'Conversion Rate (%)'],
    ];

    dailyData.forEach((row) => {
      dailyMetricsData.push([
        row.date,
        row.visits.toString(),
        row.orders.toString(),
        (row.revenue / 100).toFixed(2),
        row.conversionRate.toFixed(2),
      ]);
    });

    const dailyMetricsSheet = XLSX.utils.aoa_to_sheet(dailyMetricsData);
    
    // Set column widths for Daily Metrics sheet
    dailyMetricsSheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Visits
      { wch: 10 }, // Orders
      { wch: 15 }, // Revenue
      { wch: 18 }, // Conversion Rate
    ];
    
    XLSX.utils.book_append_sheet(workbook, dailyMetricsSheet, 'Daily Metrics');

    // ========================================================================
    // SHEET 3: Product Performance
    // ========================================================================
    
    const productPerformanceData = [
      ['Product Performance'],
      ['Product Name', 'Units Sold', 'Total Revenue (₦)', 'Inventory Velocity (days)', 'Sales Trend', 'Discount (%)', 'Category'],
    ];

    productPerformance.products.forEach((product) => {
      productPerformanceData.push([
        product.productName,
        product.unitsSold.toString(),
        (product.totalRevenue / 100).toFixed(2),
        product.inventoryVelocity.toFixed(2),
        product.salesTrend,
        product.discountPercentage !== null ? product.discountPercentage.toFixed(0) : 'N/A',
        product.category || 'Uncategorized',
      ]);
    });

    const productPerformanceSheet = XLSX.utils.aoa_to_sheet(productPerformanceData);
    
    // Set column widths for Product Performance sheet
    productPerformanceSheet['!cols'] = [
      { wch: 30 }, // Product Name
      { wch: 12 }, // Units Sold
      { wch: 18 }, // Total Revenue
      { wch: 22 }, // Inventory Velocity
      { wch: 12 }, // Sales Trend
      { wch: 12 }, // Discount
      { wch: 20 }, // Category
    ];
    
    XLSX.utils.book_append_sheet(workbook, productPerformanceSheet, 'Product Performance');

    // ========================================================================
    // SHEET 4: Customer Analytics
    // ========================================================================
    
    const customerAnalyticsData = [
      ['Customer Analytics'],
      [],
    ];

    if (!('type' in customerMetrics)) {
      customerAnalyticsData.push(
        ['Metric', 'Value'],
        ['Total Unique Customers', customerMetrics.totalUniqueCustomers.toString()],
        ['New Customers', customerMetrics.newCustomers.toString()],
        ['Returning Customers', customerMetrics.returningCustomers.toString()],
        ['Repeat Customer Rate (%)', customerMetrics.repeatCustomerRate.toFixed(2)],
        ['Average Customer Lifetime Value (₦)', (customerMetrics.averageLifetimeValue / 100).toFixed(2)],
        [],
        ['Customer Breakdown'],
        ['Customer Type', 'Count', 'Percentage'],
        ['New', customerMetrics.newCustomers.toString(), `${((customerMetrics.newCustomers / customerMetrics.totalUniqueCustomers) * 100).toFixed(2)}%`],
        ['Returning', customerMetrics.returningCustomers.toString(), `${((customerMetrics.returningCustomers / customerMetrics.totalUniqueCustomers) * 100).toFixed(2)}%`]
      );
    } else {
      customerAnalyticsData.push(
        ['Customer analytics unavailable'],
        ['Reason:', customerMetrics.message],
        ['Suggestion:', customerMetrics.suggestion]
      );
    }

    const customerAnalyticsSheet = XLSX.utils.aoa_to_sheet(customerAnalyticsData);
    
    // Set column widths for Customer Analytics sheet
    customerAnalyticsSheet['!cols'] = [
      { wch: 35 }, // Column A
      { wch: 20 }, // Column B
      { wch: 20 }, // Column C
    ];
    
    XLSX.utils.book_append_sheet(workbook, customerAnalyticsSheet, 'Customer Analytics');

    // ========================================================================
    // Generate Excel file buffer
    // ========================================================================
    
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      cellStyles: true,
    });

    // Requirement 7.6: Generate filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.xlsx
    const sanitizeStoreName = (name: string) => {
      return name.replace(/[^a-zA-Z0-9-_]/g, '_');
    };

    const formatDateForFilename = (date: string) => {
      return date.replace(/-/g, '');
    };

    const today = new Date().toISOString().split('T')[0];
    const filename = [
      'Ovend-Analytics',
      sanitizeStoreName(storeName),
      `${formatDateForFilename(range.startDate)}-${formatDateForFilename(range.endDate)}`,
      formatDateForFilename(today),
    ].join('-') + '.xlsx';

    // Return export result
    return {
      filename,
      content: excelBuffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  } catch (error) {
    console.error('Excel export generation failed', { vendorId, range, error });

    return {
      type: 'generation_error',
      message: 'Failed to generate Excel export. Please try again or contact support.',
      suggestion: 'Try selecting a smaller date range or retry in a few moments',
    };
  }
}

// ============================================================================
// PDF Export Functions
// ============================================================================

/**
 * Generate PDF export of analytics data for a date range
 * 
 * This function:
 * 1. Validates the date range (max 365 days for exports)
 * 2. Fetches analytics summary, product performance, and customer metrics
 * 3. Queries daily analytics data from store_analytics table
 * 4. Creates PDF document with formatted tables for summary, daily metrics, product performance
 * 5. Includes vendor branding (store name and logo if available)
 * 6. Generates filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.pdf
 * 
 * PDF Sections:
 * - Header: Store name, logo, date range, generation timestamp
 * - Summary: Key metrics overview with period comparisons
 * - Daily Metrics: Date, visits, orders, revenue, conversion rate per day
 * - Product Performance: Top products by revenue with units sold and performance indicators
 * - Customer Analytics: Customer metrics including repeat rate and CLV
 * 
 * @param vendorId - The vendor's unique identifier
 * @param storeName - The vendor's store name for filename and branding
 * @param range - Date range for export (max 365 days)
 * @param logoUrl - Optional vendor logo URL for branding
 * @returns Promise resolving to ExportResult with PDF data or ExportError
 * 
 * @example
 * const result = await generatePDFExport(
 *   'vendor-123',
 *   'MyStore',
 *   { startDate: '2024-01-01', endDate: '2024-01-31' },
 *   'https://example.com/logo.png'
 * );
 * 
 * if ('type' in result) {
 *   // Handle error: result.message, result.suggestion
 * } else {
 *   // Download file: result.filename, result.content, result.mimeType
 * }
 * 
 * Validates: Requirements 7.1, 7.5, 7.6, 7.10
 */
export async function generatePDFExport(
  vendorId: string,
  storeName: string,
  range: DateRange,
  logoUrl?: string
): Promise<ExportResult | ExportError> {
  // Requirement 7.9: Enforce 365-day maximum for PDF exports
  const validation = validateDateRange(range.startDate, range.endDate);
  if (!validation.valid) {
    return {
      type: 'validation_error',
      message: validation.error || 'Invalid date range',
      suggestion: 'Please select a date range within 365 days',
    };
  }

  try {
    // Import jsPDF and autotable plugin
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    // Fetch analytics summary data
    const summary = await fetchAnalyticsSummary(vendorId, range);

    // Fetch top products by revenue (top 10 for PDF)
    const productPerformance = await fetchProductPerformance(
      vendorId,
      range,
      { limit: 10, sortBy: 'revenue' }
    );

    // Fetch customer metrics
    const customerMetrics = await fetchCustomerMetrics(vendorId, range);

    // Fetch daily analytics data from store_analytics table
    const dailyDataResult = await sql`
      SELECT 
        date::text as date,
        COALESCE(visits, 0)::int as visits,
        COALESCE(orders_count, 0)::int as orders,
        COALESCE(revenue, 0)::int as revenue
      FROM store_analytics
      WHERE vendor_id = ${vendorId}
        AND date >= ${range.startDate}::date
        AND date <= ${range.endDate}::date
      ORDER BY date ASC
    `;

    // Format daily data with calculated conversion rates
    const dailyData: DailyAnalyticsData[] = dailyDataResult.map((row) => ({
      date: row.date,
      visits: row.visits,
      orders: row.orders,
      revenue: row.revenue,
      conversionRate: row.visits > 0 ? (row.orders / row.visits) * 100 : 0,
    }));

    // Create PDF document (A4 size)
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 20;

    // ========================================================================
    // HEADER SECTION: Store name, logo, date range, generation timestamp
    // ========================================================================
    
    // Requirement 7.10: Include vendor's store name and generation timestamp
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Ovend Analytics Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    // Store name
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(storeName, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    // Date range
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `${formatDateDisplay(range.startDate)} - ${formatDateDisplay(range.endDate)}`,
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    currentY += 6;

    // Generation timestamp
    const generatedAt = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // ========================================================================
    // SUMMARY SECTION: Key metrics with period comparisons
    // ========================================================================
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, currentY);
    currentY += 8;

    // Summary table data
    const summaryTableData = [
      [
        'Total Visits',
        summary.totalVisits.toLocaleString(),
        `${summary.periodChange.visits.change >= 0 ? '+' : ''}${summary.periodChange.visits.change.toFixed(2)}%`
      ],
      [
        'Total Orders',
        summary.totalOrders.toLocaleString(),
        `${summary.periodChange.orders.change >= 0 ? '+' : ''}${summary.periodChange.orders.change.toFixed(2)}%`
      ],
      [
        'Total Revenue',
        formatCurrency(summary.totalRevenue),
        `${summary.periodChange.revenue.change >= 0 ? '+' : ''}${summary.periodChange.revenue.change.toFixed(2)}%`
      ],
      [
        'Conversion Rate',
        `${summary.conversionRate.toFixed(2)}%`,
        `${summary.periodChange.conversionRate.change >= 0 ? '+' : ''}${summary.periodChange.conversionRate.change.toFixed(2)}%`
      ],
      [
        'Average Order Value',
        formatCurrency(summary.avgOrderValue),
        '-'
      ]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value', 'Change vs Previous Period']],
      body: summaryTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129], // Emerald color
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 60, halign: 'right' },
        2: { cellWidth: 50, halign: 'right' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // ========================================================================
    // CUSTOMER ANALYTICS SECTION
    // ========================================================================
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Analytics', 14, currentY);
    currentY += 8;

    if (!('type' in customerMetrics)) {
      const customerTableData = [
        ['Total Unique Customers', customerMetrics.totalUniqueCustomers.toLocaleString()],
        ['New Customers', customerMetrics.newCustomers.toLocaleString()],
        ['Returning Customers', customerMetrics.returningCustomers.toLocaleString()],
        ['Repeat Customer Rate', `${customerMetrics.repeatCustomerRate.toFixed(2)}%`],
        ['Average Lifetime Value', formatCurrency(customerMetrics.averageLifetimeValue)]
      ];

      autoTable(doc, {
        startY: currentY,
        head: [['Metric', 'Value']],
        body: customerTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 80, halign: 'right' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Customer analytics unavailable - need at least 5 completed orders', 14, currentY);
      currentY += 12;
      doc.setTextColor(0, 0, 0);
    }

    // Check if we need a new page
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    // ========================================================================
    // PRODUCT PERFORMANCE SECTION
    // ========================================================================
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Products by Revenue', 14, currentY);
    currentY += 8;

    const productTableData = productPerformance.products.map((product, index) => [
      (index + 1).toString(),
      product.productName.length > 35 ? product.productName.substring(0, 32) + '...' : product.productName,
      product.unitsSold.toLocaleString(),
      formatCurrency(product.totalRevenue),
      product.discountPercentage !== null ? `${product.discountPercentage.toFixed(0)}%` : '-'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Product Name', 'Units Sold', 'Revenue', 'Discount']],
      body: productTableData,
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 75 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Check if we need a new page for daily metrics
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    // ========================================================================
    // DAILY METRICS SECTION (limited to prevent overflow)
    // ========================================================================
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Metrics', 14, currentY);
    currentY += 8;

    // Limit to most recent 30 days for PDF to prevent overflow
    const dailyMetricsForPdf = dailyData.slice(-30);

    const dailyTableData = dailyMetricsForPdf.map((row) => [
      formatDateDisplay(row.date),
      row.visits.toLocaleString(),
      row.orders.toLocaleString(),
      formatCurrency(row.revenue),
      `${row.conversionRate.toFixed(2)}%`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Visits', 'Orders', 'Revenue', 'Conv. Rate']],
      body: dailyTableData,
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 45, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });

    // If we had to truncate daily data, add a note
    if (dailyData.length > 30) {
      currentY = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Note: Showing most recent 30 days. Full data available in CSV/Excel export.`,
        14,
        currentY
      );
    }

    // ========================================================================
    // FOOTER: Ovend branding
    // ========================================================================
    
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        'Powered by Ovend',
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // ========================================================================
    // Generate PDF buffer
    // ========================================================================
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Requirement 7.6: Generate filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.pdf
    const sanitizeStoreName = (name: string) => {
      return name.replace(/[^a-zA-Z0-9-_]/g, '_');
    };

    const formatDateForFilename = (date: string) => {
      return date.replace(/-/g, '');
    };

    const today = new Date().toISOString().split('T')[0];
    const filename = [
      'Ovend-Analytics',
      sanitizeStoreName(storeName),
      `${formatDateForFilename(range.startDate)}-${formatDateForFilename(range.endDate)}`,
      formatDateForFilename(today),
    ].join('-') + '.pdf';

    // Return export result
    return {
      filename,
      content: pdfBuffer,
      mimeType: 'application/pdf',
    };
  } catch (error) {
    console.error('PDF export generation failed', { vendorId, range, error });

    return {
      type: 'generation_error',
      message: 'Failed to generate PDF export. Please try again or contact support.',
      suggestion: 'Try selecting a smaller date range or retry in a few moments',
    };
  }
}
