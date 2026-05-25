import Link from "next/link";
import { fetchContextualGuides } from "@/app/lib/guide-triggers";
import { LightBulbIcon } from "@heroicons/react/24/outline";

const PAGE_CONTEXT_TRIGGERS: Record<string, string> = {
  "/dashboard/products": "context-products",
  "/dashboard/orders": "context-orders",
  "/dashboard/settings": "context-settings",
  "/dashboard": "context-dashboard",
};

interface ContextualGuideBannerProps {
  vendorId: string;
  currentPage: string;
}

export default async function ContextualGuideBanner({
  vendorId,
  currentPage,
}: ContextualGuideBannerProps) {
  const trigger = PAGE_CONTEXT_TRIGGERS[currentPage];
  if (!trigger) return null;

  const guides = await fetchContextualGuides(vendorId, trigger, 1);
  const guide = guides[0];
  if (!guide) return null;

  return (
    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <LightBulbIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            💡 Learn: {guide.title}
          </p>
          {guide.description && (
            <p className="text-xs text-blue-800 mt-1 line-clamp-2">
              {guide.description}
            </p>
          )}
        </div>
      </div>
      <Link
        href={`/dashboard/guides/${guide.slug}`}
        className="text-sm text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap"
      >
        Read guide →
      </Link>
    </div>
  );
}
