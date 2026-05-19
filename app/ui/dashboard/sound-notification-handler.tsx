'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSound } from '@/app/lib/sound-manager';

function Handler() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { playSound } = useSound();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      playSound('success');
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('success');
      const query = params.toString() ? `?${params.toString()}` : '';
      router.replace(`${pathname}${query}`);
    } else if (error) {
      playSound('error');
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('error');
      const query = params.toString() ? `?${params.toString()}` : '';
      router.replace(`${pathname}${query}`);
    }
  }, [searchParams, playSound, pathname, router]);

  return null;
}

export default function SoundNotificationHandler() {
  return (
    <Suspense fallback={null}>
      <Handler />
    </Suspense>
  );
}
