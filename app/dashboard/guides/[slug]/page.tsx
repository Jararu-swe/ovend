import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  fetchGuideBySlug,
  isGuideCompleted,
  fetchRelatedGuides,
} from "@/app/lib/data";
import GuideCard from "@/app/ui/dashboard/guide-card";
import { markGuideViewed } from "@/app/lib/guide-triggers";
import ReactMarkdown from "react-markdown";
import { ArrowLeftIcon, ClockIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import GuideActions from "@/app/ui/dashboard/guide-actions";

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800",
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const vendorId = session?.user?.id;

  if (!vendorId) {
    return notFound();
  }

  const guide = await fetchGuideBySlug(slug);

  if (!guide) {
    return notFound();
  }

  const [completed, relatedGuides] = await Promise.all([
    isGuideCompleted(vendorId, guide.id),
    fetchRelatedGuides(guide.id, guide.category ?? null, 3),
  ]);
  await markGuideViewed(vendorId, guide.id);

  return (
    <div className="min-h-screen bg-slate-50 -m-5 md:-m-8 lg:-m-10">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/guides"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to guides
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                difficultyColors[
                  guide.difficulty as keyof typeof difficultyColors
                ]
              }`}
            >
              {guide.difficulty}
            </span>
            <div className="flex items-center gap-1 text-slate-600 text-sm">
              <ClockIcon className="h-4 w-4" />
              <span>{guide.reading_time} min read</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {guide.title}
          </h1>

          {guide.description && (
            <p className="text-lg text-slate-600 mb-6">{guide.description}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <article className="prose prose-sm sm:prose-base max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-a:text-emerald-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-bold prose-code:bg-slate-100 prose-code:text-slate-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:overflow-x-auto">
            <ReactMarkdown>{guide.content}</ReactMarkdown>
          </article>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200 pt-8">
          <Link
            href="/dashboard/guides"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 hover:bg-slate-50 transition"
          >
            ← Back to guides
          </Link>
          <GuideActions guideId={guide.id} completed={completed} />
        </div>

        {relatedGuides.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              📚 More Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedGuides.map((g: any) => (
                <GuideCard key={g.id} guide={g} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
          <p>Got questions? Check out the Learning Hub for more guides.</p>
          <Link
            href="/dashboard/guides"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Browse all guides →
          </Link>
        </div>
      </div>
    </div>
  );
}
