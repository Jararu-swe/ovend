/**
 * RevenueForecastCard Component Usage Example
 * 
 * This file demonstrates how to use the RevenueForecastCard component
 * in a Business-tier analytics dashboard.
 */

import RevenueForecastCard from './revenue-forecast-card';
import { calculateRevenueForecast } from '@/app/lib/business-analytics';
import type { RevenueForecast, InsufficientForecastDataError } from '@/app/lib/business-analytics';

// ============================================================================
// Example 1: Basic Usage in a React Server Component
// ============================================================================

export async function RevenueForecastSection({ vendorId }: { vendorId: string }) {
  const forecast = await calculateRevenueForecast(vendorId);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Revenue Forecast</h1>
      <RevenueForecastCard forecast={forecast} />
    </div>
  );
}

// ============================================================================
// Example 2: With Loading State
// ============================================================================

export function RevenueForecastWithLoading({ 
  forecast, 
  isLoading 
}: { 
  forecast: RevenueForecast | InsufficientForecastDataError | null;
  isLoading: boolean;
}) {
  if (isLoading || !forecast) {
    return <RevenueForecastCard forecast={{} as RevenueForecast} isLoading={true} />;
  }
  
  return <RevenueForecastCard forecast={forecast} />;
}

// ============================================================================
// Example 3: In a Full Analytics Dashboard
// ============================================================================

export async function BusinessAnalyticsDashboard({ vendorId }: { vendorId: string }) {
  // Fetch all analytics data
  const forecast = await calculateRevenueForecast(vendorId);
  
  return (
    <div className="space-y-6 p-6">
      {/* Other analytics sections... */}
      
      {/* Revenue Forecast Section */}
      <section>
        <RevenueForecastCard forecast={forecast} />
      </section>
      
      {/* More analytics sections... */}
    </div>
  );
}

// ============================================================================
// Example 4: Mock Data for Testing/Storybook
// ============================================================================

export function RevenueForecastCardDemo() {
  const mockForecast: RevenueForecast = {
    forecastedRevenue: 1250000, // ₦12,500 in kobo
    confidence: 'high',
    historicalDays: 120,
    dailyProjections: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projected: 40000 + Math.random() * 5000
    })),
    seasonalTrend: 'above',
  };

  return <RevenueForecastCard forecast={mockForecast} />;
}

// ============================================================================
// Example 5: Insufficient Data State
// ============================================================================

export function RevenueForecastCardInsufficientData() {
  const insufficientDataError: InsufficientForecastDataError = {
    type: 'insufficient_forecast_data',
    message: 'You need at least 30 days of historical data to generate a revenue forecast.',
    suggestion: 'Keep taking orders! Your forecast will be available once you have 30 days of sales history.',
    historicalDays: 18,
  };

  return <RevenueForecastCard forecast={insufficientDataError} />;
}

// ============================================================================
// Example 6: Different Confidence Levels
// ============================================================================

export function RevenueForecastCardHighConfidence() {
  const highConfidenceForecast: RevenueForecast = {
    forecastedRevenue: 2500000,
    confidence: 'high',
    historicalDays: 180,
    dailyProjections: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projected: 80000 + i * 500
    })),
    seasonalTrend: 'above',
  };

  return <RevenueForecastCard forecast={highConfidenceForecast} />;
}

export function RevenueForecastCardMediumConfidence() {
  const mediumConfidenceForecast: RevenueForecast = {
    forecastedRevenue: 750000,
    confidence: 'medium',
    historicalDays: 55,
    dailyProjections: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projected: 25000 + i * 100
    })),
    seasonalTrend: 'average',
  };

  return <RevenueForecastCard forecast={mediumConfidenceForecast} />;
}

export function RevenueForecastCardLowConfidence() {
  const lowConfidenceForecast: RevenueForecast = {
    forecastedRevenue: 300000,
    confidence: 'low',
    historicalDays: 15,
    dailyProjections: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projected: 10000 - i * 50 // Declining trend
    })),
    seasonalTrend: null,
  };

  return <RevenueForecastCard forecast={lowConfidenceForecast} />;
}

// ============================================================================
// Example 7: Different Seasonal Trends
// ============================================================================

export function RevenueForecastCardSeasonalHigh() {
  const seasonalHighForecast: RevenueForecast = {
    forecastedRevenue: 3000000,
    confidence: 'high',
    historicalDays: 400,
    dailyProjections: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projected: 95000 + i * 800
    })),
    seasonalTrend: 'above',
  };

  return <RevenueForecastCard forecast={seasonalHighForecast} />;
}

export function RevenueForecastCardSeasonalLow() {
  const seasonalLowForecast: RevenueForecast = {
    forecastedRevenue: 500000,
    confidence: 'high',
    historicalDays: 365,
    dailyProjections: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projected: 15000 + i * 100
    })),
    seasonalTrend: 'below',
  };

  return <RevenueForecastCard forecast={seasonalLowForecast} />;
}

// ============================================================================
// Example 8: Client Component with State Management
// ============================================================================

'use client';

import { useState, useEffect } from 'react';

export function ClientRevenueForecast({ vendorId }: { vendorId: string }) {
  const [forecast, setForecast] = useState<RevenueForecast | InsufficientForecastDataError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchForecast() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analytics/forecast?vendorId=${vendorId}`);
        const data = await response.json();
        setForecast(data);
      } catch (error) {
        console.error('Failed to fetch forecast:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchForecast();
  }, [vendorId]);

  return <RevenueForecastCard forecast={forecast!} isLoading={isLoading} />;
}

// ============================================================================
// Example 9: Integration with Time Range Selector
// ============================================================================

export async function RevenueForecastWithTimeContext({ 
  vendorId,
  selectedRange 
}: { 
  vendorId: string;
  selectedRange: '30d' | '90d';
}) {
  // Forecast is always 30 days forward, but can be influenced by historical range
  const forecast = await calculateRevenueForecast(vendorId);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Revenue Forecast</h2>
        <p className="text-sm text-slate-600">
          Based on last {selectedRange === '30d' ? '30' : '90'} days
        </p>
      </div>
      <RevenueForecastCard forecast={forecast} />
    </div>
  );
}

// ============================================================================
// Example 10: Responsive Grid Layout
// ============================================================================

export async function AnalyticsGrid({ vendorId }: { vendorId: string }) {
  const forecast = await calculateRevenueForecast(vendorId);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Other analytics cards... */}
      
      {/* Revenue Forecast spans full width on mobile, half on desktop */}
      <div className="lg:col-span-1">
        <RevenueForecastCard forecast={forecast} />
      </div>
      
      {/* Another analytics card */}
      <div className="lg:col-span-1">
        {/* Other component */}
      </div>
    </div>
  );
}
