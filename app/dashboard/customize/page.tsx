import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CustomizeForm from '@/app/ui/customize/customize-form';
import { getOrCreateVendorTheme } from '@/app/lib/theme';
import { fetchUserById } from '@/app/lib/data';

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
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Customize Your Store</h1>
        <p className="text-sm text-slate-500 mt-1">
          Personalize your storefront with colors, fonts, and layout options
        </p>
      </div>
      <CustomizeForm theme={theme} vendorSlug={user?.store_slug || ''} />
    </div>
  );
}
