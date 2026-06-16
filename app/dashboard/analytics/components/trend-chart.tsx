'use client';

import { useState, useMemo } from 'react';
import {
  ChartBarIcon,
  PresentationChartLineIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';

/**
 * Data point for time-series charts
 */
export type DataPoint = {
  date: string; // ISO date string or label
  value: number;
  label?: string; // Optional custom label
};

/**
 * Metric configuration for multi-metric charts
 */
export type MetricConfig = {
  key: string;
  label: string;
  data: DataPoint[];
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange';
  visible?: boolean;
};

/**
 * Chart type options
 */
export type ChartType = 'line' | 'bar' | 'area';

interface TrendChartProps {
  /** Single metric data points */
  data?: DataPoint[];
  /** Multiple metrics configuration (Requirements 10.10) */
  metrics?: MetricConfig[];
  /** Chart type - line, bar, or area (Requirement 10.9) */
  chartType?: ChartType;
  /** Chart height in pixels */
  height?: number;
  /** Show trend line using linear regression (Requirements 10.1, 10.2) */
  showTrendLine?: boolean;
  /** Color for single metric (Requirements 10.4) */
  color?: 'blue' | 'green' | 'purple' | 'red' | 'orange';
  /** Chart title */
  title?: string;
  /** Value formatter function */
  formatValue?: (value: number) => string;
  /** Allow chart type toggling (Requirement 10.9) */
  allowTypeToggle?: boolean;
  /** Show legend for multi-metric charts (Requirement 10.10) */
  showLegend?: boolean;
}

/**
 * Color palette mapping (Requirement 10.4)
 * Blue for visits, Green for revenue, Purple for orders
 */
const COLOR_MAP = {
  blue: {
    primary: '#3b82f6',
    light: '#93c5fd',
    lighter: '#dbeafe',
    dark: '#1e40af',
  },
  green: {
    primary: '#10b981',
    light: '#6ee7b7',
    lighter: '#d1fae5',
    dark: '#047857',
  },
  purple: {
    primary: '#8b5cf6',
    light: '#c4b5fd',
    lighter: '#ede9fe',
    dark: '#6d28d9',
  },
  red: {
    primary: '#ef4444',
    light: '#fca5a5',
    lighter: '#fee2e2',
    dark: '#b91c1c',
  },
  orange: {
    primary: '#f97316',
    light: '#fdba74',
    lighter: '#fed7aa',
    dark: '#c2410c',
  },
};

/**
 * Calculate linear regression for trend line (Requirement 10.2)
 */
function calculateLinearRegression(data: DataPoint[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  data.forEach((point, index) => {
    const x = index;
    const y = point.value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Generate SVG path for line chart
 */
function generateLinePath(
  data: DataPoint[],
  width: number,
  height: number,
  maxValue: number,
  minValue: number
): string {
  if (data.length === 0) return '';

  const stepX = width / (data.length - 1 || 1);
  const valueRange = maxValue - minValue || 1;

  return data
    .map((point, index) => {
      const x = index * stepX;
      const y = height - ((point.value - minValue) / valueRange) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

/**
 * Generate SVG path for area chart (filled line)
 */
function generateAreaPath(
  data: DataPoint[],
  width: number,
  height: number,
  maxValue: number,
  minValue: number
): string {
  if (data.length === 0) return '';

  const linePath = generateLinePath(data, width, height, maxValue, minValue);
  const stepX = width / (data.length - 1 || 1);
  const lastX = (data.length - 1) * stepX;

  // Close the path at the bottom
  return `${linePath} L ${lastX} ${height} L 0 ${height} Z`;
}

/**
 * Generate trend line path using linear regression (Requirements 10.1, 10.2)
 */
function generateTrendLinePath(
  data: DataPoint[],
  width: number,
  height: number,
  maxValue: number,
  minValue: number
): string {
  if (data.length < 2) return '';

  const { slope, intercept } = calculateLinearRegression(data);
  const stepX = width / (data.length - 1);
  const valueRange = maxValue - minValue || 1;

  const startValue = intercept;
  const endValue = slope * (data.length - 1) + intercept;

  const startY = height - ((startValue - minValue) / valueRange) * height;
  const endY = height - ((endValue - minValue) / valueRange) * height;

  return `M 0 ${startY} L ${width} ${endY}`;
}

/**
 * TrendChart Component
 * 
 * Displays time-series data with multiple chart types (line, bar, area),
 * interactive tooltips, trend lines via linear regression, and support
 * for multiple metrics with legend controls.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.9, 10.10
 */
export default function TrendChart({
  data = [],
  metrics = [],
  chartType: initialChartType = 'line',
  height = 300,
  showTrendLine = false,
  color = 'blue',
  title,
  formatValue = (v) => v.toLocaleString(),
  allowTypeToggle = false,
  showLegend = true,
}: TrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    new Set(metrics.map((m) => m.key))
  );

  // Use single metric mode or multi-metric mode
  const isMultiMetric = metrics.length > 0;
  const chartData = isMultiMetric ? metrics : [{ key: 'default', label: '', data, color, visible: true }];

  // Calculate chart dimensions
  const chartWidth = 800; // SVG viewBox width
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate min/max values across all visible metrics
  const { minValue, maxValue } = useMemo(() => {
    const allValues = chartData
      .filter((metric) => !isMultiMetric || visibleMetrics.has(metric.key))
      .flatMap((metric) => metric.data.map((d) => d.value));

    if (allValues.length === 0) return { minValue: 0, maxValue: 100 };

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1 || 10; // Add 10% padding

    return {
      minValue: Math.floor(min - padding),
      maxValue: Math.ceil(max + padding),
    };
  }, [chartData, visibleMetrics, isMultiMetric]);

  // Generate Y-axis labels
  const yAxisLabels = useMemo(() => {
    const labelCount = 5;
    const step = (maxValue - minValue) / (labelCount - 1);
    return Array.from({ length: labelCount }, (_, i) => minValue + step * i).reverse();
  }, [minValue, maxValue]);

  // Handle metric visibility toggle (Requirement 10.10)
  const toggleMetric = (key: string) => {
    setVisibleMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        // Keep at least one metric visible
        if (newSet.size > 1) {
          newSet.delete(key);
        }
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Handle mouse move for tooltip (Requirement 10.3)
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scaleX = chartWidth / rect.width;
    const svgX = x * scaleX - padding.left;

    if (svgX < 0 || svgX > plotWidth) {
      setHoveredPoint(null);
      return;
    }

    // Find nearest data point
    const firstMetric = chartData.find((m) => visibleMetrics.has(m.key));
    if (!firstMetric || firstMetric.data.length === 0) {
      setHoveredPoint(null);
      return;
    }

    const stepX = plotWidth / (firstMetric.data.length - 1 || 1);
    const index = Math.round(svgX / stepX);
    const clampedIndex = Math.max(0, Math.min(index, firstMetric.data.length - 1));

    setHoveredPoint({
      index: clampedIndex,
      x: clampedIndex * stepX + padding.left,
      y: padding.top + plotHeight / 2,
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Render empty state
  if (chartData[0]?.data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with title and controls */}
      <div className="flex items-center justify-between mb-4">
        {title && <h4 className="text-sm font-bold text-slate-900">{title}</h4>}

        {/* Chart Type Toggle (Requirement 10.9) */}
        {allowTypeToggle && (
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-md transition ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Bar Chart"
            >
              <ChartBarIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-md transition ${
                chartType === 'line'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Line Chart"
            >
              <PresentationChartLineIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-md transition ${
                chartType === 'area'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Area Chart"
            >
              <ChartBarSquareIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative bg-white rounded-lg border border-slate-200 p-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'crosshair' }}
        >
          {/* Y-axis */}
          <g>
            {yAxisLabels.map((label, index) => {
              const y = padding.top + (index / (yAxisLabels.length - 1)) * plotHeight;
              return (
                <g key={index}>
                  {/* Grid line */}
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  {/* Y-axis label */}
                  <text
                    x={padding.left - 10}
                    y={y}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    className="text-xs fill-slate-500"
                  >
                    {formatValue(label)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* X-axis labels */}
          <g>
            {chartData[0]?.data.map((point, index) => {
              const stepX = plotWidth / (chartData[0].data.length - 1 || 1);
              const x = padding.left + index * stepX;

              // Show every nth label to avoid crowding
              const showLabel = chartData[0].data.length <= 10 || index % Math.ceil(chartData[0].data.length / 10) === 0;

              if (!showLabel) return null;

              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-xs fill-slate-500"
                >
                  {point.label || point.date}
                </text>
              );
            })}
          </g>

          {/* Plot area */}
          <g clipPath="url(#plot-area)">
            <defs>
              <clipPath id="plot-area">
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={plotWidth}
                  height={plotHeight}
                />
              </clipPath>
            </defs>

            {/* Render each metric */}
            {chartData.map((metric) => {
              if (!visibleMetrics.has(metric.key)) return null;

              const metricColor = COLOR_MAP[metric.color];
              const stepX = plotWidth / (metric.data.length - 1 || 1);

              // Bar Chart
              if (chartType === 'bar') {
                const barWidth = Math.max(2, plotWidth / metric.data.length - 4);
                return (
                  <g key={metric.key}>
                    {metric.data.map((point, index) => {
                      const x = padding.left + index * stepX;
                      const valueRatio = (point.value - minValue) / (maxValue - minValue || 1);
                      const barHeight = valueRatio * plotHeight;
                      const y = padding.top + plotHeight - barHeight;

                      return (
                        <rect
                          key={index}
                          x={x - barWidth / 2}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill={metricColor.primary}
                          opacity={hoveredPoint?.index === index ? 1 : 0.8}
                        />
                      );
                    })}
                  </g>
                );
              }

              // Line Chart
              if (chartType === 'line') {
                const linePath = generateLinePath(
                  metric.data,
                  plotWidth,
                  plotHeight,
                  maxValue,
                  minValue
                );

                return (
                  <g key={metric.key} transform={`translate(${padding.left}, ${padding.top})`}>
                    <path
                      d={linePath}
                      fill="none"
                      stroke={metricColor.primary}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Data points */}
                    {metric.data.map((point, index) => {
                      const x = index * stepX;
                      const valueRatio = (point.value - minValue) / (maxValue - minValue || 1);
                      const y = plotHeight - valueRatio * plotHeight;

                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r={hoveredPoint?.index === index ? 5 : 3}
                          fill={metricColor.primary}
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </g>
                );
              }

              // Area Chart
              if (chartType === 'area') {
                const areaPath = generateAreaPath(
                  metric.data,
                  plotWidth,
                  plotHeight,
                  maxValue,
                  minValue
                );

                return (
                  <g key={metric.key} transform={`translate(${padding.left}, ${padding.top})`}>
                    <path d={areaPath} fill={metricColor.lighter} opacity="0.5" />
                    <path
                      d={generateLinePath(metric.data, plotWidth, plotHeight, maxValue, minValue)}
                      fill="none"
                      stroke={metricColor.primary}
                      strokeWidth="2"
                    />
                  </g>
                );
              }

              return null;
            })}

            {/* Trend line (Requirements 10.1, 10.2) */}
            {showTrendLine && chartData[0] && visibleMetrics.has(chartData[0].key) && (
              <g transform={`translate(${padding.left}, ${padding.top})`}>
                <path
                  d={generateTrendLinePath(
                    chartData[0].data,
                    plotWidth,
                    plotHeight,
                    maxValue,
                    minValue
                  )}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              </g>
            )}

            {/* Hover indicator (Requirement 10.3) */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={padding.top}
                x2={hoveredPoint.x}
                y2={chartHeight - padding.bottom}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            )}
          </g>
        </svg>

        {/* Interactive Tooltip (Requirement 10.3) */}
        {hoveredPoint && (
          <div
            className="absolute bg-slate-900 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none z-10"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              top: '10px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-medium mb-1">
              {chartData[0].data[hoveredPoint.index]?.date}
            </div>
            {chartData.map((metric) => {
              if (!visibleMetrics.has(metric.key)) return null;
              const point = metric.data[hoveredPoint.index];
              if (!point) return null;

              return (
                <div key={metric.key} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLOR_MAP[metric.color].primary }}
                  />
                  <span>{metric.label}:</span>
                  <span className="font-bold">{formatValue(point.value)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend for multi-metric charts (Requirement 10.10) */}
      {isMultiMetric && showLegend && (
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                visibleMetrics.has(metric.key)
                  ? 'bg-slate-100 text-slate-900'
                  : 'bg-slate-50 text-slate-400'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: visibleMetrics.has(metric.key)
                    ? COLOR_MAP[metric.color].primary
                    : '#cbd5e1',
                }}
              />
              <span className="font-medium">{metric.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
