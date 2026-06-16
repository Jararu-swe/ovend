/**
 * Example usage of GeographicInsights component
 * 
 * This file demonstrates how to integrate the GeographicInsights component
 * into the Business Analytics Dashboard.
 * 
 * USAGE IN BUSINESS ANALYTICS DASHBOARD:
 * 
 * ```typescript
 * import GeographicInsightsWrapper from './components/geographic-insights-wrapper';
 * 
 * export default async function BusinessAnalyticsPage() {
 *   const session = await auth();
 *   const vendorId = session?.user?.id;
 *   
 *   // Get date range from query params or use default
 *   const dateRange = {
 *     startDate: '2024-01-01',
 *     endDate: '2024-01-31',
 *   };
 *   
 *   return (
 *     <div className="space-y-6">
 *       // ... other analytics sections ...
 *       
 *       <GeographicInsightsWrapper
 *         vendorId={vendorId}
 *         dateRange={dateRange}
 *         onFilterChange={(filter) => {
 *           // Handle geographic filter
 *           // This should update the URL params or state
 *           // and cause other analytics sections to re-render
 *           // with filtered data
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 * 
 * DIRECT CLIENT COMPONENT USAGE:
 * 
 * If you need to use the client component directly (for client-side filtering),
 * you can fetch the data and pass it to the component:
 * 
 * ```typescript
 * 'use client';
 * 
 * import { useState, useEffect } from 'react';
 * import GeographicInsights from './components/geographic-insights';
 * 
 * export default function ClientAnalytics({ vendorId, dateRange }) {
 *   const [insights, setInsights] = useState([]);
 *   const [vendorState, setVendorState] = useState(null);
 *   
 *   useEffect(() => {
 *     // Fetch geographic insights from API
 *     fetch(`/api/analytics/geographic?vendorId=${vendorId}&start=${dateRange.startDate}&end=${dateRange.endDate}`)
 *       .then(res => res.json())
 *       .then(data => {
 *         setInsights(data.insights);
 *         setVendorState(data.vendorState);
 *       });
 *   }, [vendorId, dateRange]);
 *   
 *   const handleFilterChange = (filter) => {
 *     // Update URL or state to filter all analytics
 *     console.log('Apply filter:', filter);
 *   };
 *   
 *   return (
 *     <GeographicInsights
 *       insights={insights}
 *       vendorState={vendorState}
 *       onFilterChange={handleFilterChange}
 *     />
 *   );
 * }
 * ```
 * 
 * HANDLING FILTER CHANGES:
 * 
 * When a user clicks on a city or state, the onFilterChange callback is triggered.
 * You should handle this by:
 * 
 * 1. Updating URL search params (recommended for shareable links):
 * ```typescript
 * const handleFilterChange = (filter) => {
 *   const params = new URLSearchParams(window.location.search);
 *   
 *   if (filter) {
 *     if (filter.city) params.set('city', filter.city);
 *     if (filter.state) params.set('state', filter.state);
 *   } else {
 *     params.delete('city');
 *     params.delete('state');
 *   }
 *   
 *   router.push(`/dashboard/analytics?${params.toString()}`);
 * };
 * ```
 * 
 * 2. Or updating React state (for client-only filtering):
 * ```typescript
 * const [geoFilter, setGeoFilter] = useState(null);
 * 
 * const handleFilterChange = (filter) => {
 *   setGeoFilter(filter);
 *   // Re-fetch all analytics with the filter applied
 * };
 * ```
 * 
 * INSUFFICIENT DATA HANDLING:
 * 
 * The component automatically handles the insufficient data case.
 * When less than 10 orders with location data exist, it displays:
 * - An empty state message
 * - Suggestion to encourage complete addresses
 * 
 * No additional error handling is needed from the parent component.
 * 
 * VENDOR STATE HIGHLIGHTING:
 * 
 * The component automatically highlights the vendor's primary state by:
 * - Fetching the vendor's pickup_address from the users table
 * - Extracting the state using extractLocationFromAddress()
 * - Applying special styling to the vendor's state in the breakdown
 * 
 * The wrapper component handles this automatically, no action needed.
 */

// This is just a documentation file - no code to export
export {};
