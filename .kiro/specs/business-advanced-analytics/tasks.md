# Implementation Plan: Business-tier Advanced Analytics

## Overview

This implementation plan converts the Business-tier Advanced Analytics design into discrete coding tasks. The feature provides Business tier vendors (₦3,500/month) with powerful analytics capabilities including extended time ranges, customer analytics, product performance analysis, conversion funnels, comparative metrics, revenue forecasting, and export functionality. The implementation leverages existing database infrastructure (store_analytics, orders, products, users tables) and emphasizes performance through caching and optimized queries.

## Tasks

- [x] 1. Set up database enhancements and core infrastructure
  - [x] 1.1 Create database indexes for analytics performance
    - Add indexes on store_analytics(vendor_id, date), orders(vendor_id, status, created_at), orders(customer_phone), orders(customer_address), products(vendor_id, status)
    - Write migration script to create indexes
    - Test index creation on development database
    - _Requirements: 12.3, 12.4_

  - [x] 1.2 Add fulfilled_at column to orders table
    - Create migration to add fulfilled_at TIMESTAMPTZ column to orders table
    - Implement backfill logic for existing fulfilled orders (set fulfilled_at = created_at + 2 hours)
    - Update order fulfillment server actions to set fulfilled_at timestamp
    - _Requirements: 4.6_

  - [x] 1.3 Implement analytics caching system
    - Create cache utility module using LRUCache with 5-minute TTL
    - Implement getFromCache, setCache, and invalidateCache functions
    - Add cache key patterns for analytics, customers, products, forecast data
    - _Requirements: 12.6, 12.7_

- [x] 2. Create core analytics data layer functions
  - [x] 2.1 Implement date range calculation and validation utilities
    - Create calculateDateRange function that converts time range ('7d', '30d', '90d') to start/end dates
    - Create validateDateRange function with 365-day maximum span check
    - Add TypeScript type definitions for TimeRange and DateRange
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Write property tests for date range utilities
    - **Property 1: Date Range Calculation Accuracy** - Verify calculateDateRange returns exactly n days difference
    - **Property 2: Date Range Validation** - Verify validation rejects ranges > 365 days
    - **Validates: Requirements 1.2, 1.3, 1.5, 7.9**

  - [x] 2.3 Implement fetchAnalyticsSummary function
    - Create function that queries store_analytics table for aggregate visits, orders, revenue
    - Calculate conversion rate (orders/visits × 100) and average order value (revenue/orders)
    - Implement period-over-period comparison logic using previous period data
    - Add caching with cache key pattern analytics:{vendorId}:{startDate}:{endDate}
    - _Requirements: 1.6, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.4 Write property tests for analytics summary calculations
    - **Property 5: Average Order Value Calculation** - Verify AOV = total revenue / order count
    - **Property 12: Conversion Rate Calculation** - Verify conversion rate = (orders/visits) × 100
    - **Property 15: Period-Over-Period Change Calculation** - Verify % change = ((current - previous) / previous) × 100
    - **Validates: Requirements 2.6, 4.2, 4.9**

  - [x] 2.5 Implement fetchCustomerMetrics function
    - Query orders table grouped by customer_phone to identify unique customers
    - Calculate repeat customer rate (customers with 2+ orders / total × 100)
    - Calculate customer lifetime value (sum of order amounts per customer)
    - Count new vs returning customers based on first order date in selected period
    - Handle insufficient data case (<5 orders) with appropriate error response
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.8, 2.9, 2.10_

  - [ ]* 2.6 Write property tests for customer analytics calculations
    - **Property 3: Repeat Customer Rate Calculation** - Verify rate = (customers with 2+ orders / total) × 100
    - **Property 4: Customer Lifetime Value Aggregation** - Verify CLV = sum of all order values per customer
    - **Property 6: Returning Customer Identification** - Verify classification of new vs returning customers
    - **Validates: Requirements 2.2, 2.4, 2.9**

  - [x] 2.7 Implement fetchProductPerformance function
    - Query products and orders tables to calculate units sold and revenue per product
    - Calculate inventory velocity (days / units sold) for each product
    - Identify low-performing products (zero sales in period)
    - Calculate discount percentage from compare_at_price and price
    - Support pagination with 25 items per page
    - Support sorting by revenue, units, velocity, or name
    - Support category filtering
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8, 3.10, 12.8_

  - [ ]* 2.8 Write property tests for product performance calculations
    - **Property 7: Inventory Velocity Calculation** - Verify velocity = days / units sold
    - **Property 8: Sorting Correctness** - Verify sorted lists maintain proper ordering
    - **Property 9: Low-Performing Product Identification** - Verify zero-sales products classified correctly
    - **Property 10: Discount Percentage Calculation** - Verify discount = ((compare_at - price) / compare_at) × 100
    - **Property 11: Category Filtering** - Verify filtered results contain only matching category
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.8, 3.10**

