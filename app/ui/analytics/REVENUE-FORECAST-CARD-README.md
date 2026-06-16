# RevenueForecastCard Component

## Overview

The `RevenueForecastCard` component displays a 30-day revenue projection for Business-tier vendors. It uses linear regression on historical data to forecast future revenue, provides confidence indicators, and detects seasonal patterns.

## Features

- **30-Day Revenue Projection**: Shows forecasted revenue for the next 30 days
- **Confidence Indicators**: 
  - High (90+ days of data)
  - Medium (30-89 days)
  - Low (<30 days)
- **Interactive Chart**: Visualizes daily revenue projections with trend line
- **Seasonal Detection**: Identifies when current month typically performs above/below average
- **Insufficient Data Handling**: Displays helpful message when <30 days of historical data
- **Loading States**: Shows skeleton loader during data fetch
- **Professional UI**: Matches Ovend design system with emerald accents

## Props

```typescript
interface RevenueForecastCardProps {
  forecast: RevenueForecast | InsufficientForecastDataError;
  isLoading?: boolean;
}
```

### `forecast`

Either a `RevenueForecast` object or an `InsufficientForecastDataError`:

**RevenueForecast:**
```typescript
type RevenueForecast = {
  forecastedRevenue: number;           // Total projected revenue in kobo
  confidence: 'high' | 'medium' | 'low'; // Confidence level
  historicalDays: number;              // Days of historical data used
  dailyProjections: Array<{            // Daily breakdown
    date: string;                      // ISO date (YYYY-MM-DD)
    projected: number;                 // Projected revenue in kobo
  }>;
  seasonalTrend: 'above' | 'below' | 'average' | null; // Seasonal pattern
};
```

**InsufficientForecastDataError:**
```typescript
type InsufficientForecastDataError = {
  type: 'insufficient_forecast_data';
  message: string;                     // User-friendly message
  suggestion: string;                  // What to do next
  historicalDays: number;              // Current data span
};
```

### `isLoading`

Optional boolean to show loading skeleton. Default: `false`

## Usage

### Basic Usage (React Server Component)

```tsx
import { RevenueForecastCard } from '@/app/ui/analytics';
import { calculateRevenueForecast } from '@/app/lib/business-analytics';

export default async function AnalyticsPage({ vendorId }: { vendorId: string }) {
  const forecast = await calculateRevenueForecast(vendorId);
  
  return <RevenueForecastCard forecast={forecast} />;
}
```

### With Loading State

```tsx
'use client';

import { useState, useEffect } from 'react';
import { RevenueForecastCard } from '@/app/ui/analytics';

export default function ForecastSection({ vendorId }: { vendorId: string }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await calculateRevenueForecast(vendorId);
      setForecast(data);
      setLoading(false);
    }
    fetchData();
  }, [vendorId]);

  return <RevenueForecastCard forecast={forecast!} isLoading={loading} />;
}
```

### In Analytics Dashboard

```tsx
import { 
  AnalyticsSummaryCards, 
  ConversionFunnelChart,
  RevenueForecastCard 
} from '@/app/ui/analytics';

export default async function BusinessAnalyticsDashboard({ 
  vendorId 
}: { 
  vendorId: string 
}) {
  const forecast = await calculateRevenueForecast(vendorId);
  const summary = await fetchAnalyticsSummary(vendorId, dateRange);
  const funnel = await fetchConversionFunnel(vendorId, dateRange);

  return (
    <div className="space-y-6">
      <AnalyticsSummaryCards summary={summary} />
      <RevenueForecastCard forecast={forecast} />
      <ConversionFunnelChart funnel={funnel} />
    </div>
  );
}
```

## Visual States

### 1. High Confidence Forecast

Shows when vendor has 90+ days of data:
- Green "High Confidence" badge
- Full 30-day chart with trend line
- Seasonal indicator (if detected)
- Detailed forecast information

### 2. Medium Confidence Forecast

Shows when vendor has 30-89 days of data:
- Amber "Medium Confidence" badge
- 30-day projection with note about improving accuracy
- Seasonal indicator may or may not be present

