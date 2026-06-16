# Business Analytics Components

This directory contains UI components for the Business-tier Advanced Analytics feature.

## Components

### GeographicInsights

Displays geographic analytics showing top cities and states by orders and revenue.

**Features:**
- ✅ Top 10 cities by orders and revenue (Req 9.1, 9.2, 9.3)
- ✅ State-level breakdown with percentages (Req 9.5, 9.6)
- ✅ Filter controls for city/state filtering (Req 9.8, 9.9)
- ✅ Insufficient data message (<10 orders) (Req 9.7)
- ✅ Highlights vendor's primary state (Req 9.10)
- ✅ Toggle between orders and revenue views
- ✅ Click-to-filter functionality

**Files:**
- `geographic-insights.tsx` - Client component (UI)
- `geographic-insights-wrapper.tsx` - Server component wrapper (data fetching)
- `geographic-insights.test.tsx` - Unit tests
- `geographic-insights-example.tsx` - Usage examples

**Props:**

```typescript
interface GeographicInsightsProps {
  insights: GeographicInsight[];     // Array of city/state data
  vendorState: string | null;        // Vendor's primary state (for highlighting)
  onFilterChange?: (filter) => void; // Callback when filter is applied
}
```

**Usage:**

```typescript
import GeographicInsightsWrapper from './components/geographic-insights-wrapper';

<GeographicInsightsWrapper
  vendorId={vendorId}
  dateRange={{ startDate: '2024-01-01', endDate: '2024-01-31' }}
  onFilterChange={(filter) => {
    // Apply filter to all analytics
  }}
/>
```

**Testing:**

```bash
npx vitest run app/dashboard/analytics/components/geographic-insights.test.tsx
```

---

### RealTimeDashboard

Displays today's performance metrics with live updates every 30 seconds.

**Features:**
- ✅ Today's visits, orders, and revenue (Req 8.1)
- ✅ Comparison with yesterday at same time (Req 8.3)
- ✅ Comparison with same weekday last week (Req 8.5)
- ✅ Pace indicator (ahead/behind/on-track) (Req 8.8)
- ✅ Last hour order count (Req 8.10)
- ✅ Last update timestamp (Req 8.6)
- ✅ Auto-refresh every 30 seconds (Req 8.10)
- ✅ Loading skeleton and error states

**Files:**
- `real-time-dashboard.tsx` - Client component with polling
- `real-time-dashboard.test.tsx` - Unit tests
- `real-time-dashboard.example.tsx` - Usage examples

**Props:**

```typescript
interface RealTimeDashboardProps {
  vendorId: string;  // Vendor's unique identifier
}
```

**Usage:**

```typescript
import RealTimeDashboard from './components/real-time-dashboard';

<RealTimeDashboard vendorId={session.user.id} />
```

**API Requirements:**

The component polls `/api/analytics/real-time?vendorId={vendorId}` every 30 seconds.

Expected response:
```typescript
{
  todayVisits: number,
  todayOrders: number,
  todayRevenue: number, // in kobo
  lastHourOrders: number,
  comparisonYesterday: {
    visits: number,
    orders: number,
    revenue: number
  },
  comparisonLastWeek: {
    visits: number,
    orders: number,
    revenue: number
  },
  paceIndicator: 'ahead' | 'behind' | 'on-track',
  lastUpdate: string // e.g., "2:30 PM"
}
```

**Testing:**

```bash
npx vitest run app/dashboard/analytics/components/real-time-dashboard.test.tsx
```

**Note:** Task 9.5 will implement the `/api/analytics/real-time` API endpoint that this component depends on.

## Requirements Validation

### Task 7.7: Geographic Insights
- [x] **Req 9.1** - Display geographic insights when location data available
- [x] **Req 9.2** - Show top 10 cities by order count
- [x] **Req 9.3** - Show top 10 cities by revenue
- [x] **Req 9.5** - Display state-level breakdown
- [x] **Req 9.7** - Show insufficient data message when <10 orders
- [x] **Req 9.8** - Add filter controls to apply filters
- [x] **Req 9.10** - Highlight vendor's primary location state

### Task 7.8: Real-Time Dashboard
- [x] **Req 8.1** - Display today's visits, orders, and revenue
- [x] **Req 8.2** - Poll /api/analytics/real-time endpoint
- [x] **Req 8.3** - Compare with yesterday at same time
- [x] **Req 8.5** - Compare with same weekday last week
- [x] **Req 8.6** - Show last update timestamp
- [x] **Req 8.8** - Display pace indicator
- [x] **Req 8.10** - Show last hour orders and poll every 30 seconds

## Design Patterns

### Client/Server Split
- **Server Component** (`-wrapper.tsx`): Fetches data from database
- **Client Component** (`.tsx`): Handles interactivity (view toggle, filters)

### Polling Pattern (RealTimeDashboard)
- Uses `useEffect` with `setInterval` for 30-second polling
- Cleans up interval on component unmount
- Continues polling even after errors (auto-recovery)

### Error Handling
- Empty data → Displays helpful message with suggestions
- Missing vendor state → Component works without highlighting
- Parse errors → Gracefully handled by `extractLocationFromAddress()`
- Network errors → Shows error state with retry button

### Performance
- State aggregation happens client-side (lightweight)
- Sorting is done in-memory (fast for top 10)
- No unnecessary re-renders (React memo opportunities)
- Polling happens in background without blocking UI

## Future Enhancements

Potential improvements for future iterations:

1. **Map Visualization** - Add interactive map with markers for cities
2. **Export to CSV** - Allow exporting geographic data
3. **Historical Trends** - Show how geographic distribution changes over time
4. **Distance Calculation** - Calculate delivery distance from vendor location
5. **Clustering** - Group nearby cities into regions
6. **Filter Persistence** - Remember last applied filter in localStorage
7. **Multiple Filters** - Allow filtering by multiple cities/states simultaneously
8. **Delivery Zone Analysis** - Identify underserved areas
9. **Real-Time Notifications** - Push notifications for significant events
10. **Configurable Polling** - Allow users to adjust refresh interval

## Related Components

- `time-range-selector.tsx` - Date range picker (Task 7.1)
- `analytics-summary-cards.tsx` - Summary metrics (Task 7.2)
- `conversion-funnel-chart.tsx` - Funnel visualization (Task 7.5)
- `revenue-forecast-card.tsx` - Revenue projections (Task 7.6)

## Data Flow

### Geographic Insights
```
User Action → Component → onFilterChange callback → Parent Component → Re-fetch Analytics → Update All Sections
```

1. User clicks on a city/state
2. Component calls `onFilterChange({ city: 'Lagos', state: 'Lagos State' })`
3. Parent component updates URL params or state
4. All analytics sections re-render with filtered data
5. User can clear filter to see all data again

### Real-Time Dashboard
```
Component Mount → Initial Fetch → Display Data → Poll Every 30s → Update Display
```

1. Component mounts and fetches initial data
2. Displays loading skeleton during first fetch
3. Shows data when available
4. Polls API every 30 seconds
5. Updates display with new data
6. Continues polling until component unmounts
