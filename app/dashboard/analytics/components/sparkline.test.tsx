import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Sparkline, { SparklineDataPoint } from './sparkline';

describe('Sparkline Component', () => {
  const mockData: SparklineDataPoint[] = [
    { value: 10 },
    { value: 20 },
    { value: 15 },
    { value: 30 },
    { value: 25 },
  ];

  describe('Rendering', () => {
    it('renders sparkline with data', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('renders empty state with no data', () => {
      const { container } = render(<Sparkline data={[]} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      // Should show a dashed line for empty state
      const dashedLine = container.querySelector('line[stroke-dasharray="2,2"]');
      expect(dashedLine).toBeTruthy();
    });

    it('applies correct width', () => {
      const { container } = render(<Sparkline data={mockData} width={100} />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('100');
    });

    it('applies correct height', () => {
      const { container } = render(<Sparkline data={mockData} height={32} />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('height')).toBe('32');
    });

    it('uses default dimensions when not specified', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('80');
      expect(svg?.getAttribute('height')).toBe('24');
    });
  });

  describe('Color Coding (Requirement 10.4)', () => {
    it('applies blue color correctly', () => {
      const { container } = render(<Sparkline data={mockData} color="blue" />);
      const path = container.querySelector('path[stroke="#3b82f6"]');
      expect(path).toBeTruthy();
    });

    it('applies green color correctly', () => {
      const { container } = render(<Sparkline data={mockData} color="green" />);
      const path = container.querySelector('path[stroke="#10b981"]');
      expect(path).toBeTruthy();
    });

    it('applies purple color correctly', () => {
      const { container } = render(<Sparkline data={mockData} color="purple" />);
      const path = container.querySelector('path[stroke="#8b5cf6"]');
      expect(path).toBeTruthy();
    });

    it('applies red color correctly', () => {
      const { container } = render(<Sparkline data={mockData} color="red" />);
      const path = container.querySelector('path[stroke="#ef4444"]');
      expect(path).toBeTruthy();
    });

    it('applies orange color correctly', () => {
      const { container } = render(<Sparkline data={mockData} color="orange" />);
      const path = container.querySelector('path[stroke="#f97316"]');
      expect(path).toBeTruthy();
    });

    it('uses blue as default color', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const path = container.querySelector('path[stroke="#3b82f6"]');
      expect(path).toBeTruthy();
    });
  });

  describe('Area Fill', () => {
    it('shows area fill when showArea is true', () => {
      const { container } = render(<Sparkline data={mockData} showArea={true} />);
      const areaPath = container.querySelector('path[fill]');
      expect(areaPath).toBeTruthy();
      expect(areaPath?.getAttribute('opacity')).toBe('0.3');
    });

    it('hides area fill when showArea is false', () => {
      const { container } = render(<Sparkline data={mockData} showArea={false} />);
      const areaPaths = Array.from(container.querySelectorAll('path')).filter(
        (path) => path.getAttribute('fill') && path.getAttribute('fill') !== 'none'
      );
      expect(areaPaths.length).toBe(0);
    });

    it('shows area fill by default', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const areaPath = container.querySelector('path[opacity="0.3"]');
      expect(areaPath).toBeTruthy();
    });
  });

  describe('Trend Indicator', () => {
    it('shows upward trend indicator for increasing values', () => {
      const upwardData: SparklineDataPoint[] = [
        { value: 10 },
        { value: 20 },
        { value: 30 },
        { value: 40 },
        { value: 50 },
      ];
      const { container } = render(<Sparkline data={upwardData} showTrend={true} />);
      expect(container.textContent).toContain('↑');
    });

    it('shows downward trend indicator for decreasing values', () => {
      const downwardData: SparklineDataPoint[] = [
        { value: 50 },
        { value: 40 },
        { value: 30 },
        { value: 20 },
        { value: 10 },
      ];
      const { container } = render(<Sparkline data={downwardData} showTrend={true} />);
      expect(container.textContent).toContain('↓');
    });

    it('does not show trend indicator for stable values', () => {
      const stableData: SparklineDataPoint[] = [
        { value: 100 },
        { value: 101 },
        { value: 99 },
        { value: 100 },
        { value: 101 },
      ];
      const { container } = render(<Sparkline data={stableData} showTrend={true} />);
      expect(container.textContent).not.toContain('↑');
      expect(container.textContent).not.toContain('↓');
    });

    it('hides trend indicator when showTrend is false', () => {
      const upwardData: SparklineDataPoint[] = [
        { value: 10 },
        { value: 50 },
      ];
      const { container } = render(<Sparkline data={upwardData} showTrend={false} />);
      expect(container.textContent).not.toContain('↑');
      expect(container.textContent).not.toContain('↓');
    });

    it('applies correct color to upward trend', () => {
      const upwardData: SparklineDataPoint[] = [
        { value: 10 },
        { value: 50 },
      ];
      const { container } = render(<Sparkline data={upwardData} showTrend={true} />);
      const trendSpan = container.querySelector('.text-emerald-600');
      expect(trendSpan).toBeTruthy();
    });

    it('applies correct color to downward trend', () => {
      const downwardData: SparklineDataPoint[] = [
        { value: 50 },
        { value: 10 },
      ];
      const { container } = render(<Sparkline data={downwardData} showTrend={true} />);
      const trendSpan = container.querySelector('.text-red-600');
      expect(trendSpan).toBeTruthy();
    });
  });

  describe('Path Generation', () => {
    it('generates valid SVG path for line', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const linePath = container.querySelector('path[fill="none"]');
      expect(linePath).toBeTruthy();
      const pathData = linePath?.getAttribute('d');
      expect(pathData).toContain('M');
      expect(pathData).toContain('L');
    });

    it('generates valid SVG path for area', () => {
      const { container } = render(<Sparkline data={mockData} showArea={true} />);
      const areaPaths = container.querySelectorAll('path');
      expect(areaPaths.length).toBeGreaterThan(0);
    });

    it('scales values correctly to fit dimensions', () => {
      const { container } = render(<Sparkline data={mockData} width={100} height={50} />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('100');
      expect(svg?.getAttribute('height')).toBe('50');
    });
  });

  describe('Edge Cases', () => {
    it('handles single data point', () => {
      const singlePoint: SparklineDataPoint[] = [{ value: 42 }];
      const { container } = render(<Sparkline data={singlePoint} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('handles two data points', () => {
      const twoPoints: SparklineDataPoint[] = [
        { value: 10 },
        { value: 20 },
      ];
      const { container } = render(<Sparkline data={twoPoints} />);
      const linePath = container.querySelector('path[fill="none"]');
      expect(linePath).toBeTruthy();
    });

    it('handles all same values', () => {
      const sameValues: SparklineDataPoint[] = [
        { value: 50 },
        { value: 50 },
        { value: 50 },
      ];
      const { container } = render(<Sparkline data={sameValues} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('handles zero values', () => {
      const zeroData: SparklineDataPoint[] = [
        { value: 0 },
        { value: 0 },
        { value: 0 },
      ];
      const { container } = render(<Sparkline data={zeroData} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('handles negative values', () => {
      const negativeData: SparklineDataPoint[] = [
        { value: -10 },
        { value: 0 },
        { value: 10 },
      ];
      const { container } = render(<Sparkline data={negativeData} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('handles very large values', () => {
      const largeData: SparklineDataPoint[] = [
        { value: 1000000 },
        { value: 2000000 },
        { value: 1500000 },
      ];
      const { container } = render(<Sparkline data={largeData} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('handles many data points', () => {
      const manyPoints: SparklineDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        value: Math.sin(i / 10) * 50 + 50,
      }));
      const { container } = render(<Sparkline data={manyPoints} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('Visual Attributes', () => {
    it('uses correct stroke width for line', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const linePath = container.querySelector('path[fill="none"]');
      expect(linePath?.getAttribute('stroke-width')).toBe('1.5');
    });

    it('uses rounded line caps', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const linePath = container.querySelector('path[fill="none"]');
      expect(linePath?.getAttribute('stroke-linecap')).toBe('round');
    });

    it('uses rounded line joins', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const linePath = container.querySelector('path[fill="none"]');
      expect(linePath?.getAttribute('stroke-linejoin')).toBe('round');
    });
  });

  describe('Integration', () => {
    it('can be used inline with text', () => {
      const { container } = render(
        <div>
          Revenue: $1,234
          <Sparkline data={mockData} />
        </div>
      );
      expect(container.textContent).toContain('Revenue: $1,234');
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('maintains inline-flex display', () => {
      const { container } = render(<Sparkline data={mockData} />);
      const wrapper = container.querySelector('.inline-flex');
      expect(wrapper).toBeTruthy();
    });
  });
});
