"use client";

import Link from "next/link";
import { BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline";

interface GuideCardProps {
  guide: {
    id: number;
    title: string;
    description: string | null;
    slug: string;
    reading_time: number;
    difficulty: "beginner" | "intermediate" | "advanced";
    featured?: boolean;
    category?: string | null;
  };
  viewed?: boolean;
  featured?: boolean;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800",
};

export default function GuideCard({
  guide,
  viewed = false,
  featured = false,
}: GuideCardProps) {
  return (
    <Link href={`/dashboard/guides/${guide.slug}`}>
      <div
        className={`group rounded-2xl border transition-all hover:shadow-lg hover:border-emerald-200 ${
          featured
            ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
            : "border-slate-200 bg-white hover:bg-slate-50"
        } p-6 cursor-pointer h-full flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                featured ? "bg-emerald-200" : "bg-slate-100"
              } group-hover:scale-110 transition`}
            >
              <BookOpenIcon
                className={`h-5 w-5 ${
                  featured ? "text-emerald-700" : "text-slate-600"
                }`}
              />
            </div>
          </div>
          {viewed && <div className="text-2xl">✅</div>}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition line-clamp-2">
          {guide.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-2">
          {guide.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${
                difficultyColors[guide.difficulty]
              }`}
            >
              {guide.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <ClockIcon className="h-4 w-4" />
            <span>{guide.reading_time} min</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <span className="text-sm font-bold text-emerald-600 group-hover:text-emerald-700 transition flex items-center gap-2">
            {viewed ? "Continue reading" : "Read guide"}
            <span className="text-lg">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