- [x] 3. Checkpoint - Ensure core data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement advanced analytics functions
  - [x] 4.1 Create conversion funnel analytics function
    - Implement fetchConversionFunnel that calculates visits → orders initiated → orders completed
    - Calculate visit-to-order conversion rate and order completion rate
    - Calculate abandonment rate (non-fulfilled orders / total orders × 100)
    - Calculate average time to fulfillment using fulfilled_at - created_at
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.2 Write property tests for conversion metrics
    - **Property 13: Abandonment and Completion Complementarity** - Verify completion rate + abandonment rate = 100%
    - **Property 14: Average Duration Calculation** - Verify avg time = sum of durations / count
    - **Validates: Requirements 4.5, 4.6**

  - [x] 4.3 Implement geographic analytics functions
    - Create extractLocationFromAddress function to parse city and state from customer addresses
    - Implement fetchGeographicInsights that aggregates orders by city and state
    - Calculate order count and revenue per location
    - Calculate percentage of orders from each location
    - Return top 10 cities by order count and revenue
    - Handle insufficient location data case (<10 orders with locations)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 4.4 Write property tests for geographic analytics
    - **Property 25: Location Data Extraction** - Verify parsing of city and state from address strings
    - **Property 26: Geographic Percentage Sum** - Verify percentages sum to 100%
    - **Property 24: Geographic Ranking** - Verify top N returns N items in descending order
    - **Validates: Requirements 9.4, 9.6, 9.2, 9.3**

  - [x] 4.5 Implement revenue forecasting function
    - Create calculateRevenueForecast using linear regression on last 90 days of daily revenue
    - Generate 30-day forward projections with daily breakdown
    - Calculate forecast confidence based on historical data span (High: 90+ days, Medium: 30-89, Low: <30)
    - Detect seasonal trends by comparing same-month performance across years (>20% variance)
    - Handle insufficient data case (<30 days) with appropriate error response
    - Cache forecast results for 24 hours
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7, 6.8, 6.9_

  - [ ]* 4.6 Write property tests for forecasting logic
    - **Property 17: Forecast Confidence Classification** - Verify confidence levels based on data span
    - **Validates: Requirements 6.4**

  - [x] 4.7 Implement real-time dashboard data function
    - Create fetchTodayPerformance that queries today's visits, orders, and revenue
    - Calculate same-time-yesterday comparison (data up to current hour from 24 hours ago)
    - Calculate same-weekday-last-week comparison (7 days prior)
    - Implement pace indicator logic (ahead/behind/on-track based on projected EOD vs yesterday)
    - Count orders in last hour for live activity indicator
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.8, 8.9, 8.10_

  - [ ]* 4.8 Write property tests for real-time metrics
    - **Property 21: Same-Time-Yesterday Comparison** - Verify comparison uses data from exactly 24 hours prior
    - **Property 22: Same-Weekday-Last-Week Comparison** - Verify comparison uses data from exactly 7 days prior
    - **Property 23: Pace Indicator Logic** - Verify ahead/behind/on-track logic based on projected vs target
    - **Validates: Requirements 8.3, 8.5, 8.8**

