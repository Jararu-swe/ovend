import { ProductsGridSkeleton } from '@/app/ui/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-slate-200 animate-pulse" />
      </div>
      <ProductsGridSkeleton />
    </div>
  );
}
