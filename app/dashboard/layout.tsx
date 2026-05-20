import SideNav from '@/app/ui/dashboard/sidenav';
import OrderNotificationAlerter from '@/app/ui/dashboard/order-notification-alerter';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50/60">
      <OrderNotificationAlerter />
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex-none md:relative md:w-64 md:z-auto">
        <SideNav />
      </div>
      <div className="flex-grow p-5 pb-24 md:overflow-y-auto md:p-8 md:pb-8 lg:p-10">{children}</div>
    </div>
  );
}