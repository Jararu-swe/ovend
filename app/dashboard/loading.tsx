export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded"></div>
      <div className="h-4 w-96 bg-slate-100 rounded"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}
