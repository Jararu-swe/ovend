import { auth } from '@/auth';
import { fetchUserById, fetchProductsList } from '@/app/lib/data';
import { redirect } from 'next/navigation';
import OnboardingWizard from '@/app/ui/dashboard/onboarding-wizard';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await fetchUserById(session.user.id);

  if (!user) {
    redirect('/login');
  }

  // Check if onboarding is needed — if user has products and whatsapp, send to dashboard
  const products = await fetchProductsList(session.user.id);
  const hasProducts = products.length > 0;
  const hasWhatsApp = !!user.whatsapp_number;

  if (hasProducts && hasWhatsApp) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <OnboardingWizard user={user} hasProducts={hasProducts} hasWhatsApp={hasWhatsApp} />
    </div>
  );
}
