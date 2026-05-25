"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import GuideCard from "./guide-card";

interface Guide {
  id: number;
  title: string;
  description: string;
  slug: string;
  reading_time: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  featured?: boolean;
  category?: string;
}

interface GuideLibraryProps {
  guides: Guide[];
  viewedGuideIds?: number[];
}

const CATEGORY_CONFIG: { value: string | null; label: string }[] = [
  { value: null, label: "All Topics" },
  { value: "getting-started", label: "🚀 Getting Started" },
  { value: "marketing", label: "📣 Marketing" },
  { value: "growth", label: "📈 Growth" },
  { value: "operations", label: "⚙️ Operations" },
  { value: "promotions", label: "🎁 Promotions" },
];

export default function GuideLibrary({
  guides,
  viewedGuideIds = [],
}: GuideLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Only show category tabs that have at least one guide (null/"All Topics" always shown)
  const availableCategories = CATEGORY_CONFIG.filter(
    (cat) => cat.value === null || guides.some((g) => g.category === cat.value),
  );

  // Filter guides based on search, difficulty, and category
  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      !difficultyFilter || guide.difficulty === difficultyFilter;

    const matchesCategory =
      categoryFilter === null || guide.category === categoryFilter;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // Separate featured and regular guides (used only in "All Topics" view)
  const featuredGuides = filteredGuides.filter((g) => g.featured);
  const regularGuides = filteredGuides.filter((g) => !g.featured);

  const completedCount = viewedGuideIds.length;
  const totalCount = guides.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter(null);
    setCategoryFilter(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar — only shown when at least one guide has been viewed */}
      {completedCount > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Your Progress</span>
            <span className="text-slate-500">
              {completedCount} / {totalCount} guides completed
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search guides..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none transition"
        />
      </div>

      {/* Category Tabs */}
      {availableCategories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {availableCategories.map((cat) => (
            <button
              key={cat.value ?? "__all__"}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                categoryFilter === cat.value
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Difficulty Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setDifficultyFilter(null)}
          className={`px-4 py-2 rounded-xl font-medium transition ${
            !difficultyFilter
              ? "bg-emerald-500 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {["beginner", "intermediate", "advanced"].map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setDifficultyFilter(difficulty)}
            className={`px-4 py-2 rounded-xl font-medium transition capitalize ${
              difficultyFilter === difficulty
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {difficulty}
          </button>
        ))}
      </div>

      {/* Guide Sections */}
      {filteredGuides.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">
            No guides found matching your search.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : categoryFilter !== null ? (
        /* Specific category selected — flat list, no sub-sections */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              viewed={viewedGuideIds.includes(guide.id)}
              featured={!!guide.featured}
            />
          ))}
        </div>
      ) : (
        /* "All Topics" — keep featured / all split */
        <div className="space-y-8">
          {featuredGuides.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                ⭐ Featured Guides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredGuides.map((guide) => (
                  <GuideCard
                    key={guide.id}
                    guide={guide}
                    viewed={viewedGuideIds.includes(guide.id)}
                    featured={true}
                  />
                ))}
              </div>
            </div>
          )}

          {regularGuides.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                📚 All Guides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularGuides.map((guide) => (
                  <GuideCard
                    key={guide.id}
                    guide={guide}
                    viewed={viewedGuideIds.includes(guide.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
