import { cn } from "@/lib/utils/cn"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-shimmer rounded-lg bg-muted", className)} />
  )
}

export function DocumentListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 px-5 py-4 shadow-sm">
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
  )
}

export function HistoryListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex gap-2 pt-3 mt-3 border-t border-border/30">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProjectListSkeleton() {
  return (
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
              <Skeleton className="h-7 w-7" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SearchHistorySkeleton() {
  return (
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
  )
}
