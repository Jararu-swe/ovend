import { useState } from 'react';
import TimeRangeSelector, { type TimeRange, type CustomDateRange } from './time-range-selector';

/**
 * Example usage of TimeRangeSelector component
 * 
 * This file demonstrates different use cases and configurations
 * of the TimeRangeSelector component.
 */

// Example 1: Basic usage with preset ranges
export function BasicExample() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();

  const handleRangeChange = (range: TimeRange, custom?: CustomDateRange) => {
    setSelectedRange(range);
    setCustomRange(custom);
    console.log('Selected range:', range, custom);
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Basic Time Range Selector</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <TimeRangeSelector
          value={selectedRange}
          customRange={customRange}
          onChange={handleRangeChange}
        />

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-medium text-slate-900 mb-2">Selected:</h3>
          <p className="text-sm text-slate-600">
            <strong>Range:</strong> {selectedRange}
          </p>
          {customRange && (
            <p className="text-sm text-slate-600 mt-1">
              <strong>Custom Range:</strong>{' '}
              {customRange.startDate.toLocaleDateString()} -{' '}
              {customRange.endDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Example 2: With analytics dashboard integration
export function DashboardIntegrationExample() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d');
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleRangeChange = async (range: TimeRange, custom?: CustomDateRange) => {
    setSelectedRange(range);
    setCustomRange(custom);
    
    // Simulate data fetching
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getDateRange = () => {
    if (selectedRange === 'custom' && customRange) {
      return customRange;
    }

    const endDate = new Date();
    const startDate = new Date();

    switch (selectedRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    return { startDate, endDate };
  };

  const dateRange = getDateRange();

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Dashboard Integration Example</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Analytics Time Period</h3>
          {isLoading && (
            <span className="text-sm text-slate-500 animate-pulse">Loading data...</span>
          )}
        </div>

        <TimeRangeSelector
          value={selectedRange}
          customRange={customRange}
          onChange={handleRangeChange}
        />
      </div>

      {/* Mock Analytics Dashboard */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Analytics Dashboard</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Visits</p>
            <p className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : '1,234'}
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm font-medium text-emerald-900 mb-1">Orders</p>
            <p className="text-2xl font-bold text-emerald-600">
              {isLoading ? '...' : '45'}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-900 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : '₦125,000'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-600 mb-1">Active Date Range:</p>
          <p className="text-sm font-medium text-slate-900">
            {dateRange.startDate.toLocaleDateString()} -{' '}
            {dateRange.endDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Example 3: Controlled component with external state
export function ControlledExample() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();
  const [history, setHistory] = useState<Array<{ range: TimeRange; timestamp: Date }>>([]);

  const handleRangeChange = (range: TimeRange, custom?: CustomDateRange) => {
    setSelectedRange(range);
    setCustomRange(custom);
    setHistory(prev => [...prev, { range, timestamp: new Date() }]);
  };

  const applyPreset = (preset: TimeRange) => {
    setSelectedRange(preset);
    setCustomRange(undefined);
    setHistory(prev => [...prev, { range: preset, timestamp: new Date() }]);
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Controlled Component Example</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Time Range Selector</h3>
          <TimeRangeSelector
            value={selectedRange}
            customRange={customRange}
            onChange={handleRangeChange}
          />

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-700 mb-2">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset('7d')}
                className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Last Week
              </button>
              <button
                onClick={() => applyPreset('30d')}
                className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Last Month
              </button>
              <button
                onClick={() => applyPreset('90d')}
                className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Last Quarter
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Selection History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No selections yet</p>
            ) : (
              history.reverse().map((item, index) => (
                <div
                  key={index}
                  className="p-2 bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-slate-700">{item.range}</span>
                  <span className="text-xs text-slate-500">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 4: Default to custom range
export function CustomRangeDefaultExample() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14); // 2 weeks ago
  const endDate = new Date();

  const [selectedRange, setSelectedRange] = useState<TimeRange>('custom');
  const [customRange, setCustomRange] = useState<CustomDateRange>({
    startDate,
    endDate,
  });

  const handleRangeChange = (range: TimeRange, custom?: CustomDateRange) => {
    setSelectedRange(range);
    if (custom) {
      setCustomRange(custom);
    }
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Custom Range Default Example</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-sm text-slate-600 mb-4">
          This example starts with a custom range selected (last 14 days).
        </p>

        <TimeRangeSelector
          value={selectedRange}
          customRange={customRange}
          onChange={handleRangeChange}
        />
      </div>
    </div>
  );
}

// Default export showing all examples
export default function TimeRangeSelectorExamples() {
  return (
    <div className="space-y-8">
      <BasicExample />
      <DashboardIntegrationExample />
      <ControlledExample />
      <CustomRangeDefaultExample />
    </div>
  );
}
