import { 
  fetchGeographicInsights, 
  extractLocationFromAddress,
} from '@/app/lib/business-analytics';
import { sql } from '@/app/lib/db';
import GeographicInsights from './geographic-insights';
import type { 
  DateRange,
  GeographicInsight,
  InsufficientGeographicDataError 
} from '@/app/lib/business-analytics-types';

interface GeographicInsightsWrapperProps {
  vendorId: string;
  dateRange: DateRange;
  onFilterChange?: (filter: { city?: string; state?: string } | null) => void;
}

/**
 * Type guard to check if the result is insufficient geographic data
 */
function isInsufficientGeographicData(
  result: GeographicInsight[] | InsufficientGeographicDataError
): result is InsufficientGeographicDataError {
  return 'type' in result && result.type === 'insufficient_geographic_data';
}

/**
 * Server Component wrapper for GeographicInsights
 * 
 * Fetches geographic data and vendor's primary location state,
 * then renders the client component with the data.
 * 
 * Handles the insufficient data case by passing empty array to client component.
 */
export default async function GeographicInsightsWrapper({
  vendorId,
  dateRange,
  onFilterChange,
}: GeographicInsightsWrapperProps) {
  // Fetch geographic insights from analytics
  const insightsResult = await fetchGeographicInsights(vendorId, dateRange);
  
  // Check if we have insufficient data
  const insights: GeographicInsight[] = isInsufficientGeographicData(insightsResult)
    ? []
    : insightsResult;

  // Fetch vendor's pickup address to extract primary state (Requirement 9.10)
  const vendorResult = await sql`
    SELECT pickup_address
    FROM users
    WHERE id = ${vendorId}
    LIMIT 1
  `;

  let vendorState: string | null = null;
  
  if (vendorResult.length > 0 && vendorResult[0].pickup_address) {
    const location = extractLocationFromAddress(vendorResult[0].pickup_address);
    if (location) {
      vendorState = location.state;
    }
  }

  return (
    <GeographicInsights
      insights={insights}
      vendorState={vendorState}
      onFilterChange={onFilterChange}
    />
  );
}
