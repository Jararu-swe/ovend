import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimeRangeSelector from './time-range-selector';

// Mock react-datepicker since it requires DOM
vi.mock('react-datepicker', () => ({
  default: ({ selected, onChange, inline }: any) => (
    <div data-testid="date-picker">
      <button onClick={() => onChange(new Date('2024-01-15'))}>
        Select Date: {selected?.toISOString()}
      </button>
    </div>
  ),
}));

describe('TimeRangeSelector component rendering', () => {
  it('renders all four time range buttons', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TimeRangeSelector
        value="7d"
        onChange={mockOnChange}
      />
    );
    
    // Check that all four buttons are present
    expect(screen.getByText('7 Days')).toBeDefined();
    expect(screen.getByText('30 Days')).toBeDefined();
    expect(screen.getByText('90 Days')).toBeDefined();
    expect(screen.getByText('Custom Range')).toBeDefined();
  });
  
  it('highlights the selected range button', () => {
    const mockOnChange = vi.fn();
    
    const { container } = render(
      <TimeRangeSelector
        value="30d"
        onChange={mockOnChange}
      />
    );
    
    const buttons = container.querySelectorAll('button');
    const thirtyDayButton = Array.from(buttons).find(
      btn => btn.textContent === '30 Days'
    );
    
    // Check that the 30d button has the active styling
    expect(thirtyDayButton?.className).toContain('bg-emerald-600');
    expect(thirtyDayButton?.className).toContain('text-white');
  });
  
  it('shows custom range label when custom date is selected', () => {
    const mockOnChange = vi.fn();
    const customRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    };
    
    render(
      <TimeRangeSelector
        value="custom"
        customRange={customRange}
        onChange={mockOnChange}
      />
    );
    
    // Should show formatted date range instead of "Custom Range"
    const customButton = screen.getByText(/Jan 1/);
    expect(customButton).toBeDefined();
  });
  
  it('provides onChange callback when range is selected', () => {
    const mockOnChange = vi.fn();
    
    render(
      <TimeRangeSelector
        value="7d"
        onChange={mockOnChange}
      />
    );
    
    // Click the 30 Days button
    const thirtyDayButton = screen.getByText('30 Days');
    thirtyDayButton.click();
    
    // Verify onChange was called with correct range
    expect(mockOnChange).toHaveBeenCalledWith('30d');
  });
});