- [x] 5. Checkpoint - Ensure advanced analytics tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement export functionality
  - [x] 6.1 Create CSV export generator
    - Implement generateCSVExport function that queries analytics data for date range
    - Format data as CSV with columns: date, visits, orders, revenue, conversion_rate, top_products, customer_metrics
    - Generate filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.csv
    - Enforce 365-day maximum for CSV exports
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.9_

  - [ ]* 6.2 Write property tests for CSV export
    - **Property 18: CSV Export Format Validity** - Verify generated CSV is parseable and contains all data fields
    - **Property 20: Export Filename Format** - Verify filename matches pattern exactly
    - **Validates: Requirements 7.2, 7.6**

  - [x] 6.3 Create Excel export generator
    - Implement generateExcelExport using xlsx library
    - Create multiple sheets: Summary, Daily Metrics, Product Performance, Customer Analytics
    - Format cells with appropriate data types and number formats
    - Generate filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.xlsx
    - Enforce 365-day maximum for Excel exports
    - _Requirements: 7.1, 7.4, 7.6, 7.9_

  - [ ]* 6.4 Write property tests for Excel export
    - **Property 19: Excel Export Structure** - Verify .xlsx file is valid and contains all specified sheets
    - **Validates: Requirements 7.4**

  - [x] 6.5 Create PDF export generator
    - Implement generatePDFExport using pdf-lib or similar library
    - Include vendor's store name, logo, and generation timestamp
    - Format tables and charts for PDF layout
    - Generate filename in format: Ovend-Analytics-{StoreName}-{DateRange}-{ExportDate}.pdf
    - _Requirements: 7.1, 7.5, 7.6, 7.10_

  - [x] 6.6 Create API route for analytics exports
    - Create /api/analytics/export API route with POST handler
    - Verify Business tier subscription before processing export
    - Accept format parameter (csv, excel, pdf) and date range
    - Call appropriate export generator based on format
    - Stream file to client with correct Content-Type headers
    - Handle export generation errors with user-friendly messages
    - _Requirements: 7.1, 7.7, 7.8_

- [~] 7. Implement UI components for analytics dashboard
  - [x] 7.1 Create time range selector component
    - Build TimeRangeSelector component with buttons for 7d, 30d, 90d, custom
    - Implement custom date range picker using react-datepicker
    - Handle date selection and validation
    - Emit onChange event with selected range
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 7.2 Create analytics summary cards component
    - Build AnalyticsSummaryCards displaying visits, orders, revenue, conversion rate
    - Show period comparison badges (WoW, MoM, YoY) with percentage change
    - Use color coding (green for positive, red for negative, gray for neutral)
    - Display trend indicators (up/down arrows)
    - _Requirements: 1.6, 5.1, 5.5, 5.6_

  - [x] 7.3 Create customer metrics section component
    - Build CustomerMetricsSection displaying repeat rate, CLV, AOV, new vs returning customers
    - Show AOV trend chart over selected time period
    - Display insufficient data message when orders < 5
    - _Requirements: 2.1, 2.7, 2.8, 2.10_

  - [~] 7.4 Create product performance table component
    - Build ProductPerformanceTable with columns: name, units sold, revenue, velocity, trend, discount
    - Implement sortable columns (click header to sort)
    - Add pagination controls (25 items per page)
    - Highlight low-performing products (zero sales) with visual indicator
    - Add category filter dropdown when categories exist
    - Display top 10 products summary above table
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.9, 3.10_

  - [x] 7.5 Create conversion funnel chart component
    - Build ConversionFunnelChart visualizing visits → orders initiated → orders completed
    - Display conversion rates between stages
    - Show abandonment rate and average fulfillment time
    - Display optimization suggestion when conversion < 2%
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 7.6 Create revenue forecast card component
    - Build RevenueForecastCard displaying 30-day projected revenue
    - Show confidence indicator (High/Medium/Low) with explanation
    - Display chart with historical revenue + projected trend line
    - Show seasonal indicator when patterns detected
    - Display insufficient data message when historical data < 30 days
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.7, 6.9, 6.10_

    - [x] 7.7 Create geographic insights component
    - Build GeographicInsights displaying top 10 cities by orders and revenue
    - Show state-level breakdown with percentages
    - Add filter controls to apply city/state filters to all analytics
    - Display insufficient data message when location data < 10 orders
    - Highlight vendor's primary location state
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.7, 9.8, 9.10_

  - [x] 7.8 Create real-time dashboard component
    - Build RealTimeDashboard showing today's visits, orders, revenue
    - Display comparison to yesterday and last week same day
    - Show pace indicator (ahead/behind/on-track)
    - Display last hour order count
    - Implement client-side polling every 30 seconds
    - Show last update timestamp
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.8, 8.10_

  - [x] 7.9 Create trend chart and visualization components
    - Build TrendChart component supporting line, bar, and area chart types
    - Add interactive tooltips with detailed values on hover
    - Implement trend line overlay using linear regression
    - Add sparkline mini-charts for quick visual trends
    - Use color coding: blue for visits, green for revenue, purple for orders
    - Display chart legend with metric toggle controls
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.9, 10.10_

  - [x] 7.10 Create export menu component
    - Build ExportMenu with dropdown buttons for CSV, Excel, PDF
    - Handle export button clicks with loading states
    - Trigger file downloads on successful export
    - Display error messages on export failure
    - _Requirements: 7.1, 7.7, 7.8_

  - [x] 7.11 Create Business tier gate component
    - Build BusinessTierGate component for Pro tier users
    - Display locked preview cards for Business features
    - Show feature title, description, and sample mockup
    - Add "Upgrade to Business" CTA buttons
    - _Requirements: 11.2, 11.3, 11.4_

