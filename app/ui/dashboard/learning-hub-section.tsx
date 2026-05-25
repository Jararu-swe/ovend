import Link from "next/link";
import GuideCard from "./guide-card";
import { BookOpenIcon } from "@heroicons/react/24/outline";

interface Guide {
  id: number;
  title: string;
  description: string;
  slug: string;
  reading_time: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  featured?: boolean;
}

interface LearningHubSectionProps {
  guides: Guide[];
  newCount: number;
}

export default function LearningHubSection({
  guides,
  newCount,
}: LearningHubSectionProps) {
  if (guides.length === 0 && newCount === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <BookOpenIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recommended for You
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Guides tailored to your store activity
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/guides"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
        >
          View all →
        </Link>
      </div>

      {newCount > 0 && (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <p className="text-sm font-medium text-blue-900">
            🎯 {newCount} new guide{newCount !== 1 ? "s" : ""} for you!
          </p>
        </div>
      )}

      {guides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guides.slice(0, 3).map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          <Link href="/dashboard/guides" className="text-emerald-600 font-medium">
            Browse the Learning Hub
          </Link>{" "}
          for tips to grow your store.
        </p>
      )}
    </section>
  );
}
