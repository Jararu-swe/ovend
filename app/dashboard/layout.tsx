import SideNav from "@/app/ui/dashboard/sidenav";
import OrderNotificationAlerter from "@/app/ui/dashboard/order-notification-alerter";
import SubscriptionExpiryModal from "@/app/ui/dashboard/subscription-expiry-modal";
import { auth } from "@/auth";
import Script from "next/script";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const subscriptionStatus = (session?.user as any)?.subscription_status ?? null;
  const subscriptionExpiresAt = (session?.user as any)?.subscription_expires_at ?? null;
  const userEmail = session?.user?.email ?? undefined;
  const userId = session?.user?.id ?? undefined;

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50/60">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <OrderNotificationAlerter />
      <SubscriptionExpiryModal 
        subscriptionStatus={subscriptionStatus}
        subscriptionExpiresAt={subscriptionExpiresAt}
        userEmail={userEmail}
        userId={userId}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:relative md:w-64 md:z-auto">
        <SideNav />
      </div>

      {/* Mobile Logo Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 w-full bg-white border-b border-slate-100">
        <SideNav isMobileHeader={true} />
      </div>

      {/* Mobile Navigation Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full bg-white border-t border-slate-200/80">
        <SideNav isMobileFooter={true} />
      </div>

      {/* Content */}
      <div className="flex-grow p-5 pt-20 pb-20 md:overflow-y-auto md:p-8 md:pb-8 md:pt-0 lg:p-10">
        {children}
      </div>
    </div>
  );
}
