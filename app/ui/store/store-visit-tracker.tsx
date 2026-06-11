'use client';

import { useEffect } from 'react';

/**
 * Client component that fires a single visit beacon on actual page load.
 * This is more accurate than server-side tracking because it only runs
 * in the browser and won't fire during SSR, revalidation, or builds.
 */
export default function StoreVisitTracker({ vendorId }: { vendorId: string }) {
  useEffect(() => {
    // Use sendBeacon for reliability — it won't be cancelled on page unload
    const url = `/api/track-visit?vendorId=${encodeURIComponent(vendorId)}`;
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
    }
  }, [vendorId]);

  // This component renders nothing
  return null;
}
