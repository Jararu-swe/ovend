import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ThemeEditor from '@/app/ui/customize/theme-editor';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { fetchUserById } from '@/app/lib/data';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Storefront',
};

export default async function CustomizePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [theme, user] = await Promise.all([
    getOrCreateVendorTheme(session.user.id),
    fetchUserById(session.user.id),
  ]);

  return (
    <div className="fixed inset-0 z-40 bg-white">
      <ThemeEditor theme={theme} vendorSlug={user?.store_slug || ''} />
    </div>
  );
}
