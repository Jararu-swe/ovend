import { CardsSkeleton } from '@/app/ui/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-10 w-48 rounded-xl bg-slate-200 animate-pulse" />
      </div>

      <section className="grid gap-6 md:grid-cols-4">
        <CardsSkeleton />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="h-20 rounded-xl bg-slate-50 animate-pulse" />
            <div className="h-20 rounded-xl bg-slate-50 animate-pulse" />
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm">
          <div className="h-6 w-48 rounded bg-emerald-100 animate-pulse mx-auto" />
          <div className="mt-4 h-4 w-64 rounded bg-emerald-100 animate-pulse mx-auto" />
          <div className="mt-6 h-4 w-32 rounded bg-emerald-100 animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}
