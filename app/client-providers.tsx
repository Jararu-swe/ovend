'use client';

import { SoundProvider } from '@/app/lib/sound-manager';
import SoundNotificationHandler from '@/app/ui/dashboard/sound-notification-handler';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SoundProvider>
      <SoundNotificationHandler />
      {children}
    </SoundProvider>
  );
}