### 3. Low Confidence Forecast

Shows when vendor has <30 days of data but forecast is still generated:
- Gray "Low Confidence" badge
- 30-day projection with warning note
- Recommendation to accumulate 90+ days for better accuracy
- No seasonal detection

### 4. Insufficient Data

Shows when vendor has <30 days of data (forecast cannot be generated):
- Empty state icon
- Clear message explaining requirement
- Motivational suggestion to keep taking orders
- Current vs. required data comparison

### 5. Loading State

Shows while data is being fetched:
- Animated skeleton placeholders
- Matches component structure

## Confidence Levels

| Confidence | Historical Data | Badge Color | Description |
|------------|----------------|-------------|-------------|
| High       | 90+ days       | Green       | Most accurate forecast |
| Medium     | 30-89 days     | Amber       | Reasonably accurate |
| Low        | 15-29 days     | Gray        | Limited accuracy |
| None       | <15 days       | -           | Cannot generate forecast |

## Seasonal Trends

Detected when same-month revenue varies by >20% from annual average:

- **📈 Seasonal High** (above): Month typically performs >20% above average
- **📉 Seasonal Low** (below): Month typically performs >20% below average
- **➡️ Average Season**: Month performs within 20% of average
- **No indicator**: Insufficient multi-year data or no clear pattern

## Chart Visualization

The component includes a simple line chart showing:
- **X-axis**: Dates (start, middle, end of projection period)
- **Y-axis**: Revenue amounts (min and max from projections)
- **Trend line**: Green line showing daily projections
- **Fill area**: Gradient fill under the line for visual emphasis
- **Grid lines**: Subtle horizontal lines for value reference

## Styling

The component follows Ovend's design system:
- **Primary color**: Emerald (green) for revenue/growth
- **Card style**: White background, rounded corners, subtle shadow
- **Typography**: Bold headings, regular body text
- **Spacing**: Consistent padding and margins
- **Responsive**: Works on mobile and desktop

## Requirements Validated

This component validates the following requirements from the Business-tier Advanced Analytics specification:

- **Requirement 6.1**: Display 30-day revenue forecast
- **Requirement 6.3**: Show confidence indicator based on data span
- **Requirement 6.4**: Calculate confidence levels (High/Medium/Low)
- **Requirement 6.5**: Display chart with projected trend line
- **Requirement 6.7**: Detect and display seasonal trends
- **Requirement 6.9**: Handle insufficient data (<30 days) with message
- **Requirement 6.10**: Display forecast assumptions and data range

## Testing

Run tests with:

```bash
npm test revenue-forecast-card.test.tsx
```

Tests cover:
- Confidence badge calculation logic
- Seasonal indicator determination
- Currency formatting
- Data validation
- Chart data processing
- Different forecast states

## Example Data

See `revenue-forecast-card.example.tsx` for complete usage examples including:
- Different confidence levels
- Seasonal patterns
- Insufficient data state
- Loading states
- Integration patterns

## Related Components

- **AnalyticsSummaryCards**: Summary metrics cards
- **ConversionFunnelChart**: Conversion funnel visualization
- **TimeRangeSelector**: Time range picker

## Data Source

The component receives data from:
- `calculateRevenueForecast()` in `app/lib/business-analytics.ts`
- Uses linear regression on last 90 days of daily revenue
- Cached for 24 hours to reduce database load

## Browser Compatibility

Works in all modern browsers that support:
- SVG rendering
- CSS Grid
- Flexbox
- ES6+

## Accessibility

- Semantic HTML structure
- Color is not the only indicator (icons + text)
- ARIA labels on interactive elements
- Keyboard navigable
- Screen reader friendly

## Performance

- Lightweight SVG chart (no external charting library)
- Efficient rendering with React
- Loading states prevent layout shift
- Cached data reduces server load

## Future Enhancements

Potential improvements for future versions:
- Interactive chart with tooltips on hover
- Export forecast data as CSV
- Compare forecast vs. actual revenue
- Adjustable confidence interval display
- Machine learning-based forecasting
- Multi-currency support