- [ ] 8. Checkpoint - Verify UI components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement main analytics page and tier access control
  - [ ] 9.1 Create main analytics page with tier-based routing
    - Create app/dashboard/analytics/page.tsx as React Server Component
    - Fetch user session and subscription tier
    - Route Business tier users to BusinessAnalyticsDashboard
    - Route Pro tier users to ProAnalyticsView with upgrade prompts
    - Route Starter tier users to basic analytics with locked content
    - _Requirements: 11.1, 11.2, 11.6, 11.7_

  - [ ]* 9.2 Write property tests for tier access control
    - **Property 28: Tier-Based Feature Access** - Verify Pro/Starter users denied access and redirected
    - **Validates: Requirements 11.5, 11.9**

  - [ ] 9.3 Create Business analytics dashboard orchestrator component
    - Build BusinessAnalyticsDashboard as client wrapper component
    - Manage time range state and pass to child components
    - Handle geographic filter state
    - Coordinate data fetching and loading states
    - Wire all analytics sections together (summary, customer metrics, products, funnel, forecast, geographic, real-time)
    - _Requirements: 1.1, 1.6, 9.8, 9.9_

  - [ ] 9.4 Implement tier verification middleware
    - Create middleware to verify subscription tier on analytics page load
    - Check users.subscription_tier column on every request
    - Restrict Business features for non-Business tier users
    - Log analytics feature access attempts with tier and timestamp
    - _Requirements: 11.8, 11.9, 11.10_

  - [ ] 9.5 Create API route for real-time dashboard polling
    - Create /api/analytics/real-time GET route
    - Verify Business tier subscription
    - Call fetchTodayPerformance and return JSON response
    - Implement rate limiting (max once per 30 seconds per vendor)
    - _Requirements: 8.6, 8.7, 12.9_

- [ ] 10. Implement cache invalidation on order events
  - [ ] 10.1 Add cache invalidation to order creation server actions
    - Update createOrder server action to call invalidateCache for today's date
    - Invalidate pattern: analytics:{vendorId}:*
    - _Requirements: 8.7, 12.6_

  - [ ] 10.2 Add cache invalidation to order status update actions
    - Update updateOrderStatus server action to invalidate affected date ranges
    - Invalidate both order creation date and fulfillment date caches
    - _Requirements: 12.7_

- [ ] 11. Implement performance optimizations
  - [ ] 11.1 Add loading states and progressive enhancement
    - Display summary metrics skeleton loaders during initial load
    - Load detailed analytics sections progressively after summary
    - Show progress indicators for long-running queries
    - _Requirements: 12.1, 12.5_

  - [ ] 11.2 Optimize database queries for large datasets
    - Use aggregation at database level for vendors with 10,000+ orders
    - Implement query result streaming for large exports
    - Add query timeout handling (10 second limit) with user-friendly error
    - _Requirements: 12.10_

  - [ ]* 11.3 Write integration tests for performance benchmarks
    - Test summary metrics load completes within 2 seconds (7d range)
    - Test 90-day range query completes within 5 seconds
    - Test cache hit response time < 100ms
    - Test real-time dashboard update latency < 5 seconds

