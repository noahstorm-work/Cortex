import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 border border-teal-400/20">
        <span className="text-2xl font-display font-semibold text-teal-500">404</span>
      </div>
      <h1 className="text-xl font-display tracking-tight text-foreground mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground/70 mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-600 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/40"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
