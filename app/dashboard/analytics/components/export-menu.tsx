'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Export format type
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Date range for export
 */
export type DateRange = {
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
};

interface ExportMenuProps {
  /** Current date range to export */
  dateRange: DateRange;
  /** Optional callback when export starts */
  onExportStart?: (format: ExportFormat) => void;
  /** Optional callback when export completes */
  onExportComplete?: (format: ExportFormat) => void;
  /** Optional callback when export fails */
  onExportError?: (format: ExportFormat, error: string) => void;
}

/**
 * ExportMenu Component
 * 
 * Displays a dropdown menu with export options for CSV, Excel, and PDF formats.
 * Handles export API requests with loading states and error handling.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.7, 7.8
 * 
 * Features:
 * - Dropdown menu with three export format options
 * - Loading states for each format
 * - Success/error feedback
 * - Automatic file download on success
 * - User-friendly error messages
 */
export default function ExportMenu({
  dateRange,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [lastExportedFormat, setLastExportedFormat] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside (Requirement 7.1)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (lastExportedFormat) {
      const timer = setTimeout(() => {
        setLastExportedFormat(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastExportedFormat]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * Handle export button click (Requirements 7.2, 7.3, 7.4)
   */
  const handleExport = async (format: ExportFormat) => {
    // Clear previous states
    setError(null);
    setLastExportedFormat(null);
    setLoadingFormat(format);
    setIsOpen(false);

    // Callback: export started
    onExportStart?.(format);

    try {
      // Requirement 7.2: POST request to /api/analytics/export
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      });

      if (!response.ok) {
        // Parse error response (Requirement 7.4)
        const errorData = await response.json().catch(() => ({
          message: 'Export failed. Please try again.',
        }));

        throw new Error(errorData.message || `Export failed with status ${response.status}`);
      }

      // Requirement 7.3: Trigger file download
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      
      // Extract filename from Content-Disposition header
      let filename = `Ovend-Analytics-Export-${new Date().toISOString().split('T')[0]}.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Success state
      setLastExportedFormat(format);
      setLoadingFormat(null);

      // Callback: export complete
      onExportComplete?.(format);
    } catch (err) {
      // Requirement 7.4: Display error messages
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setLoadingFormat(null);

      // Callback: export error
      onExportError?.(format, errorMessage);
    }
  };

  // Export options configuration (Requirement 7.1)
  const exportOptions = [
    {
      format: 'csv' as ExportFormat,
      label: 'Export as CSV',
      description: 'Comma-separated values file',
      icon: TableCellsIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100',
    },
    {
      format: 'excel' as ExportFormat,
      label: 'Export as Excel',
      description: 'Microsoft Excel workbook',
      icon: DocumentArrowDownIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverBg: 'hover:bg-emerald-100',
    },
    {
      format: 'pdf' as ExportFormat,
      label: 'Export as PDF',
      description: 'Portable document format',
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100',
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Export Button (Requirement 7.1) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loadingFormat !== null}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
          loadingFormat
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow'
        }`}
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
        <span>Export</span>
      </button>

      {/* Dropdown Menu (Requirement 7.1) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isLoading = loadingFormat === option.format;
              const isSuccess = lastExportedFormat === option.format;

              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={loadingFormat !== null}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition ${
                    loadingFormat !== null
                      ? 'opacity-50 cursor-not-allowed'
                      : `${option.hoverBg} cursor-pointer`
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 h-10 w-10 ${option.bgColor} rounded-lg flex items-center justify-center`}>
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
                    ) : isSuccess ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Icon className={`h-5 w-5 ${option.color}`} />
                    )}
                  </div>

                  {/* Label and Description */}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-slate-900">
                      {option.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isLoading ? 'Generating export...' : option.description}
                    </p>
                  </div>

                  {/* Loading State Indicator (Requirement 7.2) */}
                  {isLoading && (
                    <div className="flex-shrink-0">
                      <div className="text-xs text-emerald-600 font-medium">
                        Please wait...
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Success Message (Requirement 7.3) */}
      {lastExportedFormat && !isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-emerald-50 border border-emerald-200 rounded-lg shadow-lg z-50 p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900">
                Export Successful
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Your {lastExportedFormat.toUpperCase()} file has been downloaded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message (Requirement 7.4) */}
      {error && !isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">
                Export Failed
              </p>
              <p className="text-xs text-red-700 mt-1">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-800 font-medium hover:underline mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
