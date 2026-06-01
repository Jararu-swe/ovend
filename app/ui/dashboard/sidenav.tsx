import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import VendleLogo from "@/app/ui/vendle-logo";
import { SignOutButton } from "@/app/ui/dashboard/sign-out-button";
import { auth } from "@/auth";
import { sql } from "@/app/lib/db";
import { getNewGuideNotificationsCount } from "@/app/lib/guide-triggers";

async function getNewOrdersCount(vendorId: string): Promise<number> {
  try {
    const result = await sql<{ count: string }[]>`
      SELECT COUNT(*) as count
      FROM orders
      WHERE vendor_id = ${vendorId}
        AND status = 'new'
    `;
    return Number(result[0]?.count || 0);
  } catch (error) {
    console.error("Error fetching new orders count:", error);
    return 0;
  }
}

export default async function SideNav({
  isMobileHeader = false,
  isMobileFooter = false,
}: {
  isMobileHeader?: boolean;
  isMobileFooter?: boolean;
}) {
  const session = await auth();
  const vendorId = session?.user?.id;
  const [newOrdersCount, newGuidesCount] = vendorId
    ? await Promise.all([
        getNewOrdersCount(vendorId),
        getNewGuideNotificationsCount(vendorId),
      ])
    : [0, 0];

  // Mobile Header - Logo only
  if (isMobileHeader) {
    return (
      <Link className="flex h-16 items-center gap-3 px-5 shrink-0" href="/">
        <VendleLogo />
      </Link>
    );
  }

  // Mobile Footer - Navigation only
  if (isMobileFooter) {
    return (
      <div className="flex flex-row items-center justify-start space-x-1 overflow-x-auto px-2 py-2 no-scrollbar">
        <NavLinks
          newOrdersCount={newOrdersCount}
          newGuidesCount={newGuidesCount}
        />
      </div>
    );
  }

  // Desktop Sidebar - Full layout with logo and navigation
  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200/80">
      {/* Logo area */}
      <Link
        className="flex h-16 items-center gap-3 px-5 border-b border-slate-100 md:h-[72px] shrink-0"
        href="/"
      >
        <VendleLogo />
        <div className="ml-1">
          <p className="text-[10px] text-slate-400 font-medium -mt-0.5">
            Vendor Dashboard
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex grow flex-col space-y-1 px-3 py-3 overflow-y-auto no-scrollbar">
        <NavLinks
          newOrdersCount={newOrdersCount}
          newGuidesCount={newGuidesCount}
        />
        <div className="hidden h-auto w-full grow md:block" />
        <div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
