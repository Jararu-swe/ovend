'use client';

import { 
  TrendingUpIcon, 
  ChartBarIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import type { RevenueForecast, InsufficientForecastDataError } from '@/app/lib/business-analytics-types';

interface RevenueForecastCardProps {
  forecast: RevenueForecast | InsufficientForecastDataError;
  isLoading?: boolean;
}

/**
 * Format currency from kobo to naira with proper formatting
 */
function formatCurrency(amountInKobo: number): string {
  const naira = amountInKobo / 100;
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Get confidence badge styling based on confidence level
 */
function getConfidenceBadge(confidence: 'high' | 'medium' | 'low'): {
  bgColor: string;
  textColor: string;
  label: string;
  explanation: string;
} {
  switch (confidence) {
    case 'high':
      return {
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-800',
        label: 'High Confidence',
        explanation: 'Based on 90+ days of historical data'
      };
    case 'medium':
      return {
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        label: 'Medium Confidence',
        explanation: 'Based on 30-89 days of historical data'
      };
    case 'low':
      return {
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-800',
        label: 'Low Confidence',
        explanation: 'Based on less than 30 days of historical data'
      };
  }
}

/**
 * Get seasonal trend indicator
 */
function getSeasonalIndicator(trend: 'above' | 'below' | 'average' | null): {
  icon: string;
  label: string;
  color: string;
} | null {
  if (!trend) return null;

  switch (trend) {
    case 'above':
      return {
        icon: '📈',
        label: 'Seasonal High',
        color: 'text-emerald-600'
      };
    case 'below':
      return {
        icon: '📉',
        label: 'Seasonal Low',
        color: 'text-amber-600'
      };
    case 'average':
      return {
        icon: '➡️',
        label: 'Average Season',
        color: 'text-slate-600'
      };
  }
}

/**
 * Skeleton loader for forecast card
 */
function SkeletonForecastCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
      <div className="h-16 bg-slate-200 rounded-lg mb-6"></div>
      <div className="h-40 bg-slate-200 rounded-lg mb-4"></div>
      <div className="h-4 w-full bg-slate-200 rounded"></div>
    </div>
  );
}

/**
 * Insufficient data message component
 */
