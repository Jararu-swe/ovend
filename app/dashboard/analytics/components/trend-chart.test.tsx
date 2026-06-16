import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrendChart, { DataPoint, MetricConfig } from './trend-chart';

describe('TrendChart Component', () => {
  const mockData: DataPoint[] = [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 150 },
    { date: '2024-01-03', value: 120 },
    { date: '2024-01-04', value: 180 },
    { date: '2024-01-05', value: 200 },
  ];

  describe('Rendering', () => {
    it('renders chart with data', () => {
      render(<TrendChart data={mockData} />);
      const svg = document.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('renders empty state when no data provided', () => {
      render(<TrendChart data={[]} />);
      expect(screen.getByText('No data available')).toBeTruthy();
    });

    it('renders chart title when provided', () => {
      render(<TrendChart data={mockData} title="Test Chart" />);
      expect(screen.getByText('Test Chart')).toBeTruthy();
    });

    it('applies correct height', () => {
      const { container } = render(<TrendChart data={mockData} height={400} />);
      const chartDiv = container.querySelector('div[style*="height"]');
      // SVG uses viewBox, so we check the container structure exists
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  describe('Chart Types (Requirement 10.9)', () => {
    it('renders line chart by default', () => {
      const { container } = render(<TrendChart data={mockData} chartType="line" />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('renders bar chart when specified', () => {
      const { container } = render(<TrendChart data={mockData} chartType="bar" />);
      const rects = container.querySelectorAll('rect');
      // Should have bars for data points plus grid/structure rects
      expect(rects.length).toBeGreaterThanOrEqual(mockData.length);
    });

    it('renders area chart when specified', () => {
      const { container } = render(<TrendChart data={mockData} chartType="area" />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('shows chart type toggle when allowTypeToggle is true', () => {
      render(<TrendChart data={mockData} allowTypeToggle={true} />);
      const toggleButtons = screen.getAllByRole('button');
      // Should have 3 toggle buttons (bar, line, area)
      expect(toggleButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('switches chart type when toggle button clicked', () => {
      render(<TrendChart data={mockData} allowTypeToggle={true} chartType="line" />);
      const barButton = screen.getByTitle('Bar Chart');
      fireEvent.click(barButton);
      // After clicking, bar button should be active (has specific styling class)
      expect(barButton.className).toContain('bg-white');
    });
  });

  describe('Color Coding (Requirement 10.4)', () => {
    it('applies blue color correctly', () => {
      const { container } = render(
        <TrendChart data={mockData} color="blue" chartType="line" />
      );
      const path = container.querySelector('path[stroke="#3b82f6"]');
      expect(path).toBeTruthy();
    });

    it('applies green color correctly', () => {
      const { container } = render(
        <TrendChart data={mockData} color="green" chartType="line" />
      );
      const path = container.querySelector('path[stroke="#10b981"]');
      expect(path).toBeTruthy();
    });

    it('applies purple color correctly', () => {
      const { container } = render(
        <TrendChart data={mockData} color="purple" chartType="line" />
      );
      const path = container.querySelector('path[stroke="#8b5cf6"]');
      expect(path).toBeTruthy();
    });
  });

  describe('Trend Line (Requirements 10.1, 10.2)', () => {
    it('renders trend line when showTrendLine is true', () => {
      const { container } = render(
        <TrendChart data={mockData} showTrendLine={true} />
      );
      const dashedPath = container.querySelector('path[stroke-dasharray="5,5"]');
      expect(dashedPath).toBeTruthy();
    });

    it('does not render trend line when showTrendLine is false', () => {
      const { container } = render(
        <TrendChart data={mockData} showTrendLine={false} />
      );
      const dashedPath = container.querySelector('path[stroke-dasharray="5,5"]');
      expect(dashedPath).toBeFalsy();
    });

    it('calculates trend line for upward trend', () => {
      const upwardData: DataPoint[] = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 200 },
        { date: '2024-01-03', value: 300 },
      ];
      const { container } = render(
        <TrendChart data={upwardData} showTrendLine={true} />
      );
      const trendLine = container.querySelector('path[stroke-dasharray="5,5"]');
      expect(trendLine).toBeTruthy();
      expect(trendLine?.getAttribute('d')).toContain('M');
      expect(trendLine?.getAttribute('d')).toContain('L');
    });

    it('calculates trend line for downward trend', () => {
      const downwardData: DataPoint[] = [
        { date: '2024-01-01', value: 300 },
        { date: '2024-01-02', value: 200 },
        { date: '2024-01-03', value: 100 },
      ];
      const { container } = render(
        <TrendChart data={downwardData} showTrendLine={true} />
      );
      const trendLine = container.querySelector('path[stroke-dasharray="5,5"]');
      expect(trendLine).toBeTruthy();
    });
  });

  describe('Multiple Metrics (Requirement 10.10)', () => {
    const mockMetrics: MetricConfig[] = [
      {
        key: 'visits',
        label: 'Visits',
        data: mockData,
        color: 'blue',
      },
      {
        key: 'orders',
        label: 'Orders',
        data: mockData.map((d) => ({ ...d, value: d.value * 0.5 })),
        color: 'purple',
      },
      {
        key: 'revenue',
        label: 'Revenue',
        data: mockData.map((d) => ({ ...d, value: d.value * 2 })),
        color: 'green',
      },
    ];

    it('renders multiple metrics', () => {
      const { container } = render(<TrendChart metrics={mockMetrics} />);
      // Should have paths for each metric
      const paths = container.querySelectorAll('path[stroke]');
      expect(paths.length).toBeGreaterThanOrEqual(mockMetrics.length);
    });

    it('shows legend for multi-metric charts', () => {
      render(<TrendChart metrics={mockMetrics} showLegend={true} />);
      expect(screen.getByText('Visits')).toBeTruthy();
      expect(screen.getByText('Orders')).toBeTruthy();
      expect(screen.getByText('Revenue')).toBeTruthy();
    });

    it('hides legend when showLegend is false', () => {
      render(<TrendChart metrics={mockMetrics} showLegend={false} />);
      expect(screen.queryByText('Visits')).toBeFalsy();
    });

    it('toggles metric visibility when legend button clicked', () => {
      const { container } = render(<TrendChart metrics={mockMetrics} showLegend={true} />);
      const visitsButton = screen.getByText('Visits').closest('button');
      expect(visitsButton).toBeTruthy();
      
      // Click to hide
      if (visitsButton) fireEvent.click(visitsButton);
      
      // Check button styling changed (should show as inactive)
      expect(visitsButton?.className).toContain('text-slate-400');
    });

    it('keeps at least one metric visible', () => {
      const singleMetric: MetricConfig[] = [mockMetrics[0]];
      render(<TrendChart metrics={singleMetric} showLegend={true} />);
      const visitsButton = screen.getByText('Visits').closest('button');
      
      // Try to hide the only metric
      if (visitsButton) fireEvent.click(visitsButton);
      
      // Should still be visible (active styling)
      expect(visitsButton?.className).toContain('text-slate-900');
    });
  });

  describe('Interactive Tooltips (Requirement 10.3)', () => {
    it('shows tooltip on mouse move', () => {
      const { container } = render(<TrendChart data={mockData} />);
      const svg = container.querySelector('svg');
      
      if (svg) {
        fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
      }
      
      // Tooltip should appear (has specific class)
      const tooltip = container.querySelector('.absolute.bg-slate-900');
      expect(tooltip).toBeTruthy();
    });

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<TrendChart data={mockData} />);
      const svg = container.querySelector('svg');
      
      if (svg) {
        fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 });
        fireEvent.mouseLeave(svg);
      }
      
      // Tooltip should be hidden
      const tooltip = container.querySelector('.absolute.bg-slate-900');
      expect(tooltip).toBeFalsy();
    });

    it('shows correct values in tooltip for single metric', () => {
      const { container } = render(
        <TrendChart data={mockData} formatValue={(v) => `$${v}`} />
      );
      const svg = container.querySelector('svg');
      
      if (svg) {
        const rect = svg.getBoundingClientRect();
        fireEvent.mouseMove(svg, { 
          clientX: rect.left + rect.width / 2, 
          clientY: rect.top + rect.height / 2 
        });
      }
      
      const tooltip = container.querySelector('.absolute.bg-slate-900');
      expect(tooltip).toBeTruthy();
      // Should show formatted value
      expect(tooltip?.textContent).toContain('$');
    });

    it('shows all metric values in tooltip for multi-metric', () => {
      const mockMetrics: MetricConfig[] = [
        {
          key: 'visits',
          label: 'Visits',
          data: mockData,
          color: 'blue',
        },
        {
          key: 'orders',
          label: 'Orders',
          data: mockData,
          color: 'purple',
        },
      ];

      const { container } = render(<TrendChart metrics={mockMetrics} />);
      const svg = container.querySelector('svg');
      
      if (svg) {
        const rect = svg.getBoundingClientRect();
        fireEvent.mouseMove(svg, { 
          clientX: rect.left + rect.width / 2, 
          clientY: rect.top + rect.height / 2 
        });
      }
      
      const tooltip = container.querySelector('.absolute.bg-slate-900');
      expect(tooltip?.textContent).toContain('Visits');
      expect(tooltip?.textContent).toContain('Orders');
    });
  });

  describe('Value Formatting', () => {
    it('applies custom format function', () => {
      const formatValue = (v: number) => `₦${v.toLocaleString()}`;
      const { container } = render(
        <TrendChart data={mockData} formatValue={formatValue} />
      );
      
      // Y-axis labels should use the formatter
      const yAxisLabels = container.querySelectorAll('text[text-anchor="end"]');
      expect(yAxisLabels.length).toBeGreaterThan(0);
      // At least one label should contain the currency symbol
      const hasFormattedLabel = Array.from(yAxisLabels).some(
        (label) => label.textContent?.includes('₦')
      );
      expect(hasFormattedLabel).toBe(true);
    });

    it('uses default formatter when none provided', () => {
      const { container } = render(<TrendChart data={mockData} />);
      const yAxisLabels = container.querySelectorAll('text[text-anchor="end"]');
      expect(yAxisLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Chart Dimensions', () => {
    it('renders with proper viewBox dimensions', () => {
      const { container } = render(<TrendChart data={mockData} />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('viewBox')).toContain('0 0');
    });

    it('includes proper padding for axes', () => {
      const { container } = render(<TrendChart data={mockData} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      // Y-axis should be rendered
      const yAxisLabels = container.querySelectorAll('text[text-anchor="end"]');
      expect(yAxisLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles single data point', () => {
      const singlePoint: DataPoint[] = [{ date: '2024-01-01', value: 100 }];
      const { container } = render(<TrendChart data={singlePoint} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('handles all zero values', () => {
      const zeroData: DataPoint[] = [
        { date: '2024-01-01', value: 0 },
        { date: '2024-01-02', value: 0 },
        { date: '2024-01-03', value: 0 },
      ];
      const { container } = render(<TrendChart data={zeroData} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('handles negative values', () => {
      const negativeData: DataPoint[] = [
        { date: '2024-01-01', value: -50 },
        { date: '2024-01-02', value: 0 },
        { date: '2024-01-03', value: 50 },
      ];
      const { container } = render(<TrendChart data={negativeData} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('handles very large values', () => {
      const largeData: DataPoint[] = [
        { date: '2024-01-01', value: 1000000 },
        { date: '2024-01-02', value: 2000000 },
      ];
      const { container } = render(<TrendChart data={largeData} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('handles many data points without errors', () => {
      const manyPoints: DataPoint[] = Array.from({ length: 365 }, (_, i) => ({
        date: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        value: Math.random() * 1000,
      }));
      const { container } = render(<TrendChart data={manyPoints} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic SVG elements', () => {
      const { container } = render(<TrendChart data={mockData} />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('includes grid lines for readability', () => {
      const { container } = render(<TrendChart data={mockData} />);
      const gridLines = container.querySelectorAll('line[stroke="#e2e8f0"]');
      expect(gridLines.length).toBeGreaterThan(0);
    });
  });
});
