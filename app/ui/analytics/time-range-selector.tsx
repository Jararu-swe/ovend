'use client';

import { useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export type TimeRange = '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface TimeRangeSelectorProps {
  value: TimeRange;
  customRange?: DateRange;
  onChange: (range: TimeRange, customRange?: DateRange) => void;
}

export default function TimeRangeSelector({ 
  value, 
  customRange, 
  onChange 
}: TimeRangeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    customRange?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    customRange?.endDate || new Date()
  );
  const [validationError, setValidationError] = useState<string>('');
  
  const ranges = [
    { value: '7d' as const, label: '7 Days' },
    { value: '30d' as const, label: '30 Days' },
    { value: '90d' as const, label: '90 Days' },
    { value: 'custom' as const, label: 'Custom Range' }
  ];
  
  const handleRangeChange = (newRange: TimeRange) => {
    if (newRange === 'custom') {
      setShowCustomPicker(true);
      setValidationError('');
    } else {
      setShowCustomPicker(false);
      onChange(newRange);
    }
  };
  
  const validateDateRange = (start: Date, end: Date): string | null => {
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date format';
    }
    
    // Start date must be before end date
    if (start > end) {
      return 'Start date must be before end date';
    }
    
    // End date cannot be in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (end > today) {
      return 'End date cannot be in the future';
    }
    
    // Maximum span of 365 days
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      return 'Date range cannot exceed 365 days';
    }
    
    return null;
  };
  
  const handleCustomApply = () => {
    const error = validateDateRange(startDate, endDate);
    
    if (error) {
      setValidationError(error);
      return;
    }
    
    setValidationError('');
    onChange('custom', { startDate, endDate });
    setShowCustomPicker(false);
  };
  
  const handleCancel = () => {
    setShowCustomPicker(false);
    setValidationError('');
    // Reset to previous custom range if it exists
    if (customRange) {
      setStartDate(customRange.startDate);
      setEndDate(customRange.endDate);
    }
  };
  
  const formatCustomRangeLabel = () => {
    if (value === 'custom' && customRange) {
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      };
      return `${formatDate(customRange.startDate)} - ${formatDate(customRange.endDate)}`;
    }
    return 'Custom Range';
  };
  
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {ranges.map(range => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              value === range.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {range.value === 'custom' && <CalendarIcon className="h-4 w-4" />}
            {range.value === 'custom' && value === 'custom' && customRange
              ? formatCustomRangeLabel()
              : range.label}
          </button>
        ))}
      </div>
      
      {showCustomPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Select Custom Range</h3>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {validationError}
              </div>
            )}
            
            <div className="text-sm text-slate-600 mb-4">
              Maximum date range: 365 days
            </div>
            
            <div className="flex gap-4 mb-6 justify-center flex-wrap">
              <div className="flex flex-col items-center">
                <label className="text-sm font-medium text-slate-700 mb-2">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => {
                    setStartDate(date || new Date());
                    setValidationError('');
                  }}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  inline
                  className="rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-sm font-medium text-slate-700 mb-2">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => {
                    setEndDate(date || new Date());
                    setValidationError('');
                  }}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  inline
                  className="rounded-lg border border-slate-200"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomApply}
                className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition shadow-sm"
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
