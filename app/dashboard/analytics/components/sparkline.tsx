'use client';

import { useMemo } from 'react';

/**
 * Sparkline data point
 */
export type SparklineDataPoint = {
  value: number;
};

interface SparklineProps {
  /** Array of data points */
  data: SparklineDataPoint[];
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Line color (Requirement 10.4) */
  color?: 'blue' | 'green' | 'purple' | 'red' | 'orange';
  /** Show area fill */
  showArea?: boolean;
  /** Show trend indicator */
  showTrend?: boolean;
}

/**
 * Color palette for sparklines (Requirement 10.4)
 */
const SPARKLINE_COLORS = {
  blue: { line: '#3b82f6', area: '#dbeafe' },
  green: { line: '#10b981', area: '#d1fae5' },
  purple: { line: '#8b5cf6', area: '#ede9fe' },
  red: { line: '#ef4444', area: '#fee2e2' },
  orange: { line: '#f97316', area: '#fed7aa' },
};

/**
 * Sparkline Component
 * 
 * Mini-chart for displaying quick visual trends next to key metrics.
 * Shows a simple line graph without axes or labels.
 * 
 * Requirement: 10.5 - Display sparkline mini-charts next to key metrics
 */
export default function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'blue',
  showArea = true,
  showTrend = false,
}: SparklineProps) {
  const colors = SPARKLINE_COLORS[color];

  // Calculate min/max and generate path
  const { minValue, maxValue, linePath, areaPath, trend } = useMemo(() => {
    if (data.length === 0) {
      return {
        minValue: 0,
        maxValue: 1,
        linePath: '',
        areaPath: '',
        trend: 'neutral' as 'up' | 'down' | 'neutral',
      };
    }

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // Generate line path
    const stepX = width / (data.length - 1 || 1);
    const points = data.map((point, index) => {
      const x = index * stepX;
      const y = height - ((point.value - min) / range) * height;
      return { x, y };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Generate area path (filled)
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    // Calculate trend
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (data.length >= 2) {
      const firstValue = data[0].value;
      const lastValue = data[data.length - 1].value;
      if (lastValue > firstValue * 1.05) trend = 'up';
      else if (lastValue < firstValue * 0.95) trend = 'down';
    }

    return { minValue: min, maxValue: max, linePath, areaPath, trend };
  }, [data, width, height]);

  // Render empty state
  if (data.length === 0) {
    return (
      <svg width={width} height={height} className="inline-block">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <svg width={width} height={height} className="inline-block">
        {/* Area fill */}
        {showArea && (
          <path d={areaPath} fill={colors.area} opacity="0.3" />
        )}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.line}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Trend indicator */}
      {showTrend && trend !== 'neutral' && (
        <span
          className={`text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {trend === 'up' ? '↑' : '↓'}
        </span>
      )}
    </div>
  );
}
