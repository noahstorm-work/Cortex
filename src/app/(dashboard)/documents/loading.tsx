import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-7 w-44 rounded-lg" />
      </div>

      {/* Upload area skeleton */}
      <div className="rounded-2xl border-2 border-dashed border-border/50 bg-card/30 p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Document list skeleton */}
      <div>
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
