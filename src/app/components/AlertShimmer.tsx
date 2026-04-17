import { Skeleton } from './ui/skeleton';

export function SummaryShimmer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
    </div>
  );
}

export function AlertCardShimmer() {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
      
      <div className="flex gap-8 border-y border-border/50 py-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function AlertsListShimmer() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4">
          <AlertCardShimmer />
          <AlertCardShimmer />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4">
          <AlertCardShimmer />
        </div>
      </div>
    </div>
  );
}
