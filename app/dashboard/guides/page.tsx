import { auth } from "@/auth";
import { fetchPublishedGuides, getVendorViewedGuideIds } from "@/app/lib/data";
import { getVendorNewGuideNotifications } from "@/app/lib/guide-triggers";
import GuideLibrary from "@/app/ui/dashboard/guide-library";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const metadata = {
  title: "Learning Hub - Guides",
};

export default async function GuidesPage() {
  const session = await auth();
  const vendorId = session?.user?.id;

  if (!vendorId) {
    return null;
  }

  // Fetch all guides and vendor's data in parallel
  const [guides, viewedGuideIds, newNotifications] = await Promise.all([
    fetchPublishedGuides(),
    getVendorViewedGuideIds(vendorId),
    getVendorNewGuideNotifications(vendorId),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 border border-emerald-100/50 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <BookOpenIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              📚 Learning Hub
            </h1>
            <p className="text-slate-600">
              Everything you need to succeed on Vendle. Guides are auto-tailored
              to your store.
            </p>
          </div>
        </div>
      </div>

      {/* New Guides Banner */}
      {newNotifications.length > 0 && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">🎯</div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">
                {newNotifications.length} New Guide
                {newNotifications.length !== 1 ? "s" : ""} for You!
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                {newNotifications[0].title} and more
              </p>
              <div className="space-y-2">
                {newNotifications.slice(0, 3).map((notif: any) => (
                  <Link
                    key={notif.id}
                    href={`/dashboard/guides/${notif.slug}`}
                    className="block text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    → {notif.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="text-3xl font-bold text-slate-900">
            {guides.length}
          </div>
          <p className="text-sm text-slate-600 mt-1">Guides available</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="text-3xl font-bold text-emerald-600">
            {viewedGuideIds.length}
          </div>
          <p className="text-sm text-slate-600 mt-1">Guides completed</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="text-3xl font-bold text-slate-900">
            {Math.round(
              (viewedGuideIds.length / Math.max(guides.length, 1)) * 100,
            )}
            %
          </div>
          <p className="text-sm text-slate-600 mt-1">Progress</p>
        </div>
      </div>

      {/* Guide Library */}
      <GuideLibrary guides={guides} viewedGuideIds={viewedGuideIds} />
    </div>
  );
}
