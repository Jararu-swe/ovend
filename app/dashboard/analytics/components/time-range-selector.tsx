'use client';

import { useState } from 'react';
import { CalendarIcon, XMarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Time range selector options
 */
export type TimeRange = '7d' | '30d' | '90d' | 'custom';

/**
 * Custom date range with start and end dates
 */
export interface CustomDateRange {
  startDate: Date;
  endDate: Date;
}

interface TimeRangeSelectorProps {
  /** Current selected time range */
  value: TimeRange;
  /** Custom date range (only used when value is 'custom') */
  customRange?: CustomDateRange;
  /** Callback when range changes */
  onChange: (range: TimeRange, customRange?: CustomDateRange) => void;
  /** Whether user is on Pro tier (limits to 7 days only) */
  isProTier?: boolean;
}

/**
 * TimeRangeSelector Component
 * 
 * Provides a UI for selecting analytics time ranges:
 * - Preset options: 7 days, 30 days, 90 days
 * - Custom date range picker with validation
 * 
 * Features:
 * - Button-based preset selection
 * - Modal date picker for custom ranges
 * - Date validation (no future dates, max 365 days)
 * - Start/end date constraints
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export default function TimeRangeSelector({
  value,
  customRange,
  onChange,
  isProTier = false,
}: TimeRangeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    customRange?.startDate || new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date>(customRange?.endDate || new Date());
  const [error, setError] = useState<string | null>(null);

  // Define available time ranges (Requirement 1.1)
  const allRanges = [
    { value: '7d' as TimeRange, label: '7 Days', disabled: false },
    { value: '30d' as TimeRange, label: '30 Days', disabled: isProTier },
    { value: '90d' as TimeRange, label: '90 Days', disabled: isProTier },
    { value: 'custom' as TimeRange, label: 'Custom Range', disabled: isProTier },
  ];

  /**
   * Handle preset range selection (Requirements 1.2, 1.3, 1.4)
   */
  const handleRangeChange = (newRange: TimeRange) => {
    if (isProTier && newRange !== '7d') {
      // Don't allow non-7-day ranges for Pro tier
      return;
    }
    
    if (newRange === 'custom') {
      // Open custom date picker (Requirement 1.4)
      setShowCustomPicker(true);
      setError(null);
    } else {
      // Close custom picker and emit preset range
      setShowCustomPicker(false);
      setError(null);
      onChange(newRange);
    }
  };

  /**
   * Validate custom date range
   * - Start date must be before end date
   * - End date cannot be in the future
   * - Range cannot exceed 365 days
   */
  const validateDateRange = (): boolean => {
    // Reset error
    setError(null);

    // Check if start date is before end date
    if (startDate > endDate) {
      setError('Start date must be before end date');
      return false;
    }

    // Check if end date is not in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (endDate > today) {
      setError('End date cannot be in the future');
      return false;
    }

    // Check if range doesn't exceed 365 days
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > 365) {
      setError('Date range cannot exceed 365 days');
      return false;
    }

    return true;
  };

  /**
   * Apply custom date range (Requirement 1.4)
   */
  const handleCustomApply = () => {
    // Validate the date range
    if (!validateDateRange()) {
      return;
    }

    // Emit the custom range
    onChange('custom', { startDate, endDate });
    setShowCustomPicker(false);
    setError(null);
  };

  /**
   * Cancel custom date picker
   */
  const handleCustomCancel = () => {
    setShowCustomPicker(false);
    setError(null);
    // Reset to previous custom range if exists
    if (customRange) {
      setStartDate(customRange.startDate);
      setEndDate(customRange.endDate);
    }
  };

  /**
   * Format custom range for display
   */
  const formatCustomRange = (): string => {
    if (!customRange) return 'Custom Range';
    
    const formatDate = (date: Date) => {
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    };

    return `${formatDate(customRange.startDate)} - ${formatDate(customRange.endDate)}`;
  };

  return (
    <>
      {/* Range Selection Buttons (Requirement 1.1) */}
      <div className="flex items-center gap-2 flex-wrap">
        {allRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            disabled={range.disabled}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              range.disabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : value === range.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {range.value === 'custom' && <CalendarIcon className="h-4 w-4" />}
            {range.value === 'custom' && value === 'custom'
              ? formatCustomRange()
              : range.label}
            {range.disabled && <LockClosedIcon className="h-3 w-3" />}
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker Modal (Requirement 1.4) */}
      {showCustomPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Select Custom Date Range</h3>
              </div>
              <button
                onClick={handleCustomCancel}
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Date Pickers */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date || new Date());
                    setError(null);
                  }}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  inline
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => {
                    setEndDate(date || new Date());
                    setError(null);
                  }}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  inline
                  className="w-full"
                />
              </div>
            </div>

            {/* Selected Range Display */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Selected Range:</p>
              <p className="text-base font-medium text-slate-900">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                <span className="text-sm text-slate-500 ml-2">
                  ({Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1}{' '}
                  days)
                </span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCustomCancel}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomApply}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition shadow-sm"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
