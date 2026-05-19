'use client';

import { useEffect, useRef, useState } from 'react';
import { useSound } from '@/app/lib/sound-manager';

export default function OrderNotificationAlerter() {
  const { playSound, preferences } = useSound();
  const [lastCount, setLastCount] = useState<number | null>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!preferences.enabled) return;

    const checkNewOrders = async () => {
      try {
        const response = await fetch('/api/vendor/notifications');
        if (!response.ok) return;
        
        const data = await response.json();
        const currentCount = data.count;

        if (isFirstRun.current) {
          setLastCount(currentCount);
          isFirstRun.current = false;
          return;
        }

        if (lastCount !== null && currentCount > lastCount) {
          playSound('order');
          // Update the last count to the new higher count
          setLastCount(currentCount);
        } else if (lastCount !== null && currentCount < lastCount) {
          // If orders are processed/deleted, update the count without playing sound
          setLastCount(currentCount);
        }
      } catch (error) {
        console.error('Failed to poll for new orders:', error);
      }
    };

    // Initial check
    checkNewOrders();

    // Poll every 30 seconds
    const interval = setInterval(checkNewOrders, 30000);

    return () => clearInterval(interval);
  }, [lastCount, playSound, preferences.enabled]);

  return null;
}