- [ ] 12. Integration testing and error handling
  - [ ]* 12.1 Write integration tests for data fetching
    - Test fetchAnalyticsSummary with real database and 30/90 day ranges
    - Test fetchCustomerMetrics with seeded vendor data
    - Test fetchProductPerformance with pagination and sorting
    - Test caching behavior (hit/miss/invalidation scenarios)

  - [ ]* 12.2 Write integration tests for exports
    - Test CSV export generates valid parseable file
    - Test Excel export contains all required sheets
    - Test PDF export includes vendor branding

  - [ ]* 12.3 Write integration tests for forecasting
    - Test revenue forecast with 90 days of trending data
    - Verify forecast reflects growth/decline patterns
    - Test confidence level calculation

  - [ ] 12.4 Implement error handling for all analytics functions
    - Add insufficient data error responses (< 5 orders for customer metrics, < 30 days for forecast)
    - Add date range validation error responses (invalid dates, future dates, > 365 days)
    - Add query timeout error responses with retry suggestions
    - Add cache failure degradation (fallback to direct query)
    - Add database connection failure error responses
    - Add malformed address parsing error handling (gracefully skip unparseable addresses)
    - _Requirements: Various error scenarios from design_

- [ ] 13. Final integration and testing
  - [ ]* 13.1 Write end-to-end tests for critical workflows
    - Test: Login as Business user → Load analytics → Change time range to 30d → Verify data updates
    - Test: Select 30d range → Export CSV → Verify file downloads and content
    - Test: Pro user attempts Business feature → Verify redirect to billing with upgrade prompt
    - Test: Create new order → Verify real-time dashboard updates within 5 seconds

  - [ ] 13.2 Test tier-based access scenarios
    - Test Business tier user can access all analytics features
    - Test Pro tier user sees locked Business feature previews
    - Test Starter tier user sees limited analytics
    - Test subscription downgrade immediately restricts access
    - _Requirements: 11.1, 11.2, 11.6, 11.9_

  - [ ] 13.3 Test with realistic vendor data profiles
    - Test with new vendor (7 days, <10 orders) - verify insufficient data messages
    - Test with established vendor (180 days, 1000+ orders) - verify all features work
    - Test with high-volume vendor (365 days, 10,000+ orders) - verify performance
    - Test with seasonal vendor (730 days with spikes) - verify seasonal detection
    - _Requirements: Various data-dependent features_

- [ ] 14. Final checkpoint - End-to-end verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and integration tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses TypeScript, React Server Components, and Next.js App Router
- All analytics data functions include caching with appropriate TTL
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design
- Integration tests verify real database interactions and export generation
- End-to-end tests cover critical user workflows and tier access control
- The feature leverages existing database tables without requiring new tracking infrastructure

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.5", "2.7"] },
    { "id": 3, "tasks": ["2.4", "2.6", "2.8"] },
    { "id": 4, "tasks": ["4.1", "4.3", "4.5", "4.7"] },
    { "id": 5, "tasks": ["4.2", "4.4", "4.6", "4.8"] },
    { "id": 6, "tasks": ["6.1", "6.3", "6.5"] },
    { "id": 7, "tasks": ["6.2", "6.4", "6.6"] },
    { "id": 8, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.9"] },
    { "id": 9, "tasks": ["7.5", "7.6", "7.7", "7.8", "7.10", "7.11"] },
    { "id": 10, "tasks": ["9.1", "9.2", "9.4", "9.5"] },
    { "id": 11, "tasks": ["9.3", "10.1", "10.2"] },
    { "id": 12, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 13, "tasks": ["12.1", "12.2", "12.3", "12.4"] },
    { "id": 14, "tasks": ["13.1", "13.2", "13.3"] }
  ]
}
```
