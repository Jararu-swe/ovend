import ProfileSideNav from '@/app/ui/profile/sidenav';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50">
      <div className="w-full flex-none md:w-64">
        <ProfileSideNav />
      </div>
      <div className="flex-grow p-4 md:overflow-y-auto md:p-8">{children}</div>
    </div>
  );
}
