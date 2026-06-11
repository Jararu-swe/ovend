import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ThemeEditor from '@/app/ui/customize/theme-editor';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { fetchUserById } from '@/app/lib/data';
import { getVendorSubscription } from '@/app/lib/subscriptions';

export default async function CustomizePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [theme, user, subscription] = await Promise.all([
    getOrCreateVendorTheme(session.user.id),
    fetchUserById(session.user.id),
    getVendorSubscription(session.user.id),
  ]);

  const subscriptionTier = subscription?.tier || 'starter';

  return (
    <div className="fixed inset-0 z-40 bg-white">
      <ThemeEditor theme={theme} vendorSlug={user?.store_slug || ''} subscriptionTier={subscriptionTier} />
    </div>
  );
}
