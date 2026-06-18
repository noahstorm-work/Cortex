import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24 rounded-xl shrink-0" />
        </div>
      </div>

      {/* Search history skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-2 p-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
