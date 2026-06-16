'use client';

import { useState } from 'react';
import TimeRangeSelector, { type TimeRange, type DateRange } from '@/app/ui/analytics/time-range-selector';

export default function TimeRangeSelectorDemo() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  
  const handleRangeChange = (range: TimeRange, customDates?: DateRange) => {
    setSelectedRange(range);
    if (customDates) {
      setCustomRange(customDates);
    }
  };
  
  const formatDateRange = () => {
    if (selectedRange === 'custom' && customRange) {
      return `${customRange.startDate.toLocaleDateString()} - ${customRange.endDate.toLocaleDateString()}`;
    }
    
    const ranges: Record<TimeRange, string> = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      'custom': 'Custom range (not selected)'
    };
    
    return ranges[selectedRange];
  };
  
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Time Range Selector Demo
          </h1>
          <p className="text-slate-600">
            Test the TimeRangeSelector component with different ranges and custom date selection
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Select Time Range
          </h2>
          
          <TimeRangeSelector
            value={selectedRange}
            customRange={customRange}
            onChange={handleRangeChange}
          />
          
          <div className="mt-8 p-6 bg-slate-50 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Current Selection:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Range Type:</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                  {selectedRange}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Description:</span>
                <span className="text-sm text-slate-900 font-medium">
                  {formatDateRange()}
                </span>
              </div>
              {customRange && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Start Date:</span>
                    <span className="text-sm text-slate-900">
                      {customRange.startDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">End Date:</span>
                    <span className="text-sm text-slate-900">
                      {customRange.endDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Days Selected:</span>
                    <span className="text-sm text-slate-900">
                      {Math.ceil((customRange.endDate.getTime() - customRange.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            Features to Test:
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>Click preset buttons (7d, 30d, 90d) to see immediate selection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>Click "Custom Range" to open the date picker modal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>Try selecting dates that exceed 365 days to see validation error</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>Try selecting future dates (should be disabled)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>Click Cancel to close modal without applying changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span>Apply a custom range and see the button label update</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
