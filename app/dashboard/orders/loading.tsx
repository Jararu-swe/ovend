import { OrdersListSkeleton } from '@/app/ui/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-24 rounded bg-slate-200 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-100 animate-pulse" />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-slate-100 animate-pulse" />
        ))}
      </div>

      <OrdersListSkeleton />
    </div>
  );
}