function InsufficientDataMessage({ error }: { error: InsufficientForecastDataError }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Revenue Forecast</h3>
        <p className="text-sm text-slate-600">
          30-day revenue projection based on historical trends
        </p>
      </div>

      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <ExclamationCircleIcon className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-900 font-semibold mb-2">{error.message}</p>
        <p className="text-sm text-slate-600 mb-4">{error.suggestion}</p>
        <div className="inline-block bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Current data:</span> {error.historicalDays} days
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Required:</span> 30+ days
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple line chart component for forecast visualization
 */
function ForecastChart({ 
  dailyProjections 
}: { 
  dailyProjections: Array<{ date: string; projected: number }> 
}) {
  if (dailyProjections.length === 0) {
    return null;
  }

  // Calculate min and max values for scaling
  const values = dailyProjections.map(p => p.projected);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1; // Prevent division by zero

  // Calculate points for the line chart
  const width = 100; // percentage
  const height = 160; // pixels
  const padding = 20;
  const chartHeight = height - padding * 2;
  const chartWidth = width;

  const points = dailyProjections.map((projection, index) => {
    const x = (index / (dailyProjections.length - 1)) * chartWidth;
    const normalizedValue = (projection.projected - minValue) / range;
    const y = chartHeight - (normalizedValue * chartHeight) + padding;
    return `${x},${y}`;
  }).join(' ');

  // Format dates for display (show every 5th date to avoid crowding)
  const dateLabels = dailyProjections
    .filter((_, index) => index === 0 || index === Math.floor(dailyProjections.length / 2) || index === dailyProjections.length - 1)
    .map((p, idx) => {
      const date = new Date(p.date);
      const formatted = date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
      let position = 0;
      if (idx === 0) position = 0;
      else if (idx === 1) position = 50;
      else position = 100;
      
      return { label: formatted, position };
    });

  return (
    <div className="relative bg-slate-50 rounded-lg p-4 border border-slate-200">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-4 text-xs text-slate-500 font-medium">
        {formatCurrency(maxValue)}
      </div>
      <div className="absolute left-0 bottom-4 text-xs text-slate-500 font-medium">
        {formatCurrency(minValue)}
      </div>

      {/* Chart area */}
      <div className="ml-16 mr-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ height: `${height}px` }}
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1={padding}
            x2={chartWidth}
            y2={padding}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={height / 2}
            x2={chartWidth}
            y2={height / 2}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={height - padding}
            x2={chartWidth}
            y2={height - padding}
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* Trend line */}
          <polyline
            points={points}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Fill area under the line */}
          <polygon
            points={`0,${height - padding} ${points} ${chartWidth},${height - padding}`}
            fill="url(#gradient)"
            opacity="0.2"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {dateLabels.map((label, idx) => (
            <div
              key={idx}
              className="text-xs text-slate-500 font-medium"
              style={{ 
                position: 'absolute',
                left: `${label.position}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {label.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Revenue Forecast Card Component
 * 
 * Displays 30-day revenue forecast with:
 * - Forecasted revenue amount
 * - Confidence indicator (High/Medium/Low)
 * - Historical data span explanation
 * - Chart with projected trend line
 * - Seasonal indicator when patterns detected
 * - Insufficient data message when historical data < 30 days
 * 
 * Validates: Requirements 6.1, 6.3, 6.4, 6.5, 6.7, 6.9, 6.10
 */
export default function RevenueForecastCard({ 
  forecast, 
  isLoading = false 
}: RevenueForecastCardProps) {
  // Show loading skeleton
  if (isLoading) {
    return <SkeletonForecastCard />;
  }

  // Handle insufficient data case (Requirement 6.9)
  if ('type' in forecast && forecast.type === 'insufficient_forecast_data') {
    return <InsufficientDataMessage error={forecast} />;
  }

  // Type guard: now TypeScript knows forecast is RevenueForecast
  const forecastData = forecast as RevenueForecast;

  const confidenceBadge = getConfidenceBadge(forecastData.confidence);
  const seasonalIndicator = getSeasonalIndicator(forecastData.seasonalTrend);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Revenue Forecast</h3>
            <p className="text-sm text-slate-600">
              30-day revenue projection based on historical trends
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-100">
            <TrendingUpIcon className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Forecasted Revenue - Main Metric */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 mb-6 border border-emerald-200">
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-sm font-semibold text-emerald-800">
            Projected 30-Day Revenue
          </p>
        </div>
        <p className="text-4xl font-bold text-emerald-900 mb-3">
          {formatCurrency(forecastData.forecastedRevenue)}
        </p>
        
        {/* Confidence Indicator */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${confidenceBadge.bgColor} ${confidenceBadge.textColor}`}>
            {forecastData.confidence === 'high' && '✓'}
            {forecastData.confidence === 'medium' && '~'}
            {forecastData.confidence === 'low' && '!'}
            {confidenceBadge.label}
          </span>
          
          {/* Seasonal Indicator */}
          {seasonalIndicator && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border-2 ${
              seasonalIndicator.color === 'text-emerald-600' ? 'border-emerald-200' :
              seasonalIndicator.color === 'text-amber-600' ? 'border-amber-200' :
              'border-slate-200'
            } ${seasonalIndicator.color}`}>
              <span>{seasonalIndicator.icon}</span>
              {seasonalIndicator.label}
            </span>
          )}
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ChartBarIcon className="h-4 w-4 text-slate-600" />
          <p className="text-sm font-semibold text-slate-700">
            Daily Revenue Projection
          </p>
        </div>
        <ForecastChart dailyProjections={forecastData.dailyProjections} />
      </div>

      {/* Forecast Details & Assumptions */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-sm mb-2">
              Forecast Information
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p>
                <span className="font-medium">Data range:</span> Last {forecastData.historicalDays} days of historical revenue
              </p>
              <p>
                <span className="font-medium">Method:</span> Linear regression trend analysis
              </p>
              <p>
                <span className="font-medium">Confidence explanation:</span> {confidenceBadge.explanation}
              </p>
              {seasonalIndicator && forecastData.seasonalTrend && (
                <p>
                  <span className="font-medium">Seasonal pattern:</span> {
                    forecastData.seasonalTrend === 'above' 
                      ? 'This month typically performs above average based on historical patterns'
                      : forecastData.seasonalTrend === 'below'
                      ? 'This month typically performs below average based on historical patterns'
                      : 'This month typically performs at average levels based on historical patterns'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Note */}
      {forecastData.confidence === 'low' && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Note:</span> Forecast accuracy will improve as you accumulate more historical data. 
            Aim for at least 90 days of sales history for high-confidence projections.
          </p>
        </div>
      )}
    </div>
  );
}
