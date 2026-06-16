/**
 * ExportMenu Example
 * 
 * This file demonstrates the ExportMenu component with different configurations
 * and use cases. This is useful for:
 * - Visual testing and validation
 * - Integration testing in a browser environment
 * - Demonstrating API to other developers
 * 
 * To use: Import and render this component in your development environment
 */

'use client';

import { useState } from 'react';
import ExportMenu, { type DateRange, type ExportFormat } from './export-menu';

/**
 * Example 1: Basic Usage
 * Simple export menu with 30-day date range
 */
function BasicExample() {
  const dateRange: DateRange = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  return (
    <div className="p-6 bg-slate-50 rounded-xl">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Export Menu</h3>
      <p className="text-sm text-slate-600 mb-4">
        Export analytics data for January 2024 (30 days)
      </p>
      
      <ExportMenu dateRange={dateRange} />
    </div>
  );
}

/**
 * Example 2: With Callbacks
 * Export menu with callback handlers for tracking export lifecycle
 */
function WithCallbacksExample() {
  const [logs, setLogs] = useState<string[]>([]);
  const [dateRange] = useState<DateRange>({
    startDate: '2024-01-01',
    endDate: '2024-03-31',
  });

  const handleExportStart = (format: ExportFormat) => {
    setLogs((prev) => [...prev, `Export started: ${format.toUpperCase()}`]);
  };

  const handleExportComplete = (format: ExportFormat) => {
    setLogs((prev) => [...prev, `✓ Export completed: ${format.toUpperCase()}`]);
  };

  const handleExportError = (format: ExportFormat, error: string) => {
    setLogs((prev) => [...prev, `✗ Export failed: ${format.toUpperCase()} - ${error}`]);
  };

  return (
    <div className="p-6 bg-slate-50 rounded-xl">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Export Menu with Callbacks</h3>
      <p className="text-sm text-slate-600 mb-4">
        Export analytics data for Q1 2024 (90 days) with event logging
      </p>
      
      <ExportMenu
        dateRange={dateRange}
        onExportStart={handleExportStart}
        onExportComplete={handleExportComplete}
        onExportError={handleExportError}
      />

      {logs.length > 0 && (
        <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg">
          <h4 className="text-sm font-bold text-slate-700 mb-2">Event Log:</h4>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-xs font-mono text-slate-600">
                {log}
              </div>
            ))}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-2 text-xs text-red-600 hover:underline"
          >
            Clear Log
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Dynamic Date Range
 * Export menu with user-selectable date ranges
 */
function DynamicDateRangeExample() {
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const calculateDateRange = (range: '7d' | '30d' | '90d'): DateRange => {
    const end = new Date();
    const start = new Date();
    
    if (range === '7d') {
      start.setDate(end.getDate() - 7);
    } else if (range === '30d') {
      start.setDate(end.getDate() - 30);
    } else if (range === '90d') {
      start.setDate(end.getDate() - 90);
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const dateRange = calculateDateRange(selectedRange);

  return (
    <div className="p-6 bg-slate-50 rounded-xl">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Export Menu with Dynamic Date Range</h3>
      <p className="text-sm text-slate-600 mb-4">
        Select a time period and export the analytics data
      </p>
      
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium text-slate-700">Time Period:</label>
        {(['7d', '30d', '90d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedRange === range
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {range === '7d' && 'Last 7 Days'}
            {range === '30d' && 'Last 30 Days'}
            {range === '90d' && 'Last 90 Days'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg mb-4">
        <div>
          <p className="text-xs text-slate-500">Date Range</p>
          <p className="text-sm font-medium text-slate-900">
            {dateRange.startDate} to {dateRange.endDate}
          </p>
        </div>
        <ExportMenu dateRange={dateRange} />
      </div>
    </div>
  );
}

/**
 * Example 4: Multiple Export Menus
 * Demonstrate multiple independent export menus on the same page
 */
function MultipleExportMenusExample() {
  return (
    <div className="p-6 bg-slate-50 rounded-xl">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Multiple Export Menus</h3>
      <p className="text-sm text-slate-600 mb-4">
        Each section can have its own export menu with different date ranges
      </p>
      
      <div className="space-y-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Q1 2024 Analytics</h4>
              <p className="text-xs text-slate-500">January - March 2024</p>
            </div>
            <ExportMenu
              dateRange={{
                startDate: '2024-01-01',
                endDate: '2024-03-31',
              }}
            />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Q2 2024 Analytics</h4>
              <p className="text-xs text-slate-500">April - June 2024</p>
            </div>
            <ExportMenu
              dateRange={{
                startDate: '2024-04-01',
                endDate: '2024-06-30',
              }}
            />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Year to Date</h4>
              <p className="text-xs text-slate-500">January - December 2024</p>
            </div>
            <ExportMenu
              dateRange={{
                startDate: '2024-01-01',
                endDate: '2024-12-31',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Example Component
 * Renders all examples in a grid layout
 */
export default function ExportMenuExamples() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">ExportMenu Component Examples</h1>
        <p className="text-slate-600">
          Interactive demonstrations of the ExportMenu component with various configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicExample />
        <WithCallbacksExample />
        <DynamicDateRangeExample />
        <MultipleExportMenusExample />
      </div>

      <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Implementation Notes</h3>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>Export menu requires Business tier subscription to function</li>
          <li>API endpoint <code className="bg-blue-100 px-1 rounded">/api/analytics/export</code> must be accessible</li>
          <li>Supports CSV, Excel, and PDF export formats</li>
          <li>Automatically handles file download with proper filenames</li>
          <li>Shows loading states and error messages</li>
          <li>Dropdown closes automatically when clicking outside</li>
        </ul>
      </div>

      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
        <h3 className="text-lg font-bold text-emerald-900 mb-2">Usage</h3>
        <pre className="text-sm text-emerald-800 bg-emerald-100 p-4 rounded-lg overflow-x-auto">
{`import ExportMenu from './components/export-menu';

function MyComponent() {
  const dateRange = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  return (
    <ExportMenu
      dateRange={dateRange}
      onExportStart={(format) => console.log('Export started:', format)}
      onExportComplete={(format) => console.log('Export completed:', format)}
      onExportError={(format, error) => console.error('Export failed:', error)}
    />
  );
}`}
        </pre>
      </div>
    </div>
  );
}
