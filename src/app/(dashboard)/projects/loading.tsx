import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create form skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm">
            <Skeleton className="h-4 w-28 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Project list skeleton */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
