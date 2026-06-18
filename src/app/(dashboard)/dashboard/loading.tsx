import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Activity sections skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5"
              >
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-2.5">
                <Skeleton className="h-6 w-6 rounded-lg shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-16 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
