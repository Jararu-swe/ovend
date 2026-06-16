# ConversionFunnelChart Component

## Overview

The `ConversionFunnelChart` component visualizes the customer conversion journey from store visits to completed orders for Business-tier analytics in Ovend.

## Features

✅ **Funnel Visualization** - Displays three stages: Store Visits → Orders Initiated → Orders Completed
✅ **Conversion Rates** - Shows conversion rates between each funnel stage  
✅ **Abandonment Rate** - Displays order abandonment rate with color-coded indicators
✅ **Average Fulfillment Time** - Shows time to complete orders with smart formatting
✅ **Optimization Suggestions** - Displays actionable recommendations when conversion < 2%
✅ **Loading States** - Skeleton loader for smooth data fetching UX
✅ **No Data State** - Helpful empty state when no visits exist
✅ **Responsive Design** - Works on mobile, tablet, and desktop

## Requirements Satisfied

- **Requirement 4.1**: Conversion funnel visualization (visits → orders initiated → orders completed)
- **Requirement 4.2**: Display conversion rates between stages
- **Requirement 4.3**: Display visit-to-order conversion rate
- **Requirement 4.4**: Display order completion rate  
- **Requirement 4.5**: Display abandonment rate
- **Requirement 4.6**: Show average time to fulfillment
- **Requirement 4.7**: Display optimization suggestion when conversion < 2%

## Usage

```tsx
import { ConversionFunnelChart } from '@/app/ui/analytics';
import { fetchConversionFunnel } from '@/app/lib/business-analytics';

export async function MyAnalyticsDashboard({ vendorId }: { vendorId: string }) {
  const funnel = await fetchConversionFunnel(vendorId, {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  });

  return <ConversionFunnelChart funnel={funnel} />;
}
```

## Props

```typescript
interface ConversionFunnelChartProps {
  funnel: ConversionFunnel;
  isLoading?: boolean;
}
```

### ConversionFunnel Type

```typescript
type ConversionFunnel = {
  visits: number;
  ordersInitiated: number;
  ordersCompleted: number;
  visitToOrderRate: number;         // Percentage
  orderCompletionRate: number;      // Percentage
  abandonmentRate: number;          // Percentage
  avgTimeToFulfillment: number;     // Hours
};
```

## Visual Design

### Funnel Stages
- **Store Visits** - Blue (#3B82F6)
- **Orders Initiated** - Purple (#A855F7)
- **Orders Completed** - Emerald (#10B981)

### Abandonment Rate Colors
- **Green** (<30%) - Good performance
- **Amber** (30-50%) - Needs attention
- **Red** (>50%) - Critical issue

### Fulfillment Time Formatting
- `< 1 hour` → "30 minutes"
- `< 24 hours` → "12.5 hours"
- `≥ 24 hours` → "2d 1h"
- `0 hours` → "N/A"

## Testing

The component has comprehensive test coverage (24 tests):

```bash
npm test conversion-funnel-chart.test.tsx
```

All tests passing ✓

### Test Coverage
- Fulfillment time formatting (4 tests)
- Percentage calculations (3 tests)
- Optimization suggestion logic (4 tests)
- Funnel data validation (3 tests)
- Abandonment rate calculations (3 tests)
- Requirements validation (7 tests)

## Implementation Details

### Files Created
1. `conversion-funnel-chart.tsx` - Main component (260 lines)
2. `conversion-funnel-chart.test.tsx` - Unit tests (24 tests)
3. `conversion-funnel-chart.example.tsx` - Usage examples
4. Updated `index.ts` - Added export

### Data Source
The component uses the `fetchConversionFunnel` function from `@/app/lib/business-analytics.ts` which:
- Queries the `store_analytics` table for visits
- Queries the `orders` table for initiated and completed orders
- Calculates conversion rates and fulfillment times
- Includes caching with 5-minute TTL

## Next Steps

To integrate into the Business Analytics Dashboard:

1. Import the component in your dashboard page
2. Fetch conversion funnel data using `fetchConversionFunnel`
3. Pass the data to the component as a prop
4. Add to the dashboard layout alongside other analytics components

See `conversion-funnel-chart.example.tsx` for complete integration examples.

## Notes

- Component is Business-tier exclusive (requires subscription tier check)
- Optimized for performance with caching
- Fully responsive and accessible
- Compatible with Next.js App Router and React Server Components
